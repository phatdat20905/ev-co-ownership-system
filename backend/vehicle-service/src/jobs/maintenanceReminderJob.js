// src/jobs/maintenanceReminderJob.js
import db from '../models/index.js';
import { 
  logger,
  redisClient
} from '@ev-coownership/shared';
import eventService from '../services/eventService.js';

export class MaintenanceReminderJob {
  constructor() {
    this.jobName = 'maintenance-reminder';
    this.isRunning = false;
    this.intervalId = null;
  }

  async start() {
    if (this.isRunning) {
      logger.warn('Maintenance reminder job is already running');
      return;
    }

    this.isRunning = true;
    logger.info('Starting maintenance reminder job');

    // Run every day at 8 AM
    this.intervalId = setInterval(() => {
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
        logger.debug('Maintenance reminder job already running in another instance');
        return;
      }

      logger.info('Running maintenance reminder job');

      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

      // Find maintenance schedules due in the next 7 days
      const dueSchedules = await db.MaintenanceSchedule.findAll({
        where: {
          status: 'scheduled',
          scheduledDate: {
            [db.Sequelize.Op.lte]: sevenDaysFromNow
          }
        },
        include: [
          {
            model: db.Vehicle,
            as: 'vehicle',
            attributes: ['id', 'vehicleName', 'groupId', 'licensePlate'],
            include: [
              {
                model: db.VehicleInsurance,
                as: 'insurancePolicies',
                where: { isActive: true },
                required: false,
                limit: 1
              }
            ]
          }
        ]
      });

      logger.info(`Found ${dueSchedules.length} maintenance schedules due soon`);

      for (const schedule of dueSchedules) {
        const daysUntilDue = Math.ceil((new Date(schedule.scheduledDate) - new Date()) / (1000 * 60 * 60 * 24));
        
        // Only send reminders for schedules due in 1, 3, and 7 days
        if ([1, 3, 7].includes(daysUntilDue)) {
          await this.sendMaintenanceReminder(schedule, daysUntilDue);
        }
      }

      await this.releaseLock(lockKey);
      logger.info('Maintenance reminder job completed successfully');

    } catch (error) {
      logger.error('Maintenance reminder job failed', { error: error.message });
    }
  }

  async sendMaintenanceReminder(schedule, daysUntilDue) {
    try {
      await eventService.publishMaintenanceReminder({
        scheduleId: schedule.id,
        vehicleId: schedule.vehicleId,
        groupId: schedule.vehicle.groupId,
        maintenanceType: schedule.maintenanceType,
        scheduledDate: schedule.scheduledDate,
        daysUntilDue,
        vehicleName: schedule.vehicle.vehicleName,
        licensePlate: schedule.vehicle.licensePlate,
        estimatedCost: schedule.estimatedCost
      });

      logger.info('Maintenance reminder sent', {
        scheduleId: schedule.id,
        vehicleId: schedule.vehicleId,
        daysUntilDue
      });

    } catch (error) {
      logger.error('Failed to send maintenance reminder', {
        error: error.message,
        scheduleId: schedule.id
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

  async stop() {
    try {
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
      this.isRunning = false;
      logger.info('Stopped maintenance reminder job');
    } catch (error) {
      logger.error('Failed to stop maintenance reminder job', { error: error.message });
    }
  }
}

export default new MaintenanceReminderJob();