// src/middleware/adminAuth.js
import { 
  authenticate, 
  AppError,
  logger 
} from '@ev-coownership/shared';
import staffService from '../services/staffService.js';

export const adminAuth = async (req, res, next) => {
  try {
    // First authenticate the user
    await authenticate(req, res, (err) => {
      if (err) throw err;
    });

    // Check if user has staff profile
    const staff = await staffService.getStaffByUserId(req.user.id);
    
    if (!staff.isActive) {
      throw new AppError('Staff account is deactivated', 403, 'STAFF_DEACTIVATED');
    }

    // Attach staff info to request
    req.staff = staff;
    next();
  } catch (error) {
    logger.error('Admin authentication failed', {
      error: error.message,
      userId: req.user?.id,
      path: req.path
    });
    next(error);
  }
};

export const requirePermission = (permission) => {
  return async (req, res, next) => {
    try {
      if (!req.staff) {
        throw new AppError('Staff authentication required', 401, 'STAFF_AUTH_REQUIRED');
      }

      await staffService.validateStaffPermissions(req.staff.id, permission);
      next();
    } catch (error) {
      logger.error('Permission check failed', {
        error: error.message,
        staffId: req.staff?.id,
        permission,
        path: req.path
      });
      next(error);
    }
  };
};

export const superAdminOnly = async (req, res, next) => {
  try {
    if (!req.staff) {
      throw new AppError('Staff authentication required', 401, 'STAFF_AUTH_REQUIRED');
    }

    if (req.staff.department !== 'admin') {
      throw new AppError('Super admin access required', 403, 'SUPER_ADMIN_REQUIRED');
    }

    next();
  } catch (error) {
    logger.error('Super admin check failed', {
      error: error.message,
      staffId: req.staff?.id,
      department: req.staff?.department,
      path: req.path
    });
    next(error);
  }
};