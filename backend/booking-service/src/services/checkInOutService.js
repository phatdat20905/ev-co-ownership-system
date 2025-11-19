// booking-service/src/services/checkInOutService.js
import { logger, AppError, redisClient } from '@ev-coownership/shared';
import db from '../models/index.js';
import eventService from './eventService.js';
import crypto from 'crypto';
import QRCode from 'qrcode';

export class CheckInOutService {
  constructor() {
    this.qrCodeExpiry = parseInt(process.env.QR_CODE_EXPIRY) || 30 * 60 * 1000; // 30 minutes
    this.qrCodeSecret = process.env.QR_CODE_SECRET || 'your_qr_secret_here';
  }

  async checkIn(bookingId, userId, userRole, checkInData) {
    const transaction = await db.sequelize.transaction();

    try {
      const booking = await db.Booking.findByPk(bookingId, {
        include: [{
          model: db.Vehicle,
          as: 'vehicle',
          attributes: ['id', 'vehicleName', 'licensePlate', 'status', 'currentOdometer']
        }]
      });

      if (!booking) {
        throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
      }

      // Validate check-in conditions
      await this.validateCheckIn(booking, userId, userRole, checkInData);

      // Create check-in log
      const checkInLog = await db.CheckInOutLog.create({
        bookingId,
        actionType: 'check_in',
        odometerReading: checkInData.odometerReading,
        fuelLevel: checkInData.fuelLevel,
        images: checkInData.images || [],
        notes: checkInData.notes,
        qrCode: checkInData.qrCode,
        digitalSignature: checkInData.digitalSignature,
        performedBy: userId,
        location: checkInData.location
      }, { transaction });

      // Update booking status
      await booking.update({
        status: 'in_progress'
      }, { transaction });

      // Update vehicle status and odometer
      await db.Vehicle.update({
        status: 'in_use',
        currentOdometer: checkInData.odometerReading || booking.vehicle.currentOdometer
      }, {
        where: { id: booking.vehicleId },
        transaction
      });

      await transaction.commit();

      // Publish events (non-blocking, errors logged but don't fail the request)
      try {
        await eventService.publishCheckInSuccess(booking, checkInLog);
        socketService.publishCheckInSuccess(booking, checkInLog);
      } catch (eventError) {
        logger.warn('Failed to publish check-in events', {
          error: eventError.message,
          bookingId,
          userId
        });
      }

      logger.info('Check-in completed successfully', {
        bookingId,
        userId,
        vehicleId: booking.vehicleId
      });

      return checkInLog;
    } catch (error) {
      if (transaction && !transaction.finished) {
        await transaction.rollback();
      }
      logger.error('Failed to process check-in', {
        error: error.message,
        bookingId,
        userId
      });
      throw error;
    }
  }

  async checkOut(bookingId, userId, userRole, checkOutData) {
    const transaction = await db.sequelize.transaction();

    try {
      const booking = await db.Booking.findByPk(bookingId, {
        include: [{
          model: db.Vehicle,
          as: 'vehicle',
          attributes: ['id', 'vehicleName', 'licensePlate', 'status', 'currentOdometer']
        }]
      });

      if (!booking) {
        throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
      }

      // Validate check-out conditions
      await this.validateCheckOut(booking, userId, userRole, checkOutData);

      // Create check-out log
      const checkOutLog = await db.CheckInOutLog.create({
        bookingId,
        actionType: 'check_out',
        odometerReading: checkOutData.odometerReading,
        fuelLevel: checkOutData.fuelLevel,
        images: checkOutData.images || [],
        notes: checkOutData.notes,
        digitalSignature: checkOutData.digitalSignature,
        performedBy: userId,
        location: checkOutData.location
      }, { transaction });

      // Update booking status
      await booking.update({
        status: 'completed'
      }, { transaction });

      // Update vehicle status and odometer
      await db.Vehicle.update({
        status: 'available',
        currentOdometer: checkOutData.odometerReading || booking.vehicle.currentOdometer
      }, {
        where: { id: booking.vehicleId },
        transaction
      });

      await transaction.commit();

      // Publish events (non-blocking, errors logged but don't fail the request)
      try {
        await eventService.publishCheckOutSuccess(booking, checkOutLog);
        socketService.publishCheckOutSuccess(booking, checkOutLog);
        
        // Calculate usage statistics
        await this.calculateUsageStatistics(booking, checkOutData);
      } catch (eventError) {
        logger.warn('Failed to publish check-out events or calculate stats', {
          error: eventError.message,
          bookingId,
          userId
        });
      }

      logger.info('Check-out completed successfully', {
        bookingId,
        userId,
        vehicleId: booking.vehicleId
      });

      return checkOutLog;
    } catch (error) {
      if (transaction && !transaction.finished) {
        await transaction.rollback();
      }
      logger.error('Failed to process check-out', {
        error: error.message,
        bookingId,
        userId
      });
      throw error;
    }
  }

