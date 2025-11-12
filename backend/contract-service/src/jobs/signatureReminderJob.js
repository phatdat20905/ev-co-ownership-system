import { logger } from '@ev-coownership/shared';
import db from '../models/index.js';
import eventService from '../services/eventService.js';

export class SignatureReminderJob {
  constructor() {
    this.name = 'Signature Reminder Job';
    this.schedule = '0 9 * * *'; // Run daily at 9 AM
    this.isRunning = false;
  }

  async execute() {
    if (this.isRunning) {
      logger.warn('Signature reminder job is already running');
      return;
    }

    this.isRunning = true;
    logger.info('Starting signature reminder job');

    try {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      
      // Find contracts sent for signature more than 3 days ago with unsigned parties
      const pendingContracts = await db.Contract.findAll({
        where: {
          status: 'pending_signatures',
          updated_at: {
            [db.Sequelize.Op.lt]: threeDaysAgo
          }
        },
        include: [
          {
            model: db.ContractParty,
            as: 'parties',
            where: {
              has_signed: false
            },
            required: true
          }
        ]
      });

      let remindersSent = 0;

      for (const contract of pendingContracts) {
        const unsignedParties = contract.parties.filter(p => !p.has_signed);
        
        for (const party of unsignedParties) {
          await eventService.publishSignatureReminderSent({
            contractId: contract.id,
            userId: party.user_id,
            groupId: contract.group_id,
            reminderType: 'general'
          });
          remindersSent++;
        }
      }

      logger.info('Signature reminder job completed successfully', {
        contractsProcessed: pendingContracts.length,
        remindersSent
      });
    } catch (error) {
      logger.error('Signature reminder job failed', { error: error.message });
    } finally {
      this.isRunning = false;
    }
  }

  start() {
    logger.info(`Scheduled job: ${this.name} - ${this.schedule}`);
    
    // For demo purposes
    this.execute();
    
    setInterval(() => {
      this.execute();
    }, 24 * 60 * 60 * 1000); // 24 hours
  }
}

export default new SignatureReminderJob();