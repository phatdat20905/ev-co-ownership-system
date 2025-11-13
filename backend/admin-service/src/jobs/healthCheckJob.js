// src/jobs/healthCheckJob.js
import { logger } from '@ev-coownership/shared';
import healthMonitorService from '../services/healthMonitorService.js';

export class HealthCheckJob {
  constructor() {
    this.isRunning = false;
    this.intervalId = null;
  }

  start() {
    if (this.isRunning) {
      logger.warn('Health check job is already running');
      return;
    }

    // Run every 5 minutes
    this.intervalId = setInterval(() => {
      healthMonitorService.performHealthChecks().catch(error => {
        logger.error('Health check job failed', { error: error.message });
      });
    }, 5 * 60 * 1000); // 5 minutes

    this.isRunning = true;
    logger.info('Health check job started');
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    logger.info('Health check job stopped');
  }
}

export default new HealthCheckJob();