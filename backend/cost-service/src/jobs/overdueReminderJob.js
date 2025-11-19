// src/jobs/overdueReminderJob.js
import { Queue, Worker } from 'bullmq';
import splitService from '../services/splitService.js';
import invoiceService from '../services/invoiceService.js';
import { logger, redisClient } from '@ev-coownership/shared';

class OverdueReminderJob {
  constructor() {
    this.queueName = 'overdue-reminders';
    // lazy-init to avoid blocking startup if Redis isn't fully ready
    this.queue = null;
    this.worker = null;
    this._initialized = false;
  }

  async run() {
    try {
      logger.info('🔄 Starting overdue reminder job');
      if (!this._initialized) {
        try {
          this.queue = new Queue(this.queueName, { connection: redisClient.client });
          this.worker = new Worker(this.queueName, this.processJob.bind(this), { connection: redisClient.client, concurrency: 3 });
          this.setupWorkerEvents();
          this._initialized = true;
          logger.info('✅ Overdue reminder queue/worker initialized');
        } catch (err) {
          logger.error('Failed to initialize overdue reminder queue/worker', { error: err?.message || err });
        }
      }

      // schedule asynchronously so it doesn't block startup
      this.scheduleDailyReminders().catch((err) => {
        logger.error('Failed to schedule daily reminders (async)', { error: err?.message || err });
      });
    } catch (error) {
      logger.error('Failed to start reminder job', { error: error.message });
    }
  }

  async scheduleDailyReminders() {
    try {
      // Schedule daily at 9 AM
      await this.queue.add(
        'daily-overdue-reminders',
        { type: 'daily' },
          {
            repeat: { cron: '0 9 * * *' }, // 9AM hàng ngày
            jobId: 'daily-overdue-reminders'
          }
      );

      logger.info('✅ Daily overdue reminders scheduled');
    } catch (error) {
      logger.error('Failed to schedule daily reminders', { error: error.message });
    }
  }

  async sendImmediateReminder(splitId) {
    try {
      await this.queue.add(
        'immediate-reminder',
        { type: 'immediate', splitId },
        {
          delay: 1000, // 1 giây delay
          attempts: 2
        }
      );

      logger.info('⚡ Immediate reminder queued', { splitId });
    } catch (error) {
      logger.error('Failed to queue immediate reminder', { splitId, error: error.message });
    }
  }

  async processJob(job) {
    const { type, splitId } = job.data;
    
    logger.info('Processing reminder job', { jobId: job.id, type });

    try {
      if (type === 'daily') {
        await this.processDailyReminders();
      } else if (type === 'immediate') {
        await this.processImmediateReminder(splitId);
      }

      return { success: true };
    } catch (error) {
      logger.error('Reminder job failed', { jobId: job.id, error: error.message });
      throw error;
    }
  }

  async processDailyReminders() {
    try {
      logger.info('Processing daily overdue reminders');
      
      // Lấy các split và invoice quá hạn
      const overdueSplits = await splitService.getOverdueSplits();
      const overdueInvoices = await invoiceService.getOverdueInvoices();

      let reminderCount = 0;

      // Gửi reminder cho splits quá hạn
      for (const split of overdueSplits) {
        try {
          await this.sendSplitReminder(split);
          reminderCount++;
        } catch (error) {
          logger.error('Failed to send split reminder', { 
            splitId: split.id, 
            error: error.message 
          });
        }
      }

      // Gửi reminder cho invoices quá hạn
      for (const invoice of overdueInvoices) {
        try {
          await this.sendInvoiceReminder(invoice);
          reminderCount++;
        } catch (error) {
          logger.error('Failed to send invoice reminder', { 
            invoiceId: invoice.id, 
            error: error.message 
          });
        }
      }

      logger.info('✅ Daily reminders sent', { 
        splitCount: overdueSplits.length,
        invoiceCount: overdueInvoices.length,
        totalReminders: reminderCount
      });
    } catch (error) {
      logger.error('Daily reminder processing failed', { error: error.message });
      throw error;
    }
  }

  async processImmediateReminder(splitId) {
    try {
      logger.info('Sending immediate reminder', { splitId });
      
      // Gửi reminder ngay lập tức
      // await notificationService.sendPaymentReminder(splitId);
      
      logger.info('✅ Immediate reminder sent', { splitId });
    } catch (error) {
      logger.error('Failed to send immediate reminder', { splitId, error: error.message });
      throw error;
    }
  }

  async sendSplitReminder(split) {
    try {
      logger.info('Sending split overdue reminder', {
        splitId: split.id,
        userId: split.userId,
        amount: split.splitAmount
      });

      // Trong thực tế: gửi email/notification
      // await notificationService.sendEmail(...);

    } catch (error) {
      logger.error('Failed to send split reminder', { 
        splitId: split.id, 
        error: error.message 
      });
      throw error;
    }
  }

  async sendInvoiceReminder(invoice) {
    try {
      logger.info('Sending invoice overdue reminder', {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        groupId: invoice.groupId
      });

      // Trong thực tế: gửi thông báo cho nhóm
      // await notificationService.sendGroupNotification(...);

    } catch (error) {
      logger.error('Failed to send invoice reminder', { 
        invoiceId: invoice.id, 
        error: error.message 
      });
      throw error;
    }
  }

  setupWorkerEvents() {
    if (!this.worker) return;
    this.worker.on('completed', (job) => {
      logger.info('Reminder job completed', { jobId: job.id });
    });

    this.worker.on('failed', (job, error) => {
      logger.error('Reminder job failed', { 
        jobId: job?.id, 
        error: error?.message || error
      });
    });
  }

  async close() {
    try {
      if (this.worker) await this.worker.close();
    } catch (err) {
      logger.error('Error closing reminder worker', { error: err?.message || err });
    }
    try {
      if (this.queue) await this.queue.close();
    } catch (err) {
      logger.error('Error closing reminder queue', { error: err?.message || err });
    }
    logger.info('Reminder job closed');
  }
}

export default new OverdueReminderJob();