  async getCheckLogs(bookingId, userId, userRole) {
    try {
      const booking = await db.Booking.findByPk(bookingId);
      
      if (!booking) {
        throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
      }

      // Admin and staff can view any booking's logs
      // Co-owners can only view their own booking logs
      if (!['admin', 'staff'].includes(userRole) && booking.userId !== userId) {
        throw new AppError('Permission denied to view check logs', 403, 'PERMISSION_DENIED');
      }

      const logs = await db.CheckInOutLog.findAll({
        where: { bookingId },
        order: [['performedAt', 'ASC']],
        attributes: {
          exclude: ['digitalSignature'] // Exclude sensitive data
        }
      });

      return logs;
    } catch (error) {
      logger.error('Failed to get check logs', {
        error: error.message,
        bookingId,
        userId
      });
      throw error;
    }
  }

  async generateQRCode(bookingId, userId, userRole) {
    try {
      const booking = await db.Booking.findByPk(bookingId, {
        include: [{
          model: db.Vehicle,
          as: 'vehicle',
          attributes: ['vehicleName', 'licensePlate']
        }]
      });

      if (!booking) {
        throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
      }

      // Admin and staff can generate QR codes for any booking
      // Co-owners can only generate QR codes for their own bookings
      if (!['admin', 'staff'].includes(userRole) && booking.userId !== userId) {
        throw new AppError('Permission denied to generate QR code', 403, 'PERMISSION_DENIED');
      }

      // Check if booking is in a state that allows QR code generation
      if (!['confirmed', 'in_progress'].includes(booking.status)) {
        throw new AppError('QR code can only be generated for confirmed or in-progress bookings', 400, 'INVALID_BOOKING_STATUS');
      }

      const qrData = {
        bookingId,
        userId,
        vehicleId: booking.vehicleId,
        timestamp: Date.now(),
        action: 'check_in_out'
      };

      // Generate digital signature
      const signature = this.generateSignature(qrData);
      
      const qrCode = {
        ...qrData,
        signature,
        expiresAt: Date.now() + this.qrCodeExpiry,
        vehicleInfo: {
          name: booking.vehicle.vehicleName,
          licensePlate: booking.vehicle.licensePlate
        }
      };

      // Store QR code in cache for validation
      const cacheKey = `qr_code:${bookingId}:${signature}`;
      await redisClient.set(cacheKey, JSON.stringify(qrCode), this.qrCodeExpiry / 1000);

      // Generate QR code image as data URL
      const qrCodeString = JSON.stringify(qrCode);
      const qrImageDataURL = await QRCode.toDataURL(qrCodeString, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        width: 300,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      logger.info('QR code generated successfully', {
        bookingId,
        userId
      });

      return {
        qrCode: Buffer.from(JSON.stringify(qrCode)).toString('base64'), // For validation
        qrImage: qrImageDataURL, // Actual QR code image
        expiresAt: qrCode.expiresAt,
        bookingInfo: {
          id: booking.id,
          startTime: booking.startTime,
          endTime: booking.endTime,
          status: booking.status
        }
      };
    } catch (error) {
      logger.error('Failed to generate QR code', {
        error: error.message,
        bookingId,
        userId
      });
      throw error;
    }
  }

  async validateQRCode(qrCodeData, secret, userId) {
    try {
      // Decode QR code data
      let qrData;
      try {
        qrData = JSON.parse(Buffer.from(qrCodeData, 'base64').toString());
      } catch (error) {
        return { valid: false, error: 'Invalid QR code format' };
      }

      // Check expiration
      if (Date.now() > qrData.expiresAt) {
        return { valid: false, error: 'QR code has expired' };
      }

      // Verify signature
      const expectedSignature = this.generateSignature(qrData);
      if (qrData.signature !== expectedSignature) {
        return { valid: false, error: 'Invalid QR code signature' };
      }

      // Verify secret (if provided)
      if (secret && secret !== this.qrCodeSecret) {
        return { valid: false, error: 'Invalid secret' };
      }

      // Check if QR code exists in cache
      const cacheKey = `qr_code:${qrData.bookingId}:${qrData.signature}`;
      const cached = await redisClient.get(cacheKey);
      if (!cached) {
        return { valid: false, error: 'QR code not found or already used' };
      }

      // Get booking information
      const booking = await db.Booking.findByPk(qrData.bookingId, {
        include: [{
          model: db.Vehicle,
          as: 'vehicle',
          attributes: ['vehicleName', 'licensePlate', 'status']
        }]
      });

      if (!booking) {
        return { valid: false, error: 'Booking not found' };
      }

      // Remove QR code from cache after successful validation
      await redisClient.del(cacheKey);

      return {
        valid: true,
        booking: {
          id: booking.id,
          userId: booking.userId,
          vehicleId: booking.vehicleId,
          startTime: booking.startTime,
          endTime: booking.endTime,
          status: booking.status,
          vehicle: booking.vehicle
        },
        qrData
      };
    } catch (error) {
      logger.error('Failed to validate QR code', {
        error: error.message,
        userId
      });
      return { valid: false, error: 'QR code validation failed' };
    }
  }

  // Private methods
  async validateCheckIn(booking, userId, userRole, checkInData) {
    // Admin and staff can check in any booking
    // Co-owners can only check in their own bookings
    if (!['admin', 'staff'].includes(userRole) && booking.userId !== userId) {
      throw new AppError('Permission denied to check in this booking', 403, 'PERMISSION_DENIED');
    }

    // Check booking status
    if (booking.status !== 'confirmed') {
      throw new AppError('Booking must be confirmed to check in', 400, 'INVALID_BOOKING_STATUS');
    }

    // Check time window only for co-owners (staff/admin can check-in anytime)
    if (!['admin', 'staff'].includes(userRole)) {
      const now = new Date();
      const startTime = new Date(booking.startTime);
      const earliestCheckIn = new Date(startTime.getTime() - 15 * 60 * 1000);

      if (now < earliestCheckIn) {
        throw new AppError('Too early to check in', 400, 'CHECK_IN_TOO_EARLY');
      }

      if (now > new Date(booking.endTime)) {
        throw new AppError('Booking has expired', 400, 'BOOKING_EXPIRED');
      }
    }

    // Validate odometer reading
    if (checkInData.odometerReading) {
      const vehicle = await db.Vehicle.findByPk(booking.vehicleId);
      
      // For co-owners: strict validation
      // For staff/admin: allow override (they may need to correct errors)
      if (!['admin', 'staff'].includes(userRole)) {
        if (checkInData.odometerReading < vehicle.currentOdometer) {
          throw new AppError('Odometer reading cannot be less than current vehicle odometer', 400, 'INVALID_ODOMETER');
        }
      } else {
        // For staff/admin: just log warning if odometer seems wrong
        if (checkInData.odometerReading < vehicle.currentOdometer) {
          logger.warn('Staff/admin check-in with lower odometer', {
            bookingId: booking.id,
            vehicleId: vehicle.id,
            currentOdometer: vehicle.currentOdometer,
            checkInOdometer: checkInData.odometerReading
          });
        }
      }
    }

    // Check if already checked in
    const existingCheckIn = await db.CheckInOutLog.findOne({
      where: {
        bookingId: booking.id,
        actionType: 'check_in'
      }
    });

    if (existingCheckIn) {
      throw new AppError('Booking already checked in', 400, 'ALREADY_CHECKED_IN');
    }
  }

  async validateCheckOut(booking, userId, userRole, checkOutData) {
    // Admin and staff can check out any booking
    // Co-owners can only check out their own bookings
    if (!['admin', 'staff'].includes(userRole) && booking.userId !== userId) {
      throw new AppError('Permission denied to check out this booking', 403, 'PERMISSION_DENIED');
    }

    // Check booking status
    if (booking.status !== 'in_progress') {
      throw new AppError('Booking must be in progress to check out', 400, 'INVALID_BOOKING_STATUS');
    }

    // Validate odometer reading
    if (checkOutData.odometerReading) {
      const checkInLog = await db.CheckInOutLog.findOne({
        where: {
          bookingId: booking.id,
          actionType: 'check_in'
        }
      });

      if (checkInLog && checkOutData.odometerReading < checkInLog.odometerReading) {
        throw new AppError('Check-out odometer cannot be less than check-in odometer', 400, 'INVALID_ODOMETER');
      }
    }

    // Check if already checked out
    const existingCheckOut = await db.CheckInOutLog.findOne({
      where: {
        bookingId: booking.id,
        actionType: 'check_out'
      }
    });

    if (existingCheckOut) {
      throw new AppError('Booking already checked out', 400, 'ALREADY_CHECKED_OUT');
    }
  }

  generateSignature(data) {
    const { signature, ...dataToSign } = data;
    const message = JSON.stringify(dataToSign);
    return crypto
      .createHmac('sha256', this.qrCodeSecret)
      .update(message)
      .digest('hex');
  }

  async checkLogViewPermission(bookingId, userId) {
    try {
      const booking = await db.Booking.findByPk(bookingId);
      
      // Check if user is group admin or staff
      // This would integrate with User Service
      // For now, return false for security
      return false;
    } catch (error) {
      logger.error('Failed to check log view permission', {
        error: error.message,
        bookingId,
        userId
      });
      return false;
    }
  }

  async calculateUsageStatistics(booking, checkOutData) {
    try {
      const checkInLog = await db.CheckInOutLog.findOne({
        where: {
          bookingId: booking.id,
          actionType: 'check_in'
        }
      });

      if (checkInLog && checkOutData.odometerReading) {
        const actualDistance = checkOutData.odometerReading - checkInLog.odometerReading;
        const duration = (new Date() - new Date(checkInLog.performedAt)) / (1000 * 60 * 60); // hours
        const energyConsumed = checkInLog.fuelLevel - (checkOutData.fuelLevel || 0); // Battery % consumed
        
        // Calculate efficiency (km/kWh)
        // Assuming vehicle has ~60kWh battery capacity (adjust as needed)
        const batteryCapacityKWh = 60;
        const kWhConsumed = (energyConsumed / 100) * batteryCapacityKWh;
        const efficiency = kWhConsumed > 0 ? (actualDistance / kWhConsumed) : null;

        // Calculate cost (VND)
        // Base rate: 60,000 VND/hour + 5,000 VND/km
        const hourlyRate = 60000;
        const kmRate = 5000;
        const cost = (duration * hourlyRate) + (actualDistance * kmRate);

        // Update booking with calculated values
        await booking.update({
          actualDistance: actualDistance,
          efficiency: efficiency ? parseFloat(efficiency.toFixed(2)) : null,
          cost: parseFloat(cost.toFixed(2))
        });

        // Store usage statistics (could be sent to analytics service)
        const usageStats = {
          bookingId: booking.id,
          userId: booking.userId,
          vehicleId: booking.vehicleId,
          groupId: booking.groupId,
          distanceKm: actualDistance,
          durationHours: duration,
          energyConsumed: energyConsumed,
          efficiency: efficiency,
          cost: cost,
          checkInTime: checkInLog.performedAt,
          checkOutTime: new Date()
        };

        // Publish usage statistics event
        await eventService.publishUsageStatistics(usageStats);

        logger.info('Usage statistics calculated and booking updated', {
          bookingId: booking.id,
          actualDistance,
          efficiency,
          cost,
          duration
        });
      }
    } catch (error) {
      logger.error('Failed to calculate usage statistics', {
        error: error.message,
        bookingId: booking.id
      });
    }
  }
}

export default new CheckInOutService();