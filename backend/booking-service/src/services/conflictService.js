// booking-service/src/services/conflictService.js
import { logger, AppError, userServiceClient } from '@ev-coownership/shared';
import db from '../models/index.js';
import eventService from './eventService.js';

export class ConflictService {
  constructor() {
    this.conflictTypes = {
      TIME_OVERLAP: 'TIME_OVERLAP',
      VEHICLE_UNAVAILABLE: 'VEHICLE_UNAVAILABLE', 
      USER_QUOTA_EXCEEDED: 'USER_QUOTA_EXCEEDED',
      MAINTENANCE_SCHEDULE: 'MAINTENANCE_SCHEDULE',
      GROUP_RESTRICTION: 'GROUP_RESTRICTION'
    };
  }

  async detectAndHandleConflicts(booking) {
    try {
      logger.debug('Detecting conflicts for booking', { bookingId: booking.id });

      const conflicts = await Promise.all([
        this.detectTimeOverlapConflicts(booking),
        this.detectVehicleUnavailableConflicts(booking),
        this.detectUserQuotaConflicts(booking),
        this.detectMaintenanceConflicts(booking),
        this.detectGroupRestrictionConflicts(booking)
      ]);

      const detectedConflicts = conflicts.flat().filter(conflict => conflict !== null);

      for (const conflictData of detectedConflicts) {
        const conflict = await this.createConflictRecord(booking, conflictData);
        
        // 🔌 NEW: Real-time conflict notification (only if conflict was created)
        if (conflict) {
          socketService.publishBookingConflict(conflict);
        }
      }

      if (detectedConflicts.length > 0) {
        await booking.update({ status: 'conflict' });
        await eventService.publishBookingConflictDetected(booking, detectedConflicts);
        
        logger.warn('Conflicts detected for booking', {
          bookingId: booking.id,
          conflictCount: detectedConflicts.length
        });
      }

      return detectedConflicts;
    } catch (error) {
      logger.error('Failed to detect conflicts', {
        error: error.message,
        bookingId: booking.id
      });
      // Don't throw - log error but allow booking to proceed
      return [];
    }
  }

  async detectTimeOverlapConflicts(booking) {
    try {
      const overlappingBookings = await db.Booking.findAll({
        where: {
          vehicleId: booking.vehicleId,
          id: { [db.Sequelize.Op.ne]: booking.id },
          status: ['pending', 'confirmed', 'in_progress'],
          [db.Sequelize.Op.or]: [
            {
              startTime: { [db.Sequelize.Op.between]: [booking.startTime, booking.endTime] }
            },
            {
              endTime: { [db.Sequelize.Op.between]: [booking.startTime, booking.endTime] }
            },
            {
              [db.Sequelize.Op.and]: [
                { startTime: { [db.Sequelize.Op.lte]: booking.startTime } },
                { endTime: { [db.Sequelize.Op.gte]: booking.endTime } }
              ]
            }
          ]
        }
      });

      return overlappingBookings.map(overlappingBooking => ({
        type: this.conflictTypes.TIME_OVERLAP,
        conflictingBookingId: overlappingBooking.id,
        description: `Time overlap with booking ${overlappingBooking.id}`,
        severity: 'HIGH'
      }));
    } catch (error) {
      logger.error('Failed to detect time overlap conflicts', {
        error: error.message,
        bookingId: booking.id
      });
      return [];
    }
  }

  async detectVehicleUnavailableConflicts(booking) {
    try {
      const vehicle = await db.Vehicle.findByPk(booking.vehicleId);
      
      if (vehicle.status !== 'available') {
        return [{
          type: this.conflictTypes.VEHICLE_UNAVAILABLE,
          description: `Vehicle is ${vehicle.status}`,
          severity: 'HIGH'
        }];
      }
    } catch (error) {
      logger.error('Failed to detect vehicle unavailable conflicts', {
        error: error.message,
        bookingId: booking.id
      });
    }
    
    return [];
  }

  async detectUserQuotaConflicts(booking) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Check daily booking limit
      const todaysBookings = await db.Booking.count({
        where: {
          userId: booking.userId,
          startTime: { [db.Sequelize.Op.between]: [today, tomorrow] },
          status: ['pending', 'confirmed']
        }
      });

      if (todaysBookings >= 3) { // MAX_BOOKINGS_PER_DAY
        return [{
          type: this.conflictTypes.USER_QUOTA_EXCEEDED,
          description: 'Daily booking limit exceeded',
          severity: 'MEDIUM'
        }];
      }

