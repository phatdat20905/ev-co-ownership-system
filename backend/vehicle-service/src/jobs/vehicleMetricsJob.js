// src/jobs/vehicleMetricsJob.js
import db from '../models/index.js';
import { 
  logger,
  redisClient
} from '@ev-coownership/shared';

export class VehicleMetricsJob {
  constructor() {
    this.jobName = 'vehicle-metrics';
    this.isRunning = false;
  }

  async start() {
    if (this.isRunning) {
      logger.warn('Vehicle metrics job is already running');
      return;
    }

    this.isRunning = true;
    logger.info('Starting vehicle metrics job');

    // Run every hour
    setInterval(() => {
      this.run();
    }, 60 * 60 * 1000); // 1 hour

    // Also run immediately on startup
    this.run();
  }

  async run() {
    try {
      const lockKey = `job:${this.jobName}:lock`;
      const lockAcquired = await this.acquireLock(lockKey);
      
      if (!lockAcquired) {
        logger.debug('Vehicle metrics job already running in another instance');
        return;
      }

      logger.info('Running vehicle metrics job');

      // Collect system metrics
      await this.collectSystemMetrics();
      
      // Update cache with fresh data
      await this.updateCacheMetrics();

      await this.releaseLock(lockKey);
      logger.info('Vehicle metrics job completed successfully');

    } catch (error) {
      logger.error('Vehicle metrics job failed', { error: error.message });
    }
  }

  async collectSystemMetrics() {
    try {
      // Get total vehicle count
      const totalVehicles = await db.Vehicle.count();

      // Get vehicles by status
      const vehiclesByStatus = await db.Vehicle.findAll({
        attributes: [
          'status',
          [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
        ],
        group: ['status'],
        raw: true
      });

      // Get maintenance statistics
      const maintenanceStats = await db.MaintenanceSchedule.findAll({
        attributes: [
          'status',
          [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
        ],
        group: ['status'],
        raw: true
      });

      // Store metrics in Redis for monitoring
      const metrics = {
        timestamp: new Date().toISOString(),
        totalVehicles,
        vehiclesByStatus: this.formatStatusCount(vehiclesByStatus),
        maintenanceByStatus: this.formatStatusCount(maintenanceStats),
        systemHealth: this.calculateSystemHealth(vehiclesByStatus, maintenanceStats)
      };

      await redisClient.set('metrics:vehicle:system', JSON.stringify(metrics), 3600); // Cache for 1 hour

      logger.debug('System metrics collected', {
        totalVehicles,
        availableVehicles: this.getCountByStatus(vehiclesByStatus, 'available')
      });

    } catch (error) {
      logger.error('Failed to collect system metrics', { error: error.message });
    }
  }

  async updateCacheMetrics() {
    try {
      // Clear old cache entries that might be stale
      const pattern = 'metrics:*';
      const keys = await redisClient.keys(pattern);
      
      const now = Date.now();
      for (const key of keys) {
        // You could implement more sophisticated cache invalidation logic here
        logger.debug('Cache metric updated', { key });
      }

    } catch (error) {
      logger.error('Failed to update cache metrics', { error: error.message });
    }
  }

  // Helper methods
  formatStatusCount(statusArray) {
    const result = {};
    statusArray.forEach(item => {
      result[item.status] = parseInt(item.count);
    });
    return result;
  }

  getCountByStatus(statusArray, status) {
    const item = statusArray.find(s => s.status === status);
    return item ? parseInt(item.count) : 0;
  }

  calculateSystemHealth(vehiclesByStatus, maintenanceStats) {
    let score = 100;

    // Deduct for vehicles in maintenance
    const maintenanceCount = this.getCountByStatus(vehiclesByStatus, 'maintenance');
    const totalVehicles = vehiclesByStatus.reduce((sum, item) => sum + parseInt(item.count), 0);
    
    if (totalVehicles > 0) {
      const maintenancePercentage = (maintenanceCount / totalVehicles) * 100;
      score -= Math.min(maintenancePercentage * 2, 30);
    }

    // Deduct for overdue maintenance
    const overdueMaintenance = maintenanceStats.find(m => m.status === 'scheduled')?.count || 0;
    score -= Math.min(overdueMaintenance * 5, 20);

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  async acquireLock(lockKey) {
    try {
      const result = await redisClient.set(lockKey, 'locked', { NX: true, EX: 3600 });
 // Lock for 1 hour
      return result === 'OK';
    } catch (error) {
      logger.error('Failed to acquire job lock', { error: error.message });
      return false;
    }
  }

  async releaseLock(lockKey) {
    try {
      await redisClient.del(lockKey);
    } catch (error) {
      logger.error('Failed to release job lock', { error: error.message });
    }
  }
}

export default new VehicleMetricsJob();