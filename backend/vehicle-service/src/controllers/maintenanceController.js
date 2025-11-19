// src/controllers/maintenanceController.js
import maintenanceService from '../services/maintenanceService.js';
import { 
  successResponse, 
  logger 
} from '@ev-coownership/shared';

export class MaintenanceController {
  async createMaintenanceSchedule(req, res, next) {
    try {
      const { vehicleId } = req.params;
      const scheduleData = { ...req.body, vehicleId };
      const userId = req.user.id;
      const userRole = req.user.role;

      const schedule = await maintenanceService.createMaintenanceSchedule(scheduleData, userId, userRole);

      logger.info('Maintenance schedule created successfully', { 
        scheduleId: schedule.id, 
        vehicleId,
        userId 
      });

      return successResponse(res, 'Maintenance schedule created successfully', schedule, 201);
    } catch (error) {
      logger.error('Failed to create maintenance schedule', { 
        error: error.message, 
        userId: req.user?.id,
        vehicleId: req.params.vehicleId 
      });
      next(error);
    }
  }

  async getMaintenanceSchedules(req, res, next) {
    try {
      const { vehicleId } = req.params;
      const { status } = req.query;
      const userId = req.user.id;

      const schedules = await maintenanceService.getMaintenanceSchedules(vehicleId, status, userId);

      logger.debug('Maintenance schedules retrieved successfully', { 
        vehicleId, 
        count: schedules.length,
        userId 
      });

      return successResponse(res, 'Maintenance schedules retrieved successfully', schedules);
    } catch (error) {
      logger.error('Failed to get maintenance schedules', { 
        error: error.message, 
        userId: req.user?.id,
        vehicleId: req.params.vehicleId 
      });
      next(error);
    }
  }

  async getMaintenanceSchedule(req, res, next) {
    try {
      const { scheduleId } = req.params;
      const userId = req.user.id;

      const schedule = await maintenanceService.getMaintenanceSchedule(scheduleId, userId);

      logger.debug('Maintenance schedule retrieved successfully', { scheduleId, userId });

      return successResponse(res, 'Maintenance schedule retrieved successfully', schedule);
    } catch (error) {
      logger.error('Failed to get maintenance schedule', { 
        error: error.message, 
        scheduleId: req.params.scheduleId,
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async updateMaintenanceSchedule(req, res, next) {
    try {
      const { scheduleId } = req.params;
      const updateData = req.body;
      const userId = req.user.id;
      const userRole = req.user.role;

      const schedule = await maintenanceService.updateMaintenanceSchedule(scheduleId, updateData, userId, userRole);

      logger.info('Maintenance schedule updated successfully', { scheduleId, userId });

      return successResponse(res, 'Maintenance schedule updated successfully', schedule);
    } catch (error) {
      logger.error('Failed to update maintenance schedule', { 
        error: error.message, 
        scheduleId: req.params.scheduleId,
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async deleteMaintenanceSchedule(req, res, next) {
    try {
      const { scheduleId } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      await maintenanceService.deleteMaintenanceSchedule(scheduleId, userId, userRole);

      logger.info('Maintenance schedule deleted successfully', { scheduleId, userId });

      return successResponse(res, 'Maintenance schedule deleted successfully');
    } catch (error) {
      logger.error('Failed to delete maintenance schedule', { 
        error: error.message, 
        scheduleId: req.params.scheduleId,
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async completeMaintenance(req, res, next) {
    try {
      const { scheduleId } = req.params;
      const completionData = req.body;
      const userId = req.user.id;
      const userRole = req.user.role;

      const history = await maintenanceService.completeMaintenance(scheduleId, completionData, userId, userRole);

      logger.info('Maintenance completed successfully', { 
        scheduleId, 
        historyId: history.id,
        userId 
      });

      return successResponse(res, 'Maintenance completed successfully', history);
    } catch (error) {
      logger.error('Failed to complete maintenance', { 
        error: error.message, 
        scheduleId: req.params.scheduleId,
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async createMaintenanceHistory(req, res, next) {
    try {
      const { vehicleId } = req.params;
      const historyData = { ...req.body, vehicleId };
      const userId = req.user.id;

      const history = await maintenanceService.createMaintenanceHistory(historyData, userId);

      logger.info('Maintenance history created successfully', { 
        historyId: history.id, 
        vehicleId,
        userId 
      });

      return successResponse(res, 'Maintenance history created successfully', history, 201);
    } catch (error) {
      logger.error('Failed to create maintenance history', { 
        error: error.message, 
        userId: req.user?.id,
        vehicleId: req.params.vehicleId 
      });
      next(error);
    }
  }

  async getMaintenanceHistory(req, res, next) {
    try {
      const { vehicleId } = req.params;
      const { startDate, endDate } = req.query;
      const userId = req.user.id;

      const history = await maintenanceService.getMaintenanceHistory(vehicleId, startDate, endDate, userId);

      logger.debug('Maintenance history retrieved successfully', { 
        vehicleId, 
        count: history.length,
        userId 
      });

      return successResponse(res, 'Maintenance history retrieved successfully', history);
    } catch (error) {
      logger.error('Failed to get maintenance history', { 
        error: error.message, 
        userId: req.user?.id,
        vehicleId: req.params.vehicleId 
      });
      next(error);
    }
  }

  async getAllMaintenanceSchedules(req, res, next) {
    try {
      const { status, vehicleId } = req.query;
      const userId = req.user.id;
      const userRole = req.user.role;

      const schedules = await maintenanceService.getAllMaintenanceSchedules(
        { status, vehicleId }, 
        userId, 
        userRole
      );

      logger.debug('All maintenance schedules retrieved successfully', { 
        count: schedules.length,
        userId,
        userRole
      });

      return successResponse(res, 'All maintenance schedules retrieved successfully', { schedules });
    } catch (error) {
      logger.error('Failed to get all maintenance schedules', { 
        error: error.message, 
        userId: req.user?.id
      });
      next(error);
    }
  }
}

export default new MaintenanceController();