      // Check active bookings limit
      const activeBookings = await db.Booking.count({
        where: {
          userId: booking.userId,
          status: ['pending', 'confirmed']
        }
      });

      if (activeBookings >= 5) { // MAX_ACTIVE_BOOKINGS
        return [{
          type: this.conflictTypes.USER_QUOTA_EXCEEDED,
          description: 'Active bookings limit exceeded',
          severity: 'MEDIUM'
        }];
      }
    } catch (error) {
      logger.error('Failed to detect user quota conflicts', {
        error: error.message,
        bookingId: booking.id
      });
    }
    
    return [];
  }

  async detectMaintenanceConflicts(booking) {
    try {
      // This would integrate with Vehicle Service to check maintenance schedule
      // For now, return empty array
      return [];
    } catch (error) {
      logger.error('Failed to detect maintenance conflicts', {
        error: error.message,
        bookingId: booking.id
      });
      return [];
    }
  }

  async detectGroupRestrictionConflicts(booking) {
    try {
      // Check group-specific restrictions via User Service
      const response = await userServiceClient.get(
        `${process.env.USER_SERVICE_URL}/groups/${booking.groupId}/restrictions`
      );

      const restrictions = response.data.restrictions || [];
      const conflicts = [];

      for (const restriction of restrictions) {
        if (this.violatesRestriction(booking, restriction)) {
          conflicts.push({
            type: this.conflictTypes.GROUP_RESTRICTION,
            description: `Violates group restriction: ${restriction.name}`,
            severity: restriction.severity || 'MEDIUM'
          });
        }
      }

      return conflicts;
    } catch (error) {
      logger.warn('Failed to check group restrictions', {
        error: error.message,
        bookingId: booking.id
      });
      return [];
    }
  }

  violatesRestriction(booking, restriction) {
    // Implement restriction checking logic
    // This is a simplified version
    switch (restriction.type) {
      case 'MAX_DURATION':
        const duration = (new Date(booking.endTime) - new Date(booking.startTime)) / (1000 * 60 * 60);
        return duration > restriction.value;
      case 'TIME_WINDOW':
        const startHour = new Date(booking.startTime).getHours();
        return startHour < restriction.startHour || startHour > restriction.endHour;
      default:
        return false;
    }
  }

  async createConflictRecord(booking, conflictData) {
    try {
      // Ensure booking exists before creating conflict record
      const bookingExists = await db.Booking.findByPk(booking.id);
      if (!bookingExists) {
        logger.warn('Cannot create conflict record: booking not found', {
          bookingId: booking.id
        });
        return null;
      }

      const conflict = await db.BookingConflict.create({
        bookingId_1: booking.id,
        bookingId_2: conflictData.conflictingBookingId || null,
        conflictType: conflictData.type,
        resolved: false,
        resolutionNote: null,
        resolvedBy: null
      });

      return conflict;
    } catch (error) {
      logger.error('Failed to create conflict record', {
        error: error.message,
        bookingId: booking.id,
        conflictData
      });
      // Don't throw - allow booking to succeed even if conflict record fails
      return null;
    }
  }

  async getUserConflicts(userId, resolved = false, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;

      const { count, rows } = await db.BookingConflict.findAndCountAll({
        where: {
          resolved: resolved === 'true',
          [db.Sequelize.Op.or]: [
            { '$booking1.userId$': userId },
            { '$booking2.userId$': userId }
          ]
        },
        include: [
          {
            model: db.Booking,
            as: 'booking1',
            attributes: ['id', 'userId', 'startTime', 'endTime', 'status', 'vehicleId'],
            include: [{
              model: db.Vehicle,
              as: 'vehicle',
              attributes: ['vehicleName', 'licensePlate']
            }]
          },
          {
            model: db.Booking,
            as: 'booking2',
            attributes: ['id', 'userId', 'startTime', 'endTime', 'status', 'vehicleId'],
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
      logger.error('Failed to get user conflicts', {
        error: error.message,
        userId
      });
      throw error;
    }
  }

  async resolveConflict(conflictId, userId, resolution) {
    const transaction = await db.sequelize.transaction();

    try {
      const conflict = await db.BookingConflict.findByPk(conflictId, {
        include: [
          { model: db.Booking, as: 'booking1' },
          { model: db.Booking, as: 'booking2' }
        ]
      });

      if (!conflict) {
        throw new AppError('Conflict not found', 404, 'CONFLICT_NOT_FOUND');
      }

      // Check if user has permission to resolve this conflict
      const hasPermission = await this.checkConflictResolutionPermission(conflict, userId);
      if (!hasPermission) {
        throw new AppError('Permission denied to resolve conflict', 403, 'PERMISSION_DENIED');
      }

      await conflict.update({
        resolved: true,
        resolutionNote: resolution.note,
        resolvedBy: userId,
        resolvedAt: new Date()
      }, { transaction });

      // Update booking status if needed
      if (resolution.action === 'cancel_booking' && resolution.bookingId) {
        const bookingToCancel = await db.Booking.findByPk(resolution.bookingId);
        if (bookingToCancel) {
          await bookingToCancel.update({
            status: 'cancelled',
            cancellationReason: `Conflict resolution: ${resolution.note}`
          }, { transaction });
        }
      }

      await transaction.commit();

      // Publish events
      await eventService.publishBookingConflictResolved(conflict, resolution);
      
      // 🔌 NEW: Real-time conflict resolution notification
      socketService.publishConflictResolved(conflict, resolution);

      logger.info('Conflict resolved successfully', {
        conflictId,
        userId,
        resolution
      });

      return conflict;
    } catch (error) {
      await transaction.rollback();
      logger.error('Failed to resolve conflict', {
        error: error.message,
        conflictId,
        userId
      });
      throw error;
    }
  }

  async checkConflictResolutionPermission(conflict, userId) {
    // User can resolve conflicts involving their own bookings
    const userBookingIds = [conflict.booking1?.userId, conflict.booking2?.userId];
    return userBookingIds.includes(userId);
  }

  async getAllConflicts(resolved = false, conflictType = null, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;
      const where = {};

      if (resolved !== undefined) {
        where.resolved = resolved === 'true';
      }

      if (conflictType) {
        where.conflictType = conflictType;
      }

      const { count, rows } = await db.BookingConflict.findAndCountAll({
        where,
        include: [
          {
            model: db.Booking,
            as: 'booking1',
            attributes: ['id', 'userId', 'startTime', 'endTime', 'status'],
            include: [{
              model: db.Vehicle,
              as: 'vehicle',
              attributes: ['vehicleName', 'licensePlate']
            }]
          },
          {
            model: db.Booking,
            as: 'booking2',
            attributes: ['id', 'userId', 'startTime', 'endTime', 'status'],
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
      logger.error('Failed to get all conflicts', {
        error: error.message
      });
      throw error;
    }
  }

  async adminResolveConflict(conflictId, adminUserId, resolution, action) {
    const transaction = await db.sequelize.transaction();

    try {
      const conflict = await db.BookingConflict.findByPk(conflictId, {
        include: [
          { model: db.Booking, as: 'booking1' },
          { model: db.Booking, as: 'booking2' }
        ]
      });

      if (!conflict) {
        throw new AppError('Conflict not found', 404, 'CONFLICT_NOT_FOUND');
      }

      await conflict.update({
        resolved: true,
        resolutionNote: resolution.note,
        resolvedBy: adminUserId,
        resolvedAt: new Date()
      }, { transaction });

      // Execute admin action
      await this.executeAdminAction(action, conflict, adminUserId, transaction);

      await transaction.commit();

      await eventService.publishBookingConflictResolved(conflict, {
        ...resolution,
        resolvedByAdmin: true,
        action
      });

      logger.info('Admin resolved conflict', {
        conflictId,
        adminUserId,
        resolution,
        action
      });

      return conflict;
    } catch (error) {
      await transaction.rollback();
      logger.error('Failed to resolve conflict as admin', {
        error: error.message,
        conflictId,
        adminUserId
      });
      throw error;
    }
  }

  async executeAdminAction(action, conflict, adminUserId, transaction) {
    switch (action.type) {
      case 'CANCEL_BOOKING':
        const bookingToCancel = await db.Booking.findByPk(action.bookingId);
        if (bookingToCancel) {
          await bookingToCancel.update({
            status: 'cancelled',
            cancellationReason: `Admin conflict resolution: ${action.reason}`
          }, { transaction });
        }
        break;

      case 'CONFIRM_BOOKING':
        const bookingToConfirm = await db.Booking.findByPk(action.bookingId);
        if (bookingToConfirm) {
          await bookingToConfirm.update({
            status: 'confirmed'
          }, { transaction });
        }
        break;

      case 'ADJUST_TIME':
        const bookingToAdjust = await db.Booking.findByPk(action.bookingId);
        if (bookingToAdjust) {
          await bookingToAdjust.update({
            startTime: action.newStartTime,
            endTime: action.newEndTime
          }, { transaction });
        }
        break;

      default:
        logger.warn('Unknown admin action type', { actionType: action.type });
    }
  }
}

export default new ConflictService();