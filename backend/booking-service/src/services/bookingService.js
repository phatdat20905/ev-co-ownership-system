// booking-service/src/services/bookingService.js
import { logger, AppError, userServiceClient, redisClient } from '@ev-coownership/shared';
import db from '../models/index.js';
import priorityService from './priorityService.js';
import conflictService from './conflictService.js';
import validationService from './validationService.js';
import eventService from './eventService.js';
import calendarService from './calendarService.js';

const { Op } = db.Sequelize;

export class BookingService {
  constructor() {
    this.bookingRules = {
      MIN_DURATION: 2 * 60 * 60 * 1000,      // 2 hours
      MAX_DURATION: 24 * 60 * 60 * 1000,     // 24 hours
      MAX_ADVANCE_DAYS: 30,
      SAME_DAY_CUTOFF_HOURS: 2,
      MAX_BOOKINGS_PER_DAY: 3,
      MAX_ACTIVE_BOOKINGS: 5
    };
  }

  async createBooking(bookingData, userId) {
    const transaction = await db.sequelize.transaction();

    try {
      logger.info('Creating new booking', { userId, bookingData });

      // 1. Validate input data
      await validationService.validateBookingData(bookingData);

      // 2. Check user permissions and group membership
      await this.verifyUserPermissions(userId, bookingData.groupId);

      // 3. Check vehicle availability
      await validationService.validateVehicleAvailability(
        bookingData.vehicleId,
        bookingData.startTime,
        bookingData.endTime
      );

      // 4. Check user booking limits
      await validationService.validateUserBookingLimits(userId, bookingData);

      // 5. Calculate priority score
      const priorityScore = await priorityService.calculatePriorityScore(
        userId,
        bookingData.groupId,
        bookingData
      );

      // 6. Create booking
      const booking = await db.Booking.create({
        ...bookingData,
        userId,
        priorityScore,
        status: priorityScore >= 80 ? 'confirmed' : 'pending'
      }, { transaction });

      // 7. Auto-confirm if high priority
      if (priorityScore >= 80) {
        await booking.update({ 
          status: 'confirmed',
          autoConfirmed: true 
        }, { transaction });
        await eventService.publishBookingConfirmed(booking);
        
        // 🔌 NEW: Real-time notification
        socketService.publishBookingCreated(booking);
      }

      // 8. Check for conflicts
      await conflictService.detectAndHandleConflicts(booking);

      await transaction.commit();

      // 9. Clear relevant caches
      await calendarService.clearCalendarCache(bookingData.vehicleId, bookingData.groupId);

      // 10. Publish events
      await eventService.publishBookingCreated(booking);
      
      // 🔌 NEW: Real-time notification for all cases
      if (booking.status !== 'confirmed') {
        socketService.publishBookingCreated(booking);
      }

      // 🔌 NEW: Trigger calendar update
      await calendarService.triggerCalendarUpdate(
        bookingData.vehicleId,
        bookingData.groupId,
        'booking_created',
        { bookingId: booking.id }
      );

      logger.info('Booking created successfully', { 
        bookingId: booking.id, 
        userId,
        status: booking.status
      });

      return await this.getBookingById(booking.id, userId);
    } catch (error) {
      await transaction.rollback();
      logger.error('Failed to create booking', { 
        error: error.message, 
        userId,
        bookingData 
      });
      throw error;
    }
  }


  async getBookingById(bookingId, userId) {
    try {
      const booking = await db.Booking.findByPk(bookingId, {
        include: [
          {
            model: db.Vehicle,
            as: 'vehicle',
            attributes: ['id', 'vehicleName', 'licensePlate', 'brand', 'model', 'status']
          },
          {
            model: db.CheckInOutLog,
            as: 'checkLogs',
            attributes: ['id', 'actionType', 'performedAt', 'odometerReading', 'fuelLevel'],
            order: [['performedAt', 'ASC']]
          }
        ]
      });

      if (!booking) {
        throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
      }

      // Check if user has permission to view this booking
      await this.verifyBookingAccess(booking, userId);

      return booking;
    } catch (error) {
      logger.error('Failed to get booking', { 
        error: error.message, 
        bookingId,
        userId 
      });
      throw error;
    }
  }

