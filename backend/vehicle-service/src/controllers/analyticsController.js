// src/controllers/analyticsController.js
import analyticsService from '../services/analyticsService.js';
import { 
  successResponse, 
  logger 
} from '@ev-coownership/shared';

export class AnalyticsController {
  async getUtilization(req, res, next) {
    try {
      const { vehicleId } = req.params;
      const { period = 'monthly' } = req.query;
      const userId = req.user.id;

      const utilization = await analyticsService.getUtilization(vehicleId, period, userId);

      logger.debug('Vehicle utilization analytics retrieved', { vehicleId, userId });

      return successResponse(res, 'Utilization analytics retrieved successfully', utilization);
    } catch (error) {
      logger.error('Failed to get utilization analytics', { 
        error: error.message, 
        userId: req.user?.id,
        vehicleId: req.params.vehicleId 
      });
      next(error);
    }
  }

  async getMaintenanceCosts(req, res, next) {
    try {
      const { vehicleId } = req.params;
      const { year = new Date().getFullYear() } = req.query;
      const userId = req.user.id;

      const costs = await analyticsService.getMaintenanceCosts(vehicleId, parseInt(year), userId);

      logger.debug('Maintenance costs analytics retrieved', { vehicleId, year, userId });

      return successResponse(res, 'Maintenance costs analytics retrieved successfully', costs);
    } catch (error) {
      logger.error('Failed to get maintenance costs analytics', { 
        error: error.message, 
        userId: req.user?.id,
        vehicleId: req.params.vehicleId 
      });
      next(error);
    }
  }

  async getBatteryHealth(req, res, next) {
    try {
      const { vehicleId } = req.params;
      const userId = req.user.id;

      const batteryHealth = await analyticsService.getBatteryHealth(vehicleId, userId);

      logger.debug('Battery health analytics retrieved', { vehicleId, userId });

      return successResponse(res, 'Battery health analytics retrieved successfully', batteryHealth);
    } catch (error) {
      logger.error('Failed to get battery health analytics', { 
        error: error.message, 
        userId: req.user?.id,
        vehicleId: req.params.vehicleId 
      });
      next(error);
    }
  }

  async getOperatingCosts(req, res, next) {
    try {
      const { vehicleId } = req.params;
      const { period = 'quarterly' } = req.query;
      const userId = req.user.id;

      const costs = await analyticsService.getOperatingCosts(vehicleId, period, userId);

      logger.debug('Operating costs analytics retrieved', { vehicleId, userId });

      return successResponse(res, 'Operating costs analytics retrieved successfully', costs);
    } catch (error) {
      logger.error('Failed to get operating costs analytics', { 
        error: error.message, 
        userId: req.user?.id,
        vehicleId: req.params.vehicleId 
      });
      next(error);
    }
  }

  async getGroupSummary(req, res, next) {
    try {
      const { groupId } = req.params;
      const userId = req.user.id;

      const summary = await analyticsService.getGroupSummary(groupId, userId);

      logger.debug('Group vehicles summary retrieved', { groupId, userId });

      return successResponse(res, 'Group vehicles summary retrieved successfully', summary);
    } catch (error) {
      logger.error('Failed to get group vehicles summary', { 
        error: error.message, 
        userId: req.user?.id,
        groupId: req.params.groupId 
      });
      next(error);
    }
  }
}

export default new AnalyticsController();