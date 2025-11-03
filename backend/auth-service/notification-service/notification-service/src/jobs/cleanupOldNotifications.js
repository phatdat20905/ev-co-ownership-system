// src/jobs/cleanupOldNotifications.js
import db from '../models/index.js';
import { logger } from '@ev-coownership/shared';
import { Op } from 'sequelize';

class CleanupOldNotificationsJob {
  constructor() {
    this.jobName = 'cleanup-old-notifications';
    this.retentionDays = 90; // Keep notifications for 90 days
  }

  async run() {
    try {
      logger.info('Starting cleanup old notifications job');

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.retentionDays);

      const result = await db.Notification.destroy({
        where: {
          createdAt: {
            [Op.lt]: cutoffDate,
          },
        },
      });

      logger.info('Cleanup old notifications job completed', {
        deletedCount: result,
        retentionDays: this.retentionDays,
        cutoffDate: cutoffDate.toISOString(),
      });

      return { deletedCount: result };
    } catch (error) {
      logger.error('Cleanup old notifications job failed', { error: error.message });
      throw error;
    }
  }

  getSchedule() {
    return '0 2 * * *'; // Run daily at 2 AM
  }
}

export default new CleanupOldNotificationsJob();