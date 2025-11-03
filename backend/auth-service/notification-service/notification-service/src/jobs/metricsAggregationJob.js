// src/jobs/metricsAggregationJob.js
import db from '../models/index.js';
import { logger } from '@ev-coownership/shared';
import { Op } from 'sequelize';
import { NOTIFICATION_STATUS } from '../utils/constants.js';

class MetricsAggregationJob {
  constructor() {
    this.jobName = 'metrics-aggregation';
  }

  async run() {
    try {
      logger.info('Starting metrics aggregation job');

      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      // Daily metrics
      const dailyMetrics = await this.calculateMetrics(startOfDay);
      
      // Weekly metrics
      const weeklyMetrics = await this.calculateMetrics(startOfWeek);
      
      // Monthly metrics
      const monthlyMetrics = await this.calculateMetrics(startOfMonth);

      const metrics = {
        daily: dailyMetrics,
        weekly: weeklyMetrics,
        monthly: monthlyMetrics,
        timestamp: new Date(),
      };

      logger.info('Metrics aggregation job completed', {
        dailyTotal: dailyMetrics.total,
        weeklyTotal: weeklyMetrics.total,
        monthlyTotal: monthlyMetrics.total,
      });

      return metrics;
    } catch (error) {
      logger.error('Metrics aggregation job failed', { error: error.message });
      throw error;
    }
  }

  async calculateMetrics(startDate) {
    const where = {
      createdAt: {
        [Op.gte]: startDate,
      },
    };

    const [
      totalCount,
      sentCount,
      failedCount,
      byType,
      byChannel,
    ] = await Promise.all([
      // Total count
      db.Notification.count({ where }),
      
      // Sent count
      db.Notification.count({
        where: {
          ...where,
          status: NOTIFICATION_STATUS.SENT,
        },
      }),
      
      // Failed count
      db.Notification.count({
        where: {
          ...where,
          status: NOTIFICATION_STATUS.FAILED,
        },
      }),
      
      // Count by type
      db.Notification.findAll({
        where,
        attributes: [
          'type',
          [db.Sequelize.fn('COUNT', db.Sequelize.col('id')), 'count'],
        ],
        group: ['type'],
        raw: true,
      }),
      
      // Count by channel
      db.Notification.findAll({
        where,
        attributes: ['channels'],
        raw: true,
      }),
    ]);

    // Calculate channel distribution
    const channelDistribution = this.calculateChannelDistribution(byChannel);

    return {
      total: totalCount,
      sent: sentCount,
      failed: failedCount,
      successRate: totalCount > 0 ? (sentCount / totalCount) * 100 : 0,
      byType: this.formatGroupedResults(byType),
      byChannel: channelDistribution,
    };
  }

  calculateChannelDistribution(notifications) {
    const channelCounts = {
      email: 0,
      push: 0,
      sms: 0,
      in_app: 0,
    };

    notifications.forEach(notification => {
      notification.channels.forEach(channel => {
        if (channelCounts[channel] !== undefined) {
          channelCounts[channel]++;
        }
      });
    });

    return channelCounts;
  }

  formatGroupedResults(results) {
    return results.reduce((acc, row) => {
      acc[row.type] = parseInt(row.count);
      return acc;
    }, {});
  }

  getSchedule() {
    return '0 * * * *'; // Run every hour
  }
}

export default new MetricsAggregationJob();