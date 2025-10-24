// booking-service/src/jobs/conflictDetectionJob.js
import { logger, redisClient } from '@ev-coownership/shared';
import db from '../models/index.js';
import conflictService from '../services/conflictService.js';

export class ConflictDetectionJob {
  constructor() {
    this.jobName = 'ConflictDetectionJob';
    this.lockKey = 'job:conflict-detection:lock';
    this.lockTimeout = 5 * 60 * 1000; // 5 minutes
  }

  async run() {
    const lockAcquired = await this.acquireLock();
    if (!lockAcquired) {
      logger.debug('Conflict detection job already running, skipping...');
      return;
    }

    try {
      logger.info('Starting conflict detection job');

      const results = await Promise.allSettled([
        this.detectTimeOverlapConflicts(),
        this.detectVehicleStatusConflicts(),
        this.resolveStaleConflicts()
      ]);

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      const summary = {
        timeOverlapConflicts: results[0].status === 'fulfilled' ? results[0].value : 0,
        vehicleStatusConflicts: results[1].status === 'fulfilled' ? results[1].value : 0,
        staleConflictsResolved: results[2].status === 'fulfilled' ? results[2].value : 0
      };

      logger.info('Conflict detection job completed', {
        successfulTasks: successful,
        failedTasks: failed,
        ...summary
      });

      await redisClient.set('job:conflict-detection:last-run', new Date().toISOString(), 24 * 60 * 60);

    } catch (error) {
      logger.error('Conflict detection job failed', {
        error: error.message,
        job: this.jobName
      });
    } finally {
      await this.releaseLock();
    }
  }

  async detectTimeOverlapConflicts() {
    try {
      logger.info('Detecting time overlap conflicts...');

      // Tìm các bookings sắp diễn ra có thể bị conflict
      const upcomingBookings = await db.Booking.findAll({
        where: {
          status: ['pending', 'confirmed'],
          startTime: {
            [db.Sequelize.Op.gte]: new Date(),
            [db.Sequelize.Op.lte]: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h tới
          }
        },
        include: [{
          model: db.Vehicle,
          as: 'vehicle',
          attributes: ['id', 'status']
        }]
      });

      let conflictsDetected = 0;

      for (const booking of upcomingBookings) {
        try {
          // Kiểm tra conflict cho từng booking
          const detectedConflicts = await conflictService.detectAndHandleConflicts(booking);
          if (detectedConflicts.length > 0) {
            conflictsDetected += detectedConflicts.length;
          }
        } catch (error) {
          logger.warn('Failed to detect conflicts for booking', {
            bookingId: booking.id,
            error: error.message
          });
        }
      }

      logger.info('Time overlap conflicts detection completed', {
        bookingsChecked: upcomingBookings.length,
        conflictsDetected
      });

      return conflictsDetected;
    } catch (error) {
      logger.error('Time overlap conflicts detection failed', {
        error: error.message
      });
      throw error;
    }
  }

  async detectVehicleStatusConflicts() {
    try {
      logger.info('Detecting vehicle status conflicts...');

      // Tìm các bookings mà vehicle không còn available
      const conflictingBookings = await db.Booking.findAll({
        where: {
          status: ['pending', 'confirmed'],
          startTime: {
            [db.Sequelize.Op.gte]: new Date()
          }
        },
        include: [{
          model: db.Vehicle,
          as: 'vehicle',
          where: {
            status: {
              [db.Sequelize.Op.ne]: 'available'
            }
          },
          attributes: ['id', 'status', 'vehicleName']
        }]
      });

      let conflictsResolved = 0;

      for (const booking of conflictingBookings) {
        try {
          // Tạo conflict record
          await db.BookingConflict.create({
            bookingId_1: booking.id,
            conflictType: 'VEHICLE_UNAVAILABLE',
            description: `Vehicle ${booking.vehicle.vehicleName} is ${booking.vehicle.status}`,
            resolved: false
          });

          // Cập nhật booking status
          await booking.update({ status: 'conflict' });

          conflictsResolved++;

          logger.info('Vehicle status conflict detected and recorded', {
            bookingId: booking.id,
            vehicleStatus: booking.vehicle.status
          });

        } catch (error) {
          logger.warn('Failed to handle vehicle status conflict', {
            bookingId: booking.id,
            error: error.message
          });
        }
      }

      logger.info('Vehicle status conflicts detection completed', {
        conflictsFound: conflictingBookings.length,
        conflictsResolved
      });

      return conflictsResolved;
    } catch (error) {
      logger.error('Vehicle status conflicts detection failed', {
        error: error.message
      });
      throw error;
    }
  }