  async getUserBookings(userId, filters = {}) {
    try {
      const {
        status,
        vehicleId,
        groupId,
        page = 1,
        limit = 10,
        sort = 'startTime',
        order = 'DESC'
      } = filters;

      const where = { userId };
      
      if (status) where.status = status;
      if (vehicleId) where.vehicleId = vehicleId;
      if (groupId) where.groupId = groupId;

      const offset = (page - 1) * limit;

      const { count, rows: bookings } = await db.Booking.findAndCountAll({
        where,
        include: [
          {
            model: db.Vehicle,
            as: 'vehicle',
            attributes: ['id', 'vehicleName', 'licensePlate', 'brand', 'model']
          }
        ],
        order: [[sort, order]],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      return {
        bookings,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      logger.error('Failed to get user bookings', { 
        error: error.message, 
        userId 
      });
      throw error;
    }
  }

  async updateBooking(bookingId, updateData, userId) {
    const transaction = await db.sequelize.transaction();

    try {
      const booking = await this.getBookingById(bookingId, userId);

      // Store old data for real-time comparison
      const oldBookingData = { ...booking.toJSON() };

      // Check if booking can be modified
      if (!['pending', 'confirmed'].includes(booking.status)) {
        throw new AppError('Booking cannot be modified in its current state', 400, 'BOOKING_NOT_MODIFIABLE');
      }

      // Validate update data
      await validationService.validateBookingUpdate(updateData, booking);

      // If time is being changed, check availability
      if (updateData.startTime || updateData.endTime) {
        const newStartTime = updateData.startTime || booking.startTime;
        const newEndTime = updateData.endTime || booking.endTime;
        
        await validationService.validateVehicleAvailability(
          booking.vehicleId,
          newStartTime,
          newEndTime,
          bookingId
        );
      }

      // Update booking
      const updatedBooking = await booking.update(updateData, { transaction });

      // Re-check for conflicts if time changed
      if (updateData.startTime || updateData.endTime) {
        await conflictService.detectAndHandleConflicts(updatedBooking);
      }

      await transaction.commit();

      // Clear caches
      await calendarService.clearCalendarCache(booking.vehicleId, booking.groupId);

      // Publish events
      await eventService.publishBookingUpdated(updatedBooking);
      
      // 🔌 NEW: Real-time notification
      socketService.publishBookingUpdated(updatedBooking, oldBookingData);

      // 🔌 NEW: Trigger calendar update
      await calendarService.triggerCalendarUpdate(
        booking.vehicleId,
        booking.groupId,
        'booking_updated',
        { 
          bookingId: booking.id,
          changes: socketService.getChangedFields(oldBookingData, updatedBooking.toJSON())
        }
      );

      logger.info('Booking updated successfully', { 
        bookingId, 
        userId 
      });

      return await this.getBookingById(bookingId, userId);
    } catch (error) {
      await transaction.rollback();
      logger.error('Failed to update booking', { 
        error: error.message, 
        bookingId,
        userId 
      });
      throw error;
    }
  }

  async cancelBooking(bookingId, userId, reason) {
    const transaction = await db.sequelize.transaction();

    try {
      const booking = await this.getBookingById(bookingId, userId);

      // Store old data
      const oldBookingData = { ...booking.toJSON() };

      // Check if booking can be cancelled
      if (!['pending', 'confirmed'].includes(booking.status)) {
        throw new AppError('Booking cannot be cancelled in its current state', 400, 'BOOKING_NOT_CANCELLABLE');
      }

      // Update booking status
      await booking.update({
        status: 'cancelled',
        cancellationReason: reason
      }, { transaction });

      // Resolve any conflicts related to this booking
      await db.BookingConflict.update(
        {
          resolved: true,
          resolvedBy: userId,
          resolutionNote: `Booking cancelled: ${reason}`,
          resolvedAt: new Date()
        },
        {
          where: {
            [Op.or]: [
              { bookingId_1: bookingId },
              { bookingId_2: bookingId }
            ],
            resolved: false
          },
          transaction
        }
      );

      await transaction.commit();

      // Clear caches
      await calendarService.clearCalendarCache(booking.vehicleId, booking.groupId);

      // Publish events
      await eventService.publishBookingCancelled(booking);
      
      // 🔌 NEW: Real-time notification
      socketService.publishBookingCancelled(booking);

      // 🔌 NEW: Trigger calendar update
      await calendarService.triggerCalendarUpdate(
        booking.vehicleId,
        booking.groupId,
        'booking_cancelled',
        { bookingId: booking.id, reason }
      );

      logger.info('Booking cancelled successfully', { 
        bookingId, 
        userId,
        reason 
      });

      return await this.getBookingById(bookingId, userId);
    } catch (error) {
      await transaction.rollback();
      logger.error('Failed to cancel booking', { 
        error: error.message, 
        bookingId,
        userId 
      });
      throw error;
    }
  }

  async getBookingHistory(userId, period = '30d', page = 1, limit = 20) {
    try {
      const dateRange = this.calculateDateRange(period);
      
      const { count, rows: bookings } = await db.Booking.findAndCountAll({
        where: {
          userId,
          status: ['completed', 'cancelled'],
          createdAt: {
            [Op.between]: [dateRange.start, dateRange.end]
          }
        },
        include: [
          {
            model: db.Vehicle,
            as: 'vehicle',
            attributes: ['id', 'vehicleName', 'licensePlate']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: (page - 1) * limit
      });

      return {
        bookings,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        },
        period
      };
    } catch (error) {
      logger.error('Failed to get booking history', { 
        error: error.message, 
        userId 
      });
      throw error;
    }
  }

  async getBookingStats(userId, groupId = null) {
    try {
      const cacheKey = `booking_stats:${userId}:${groupId || 'all'}`;
      
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const where = { userId };
      if (groupId) {
        where.groupId = groupId;
      }

      const stats = await db.Booking.findAll({
        where,
        attributes: [
          'status',
          [db.Sequelize.fn('COUNT', db.Sequelize.col('id')), 'count'],
          [db.Sequelize.fn('SUM', db.Sequelize.literal(
            "CASE WHEN status = 'completed' THEN EXTRACT(EPOCH FROM (end_time - start_time))/3600 ELSE 0 END"
          )), 'totalHours']
        ],
        group: ['status'],
        raw: true
      });

      const totalBookings = await db.Booking.count({ where });
      const upcomingBookings = await db.Booking.count({
        where: {
          ...where,
          status: ['pending', 'confirmed'],
          startTime: { [Op.gt]: new Date() }
        }
      });

      const completedBookings = stats.find(s => s.status === 'completed');
      const totalHours = completedBookings ? parseFloat(completedBookings.totalHours || 0) : 0;

      const result = {
        userId,
        groupId,
        totalBookings,
        upcomingBookings,
        totalHours: Math.round(totalHours * 100) / 100,
        byStatus: stats.reduce((acc, item) => {
          acc[item.status] = parseInt(item.count);
          return acc;
        }, {})
      };

      // Cache for 5 minutes
      await redisClient.set(cacheKey, JSON.stringify(result), 300);

      return result;
    } catch (error) {
      logger.error('Failed to get booking stats', { 
        error: error.message, 
        userId 
      });
      throw error;
    }
  }

  async getUpcomingBookings(userId, limit = 5) {
    try {
      const now = new Date();

      const bookings = await db.Booking.findAll({
        where: {
          userId,
          status: ['pending', 'confirmed'],
          startTime: { [Op.gt]: now }
        },
        include: [{
          model: db.Vehicle,
          as: 'vehicle',
          attributes: ['id', 'vehicleName', 'licensePlate', 'brand', 'model']
        }],
        order: [['startTime', 'ASC']],
        limit: parseInt(limit)
      });

      return bookings;
    } catch (error) {
      logger.error('Failed to get upcoming bookings', {
        error: error.message,
        userId
      });
      throw error;
    }
  }

  async checkBookingEligibility(userId, vehicleId, startTime, endTime) {
    try {
      const eligibility = {
        eligible: true,
        reasons: [],
        warnings: []
      };

      // Check vehicle availability
      const availability = await calendarService.checkAvailability(vehicleId, startTime, endTime, userId);
      if (!availability.available) {
        eligibility.eligible = false;
        eligibility.reasons.push(availability.reason);
      }

      // Check user booking limits
      try {
        await validationService.validateUserBookingLimits(userId, { startTime, endTime });
      } catch (error) {
        eligibility.eligible = false;
        eligibility.reasons.push(error.message);
      }

      // Check advance booking limit
      const now = new Date();
      const start = new Date(startTime);
      const maxAdvanceDate = new Date(now.getTime() + this.bookingRules.MAX_ADVANCE_DAYS * 24 * 60 * 60 * 1000);
      
      if (start > maxAdvanceDate) {
        eligibility.eligible = false;
        eligibility.reasons.push(`Cannot book more than ${this.bookingRules.MAX_ADVANCE_DAYS} days in advance`);
      }

      // Check same-day booking cutoff
      if (this.isSameDay(start, now)) {
        const cutoffTime = new Date(now.getTime() + this.bookingRules.SAME_DAY_CUTOFF_HOURS * 60 * 60 * 1000);
        if (start < cutoffTime) {
          eligibility.eligible = false;
          eligibility.reasons.push(`Same-day bookings must be at least ${this.bookingRules.SAME_DAY_CUTOFF_HOURS} hours in advance`);
        }
      }

      // Add warnings for non-blocking issues
      const duration = (new Date(endTime) - new Date(startTime)) / (1000 * 60 * 60);
      if (duration > 8) {
        eligibility.warnings.push('Long booking duration may affect vehicle availability for other users');
      }

      return eligibility;
    } catch (error) {
      logger.error('Failed to check booking eligibility', {
        error: error.message,
        userId,
        vehicleId
      });
      throw error;
    }
  }

  async extendBooking(bookingId, newEndTime, userId, reason) {
    const transaction = await db.sequelize.transaction();

    try {
      const booking = await this.getBookingById(bookingId, userId);

      // Check if booking can be extended
      if (booking.status !== 'in_progress') {
        throw new AppError('Only in-progress bookings can be extended', 400, 'INVALID_BOOKING_STATUS');
      }

      const currentEndTime = new Date(booking.endTime);
      const requestedEndTime = new Date(newEndTime);

      if (requestedEndTime <= currentEndTime) {
        throw new AppError('New end time must be after current end time', 400, 'INVALID_EXTENSION_TIME');
      }

      // Check maximum extension (e.g., 2 hours)
      const maxExtension = 2 * 60 * 60 * 1000; // 2 hours
      if (requestedEndTime - currentEndTime > maxExtension) {
        throw new AppError(`Maximum extension is ${maxExtension / (60 * 60 * 1000)} hours`, 400, 'MAX_EXTENSION_EXCEEDED');
      }

      // Check vehicle availability for extension period
      const availability = await calendarService.checkAvailability(
        booking.vehicleId,
        currentEndTime,
        requestedEndTime,
        userId
      );

      if (!availability.available) {
        throw new AppError('Vehicle is not available for the extended period', 409, 'EXTENSION_NOT_AVAILABLE');
      }

      // Update booking
      const updatedBooking = await booking.update({
        endTime: requestedEndTime,
        notes: booking.notes ? `${booking.notes}\nExtended: ${reason}` : `Extended: ${reason}`
      }, { transaction });

      await transaction.commit();

      // Clear caches
      await calendarService.clearCalendarCache(booking.vehicleId, booking.groupId);

      await eventService.publishBookingUpdated(updatedBooking);

      logger.info('Booking extended successfully', {
        bookingId,
        userId,
        originalEndTime: currentEndTime,
        newEndTime: requestedEndTime,
        reason
      });

      return await this.getBookingById(bookingId, userId);
    } catch (error) {
      await transaction.rollback();
      logger.error('Failed to extend booking', {
        error: error.message,
        bookingId,
        userId
      });
      throw error;
    }
  }

  // ========== PRIVATE METHODS ==========

  async verifyUserPermissions(userId, groupId) {
    try {
      // Call User Service to verify group membership and permissions
      const response = await userServiceClient.get(
        `${process.env.USER_SERVICE_URL}/groups/${groupId}/members/${userId}/verify`
      );

      if (!response.data.isMember) {
        throw new AppError('User is not a member of this group', 403, 'PERMISSION_DENIED');
      }

      if (!response.data.canBook) {
        throw new AppError('User does not have permission to book vehicles in this group', 403, 'BOOKING_PERMISSION_DENIED');
      }

      return response.data;
    } catch (error) {
      logger.error('Failed to verify user permissions', { 
        error: error.message, 
        userId,
        groupId 
      });
      
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError('Failed to verify user permissions', 500, 'PERMISSION_VERIFICATION_FAILED');
    }
  }

  async verifyBookingAccess(booking, userId) {
    // User can access their own bookings
    if (booking.userId === userId) {
      return true;
    }

    // Check if user is group admin or has permission to view all group bookings
    try {
      const response = await userServiceClient.get(
        `${process.env.USER_SERVICE_URL}/groups/${booking.groupId}/members/${userId}/permissions`
      );

      if (response.data.canViewAllBookings) {
        return true;
      }
    } catch (error) {
      logger.error('Failed to verify booking access permissions', { 
        error: error.message, 
        userId,
        groupId: booking.groupId 
      });
    }

    throw new AppError('You do not have permission to view this booking', 403, 'PERMISSION_DENIED');
  }

  calculateDateRange(period) {
    const end = new Date();
    const start = new Date();

    switch (period) {
      case '7d':
        start.setDate(start.getDate() - 7);
        break;
      case '30d':
        start.setDate(start.getDate() - 30);
        break;
      case '90d':
        start.setDate(start.getDate() - 90);
        break;
      case '1y':
        start.setFullYear(start.getFullYear() - 1);
        break;
      default:
        start.setDate(start.getDate() - 30);
    }

    return { start, end };
  }

  isSameDay(date1, date2) {
    return date1.toDateString() === date2.toDateString();
  }

  async autoProcessPendingBookings() {
    try {
      const now = new Date();
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

      // Find pending bookings that start within the next hour
      const pendingBookings = await db.Booking.findAll({
        where: {
          status: 'pending',
          startTime: {
            [Op.between]: [now, oneHourFromNow]
          }
        },
        order: [['priorityScore', 'DESC'], ['createdAt', 'ASC']]
      });

      let processedCount = 0;

      for (const booking of pendingBookings) {
        try {
          // Check if vehicle is still available
          const availability = await calendarService.checkAvailability(
            booking.vehicleId,
            booking.startTime,
            booking.endTime,
            booking.userId
          );

          if (availability.available) {
            // Auto-confirm the booking
            await booking.update({ status: 'confirmed', autoConfirmed: true });
            await eventService.publishBookingConfirmed(booking);
            processedCount++;

            logger.info('Pending booking auto-confirmed', {
              bookingId: booking.id,
              priorityScore: booking.priorityScore
            });
          } else {
            // Mark as conflict if not available
            await booking.update({ status: 'conflict' });
            await conflictService.detectAndHandleConflicts(booking);
            
            logger.warn('Pending booking marked as conflict due to unavailability', {
              bookingId: booking.id
            });
          }
        } catch (error) {
          logger.error('Failed to auto-process pending booking', {
            error: error.message,
            bookingId: booking.id
          });
        }
      }

      logger.info('Auto-processed pending bookings', {
        total: pendingBookings.length,
        processed: processedCount,
        failed: pendingBookings.length - processedCount
      });

      return { processed: processedCount, total: pendingBookings.length };
    } catch (error) {
      logger.error('Failed to auto-process pending bookings', {
        error: error.message
      });
      throw error;
    }
  }
}

export default new BookingService();