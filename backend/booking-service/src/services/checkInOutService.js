// booking-service/src/services/checkInOutService.js
import { logger, AppError, redisClient } from '@ev-coownership/shared';
import db from '../models/index.js';
import eventService from './eventService.js';
import crypto from 'crypto';

export class CheckInOutService {
  constructor() {
    this.qrCodeExpiry = parseInt(process.env.QR_CODE_EXPIRY) || 30 * 60 * 1000; // 30 minutes
    this.qrCodeSecret = process.env.QR_CODE_SECRET || 'your_qr_secret_here';
  }

  async checkIn(bookingId, userId, checkInData) {
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
      await this.validateCheckIn(booking, userId, checkInData);

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

      // Publish events
      await eventService.publishCheckInSuccess(booking, checkInLog);
      
      // 🔌 NEW: Real-time check-in notification
      socketService.publishCheckInSuccess(booking, checkInLog);

      logger.info('Check-in completed successfully', {
        bookingId,
        userId,
        vehicleId: booking.vehicleId
      });

      return checkInLog;
    } catch (error) {
      await transaction.rollback();
      logger.error('Failed to process check-in', {
        error: error.message,
        bookingId,
        userId
      });
      throw error;
    }
  }

  async checkOut(bookingId, userId, checkOutData) {
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
      await this.validateCheckOut(booking, userId, checkOutData);

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

      // Publish events
      await eventService.publishCheckOutSuccess(booking, checkOutLog);
      
      // 🔌 NEW: Real-time check-out notification
      socketService.publishCheckOutSuccess(booking, checkOutLog);

      // Calculate usage statistics
      await this.calculateUsageStatistics(booking, checkOutData);

      logger.info('Check-out completed successfully', {
        bookingId,
        userId,
        vehicleId: booking.vehicleId
      });

      return checkOutLog;
    } catch (error) {
      await transaction.rollback();
      logger.error('Failed to process check-out', {
        error: error.message,
        bookingId,
        userId
      });
      throw error;
    }
  }

  async getCheckLogs(bookingId, userId) {
    try {
      const booking = await db.Booking.findByPk(bookingId);
      
      if (!booking) {
        throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
      }

      // Check permission
      if (booking.userId !== userId) {
        // Verify if user has permission to view this booking's logs
        const hasPermission = await this.checkLogViewPermission(bookingId, userId);
        if (!hasPermission) {
          throw new AppError('Permission denied to view check logs', 403, 'PERMISSION_DENIED');
        }
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

  async generateQRCode(bookingId, userId) {
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

      if (booking.userId !== userId) {
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

      logger.info('QR code generated successfully', {
        bookingId,
        userId
      });

      return {
        qrCode: Buffer.from(JSON.stringify(qrCode)).toString('base64'),
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
  async validateCheckIn(booking, userId, checkInData) {
    // Check if user has permission
    if (booking.userId !== userId) {
      throw new AppError('Permission denied to check in this booking', 403, 'PERMISSION_DENIED');
    }

    // Check booking status
    if (booking.status !== 'confirmed') {
      throw new AppError('Booking must be confirmed to check in', 400, 'INVALID_BOOKING_STATUS');
    }

    // Check time window (allow check-in 15 minutes before start time)
    const now = new Date();
    const startTime = new Date(booking.startTime);
    const earliestCheckIn = new Date(startTime.getTime() - 15 * 60 * 1000);

    if (now < earliestCheckIn) {
      throw new AppError('Too early to check in', 400, 'CHECK_IN_TOO_EARLY');
    }

    if (now > new Date(booking.endTime)) {
      throw new AppError('Booking has expired', 400, 'BOOKING_EXPIRED');
    }

    // Validate odometer reading
    if (checkInData.odometerReading) {
      const vehicle = await db.Vehicle.findByPk(booking.vehicleId);
      if (checkInData.odometerReading < vehicle.currentOdometer) {
        throw new AppError('Odometer reading cannot be less than current vehicle odometer', 400, 'INVALID_ODOMETER');
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

  async validateCheckOut(booking, userId, checkOutData) {
    // Check if user has permission
    if (booking.userId !== userId) {
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
        const distance = checkOutData.odometerReading - checkInLog.odometerReading;
        const duration = (new Date() - new Date(checkInLog.performedAt)) / (1000 * 60 * 60); // hours

        // Store usage statistics (could be sent to analytics service)
        const usageStats = {
          bookingId: booking.id,
          userId: booking.userId,
          vehicleId: booking.vehicleId,
          groupId: booking.groupId,
          distanceKm: distance,
          durationHours: duration,
          fuelConsumed: checkInLog.fuelLevel - (checkOutData.fuelLevel || 0),
          checkInTime: checkInLog.performedAt,
          checkOutTime: new Date()
        };

        // Publish usage statistics event
        await eventService.publishUsageStatistics(usageStats);

        logger.debug('Usage statistics calculated', {
          bookingId: booking.id,
          distance,
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