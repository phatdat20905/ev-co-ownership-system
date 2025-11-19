// src/services/maintenanceService.js
import db from '../models/index.js';
import { 
  logger, 
  AppError 
} from '@ev-coownership/shared';
import eventService from './eventService.js';

export class MaintenanceService {
  async createMaintenanceSchedule(scheduleData, userId, userRole) {
    const transaction = await db.sequelize.transaction();

    try {
      const vehicle = await db.Vehicle.findByPk(scheduleData.vehicleId);
      if (!vehicle) {
        throw new AppError('Vehicle not found', 404, 'VEHICLE_NOT_FOUND');
      }

      // Check access (bypass for admin/staff)
      if (userRole !== 'admin' && userRole !== 'staff') {
        const hasAccess = await this.checkGroupAccess(vehicle.groupId, userId);
        if (!hasAccess) {
          throw new AppError('You do not have access to this vehicle', 403, 'ACCESS_DENIED');
        }
      }

      // Validate scheduled date
      if (new Date(scheduleData.scheduledDate) < new Date()) {
        throw new AppError('Scheduled date cannot be in the past', 400, 'INVALID_SCHEDULED_DATE');
      }

      const schedule = await db.MaintenanceSchedule.create(scheduleData, { transaction });

      await transaction.commit();

      // Publish event
      await eventService.publishMaintenanceScheduled({
        scheduleId: schedule.id,
        vehicleId: schedule.vehicleId,
        groupId: vehicle.groupId,
        maintenanceType: schedule.maintenanceType,
        scheduledDate: schedule.scheduledDate,
        scheduledBy: userId
      });

      return schedule;
    } catch (error) {
      await transaction.rollback();
      logger.error('Failed to create maintenance schedule', { error: error.message, userId, vehicleId: scheduleData.vehicleId });
      throw error;
    }
  }

  async getMaintenanceSchedules(vehicleId, status, userId) {
    try {
      const vehicle = await db.Vehicle.findByPk(vehicleId);
      if (!vehicle) {
        throw new AppError('Vehicle not found', 404, 'VEHICLE_NOT_FOUND');
      }

      // Check access
      const hasAccess = await this.checkGroupAccess(vehicle.groupId, userId);
      if (!hasAccess) {
        throw new AppError('You do not have access to this vehicle', 403, 'ACCESS_DENIED');
      }

      const whereClause = { vehicleId };
      if (status) {
        whereClause.status = status;
      }

      const schedules = await db.MaintenanceSchedule.findAll({
        where: whereClause,
        order: [['scheduledDate', 'ASC']],
        include: [
          {
            model: db.Vehicle,
            as: 'vehicle',
            attributes: ['id', 'vehicleName', 'licensePlate']
          }
        ]
      });

      return schedules;
    } catch (error) {
      logger.error('Failed to get maintenance schedules', { error: error.message, vehicleId, userId });
      throw error;
    }
  }

  async getMaintenanceSchedule(scheduleId, userId) {
    try {
      const schedule = await db.MaintenanceSchedule.findByPk(scheduleId, {
        include: [
          {
            model: db.Vehicle,
            as: 'vehicle',
            attributes: ['id', 'vehicleName', 'groupId', 'licensePlate']
          }
        ]
      });

      if (!schedule) {
        throw new AppError('Maintenance schedule not found', 404, 'MAINTENANCE_SCHEDULE_NOT_FOUND');
      }

      // Check access
      const hasAccess = await this.checkGroupAccess(schedule.vehicle.groupId, userId);
      if (!hasAccess) {
        throw new AppError('You do not have access to this maintenance schedule', 403, 'ACCESS_DENIED');
      }

      return schedule;
    } catch (error) {
      logger.error('Failed to get maintenance schedule', { error: error.message, scheduleId, userId });
      throw error;
    }
  }

