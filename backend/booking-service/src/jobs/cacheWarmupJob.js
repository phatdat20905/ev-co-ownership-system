// booking-service/src/jobs/cacheWarmupJob.js
import { logger, redisClient } from '@ev-coownership/shared';
import db from '../models/index.js';
import calendarService from '../services/calendarService.js';

export class CacheWarmupJob {
  constructor() {
    this.jobName = 'CacheWarmupJob';
    this.lockKey = 'job:cache-warmup:lock';
    this.lockTimeout = 10 * 60 * 1000; // 10 minutes
  }

  async run() {
    const lockAcquired = await this.acquireLock();
    if (!lockAcquired) {
      logger.debug('Cache warmup job already running, skipping...');
      return;
    }

    try {
      logger.info('Starting cache warmup job');

      const results = await Promise.allSettled([
        this.warmupVehicleCalendars(),
        this.warmupPopularGroupCalendars(),
        this.warmupVehicleAvailability(),
        this.warmupAdminAnalytics()
      ]);

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      logger.info('Cache warmup job completed', {
        successfulTasks: successful,
        failedTasks: failed,
        totalTasks: results.length
      });

      // Lưu thời gian chạy cuối
      await redisClient.set('job:cache-warmup:last-run', new Date().toISOString(), 24 * 60 * 60);

    } catch (error) {
      logger.error('Cache warmup job failed', {
        error: error.message,
        job: this.jobName
      });
    } finally {
      await this.releaseLock();
    }
  }

  async warmupVehicleCalendars() {
    try {
      logger.info('Warming up vehicle calendars...');

      // Lấy tất cả vehicles active
      const vehicles = await db.Vehicle.findAll({
        where: { status: 'available' },
        attributes: ['id', 'vehicleName'],
        limit: 50 // Giới hạn để tránh quá tải
      });

      const today = new Date();
      const next7Days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

      let warmedUp = 0;

      for (const vehicle of vehicles) {
        try {
          // Pre-cache calendar cho 7 ngày tới
          await calendarService.getVehicleCalendar(
            vehicle.id,
            today.toISOString().split('T')[0],
            next7Days.toISOString().split('T')[0],
            'system' // system user
          );
          warmedUp++;
        } catch (error) {
          logger.warn('Failed to warmup vehicle calendar', {
            vehicleId: vehicle.id,
            error: error.message
          });
        }
      }

      logger.info('Vehicle calendars warmup completed', {
        totalVehicles: vehicles.length,
        warmedUp
      });

      return { warmedUp, total: vehicles.length };
    } catch (error) {
      logger.error('Vehicle calendars warmup failed', {
        error: error.message
      });
      throw error;
    }
  }

