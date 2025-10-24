// booking-service/src/jobs/bookingReminderJob.js
import { logger, redisClient } from '@ev-coownership/shared';
import db from '../models/index.js';
import eventService from '../services/eventService.js';

export class BookingReminderJob {
  constructor() {
    this.jobName = 'BookingReminderJob';
    this.lockKey = 'job:booking-reminder:lock';
    this.lockTimeout = 5 * 60 * 1000; // 5 minutes
  }

  async run() {
    // Acquire distributed lock để tránh chạy job trùng
    const lockAcquired = await this.acquireLock();
    if (!lockAcquired) {
      logger.debug('Booking reminder job already running, skipping...');
      return;
    }

    try {
      logger.info('Starting booking reminder job');

      const remindersSent = await this.sendUpcomingBookingReminders();
      const overdueReminders = await this.sendOverdueCheckoutReminders();

      logger.info('Booking reminder job completed', {
        upcomingReminders: remindersSent,
        overdueReminders: overdueReminders
      });

    } catch (error) {
      logger.error('Booking reminder job failed', {
        error: error.message,
        job: this.jobName
      });
    } finally {
      await this.releaseLock();
    }
  }

  async sendUpcomingBookingReminders() {
    try {
      const now = new Date();
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
      const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      // Tìm bookings sắp diễn ra (trong 1 giờ tới)
      const imminentBookings = await db.Booking.findAll({
        where: {
          status: 'confirmed',
          startTime: {
            [db.Sequelize.Op.between]: [now, oneHourFromNow]
          }
        },
        include: [{
          model: db.Vehicle,
          as: 'vehicle',
          attributes: ['vehicleName', 'licensePlate']
        }]
      });

      // Tìm bookings sắp diễn ra (trong 24 giờ tới)
      const tomorrowBookings = await db.Booking.findAll({
        where: {
          status: 'confirmed',
          startTime: {
            [db.Sequelize.Op.between]: [oneHourFromNow, twentyFourHoursFromNow]
          }
        },
        include: [{
          model: db.Vehicle,
          as: 'vehicle',
          attributes: ['vehicleName', 'licensePlate']
        }]
      });

      let remindersSent = 0;

      // Gửi reminder cho bookings trong 1 giờ tới
      for (const booking of imminentBookings) {
        const alreadyNotified = await this.checkIfNotified(booking.id, 'imminent');
        if (!alreadyNotified) {
          await this.sendImminentReminder(booking);
          await this.markAsNotified(booking.id, 'imminent');
          remindersSent++;
        }
      }

      // Gửi reminder cho bookings trong 24 giờ tới
      for (const booking of tomorrowBookings) {
        const alreadyNotified = await this.checkIfNotified(booking.id, 'tomorrow');
        if (!alreadyNotified) {
          await this.sendTomorrowReminder(booking);
          await this.markAsNotified(booking.id, 'tomorrow');
          remindersSent++;
        }
      }

      return remindersSent;
    } catch (error) {
      logger.error('Failed to send upcoming booking reminders', {
        error: error.message
      });
      return 0;
    }
  }

  async sendOverdueCheckoutReminders() {
    try {
      const now = new Date();
      const overdueThreshold = new Date(now.getTime() - 30 * 60 * 1000); // 30 phút quá hạn

      // Tìm bookings đã quá hạn check-out
      const overdueBookings = await db.Booking.findAll({
        where: {
          status: 'in_progress',
          endTime: {
            [db.Sequelize.Op.lt]: overdueThreshold
          }
        },
        include: [{
          model: db.Vehicle,
          as: 'vehicle',
          attributes: ['vehicleName', 'licensePlate']
        }]
      });

      let remindersSent = 0;

      for (const booking of overdueBookings) {
        const alreadyNotified = await this.checkIfNotified(booking.id, 'overdue');
        if (!alreadyNotified) {
          await this.sendOverdueReminder(booking);
          await this.markAsNotified(booking.id, 'overdue');
          remindersSent++;
        }
      }

      return remindersSent;
    } catch (error) {
      logger.error('Failed to send overdue checkout reminders', {
        error: error.message
      });
      return 0;
    }
  }

  async sendImminentReminder(booking) {
    try {
      await eventService.publishBookingReminder(booking);

      logger.info('Sent imminent booking reminder', {
        bookingId: booking.id,
        userId: booking.userId,
        vehicleName: booking.vehicle.vehicleName
      });
    } catch (error) {
      logger.error('Failed to send imminent booking reminder', {
        error: error.message,
        bookingId: booking.id
      });
    }
  }

  async sendTomorrowReminder(booking) {
    try {
      // Gửi reminder cho booking ngày mai
      // Có thể tích hợp với notification service
      
      logger.info('Sent tomorrow booking reminder', {
        bookingId: booking.id,
        userId: booking.userId,
        vehicleName: booking.vehicle.vehicleName
      });
    } catch (error) {
      logger.error('Failed to send tomorrow booking reminder', {
        error: error.message,
        bookingId: booking.id
      });
    }
  }

  async sendOverdueReminder(booking) {
    try {
      // Gửi reminder cho booking quá hạn
      
      logger.info('Sent overdue checkout reminder', {
        bookingId: booking.id,
        userId: booking.userId,
        vehicleName: booking.vehicle.vehicleName
      });
    } catch (error) {
      logger.error('Failed to send overdue checkout reminder', {
        error: error.message,
        bookingId: booking.id
      });
    }
  }

  // Helper methods for notification tracking
  async checkIfNotified(bookingId, reminderType) {
    const key = `reminder:${bookingId}:${reminderType}`;
    const notified = await redisClient.get(key);
    return notified !== null;
  }

  async markAsNotified(bookingId, reminderType) {
    const key = `reminder:${bookingId}:${reminderType}`;
    // Lưu trong 25 giờ để tránh gửi lại
    await redisClient.set(key, 'sent', 25 * 60 * 60);
  }

  // Distributed lock methods
  async acquireLock() {
    try {
      const result = await await redisClient.client.set(this.lockKey, 'locked', {
        PX: this.lockTimeout,  // TTL tính bằng milliseconds
        NX: true               // chỉ set nếu key chưa tồn tại
      });
      return result === 'OK';
    } catch (error) {
      logger.error('Failed to acquire job lock', { error: error.message });
      return false;
    }
  }

  async releaseLock() {
    try {
      await redisClient.del(this.lockKey);
    } catch (error) {
      logger.error('Failed to release job lock', { error: error.message });
    }
  }

  // Health check
  async healthCheck() {
    try {
      const lastRun = await redisClient.get('job:booking-reminder:last-run');
      return {
        healthy: true,
        job: this.jobName,
        lastRun: lastRun || 'Never',
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

export default new BookingReminderJob();