// booking-service/src/services/adminService.js
import { logger, AppError, redisClient, userServiceClient } from '@ev-coownership/shared';
import db from '../models/index.js';
import eventService from './eventService.js';
import calendarService from './calendarService.js';
import analyticsService from './analyticsService.js';

const { Op } = db.Sequelize;

export class AdminService {
  async getAllBookings(filters = {}, adminUserId) {
    try {
      const {
        status,
        groupId,
        vehicleId,
        userId,
        startDate,
        endDate,
        page = 1,
        limit = 20
      } = filters;

      const where = {};
      
      if (status) where.status = status;
      if (groupId) where.groupId = groupId;
      if (vehicleId) where.vehicleId = vehicleId;
      if (userId) where.userId = userId;

      if (startDate && endDate) {
        where.startTime = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }

      const offset = (page - 1) * limit;

      const { count, rows } = await db.Booking.findAndCountAll({
        where,
        include: [
          {
            model: db.Vehicle,
            as: 'vehicle',
            attributes: ['id', 'vehicleName', 'licensePlate', 'brand', 'model']
          },
          {
            model: db.CheckInOutLog,
            as: 'checkLogs',
            attributes: ['id', 'actionType', 'performedAt'],
            limit: 1,
            order: [['performedAt', 'DESC']]
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      logger.debug('Admin retrieved all bookings', { adminUserId, count });

      return {
        bookings: rows,
        filters,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      logger.error('Error getting all bookings as admin', { error: error.message, adminUserId });
      throw error;
    }
  }

  async getBooking(bookingId, adminUserId) {
    try {
      const booking = await db.Booking.findByPk(bookingId, {
        include: [
          {
            model: db.Vehicle,
            as: 'vehicle',
            attributes: ['id', 'vehicleName', 'licensePlate', 'brand', 'model', 'groupId', 'status']
          },
          {
            model: db.CheckInOutLog,
            as: 'checkLogs',
            order: [['performedAt', 'ASC']]
          },
          {
            model: db.BookingConflict,
            as: 'conflictsAsBooking1',
            include: [
              {
                model: db.Booking,
                as: 'booking2',
                attributes: ['id', 'userId', 'startTime', 'endTime', 'status']
              }
            ]
          },
          {
            model: db.BookingConflict,
            as: 'conflictsAsBooking2',
            include: [
              {
                model: db.Booking,
                as: 'booking1',
                attributes: ['id', 'userId', 'startTime', 'endTime', 'status']
              }
            ]
          }
        ]
      });

      if (!booking) {
        throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
      }

      logger.debug('Admin retrieved booking details', { bookingId, adminUserId });

      return booking;
    } catch (error) {
      logger.error('Error getting booking as admin', { error: error.message, bookingId, adminUserId });
      throw error;
    }
  }

  async updateBookingStatus(bookingId, status, reason, adminUserId) {
    const transaction = await db.sequelize.transaction();

    try {
      const booking = await db.Booking.findByPk(bookingId);
      if (!booking) {
        throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
      }

      const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
      if (!validStatuses.includes(status)) {
        throw new AppError(`Invalid status: ${status}`, 400, 'INVALID_STATUS');
      }

      const oldStatus = booking.status;
      
      await booking.update({
        status,
        ...(status === 'cancelled' && { cancellationReason: reason })
      }, { transaction });

      // If confirming a booking, resolve any conflicts
      if (status === 'confirmed') {
        await db.BookingConflict.update(
          {
            resolved: true,
            resolvedBy: adminUserId,
            resolutionNote: `Booking confirmed by admin: ${reason}`,
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
      }

      await transaction.commit();

      // Clear caches
      await this.clearBookingCaches(booking.vehicleId, booking.groupId);

      // Publish admin status update event
      await eventService.publishAdminBookingStatusUpdate(bookingId, adminUserId, oldStatus, status, reason);

      logger.info('Admin updated booking status', { 
        bookingId, 
        adminUserId, 
        oldStatus, 
        newStatus: status,
        reason 
      });

      return await this.getBooking(bookingId, adminUserId);
    } catch (error) {
      await transaction.rollback();
      logger.error('Error updating booking status as admin', { error: error.message, bookingId, adminUserId });
      throw error;
    }
  }

  async deleteBooking(bookingId, reason, adminUserId) {
    const transaction = await db.sequelize.transaction();

    try {
      const booking = await db.Booking.findByPk(bookingId);
      if (!booking) {
        throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
      }

      // Store booking data for event
      const bookingData = booking.toJSON();

      // Delete related records first
      await db.CheckInOutLog.destroy({
        where: { bookingId },
        transaction
      });

      await db.BookingConflict.destroy({
        where: {
          [Op.or]: [
            { bookingId_1: bookingId },
            { bookingId_2: bookingId }
          ]
        },
        transaction
      });

      // Delete the booking
      await booking.destroy({ transaction });

      await transaction.commit();

      // Clear caches
      await this.clearBookingCaches(bookingData.vehicleId, bookingData.groupId);

      // Publish admin deletion event
      await eventService.publishAdminBookingDeletion(bookingId, adminUserId, bookingData, reason);

      logger.info('Admin deleted booking', { 
        bookingId, 
        adminUserId, 
        reason,
        originalStatus: bookingData.status 
      });

      return { success: true, message: 'Booking deleted successfully' };
    } catch (error) {
      await transaction.rollback();
      logger.error('Error deleting booking as admin', { error: error.message, bookingId, adminUserId });
      throw error;
    }
  }

  async getBookingAnalytics(period = '30d', adminUserId) {
    try {
      return await analyticsService.getBookingAnalytics(period, adminUserId);
    } catch (error) {
      logger.error('Error getting booking analytics', { error: error.message, adminUserId });
      throw error;
    }
  }

  async getVehicleUtilization(period = '30d', vehicleId = null, adminUserId) {
    try {
      return await analyticsService.getVehicleUtilization(period, vehicleId, adminUserId);
    } catch (error) {
      logger.error('Error getting vehicle utilization', { error: error.message, adminUserId });
      throw error;
    }
  }

  async getGroupTrends(groupId, period = '30d', adminUserId) {
    try {
      return await analyticsService.getGroupTrends(groupId, period, adminUserId);
    } catch (error) {
      logger.error('Error getting group trends', { error: error.message, groupId, adminUserId });
      throw error;
    }
  }

  async generateBookingReport(startDate, endDate, reportType = 'detailed', adminUserId) {
    try {
      return await analyticsService.generateBookingReport(startDate, endDate, reportType, adminUserId);
    } catch (error) {
      logger.error('Error generating booking report', { error: error.message, adminUserId });
      throw error;
    }
  }

  async getPendingConflicts(page = 1, limit = 20, adminUserId) {
    try {
      const offset = (page - 1) * limit;

      const { count, rows } = await db.BookingConflict.findAndCountAll({
        where: { resolved: false },
        include: [
          {
            model: db.Booking,
            as: 'booking1',
            include: [{
              model: db.Vehicle,
              as: 'vehicle',
              attributes: ['vehicleName', 'licensePlate']
            }]
          },
          {
            model: db.Booking,
            as: 'booking2',
            include: [{
              model: db.Vehicle,
              as: 'vehicle',
              attributes: ['vehicleName', 'licensePlate']
            }]
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      return {
        conflicts: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      logger.error('Error getting pending conflicts', { error: error.message, adminUserId });
      throw error;
    }
  }

  async forceCheckIn(bookingId, checkInData, adminUserId) {
    const transaction = await db.sequelize.transaction();

    try {
      const booking = await db.Booking.findByPk(bookingId);
      if (!booking) {
        throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
      }

      // Create check-in log
      const checkInLog = await db.CheckInOutLog.create({
        bookingId,
        actionType: 'check_in',
        odometerReading: checkInData.odometerReading,
        fuelLevel: checkInData.fuelLevel,
        images: checkInData.images || [],
        notes: `Forced check-in by admin: ${checkInData.notes || 'No reason provided'}`,
        performedBy: adminUserId,
        location: checkInData.location
      }, { transaction });

      // Update booking status
      await booking.update({
        status: 'in_progress'
      }, { transaction });

      // Update vehicle status
      await db.Vehicle.update({
        status: 'in_use',
        currentOdometer: checkInData.odometerReading
      }, {
        where: { id: booking.vehicleId },
        transaction
      });

      await transaction.commit();

      // Clear caches
      await calendarService.clearCalendarCache(booking.vehicleId, booking.groupId);

      await eventService.publishCheckInSuccess(booking, checkInLog);

      logger.info('Admin forced check-in', {
        bookingId,
        adminUserId,
        checkInData
      });

      return checkInLog;
    } catch (error) {
      await transaction.rollback();
      logger.error('Error forcing check-in as admin', { error: error.message, bookingId, adminUserId });
      throw error;
    }
  }

  async forceCheckOut(bookingId, checkOutData, adminUserId) {
    const transaction = await db.sequelize.transaction();

    try {
      const booking = await db.Booking.findByPk(bookingId);
      if (!booking) {
        throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
      }

      // Create check-out log
      const checkOutLog = await db.CheckInOutLog.create({
        bookingId,
        actionType: 'check_out',
        odometerReading: checkOutData.odometerReading,
        fuelLevel: checkOutData.fuelLevel,
        images: checkOutData.images || [],
        notes: `Forced check-out by admin: ${checkOutData.notes || 'No reason provided'}`,
        performedBy: adminUserId,
        location: checkOutData.location
      }, { transaction });

      // Update booking status
      await booking.update({
        status: 'completed'
      }, { transaction });

      // Update vehicle status
      await db.Vehicle.update({
        status: 'available',
        currentOdometer: checkOutData.odometerReading
      }, {
        where: { id: booking.vehicleId },
        transaction
      });

      await transaction.commit();

      // Clear caches
      await calendarService.clearCalendarCache(booking.vehicleId, booking.groupId);

      await eventService.publishCheckOutSuccess(booking, checkOutLog);

      logger.info('Admin forced check-out', {
        bookingId,
        adminUserId,
        checkOutData
      });

      return checkOutLog;
    } catch (error) {
      await transaction.rollback();
      logger.error('Error forcing check-out as admin', { error: error.message, bookingId, adminUserId });
      throw error;
    }
  }

  async getSystemHealth() {
    try {
      const healthChecks = await Promise.all([
        this.checkDatabaseHealth(),
        this.checkRedisHealth(),
        this.checkExternalServicesHealth()
      ]);

      const allHealthy = healthChecks.every(check => check.healthy);

      return {
        healthy: allHealthy,
        services: {
          database: healthChecks[0],
          redis: healthChecks[1],
          externalServices: healthChecks[2]
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error checking system health', { error: error.message });
      return {
        healthy: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Private methods
  async clearBookingCaches(vehicleId, groupId) {
    try {
      await calendarService.clearCalendarCache(vehicleId, groupId);
      await analyticsService.clearAnalyticsCache();
      
      // Clear specific booking caches
      const patterns = [
        'booking_stats:*',
        `vehicle_calendar:${vehicleId}:*`,
        `group_calendar:${groupId}:*`
      ];

      for (const pattern of patterns) {
        const keys = await redisClient.keys(pattern);
        if (keys.length > 0) {
          await Promise.all(keys.map(key => redisClient.del(key)));
        }
      }
    } catch (error) {
      logger.error('Error clearing booking caches', { error: error.message, vehicleId });
    }
  }

  async checkDatabaseHealth() {
    try {
      await db.sequelize.authenticate();
      
      // Test a simple query
      const result = await db.Booking.findOne({
        attributes: [[db.Sequelize.fn('COUNT', db.Sequelize.col('id')), 'count']],
        raw: true
      });

      return {
        healthy: true,
        service: 'database',
        details: {
          connection: 'OK',
          query: 'OK'
        }
      };
    } catch (error) {
      return {
        healthy: false,
        service: 'database',
        error: error.message
      };
    }
  }

  async checkRedisHealth() {
    try {
      await redisClient.set('health_check', 'OK', 10);
      const value = await redisClient.get('health_check');
      
      return {
        healthy: value === 'OK',
        service: 'redis',
        details: {
          connection: 'OK',
          readWrite: 'OK'
        }
      };
    } catch (error) {
      return {
        healthy: false,
        service: 'redis',
        error: error.message
      };
    }
  }

  async checkExternalServicesHealth() {
    const services = [
      { name: 'user-service', url: process.env.USER_SERVICE_URL },
      { name: 'vehicle-service', url: process.env.VEHICLE_SERVICE_URL },
      { name: 'auth-service', url: process.env.AUTH_SERVICE_URL }
    ];

    const results = await Promise.all(
      services.map(async (service) => {
        try {
          const response = await userServiceClient.get(`${service.url}/health`, { timeout: 5000 });
          return {
            name: service.name,
            healthy: true,
            status: response.status
          };
        } catch (error) {
          return {
            name: service.name,
            healthy: false,
            error: error.message
          };
        }
      })
    );

    const allHealthy = results.every(result => result.healthy);

    return {
      healthy: allHealthy,
      service: 'external-services',
      details: results
    };
  }
}

export default new AdminService();