  async resolveStaleConflicts() {
    try {
      logger.info('Resolving stale conflicts...');

      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      // Tìm các conflicts cũ chưa được resolve
      const staleConflicts = await db.BookingConflict.findAll({
        where: {
          resolved: false,
          createdAt: {
            [db.Sequelize.Op.lt]: twentyFourHoursAgo
          }
        },
        include: [
          {
            model: db.Booking,
            as: 'booking1',
            attributes: ['id', 'status', 'startTime']
          },
          {
            model: db.Booking,
            as: 'booking2',
            attributes: ['id', 'status', 'startTime']
          }
        ]
      });

      let resolvedCount = 0;

      for (const conflict of staleConflicts) {
        try {
          const resolution = await this.autoResolveStaleConflict(conflict);
          if (resolution.resolved) {
            resolvedCount++;
          }
        } catch (error) {
          logger.warn('Failed to auto-resolve stale conflict', {
            conflictId: conflict.id,
            error: error.message
          });
        }
      }

      logger.info('Stale conflicts resolution completed', {
        staleConflicts: staleConflicts.length,
        resolved: resolvedCount
      });

      return resolvedCount;
    } catch (error) {
      logger.error('Stale conflicts resolution failed', {
        error: error.message
      });
      throw error;
    }
  }

  async autoResolveStaleConflict(conflict) {
    const transaction = await db.sequelize.transaction();

    try {
      const now = new Date();
      let resolutionNote = 'Auto-resolved by system: ';

      // Logic auto-resolution dựa trên conflict type và thời gian
      switch (conflict.conflictType) {
        case 'TIME_OVERLAP':
          // Ưu tiên booking nào sớm hơn
          if (conflict.booking1 && conflict.booking2) {
            const booking1Time = new Date(conflict.booking1.startTime);
            const booking2Time = new Date(conflict.booking2.startTime);

            const bookingToCancel = booking1Time < booking2Time ? conflict.booking2 : conflict.booking1;
            const bookingToKeep = booking1Time < booking2Time ? conflict.booking1 : conflict.booking2;

            // Hủy booking muộn hơn
            await bookingToCancel.update({
              status: 'cancelled',
              cancellationReason: 'Auto-cancelled due to time overlap conflict'
            }, { transaction });

            resolutionNote += `Cancelled later booking (${bookingToCancel.id})`;
          }
          break;

        case 'VEHICLE_UNAVAILABLE':
          // Hủy booking nếu vehicle không available
          if (conflict.booking1) {
            await conflict.booking1.update({
              status: 'cancelled',
              cancellationReason: 'Auto-cancelled - vehicle unavailable'
            }, { transaction });
            resolutionNote += `Vehicle unavailable - cancelled booking`;
          }
          break;

        default:
          resolutionNote += `No auto-resolution logic for ${conflict.conflictType}`;
          break;
      }

      // Đánh dấu conflict đã resolved
      await conflict.update({
        resolved: true,
        resolutionNote,
        resolvedBy: 'system',
        resolvedAt: now
      }, { transaction });

      await transaction.commit();

      logger.info('Auto-resolved stale conflict', {
        conflictId: conflict.id,
        resolution: resolutionNote
      });

      return { resolved: true, conflictId: conflict.id, resolution: resolutionNote };

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async acquireLock() {
    try {
      const result = await redisClient.client.set(this.lockKey, 'locked', {
        PX: this.lockTimeout,  // TTL tính bằng milliseconds
        NX: true               // chỉ set nếu key chưa tồn tại
      });
      return result === 'OK';
    } catch (error) {
      logger.error('Failed to acquire conflict detection lock', { error: error.message });
      return false;
    }
  }

  async releaseLock() {
    try {
      await redisClient.del(this.lockKey);
    } catch (error) {
      logger.error('Failed to release conflict detection lock', { error: error.message });
    }
  }

  async healthCheck() {
    try {
      const lastRun = await redisClient.get('job:conflict-detection:last-run');
      
      // Thống kê conflicts hiện tại
      const openConflicts = await db.BookingConflict.count({
        where: { resolved: false }
      });

      const totalConflicts = await db.BookingConflict.count();

      return {
        healthy: true,
        job: this.jobName,
        lastRun: lastRun || 'Never',
        conflictStats: {
          open: openConflicts,
          total: totalConflicts
        },
        nextRun: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 phút sau
      };
    } catch (error) {
      return {
        healthy: false,
        job: this.jobName,
        error: error.message
      };
    }
  }
}

export default new ConflictDetectionJob();