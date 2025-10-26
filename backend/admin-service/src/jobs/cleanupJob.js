// src/jobs/cleanupJob.js
import { logger } from '@ev-coownership/shared';
import analyticsRepository from '../repositories/analyticsRepository.js';

export class CleanupJob {
  constructor() {
    this.isRunning = false;
    this.intervalId = null;
  }

  start() {
    if (this.isRunning) {
      logger.warn('Cleanup job is already running');
      return;
    }

    // Run daily at 2 AM
    this.intervalId = setInterval(() => {
      const now = new Date();
      if (now.getHours() === 2 && now.getMinutes() === 0) {
        this.runCleanup().catch(error => {
          logger.error('Cleanup job failed', { error: error.message });
        });
      }
    }, 60 * 1000); // Check every minute

    this.isRunning = true;
    logger.info('Cleanup job started');
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    logger.info('Cleanup job stopped');
  }

  async runCleanup() {
    try {
      logger.info('Starting data cleanup job');

      // Calculate retention period
      const retentionDays = parseInt(process.env.DATA_RETENTION_DAYS) || 90;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      // Cleanup old analytics data
      await this.cleanupOldAnalyticsData(cutoffDate);
      
      // Cleanup old system logs
      await this.cleanupOldSystemLogs(cutoffDate);
      
      // Cleanup old audit logs
      await this.cleanupOldAuditLogs(cutoffDate);

      logger.info('Data cleanup job completed successfully');
    } catch (error) {
      logger.error('Data cleanup job failed', { error: error.message });
      throw error;
    }
  }

  async cleanupOldAnalyticsData(cutoffDate) {
    try {
      // This would delete old analytics data from MongoDB
      // For now, just log the operation
      logger.info('Cleaning up old analytics data', { cutoffDate });
      
      // In real implementation:
      // const collection = mongoDBClient.getCollection('analytics_events');
      // await collection.deleteMany({ timestamp: { $lt: cutoffDate } });
      
    } catch (error) {
      logger.error('Failed to cleanup old analytics data', { error: error.message });
    }
  }

  async cleanupOldSystemLogs(cutoffDate) {
    try {
      logger.info('Cleaning up old system logs', { cutoffDate });
      
      // In real implementation:
      // const collection = mongoDBClient.getCollection('system_logs');
      // await collection.deleteMany({ timestamp: { $lt: cutoffDate } });
      
    } catch (error) {
      logger.error('Failed to cleanup old system logs', { error: error.message });
    }
  }

  async cleanupOldAuditLogs(cutoffDate) {
    try {
      const AuditLog = (await import('../models/index.js')).default.AuditLog;
      
      const result = await AuditLog.destroy({
        where: {
          createdAt: {
            $lt: cutoffDate
          }
        }
      });

      logger.info('Old audit logs cleaned up', { 
        deletedCount: result,
        cutoffDate 
      });
    } catch (error) {
      logger.error('Failed to cleanup old audit logs', { error: error.message });
    }
  }

  async runManualCleanup(days = 90) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      logger.info('Running manual cleanup', { days, cutoffDate });

      await this.cleanupOldAnalyticsData(cutoffDate);
      await this.cleanupOldSystemLogs(cutoffDate);
      await this.cleanupOldAuditLogs(cutoffDate);

      logger.info('Manual cleanup completed successfully');
    } catch (error) {
      logger.error('Manual cleanup failed', { error: error.message });
      throw error;
    }
  }
}

export default new CleanupJob();