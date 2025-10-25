// src/jobs/insuranceExpiryJob.js
import db from '../models/index.js';
import { 
  logger,
  redisClient
} from '@ev-coownership/shared';
import insuranceService from '../services/insuranceService.js';

export class InsuranceExpiryJob {
  constructor() {
    this.jobName = 'insurance-expiry';
    this.isRunning = false;
  }

  async start() {
    if (this.isRunning) {
      logger.warn('Insurance expiry job is already running');
      return;
    }

    this.isRunning = true;
    logger.info('Starting insurance expiry job');

    // Run every day at 9 AM
    setInterval(() => {
      this.run();
    }, 24 * 60 * 60 * 1000); // 24 hours

    // Also run immediately on startup
    this.run();
  }

  async run() {
    try {
      const lockKey = `job:${this.jobName}:lock`;
      const lockAcquired = await this.acquireLock(lockKey);
      
      if (!lockAcquired) {
        logger.debug('Insurance expiry job already running in another instance');
        return;
      }

      logger.info('Running insurance expiry job');

      // Check for expiring insurance policies
      const expiringPolicies = await insuranceService.checkInsuranceExpiry();

      logger.info(`Found ${expiringPolicies.length} insurance policies expiring soon`);

      await this.releaseLock(lockKey);
      logger.info('Insurance expiry job completed successfully');

    } catch (error) {
      logger.error('Insurance expiry job failed', { error: error.message });
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

export default new InsuranceExpiryJob();