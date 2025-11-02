// src/jobs/batteryHealthCheckJob.js
import db from '../models/index.js';
import { 
  logger,
  redisClient
} from '@ev-coownership/shared';
import batteryService from '../services/batteryService.js';

export class BatteryHealthCheckJob {
  constructor() {
    this.jobName = 'battery-health-check';
    this.isRunning = false;
  }

  async start() {
    if (this.isRunning) {
      logger.warn('Battery health check job is already running');
      return;
    }

    this.isRunning = true;
    logger.info('Starting battery health check job');

    // Run every 7 days
    setInterval(() => {
      this.run();
    }, 7 * 24 * 60 * 60 * 1000); // 7 days

    // Also run immediately on startup
    this.run();
  }

  async run() {
    try {
      const lockKey = `job:${this.jobName}:lock`;
      const lockAcquired = await this.acquireLock(lockKey);
      
      if (!lockAcquired) {
        logger.debug('Battery health check job already running in another instance');
        return;
      }

      logger.info('Running battery health check job');

      // Get all vehicles with battery capacity
      const vehicles = await db.Vehicle.findAll({
        where: {
          batteryCapacityKwh: {
            [db.Sequelize.Op.ne]: null
          }
        },
        attributes: ['id', 'vehicleName', 'groupId']
      });

      logger.info(`Checking battery health for ${vehicles.length} vehicles`);

      for (const vehicle of vehicles) {
        try {
          await this.checkVehicleBatteryHealth(vehicle);
          // Add delay to avoid overwhelming the system
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          logger.error('Failed to check battery health for vehicle', {
            error: error.message,
            vehicleId: vehicle.id
          });
        }
      }

      await this.releaseLock(lockKey);
      logger.info('Battery health check job completed successfully');

    } catch (error) {
      logger.error('Battery health check job failed', { error: error.message });
    }
  }

  async checkVehicleBatteryHealth(vehicle) {
    try {
      const batteryHealth = await batteryService.calculateBatteryHealth(vehicle.id);
      
      logger.debug('Battery health checked', {
        vehicleId: vehicle.id,
        health: batteryHealth.health,
        confidence: batteryHealth.confidence
      });

    } catch (error) {
      logger.error('Failed to check battery health for vehicle', {
        error: error.message,
        vehicleId: vehicle.id
      });
    }
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

export default new BatteryHealthCheckJob();