  async updateMaintenanceSchedule(scheduleId, updateData, userId, userRole) {
    const transaction = await db.sequelize.transaction();

    try {
      const schedule = await db.MaintenanceSchedule.findByPk(scheduleId, {
        include: [{ model: db.Vehicle, as: 'vehicle' }]
      });

      if (!schedule) {
        throw new AppError('Maintenance schedule not found', 404, 'MAINTENANCE_SCHEDULE_NOT_FOUND');
      }

      // Check access (bypass for admin/staff)
      if (userRole !== 'admin' && userRole !== 'staff') {
        const hasAccess = await this.checkGroupAccess(schedule.vehicle.groupId, userId);
        if (!hasAccess) {
          throw new AppError('You do not have access to this maintenance schedule', 403, 'ACCESS_DENIED');
        }
      }

      // Validate scheduled date only if it's being changed to a new value
      if (updateData.scheduledDate) {
        const newDate = new Date(updateData.scheduledDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Only enforce future date for new schedules that haven't started
        if (schedule.status === 'scheduled' && newDate < today) {
          throw new AppError('Scheduled date cannot be in the past for scheduled maintenance', 400, 'INVALID_SCHEDULED_DATE');
        }
      }

      await schedule.update(updateData, { transaction });
      await transaction.commit();

      // Publish event
      await eventService.publishMaintenanceUpdated({
        scheduleId: schedule.id,
        vehicleId: schedule.vehicleId,
        groupId: schedule.vehicle.groupId,
        updates: updateData,
        updatedBy: userId
      });

      return schedule;
    } catch (error) {
      await transaction.rollback();
      logger.error('Failed to update maintenance schedule', { error: error.message, scheduleId, userId });
      throw error;
    }
  }

  async deleteMaintenanceSchedule(scheduleId, userId, userRole) {
    const transaction = await db.sequelize.transaction();

    try {
      const schedule = await db.MaintenanceSchedule.findByPk(scheduleId, {
        include: [{ model: db.Vehicle, as: 'vehicle' }]
      });

      if (!schedule) {
        throw new AppError('Maintenance schedule not found', 404, 'MAINTENANCE_SCHEDULE_NOT_FOUND');
      }

      // Check access (bypass for admin/staff)
      if (userRole !== 'admin' && userRole !== 'staff') {
        const hasAccess = await this.checkGroupAccess(schedule.vehicle.groupId, userId);
        if (!hasAccess) {
          throw new AppError('You do not have access to this maintenance schedule', 403, 'ACCESS_DENIED');
        }
      }

      await schedule.destroy({ transaction });
      await transaction.commit();

      // Publish event
      await eventService.publishMaintenanceCancelled({
        scheduleId: schedule.id,
        vehicleId: schedule.vehicleId,
        groupId: schedule.vehicle.groupId,
        cancelledBy: userId
      });

    } catch (error) {
      await transaction.rollback();
      logger.error('Failed to delete maintenance schedule', { error: error.message, scheduleId, userId });
      throw error;
    }
  }

  async completeMaintenance(scheduleId, completionData, userId, userRole) {
    const transaction = await db.sequelize.transaction();

    try {
      const schedule = await db.MaintenanceSchedule.findByPk(scheduleId, {
        include: [{ model: db.Vehicle, as: 'vehicle' }]
      });

      if (!schedule) {
        throw new AppError('Maintenance schedule not found', 404, 'MAINTENANCE_SCHEDULE_NOT_FOUND');
      }

      // Check access (bypass for admin/staff)
      if (userRole !== 'admin' && userRole !== 'staff') {
        const hasAccess = await this.checkGroupAccess(schedule.vehicle.groupId, userId);
        if (!hasAccess) {
          throw new AppError('You do not have access to this maintenance schedule', 403, 'ACCESS_DENIED');
        }
      }

      // Create maintenance history record
      const history = await db.MaintenanceHistory.create({
        vehicleId: schedule.vehicleId,
        maintenanceScheduleId: scheduleId,
        maintenanceType: schedule.maintenanceType,
        performedDate: new Date(),
        odometerReading: completionData.odometerReading,
        cost: completionData.cost,
        serviceProvider: completionData.serviceProvider,
        description: completionData.description,
        receiptUrl: completionData.receiptUrl,
        performedBy: userId
      }, { transaction });

      // Update schedule status
      await schedule.update({
        status: 'completed',
        actualCost: completionData.cost
      }, { transaction });

      // Update vehicle odometer if provided
      if (completionData.odometerReading) {
        await db.Vehicle.update(
          { currentOdometer: completionData.odometerReading },
          { where: { id: schedule.vehicleId }, transaction }
        );
      }

      await transaction.commit();

      // Publish events
      await eventService.publishMaintenanceCompleted({
        scheduleId: schedule.id,
        historyId: history.id,
        vehicleId: schedule.vehicleId,
        groupId: schedule.vehicle.groupId,
        maintenanceType: schedule.maintenanceType,
        cost: completionData.cost,
        performedBy: userId
      });

      // Publish cost event for Cost Service
      await eventService.publishMaintenanceCostRecorded({
        vehicleId: schedule.vehicleId,
        groupId: schedule.vehicle.groupId,
        costId: history.id,
        amount: completionData.cost,
        category: 'maintenance',
        description: `${schedule.maintenanceType} - ${completionData.serviceProvider || 'Service'}`,
        date: new Date().toISOString().split('T')[0]
      });

      return history;
    } catch (error) {
      await transaction.rollback();
      logger.error('Failed to complete maintenance', { error: error.message, scheduleId, userId });
      throw error;
    }
  }

  async createMaintenanceHistory(historyData, userId) {
    const transaction = await db.sequelize.transaction();

    try {
      const vehicle = await db.Vehicle.findByPk(historyData.vehicleId);
      if (!vehicle) {
        throw new AppError('Vehicle not found', 404, 'VEHICLE_NOT_FOUND');
      }

      // Check access
      const hasAccess = await this.checkGroupAccess(vehicle.groupId, userId);
      if (!hasAccess) {
        throw new AppError('You do not have access to this vehicle', 403, 'ACCESS_DENIED');
      }

      const history = await db.MaintenanceHistory.create(historyData, { transaction });

      // Update vehicle odometer if provided
      if (historyData.odometerReading) {
        await db.Vehicle.update(
          { currentOdometer: historyData.odometerReading },
          { where: { id: historyData.vehicleId }, transaction }
        );
      }

      await transaction.commit();

      // Publish cost event for Cost Service
      await eventService.publishMaintenanceCostRecorded({
        vehicleId: historyData.vehicleId,
        groupId: vehicle.groupId,
        costId: history.id,
        amount: historyData.cost,
        category: 'maintenance',
        description: `${historyData.maintenanceType} - ${historyData.serviceProvider || 'Service'}`,
        date: historyData.performedDate
      });

      return history;
    } catch (error) {
      await transaction.rollback();
      logger.error('Failed to create maintenance history', { error: error.message, userId, vehicleId: historyData.vehicleId });
      throw error;
    }
  }

  async getMaintenanceHistory(vehicleId, startDate, endDate, userId) {
    try {
      const vehicle = await db.Vehicle.findByPk(vehicleId);
      if (!vehicle) {
        throw new AppError('Vehicle not found', 404, 'VEHICLE_NOT_FOUND');
      }

      // Check access
      const hasAccess = await this.checkGroupAccess(vehicle.groupId, userId);
      if (!hasAccess) {
        throw new AppError('You do not have access to this vehicle', 403, 'ACCESS_DENIED');
      }

      const whereClause = { vehicleId };

      if (startDate && endDate) {
        whereClause.performedDate = {
          [db.Sequelize.Op.between]: [startDate, endDate]
        };
      }

      const history = await db.MaintenanceHistory.findAll({
        where: whereClause,
        order: [['performedDate', 'DESC']],
        include: [
          {
            model: db.Vehicle,
            as: 'vehicle',
            attributes: ['id', 'vehicleName', 'licensePlate']
          }
        ]
      });

      return history;
    } catch (error) {
      logger.error('Failed to get maintenance history', { error: error.message, vehicleId, userId });
      throw error;
    }
  }

  // Get all schedules (admin/staff only - no vehicle filtering)
  async getAllMaintenanceSchedules(filters, userId, userRole) {
    try {
      // Check if user is admin or staff
      if (!userRole || !['admin', 'staff'].includes(userRole.toLowerCase())) {
        throw new AppError('Access denied: Admin or staff role required', 403, 'ACCESS_DENIED');
      }

      const whereClause = {};
      if (filters.status) {
        whereClause.status = filters.status;
      }
      if (filters.vehicleId) {
        whereClause.vehicleId = filters.vehicleId;
      }

      const schedules = await db.MaintenanceSchedule.findAll({
        where: whereClause,
        order: [['scheduledDate', 'DESC']],
        include: [
          {
            model: db.Vehicle,
            as: 'vehicle',
            attributes: ['id', 'vehicleName', 'licensePlate', 'groupId']
          }
        ]
      });

      return schedules;
    } catch (error) {
      logger.error('Failed to get all maintenance schedules', { error: error.message, userId });
      throw error;
    }
  }

  // Helper methods
  async checkGroupAccess(groupId, userId) {
    try {
      // Call User Service to check group membership
      const response = await fetch(`${process.env.USER_SERVICE_URL}/api/v1/user/groups/${groupId}/members/${userId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.VEHICLE_SERVICE_INTERNAL_TOKEN || process.env.INTERNAL_SERVICE_TOKEN}`
        }
      });

      return response.ok;
    } catch (error) {
      logger.error('Failed to check group access', { error: error.message, groupId, userId });
      return false;
    }
  }
}

export default new MaintenanceService();