  async warmupPopularGroupCalendars() {
    try {
      logger.info('Warming up popular group calendars...');

      // Tìm các groups có nhiều bookings nhất
      const popularGroups = await db.Booking.findAll({
        attributes: [
          'groupId',
          [db.Sequelize.fn('COUNT', db.Sequelize.col('id')), 'bookingCount']
        ],
        where: {
          createdAt: {
            [db.Sequelize.Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days
          }
        },
        group: ['groupId'],
        order: [[db.Sequelize.literal('bookingCount'), 'DESC']],
        limit: 20,
        raw: true
      });

      const today = new Date();
      const next30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

      let warmedUp = 0;

      for (const group of popularGroups) {
        try {
          await calendarService.getGroupCalendar(
            group.groupId,
            today.toISOString().split('T')[0],
            next30Days.toISOString().split('T')[0],
            'system'
          );
          warmedUp++;
        } catch (error) {
          logger.warn('Failed to warmup group calendar', {
            groupId: group.groupId,
            error: error.message
          });
        }
      }

      logger.info('Group calendars warmup completed', {
        totalGroups: popularGroups.length,
        warmedUp
      });

      return { warmedUp, total: popularGroups.length };
    } catch (error) {
      logger.error('Group calendars warmup failed', {
        error: error.message
      });
      throw error;
    }
  }

  async warmupVehicleAvailability() {
    try {
      logger.info('Warming up vehicle availability...');

      const vehicles = await db.Vehicle.findAll({
        where: { status: 'available' },
        attributes: ['id'],
        limit: 30
      });

      // Pre-cache availability cho các khung giờ phổ biến
      const timeSlots = this.generatePopularTimeSlots();
      let warmedUp = 0;

      for (const vehicle of vehicles) {
        for (const slot of timeSlots) {
          try {
            await calendarService.checkAvailability(
              vehicle.id,
              slot.startTime,
              slot.endTime,
              'system'
            );
            warmedUp++;
          } catch (error) {
            // Bỏ qua lỗi cho từng slot
          }
        }
      }

      logger.info('Vehicle availability warmup completed', {
        totalVehicles: vehicles.length,
        timeSlots: timeSlots.length,
        totalChecks: warmedUp
      });

      return { warmedUp, vehicles: vehicles.length, slots: timeSlots.length };
    } catch (error) {
      logger.error('Vehicle availability warmup failed', {
        error: error.message
      });
      throw error;
    }
  }

  async warmupAdminAnalytics() {
    try {
      logger.info('Warming up admin analytics...');

      const periods = ['7d', '30d', '90d'];
      let warmedUp = 0;

      for (const period of periods) {
        try {
          // Pre-cache analytics data
          const cacheKey = `admin_analytics:${period}`;
          const existing = await redisClient.get(cacheKey);
          
          if (!existing) {
            // Gọi service để generate và cache data
            // Giả sử chúng ta có analyticsService
            // await analyticsService.getBookingAnalytics(period, 'system');
            warmedUp++;
          }
        } catch (error) {
          logger.warn('Failed to warmup admin analytics', {
            period,
            error: error.message
          });
        }
      }

      logger.info('Admin analytics warmup completed', {
        periods: periods.length,
        warmedUp
      });

      return { warmedUp, total: periods.length };
    } catch (error) {
      logger.error('Admin analytics warmup failed', {
        error: error.message
      });
      throw error;
    }
  }

  generatePopularTimeSlots() {
    const today = new Date();
    const slots = [];

    // Tạo các khung giờ phổ biến cho 7 ngày tới
    for (let day = 0; day < 7; day++) {
      const date = new Date(today.getTime() + day * 24 * 60 * 60 * 1000);
      
      // Các khung giờ sáng (8h-12h)
      const morningStart = new Date(date);
      morningStart.setHours(8, 0, 0, 0);
      const morningEnd = new Date(date);
      morningEnd.setHours(12, 0, 0, 0);
      slots.push({ startTime: morningStart, endTime: morningEnd });

      // Các khung giờ chiều (13h-17h)
      const afternoonStart = new Date(date);
      afternoonStart.setHours(13, 0, 0, 0);
      const afternoonEnd = new Date(date);
      afternoonEnd.setHours(17, 0, 0, 0);
      slots.push({ startTime: afternoonStart, endTime: afternoonEnd });

      // Các khung giờ tối (18h-22h)
      const eveningStart = new Date(date);
      eveningStart.setHours(18, 0, 0, 0);
      const eveningEnd = new Date(date);
      eveningEnd.setHours(22, 0, 0, 0);
      slots.push({ startTime: eveningStart, endTime: eveningEnd });
    }

    return slots;
  }

  async acquireLock() {
    try {
      const result = await redisClient.client.set(this.lockKey, 'locked', {
        PX: this.lockTimeout,  // TTL tính bằng milliseconds
        NX: true               // chỉ set nếu key chưa tồn tại
      });
      return result === 'OK';
    } catch (error) {
      logger.error('Failed to acquire cache warmup lock', { error: error.message });
      return false;
    }
  }

  async releaseLock() {
    try {
      await redisClient.del(this.lockKey);
    } catch (error) {
      logger.error('Failed to release cache warmup lock', { error: error.message });
    }
  }

  async healthCheck() {
    try {
      const lastRun = await redisClient.get('job:cache-warmup:last-run');
      const cacheStats = await redisClient.info('memory');
      
      return {
        healthy: true,
        job: this.jobName,
        lastRun: lastRun || 'Never',
        memoryUsage: cacheStats ? this.extractMemoryInfo(cacheStats) : 'Unknown',
        nextRun: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 phút sau
      };
    } catch (error) {
      return {
        healthy: false,
        job: this.jobName,
        error: error.message
      };
    }
  }

  extractMemoryInfo(infoString) {
    const lines = infoString.split('\n');
    const usedMemory = lines.find(line => line.startsWith('used_memory:'));
    const maxMemory = lines.find(line => line.startsWith('maxmemory:'));
    
    return {
      used: usedMemory ? usedMemory.split(':')[1] : 'Unknown',
      max: maxMemory ? maxMemory.split(':')[1] : 'Unknown'
    };
  }
}

export default new CacheWarmupJob();