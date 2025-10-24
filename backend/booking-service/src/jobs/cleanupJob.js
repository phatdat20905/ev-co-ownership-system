// booking-service/src/jobs/cleanupJob.js
import { logger, redisClient } from '@ev-coownership/shared';
import db from '../models/index.js';

export class CleanupJob {
  constructor() {
    this.jobName = 'CleanupJob';
    this.lockKey = 'job:cleanup:lock';
    this.lockTimeout = 10 * 60 * 1000; // 10 minutes
  }

  async run() {
    const lockAcquired = await this.acquireLock();
    if (!lockAcquired) {
      logger.debug('Cleanup job already running, skipping...');
      return;
    }

    try {
      logger.info('Starting cleanup job');

      const results = await Promise.allSettled([
        this.cleanupOldBookings(),
        this.cleanupResolvedConflicts(),
        this.cleanupExpiredCache(),
        this.cleanupOldCheckInOutLogs(),
        this.cleanupStaleCalendarCache()
      ]);

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      const summary = {
        oldBookingsCleaned: results[0].status === 'fulfilled' ? results[0].value : 0,
        conflictsCleaned: results[1].status === 'fulfilled' ? results[1].value : 0,
        cacheEntriesCleaned: results[2].status === 'fulfilled' ? results[2].value : 0,
        checkLogsCleaned: results[3].status === 'fulfilled' ? results[3].value : 0,
        calendarCacheCleaned: results[4].status === 'fulfilled' ? results[4].value : 0
      };

      logger.info('Cleanup job completed', {
        successfulTasks: successful,
        failedTasks: failed,
        ...summary
      });

      await redisClient.set('job:cleanup:last-run', new Date().toISOString(), 24 * 60 * 60);

    } catch (error) {
      logger.error('Cleanup job failed', {
        error: error.message,
        job: this.jobName
      });
    } finally {
      await this.releaseLock();
    }
  }

  async cleanupOldBookings() {
    try {
      logger.info('Cleaning up old bookings...');

      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

      // Xóa các bookings cũ đã completed hoặc cancelled
      const deletedCount = await db.Booking.destroy({
        where: {
          status: ['completed', 'cancelled'],
          updatedAt: {
            [db.Sequelize.Op.lt]: ninetyDaysAgo
          }
        }
      });

      logger.info('Old bookings cleanup completed', {
        deletedCount
      });

      return deletedCount;
    } catch (error) {
      logger.error('Old bookings cleanup failed', {
        error: error.message
      });
      throw error;
    }
  }

  async cleanupResolvedConflicts() {
    try {
      logger.info('Cleaning up resolved conflicts...');

      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      // Xóa các conflicts đã resolved từ 30 ngày trước
      const deletedCount = await db.BookingConflict.destroy({
        where: {
          resolved: true,
          resolvedAt: {
            [db.Sequelize.Op.lt]: thirtyDaysAgo
          }
        }
      });

      logger.info('Resolved conflicts cleanup completed', {
        deletedCount
      });

      return deletedCount;
    } catch (error) {
      logger.error('Resolved conflicts cleanup failed', {
        error: error.message
      });
      throw error;
    }
  }

  async cleanupExpiredCache() {
    try {
      logger.info('Cleaning up expired cache entries...');

      // Redis tự động xóa các entries hết hạn
      // Chúng ta chỉ cần log số lượng
      const info = await redisClient.info('keyspace');
      const expiredStats = this.parseExpiredKeys(info);

      logger.info('Expired cache cleanup completed', {
        ...expiredStats
      });

      return expiredStats.expiredKeys || 0;
    } catch (error) {
      logger.error('Expired cache cleanup failed', {
        error: error.message
      });
      throw error;
    }
  }

  async cleanupOldCheckInOutLogs() {
    try {
      logger.info('Cleaning up old check-in/out logs...');

      const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);

      // Xóa các logs cũ hơn 1 năm
      const deletedCount = await db.CheckInOutLog.destroy({
        where: {
          performedAt: {
            [db.Sequelize.Op.lt]: oneYearAgo
          }
        }
      });

      logger.info('Old check-in/out logs cleanup completed', {
        deletedCount
      });

      return deletedCount;
    } catch (error) {
      logger.error('Old check-in/out logs cleanup failed', {
        error: error.message
      });
      throw error;
    }
  }

  async cleanupStaleCalendarCache() {
    try {
      logger.info('Cleaning up stale calendar cache...');

      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      // Xóa các calendar cache cũ
      const deletedCount = await db.CalendarCache.destroy({
        where: {
          date: {
            [db.Sequelize.Op.lt]: sevenDaysAgo
          }
        }
      });

      logger.info('Stale calendar cache cleanup completed', {
        deletedCount
      });

      return deletedCount;
    } catch (error) {
      logger.error('Stale calendar cache cleanup failed', {
        error: error.message
      });
      throw error;
    }
  }

  parseExpiredKeys(keyspaceInfo) {
    try {
      const lines = keyspaceInfo.split('\n');
      const dbLine = lines.find(line => line.startsWith('db0'));
      
      if (!dbLine) return { expiredKeys: 0 };

      const matches = dbLine.match(/expired=(\d+)/);
      const expiredKeys = matches ? parseInt(matches[1]) : 0;

      return { expiredKeys };
    } catch (error) {
      return { expiredKeys: 0, error: error.message };
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
      logger.error('Failed to acquire cleanup lock', { error: error.message });
      return false;
    }
  }

  async releaseLock() {
    try {
      await redisClient.del(this.lockKey);
    } catch (error) {
      logger.error('Failed to release cleanup lock', { error: error.message });
    }
  }

  async healthCheck() {
    try {
      const lastRun = await redisClient.get('job:cleanup:last-run');
      
      // Thống kê database size
      const bookingCount = await db.Booking.count();
      const conflictCount = await db.BookingConflict.count();
      const logCount = await db.CheckInOutLog.count();
      const cacheCount = await db.CalendarCache.count();

      return {
        healthy: true,
        job: this.jobName,
        lastRun: lastRun || 'Never',
        databaseStats: {
          bookings: bookingCount,
          conflicts: conflictCount,
          checkLogs: logCount,
          calendarCache: cacheCount
        },
        nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 giờ sau
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

export default new CleanupJob();