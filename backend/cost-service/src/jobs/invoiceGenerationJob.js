// src/jobs/invoiceGenerationJob.js
import { Queue, Worker } from 'bullmq';
import invoiceService from '../services/invoiceService.js';
import { logger, redisClient } from '@ev-coownership/shared';

class InvoiceGenerationJob {
  constructor() {
    this.queueName = 'invoice-generation';
    // lazy-init: don't create Queue/Worker at import time to avoid blocking startup
    this.queue = null;
    this.worker = null;
    this._initialized = false;
  }

  async run() {
    try {
      logger.info('🔄 Starting invoice generation job');
      // Initialize queue/worker if not already
      if (!this._initialized) {
        try {
          // create queue and worker with redis connection
          this.queue = new Queue(this.queueName, { connection: redisClient.client });
          this.worker = new Worker(
            this.queueName,
            this.processJob.bind(this),
            { connection: redisClient.client, concurrency: 2 }
          );
          this.setupWorkerEvents();
          this._initialized = true;
          logger.info('✅ Invoice job queue/worker initialized');
        } catch (err) {
          logger.error('Failed to initialize invoice queue/worker', { error: err?.message || err });
        }
      }

      // Schedule monthly invoices asynchronously so scheduling doesn't block startup
      this.scheduleMonthlyInvoices().catch((err) => {
        logger.error('Failed to schedule monthly invoices (async)', { error: err?.message || err });
      });
    } catch (error) {
      logger.error('Failed to start invoice job', { error: error.message });
    }
  }

  async scheduleMonthlyInvoices() {
    try {
      // Schedule for the 1st of every month at 2 AM
      await this.queue.add(
        'monthly-invoice-generation',
        { type: 'monthly' },
        {
          // Use cron expression with bullmq repeat option
          repeat: { cron: '0 2 1 * *' }, // 2AM ngày 1 hàng tháng
          jobId: 'monthly-invoice-generation'
        }
      );

      logger.info('✅ Monthly invoice generation scheduled');
    } catch (error) {
      logger.error('Failed to schedule monthly invoices', { error: error.message });
    }
  }

  async generateInvoiceForGroup(groupId, period) {
    try {
      await this.queue.add(
        'group-invoice-generation',
        { groupId, period, type: 'group' },
        {
          delay: 5000, // 5 giây delay
          attempts: 3
        }
      );

      logger.info('📋 Invoice generation queued for group', { groupId });
    } catch (error) {
      logger.error('Failed to queue group invoice', { groupId, error: error.message });
    }
  }

  async processJob(job) {
    const { type, groupId, period } = job.data;
    
    logger.info('Processing invoice job', { jobId: job.id, type });

    try {
      if (type === 'monthly') {
        await this.processMonthlyInvoices();
      } else if (type === 'group') {
        await this.processGroupInvoice(groupId, period);
      }

      return { success: true };
    } catch (error) {
      logger.error('Invoice job failed', { jobId: job.id, error: error.message });
      throw error;
    }
  }

  async processMonthlyInvoices() {
    try {
      logger.info('Processing monthly invoices');
      
      // Mock data - trong thực tế sẽ lấy từ database
      const groupIds = [
        '44444444-4444-4444-4444-444444444444',
        '55555555-5555-5555-5555-555555555555'
      ];

      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      
      const periodStart = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
      const periodEnd = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);

      for (const groupId of groupIds) {
        try {
          await invoiceService.generateInvoice({
            groupId,
            periodStart: periodStart.toISOString().split('T')[0],
            periodEnd: periodEnd.toISOString().split('T')[0]
          }, 'system');
        } catch (error) {
          logger.error('Failed to generate invoice for group', { groupId, error: error.message });
        }
      }

      logger.info('✅ Monthly invoices completed', { count: groupIds.length });
    } catch (error) {
      logger.error('Monthly invoice processing failed', { error: error.message });
      throw error;
    }
  }

  async processGroupInvoice(groupId, period) {
    try {
      await invoiceService.generateInvoice({
        groupId,
        periodStart: period.start,
        periodEnd: period.end
      }, 'system');

      logger.info('✅ Group invoice generated', { groupId });
    } catch (error) {
      logger.error('Failed to generate group invoice', { groupId, error: error.message });
      throw error;
    }
  }

  setupWorkerEvents() {
    if (!this.worker) return;
    this.worker.on('completed', (job) => {
      logger.info('Invoice job completed', { jobId: job.id });
    });

    this.worker.on('failed', (job, error) => {
      logger.error('Invoice job failed', { 
        jobId: job?.id, 
        error: error?.message || error
      });
    });
  }

  async close() {
    try {
      if (this.worker) await this.worker.close();
    } catch (err) {
      logger.error('Error closing invoice worker', { error: err?.message || err });
    }
    try {
      if (this.queue) await this.queue.close();
    } catch (err) {
      logger.error('Error closing invoice queue', { error: err?.message || err });
    }
    logger.info('Invoice job closed');
  }
}

export default new InvoiceGenerationJob();