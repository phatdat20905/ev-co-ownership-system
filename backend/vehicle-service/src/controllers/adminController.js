// src/controllers/adminController.js
import adminService from '../services/adminService.js';
import { 
  successResponse, 
  logger 
} from '@ev-coownership/shared';

export class AdminController {
  async getAllVehicles(req, res, next) {
    try {
      const { page = 1, limit = 50, status, groupId } = req.query;
      const userId = req.user.id;

      const result = await adminService.getAllVehicles(parseInt(page), parseInt(limit), status, groupId, userId);

      logger.debug('All vehicles retrieved for admin', { 
        count: result.vehicles.length,
        userId 
      });

      return successResponse(res, 'All vehicles retrieved successfully', result);
    } catch (error) {
      logger.error('Failed to get all vehicles for admin', { 
        error: error.message, 
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async getMaintenanceDueVehicles(req, res, next) {
    try {
      const userId = req.user.id;

      const vehicles = await adminService.getMaintenanceDueVehicles(userId);

      logger.debug('Maintenance due vehicles retrieved for admin', { 
        count: vehicles.length,
        userId 
      });

      return successResponse(res, 'Maintenance due vehicles retrieved successfully', vehicles);
    } catch (error) {
      logger.error('Failed to get maintenance due vehicles', { 
        error: error.message, 
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async getInsuranceExpiringVehicles(req, res, next) {
    try {
      const userId = req.user.id;

      const vehicles = await adminService.getInsuranceExpiringVehicles(userId);

      logger.debug('Insurance expiring vehicles retrieved for admin', { 
        count: vehicles.length,
        userId 
      });

      return successResponse(res, 'Insurance expiring vehicles retrieved successfully', vehicles);
    } catch (error) {
      logger.error('Failed to get insurance expiring vehicles', { 
        error: error.message, 
        userId: req.user?.id 
      });
      next(error);
    }
  }

  async getSystemOverview(req, res, next) {
    try {
      const userId = req.user.id;

      const overview = await adminService.getSystemOverview(userId);

      logger.debug('System overview retrieved for admin', { userId });

      return successResponse(res, 'System overview retrieved successfully', overview);
    } catch (error) {
      logger.error('Failed to get system overview', { 
        error: error.message, 
        userId: req.user?.id 
      });
      next(error);
    }
  }
}

export default new AdminController();