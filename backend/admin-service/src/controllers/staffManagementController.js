// src/controllers/staffManagementController.js
import staffService from '../services/staffService.js';
import { successResponse, logger, AppError } from '@ev-coownership/shared';

export class StaffManagementController {
  async createStaff(req, res, next) {
    try {
      const staffData = {
        ...req.body,
        updatedBy: req.staff.id
      };

      const staff = await staffService.createStaff(staffData);

      logger.info('Staff created successfully', {
        staffId: staff.id,
        createdBy: req.staff.id
      });

      return successResponse(res, 'Staff created successfully', staff, 201);
    } catch (error) {
      logger.error('Failed to create staff', {
        error: error.message,
        createdBy: req.staff?.id
      });
      next(error);
    }
  }

  async getStaff(req, res, next) {
    try {
      const { staffId } = req.params;
      
      const staff = await staffService.getStaffById(staffId);

      logger.debug('Staff retrieved successfully', {
        staffId,
        requestedBy: req.staff.id
      });

      return successResponse(res, 'Staff retrieved successfully', staff);
    } catch (error) {
      logger.error('Failed to get staff', {
        error: error.message,
        staffId: req.params.staffId
      });
      next(error);
    }
  }

  async updateStaff(req, res, next) {
    try {
      const { staffId } = req.params;
      const updateData = {
        ...req.body,
        updatedBy: req.staff.id
      };

      const staff = await staffService.updateStaff(staffId, updateData);

      logger.info('Staff updated successfully', {
        staffId,
        updatedBy: req.staff.id
      });

      return successResponse(res, 'Staff updated successfully', staff);
    } catch (error) {
      logger.error('Failed to update staff', {
        error: error.message,
        staffId: req.params.staffId
      });
      next(error);
    }
  }

  async updateStaffPermissions(req, res, next) {
    try {
      const { staffId } = req.params;
      const { permissions } = req.body;

      if (!permissions || typeof permissions !== 'object') {
        throw new AppError('Permissions object is required', 400, 'INVALID_PERMISSIONS');
      }

      const staff = await staffService.updatePermissions(staffId, permissions);

      logger.info('Staff permissions updated successfully', {
        staffId,
        updatedBy: req.staff.id,
        permissions: Object.keys(permissions)
      });

      return successResponse(res, 'Staff permissions updated successfully', staff);
    } catch (error) {
      logger.error('Failed to update staff permissions', {
        error: error.message,
        staffId: req.params.staffId
      });
      next(error);
    }
  }

  async deactivateStaff(req, res, next) {
    try {
      const { staffId } = req.params;

      const staff = await staffService.deactivateStaff(staffId);

      logger.info('Staff deactivated successfully', {
        staffId,
        deactivatedBy: req.staff.id
      });

      return successResponse(res, 'Staff deactivated successfully', staff);
    } catch (error) {
      logger.error('Failed to deactivate staff', {
        error: error.message,
        staffId: req.params.staffId
      });
      next(error);
    }
  }

  async listStaff(req, res, next) {
    try {
      const {
        department,
        isActive = 'true',
        page = 1,
        limit = 20
      } = req.query;

      const filters = {
        department,
        isActive: isActive === 'true',
        page: parseInt(page),
        limit: parseInt(limit)
      };

      const result = await staffService.listStaff(filters);

      logger.debug('Staff list retrieved successfully', {
        total: result.pagination.total,
        requestedBy: req.staff.id
      });

      return successResponse(res, 'Staff list retrieved successfully', result);
    } catch (error) {
      logger.error('Failed to list staff', {
        error: error.message,
        filters: req.query
      });
      next(error);
    }
  }

  async getStaffPerformance(req, res, next) {
    try {
      const { period = 'monthly' } = req.query;

      const performance = await staffService.getStaffPerformance(period);

      logger.debug('Staff performance retrieved successfully', {
        period,
        requestedBy: req.staff.id
      });

      return successResponse(res, 'Staff performance retrieved successfully', performance);
    } catch (error) {
      logger.error('Failed to get staff performance', {
        error: error.message,
        period: req.query.period
      });
      next(error);
    }
  }

  async getMyProfile(req, res, next) {
    try {
      const staff = await staffService.getStaffByUserId(req.user.id);

      logger.debug('Staff profile retrieved successfully', {
        staffId: staff.id
      });

      return successResponse(res, 'Staff profile retrieved successfully', staff);
    } catch (error) {
      logger.error('Failed to get staff profile', {
        error: error.message,
        userId: req.user?.id
      });
      next(error);
    }
  }
}

export default new StaffManagementController();