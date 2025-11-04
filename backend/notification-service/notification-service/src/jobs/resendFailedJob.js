// src/jobs/resendFailedJob.js
import db from '../models/index.js';
import notificationService from '../services/notificationService.js';
import { logger } from '@ev-coownership/shared';
import { NOTIFICATION_STATUS } from '../utils/constants.js';

class ResendFailedJob {
  constructor() {
    this.jobName = 'resend-failed-notifications';
    this.batchSize = 50;
    this.maxRetries = 3;
  }

  async run() {
    try {
      logger.info('Starting resend failed notifications job');

      const failedNotifications = await db.Notification.findAll({
        where: {
          status: NOTIFICATION_STATUS.FAILED,
          retryCount: { [db.Sequelize.Op.lt]: this.maxRetries },
          createdAt: {
            [db.Sequelize.Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
        limit: this.batchSize,
      });

      logger.info(`Found ${failedNotifications.length} failed notifications to retry`);

      let successCount = 0;
      let failCount = 0;

      for (const notification of failedNotifications) {
        try {
          // Update retry count
          await notification.increment('retryCount');

          // Resend notification
          const result = await notificationService.sendNotification({
            userId: notification.userId,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            channels: notification.channels,
            metadata: notification.metadata,
          });

          if (result.status === NOTIFICATION_STATUS.SENT) {
            successCount++;
            logger.info('Successfully resent failed notification', {
              notificationId: notification.id,
              retryCount: notification.retryCount,
            });
          } else {
            failCount++;
            logger.warn('Failed to resend notification', {
              notificationId: notification.id,
              retryCount: notification.retryCount,
            });
          }
        } catch (error) {
          failCount++;
          logger.error('Error resending notification', {
            notificationId: notification.id,
            error: error.message,
          });
        }
      }

      logger.info('Resend failed notifications job completed', {
        successCount,
        failCount,
        total: failedNotifications.length,
      });

      return { successCount, failCount, total: failedNotifications.length };
    } catch (error) {
      logger.error('Resend failed notifications job failed', { error: error.message });
      throw error;
    }
  }

  getSchedule() {
    return '0 */6 * * *'; // Run every 6 hours
  }
}

export default new ResendFailedJob();