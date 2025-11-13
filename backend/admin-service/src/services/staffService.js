// src/services/staffService.js
import staffRepository from '../repositories/staffRepository.js';
import { logger, AppError } from '@ev-coownership/shared';
import eventService from './eventService.js';

export class StaffService {
  async createStaff(staffData) {
    try {
      // Check if employee ID already exists
      const existingStaff = await staffRepository.findByEmployeeId(staffData.employeeId);
      if (existingStaff) {
        throw new AppError('Employee ID already exists', 400, 'DUPLICATE_EMPLOYEE_ID');
      }

      // Check if user already has staff profile
      const existingUserStaff = await staffRepository.findByUserId(staffData.userId);
      if (existingUserStaff) {
        throw new AppError('User already has a staff profile', 400, 'DUPLICATE_STAFF_PROFILE');
      }

      const staff = await staffRepository.create(staffData);

      logger.info('Staff profile created successfully', {
        staffId: staff.id,
        employeeId: staff.employeeId,
        department: staff.department
      });

      await eventService.publishStaffCreated({
        staffId: staff.id,
        userId: staff.userId,
        employeeId: staff.employeeId,
        department: staff.department,
        position: staff.position
      });

      return staff;
    } catch (error) {
      logger.error('Failed to create staff profile', {
        error: error.message,
        employeeId: staffData.employeeId,
        userId: staffData.userId
      });
      throw error;
    }
  }

  async getStaffById(staffId) {
    try {
      const staff = await staffRepository.findById(staffId);
      if (!staff) {
        throw new AppError('Staff not found', 404, 'STAFF_NOT_FOUND');
      }
      return staff;
    } catch (error) {
      logger.error('Failed to get staff by ID', {
        error: error.message,
        staffId
      });
      throw error;
    }
  }

  async getStaffByUserId(userId) {
    try {
      const staff = await staffRepository.findByUserId(userId);
      if (!staff) {
        throw new AppError('Staff not found for user', 404, 'STAFF_NOT_FOUND');
      }
      return staff;
    } catch (error) {
      logger.error('Failed to get staff by user ID', {
        error: error.message,
        userId
      });
      throw error;
    }
  }

  async updateStaff(staffId, updateData) {
    try {
      const staff = await staffRepository.update(staffId, updateData);
      if (!staff) {
        throw new AppError('Staff not found', 404, 'STAFF_NOT_FOUND');
      }

      logger.info('Staff profile updated successfully', {
        staffId,
        updates: Object.keys(updateData)
      });

      await eventService.publishStaffUpdated({
        staffId: staff.id,
        updates: updateData
      });

      return staff;
    } catch (error) {
      logger.error('Failed to update staff profile', {
        error: error.message,
        staffId
      });
      throw error;
    }
  }

  async updatePermissions(staffId, permissions) {
    try {
      const staff = await staffRepository.updatePermissions(staffId, permissions);
      if (!staff) {
        throw new AppError('Staff not found', 404, 'STAFF_NOT_FOUND');
      }

      logger.info('Staff permissions updated successfully', {
        staffId,
        permissions
      });

      await eventService.publishStaffPermissionsUpdated({
        staffId: staff.id,
        permissions
      });

      return staff;
    } catch (error) {
      logger.error('Failed to update staff permissions', {
        error: error.message,
        staffId
      });
      throw error;
    }
  }

  async deactivateStaff(staffId) {
    try {
      const staff = await staffRepository.deactivateStaff(staffId);
      if (!staff) {
        throw new AppError('Staff not found', 404, 'STAFF_NOT_FOUND');
      }

      logger.info('Staff deactivated successfully', { staffId });

      await eventService.publishStaffDeactivated({
        staffId: staff.id
      });

      return staff;
    } catch (error) {
      logger.error('Failed to deactivate staff', {
        error: error.message,
        staffId
      });
      throw error;
    }
  }

  async listStaff(filters = {}) {
    try {
      const {
        department,
        isActive = true,
        page = 1,
        limit = 20
      } = filters;

      const where = { isActive };
      if (department) {
        where.department = department;
      }

      const result = await staffRepository.paginate({
        where,
        page,
        limit,
        order: [['createdAt', 'DESC']]
      });

      logger.debug('Staff list retrieved successfully', {
        total: result.pagination.total,
        page,
        limit
      });

      return result;
    } catch (error) {
      logger.error('Failed to list staff', {
        error: error.message,
        filters
      });
      throw error;
    }
  }

  async getStaffPerformance(period = 'monthly') {
    try {
      const performance = await staffRepository.getStaffWithPerformance(period);

      logger.debug('Staff performance data retrieved successfully', {
        period,
        count: performance.length
      });

      return performance;
    } catch (error) {
      logger.error('Failed to get staff performance', {
        error: error.message,
        period
      });
      throw error;
    }
  }

  async validateStaffPermissions(staffId, requiredPermission) {
    try {
      const staff = await staffRepository.findById(staffId);
      if (!staff) {
        throw new AppError('Staff not found', 404, 'STAFF_NOT_FOUND');
      }

      if (!staff.isActive) {
        throw new AppError('Staff account is deactivated', 403, 'STAFF_DEACTIVATED');
      }

      const hasPermission = staff.permissions[requiredPermission];
      if (!hasPermission) {
        throw new AppError('Insufficient permissions', 403, 'INSUFFICIENT_PERMISSIONS');
      }

      return staff;
    } catch (error) {
      logger.error('Failed to validate staff permissions', {
        error: error.message,
        staffId,
        requiredPermission
      });
      throw error;
    }
  }
}

export default new StaffService();