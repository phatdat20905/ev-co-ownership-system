import { logger } from '@ev-coownership/shared';
import lifecycleService from '../services/lifecycleService.js';

export class ContractExpiryJob {
  constructor() {
    this.name = 'Contract Expiry Job';
    this.schedule = '0 0 * * *'; // Run daily at midnight
    this.isRunning = false;
  }

  async execute() {
    if (this.isRunning) {
      logger.warn('Contract expiry job is already running');
      return;
    }

    this.isRunning = true;
    logger.info('Starting contract expiry job');

    try {
      // Check for expiring contracts
      const expiringResults = await lifecycleService.checkExpiringContracts();
      
      // Expire contracts that have passed their expiry date
      const expiredResults = await lifecycleService.expireContracts();

      logger.info('Contract expiry job completed successfully', {
        expiringContracts: expiringResults.length,
        expiredContracts: expiredResults.length
      });
    } catch (error) {
      logger.error('Contract expiry job failed', { error: error.message });
    } finally {
      this.isRunning = false;
    }
  }

  start() {
    // In a real implementation, use node-cron or similar
    logger.info(`Scheduled job: ${this.name} - ${this.schedule}`);
    
    // For demo purposes, run immediately
    this.execute();
    
    // Set up interval for demo (in production, use proper scheduler)
    setInterval(() => {
      this.execute();
    }, 24 * 60 * 60 * 1000); // 24 hours
  }
}

export default new ContractExpiryJob();