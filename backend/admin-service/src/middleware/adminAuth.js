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

    // Check if user has staff profile. If not found but the authenticated user
    // appears to be an admin (from identity provider), allow a fallback pseudo-staff
    // so site admin UX works even when an entry is not present in the staff table.
    let staff;
    try {
      staff = await staffService.getStaffByUserId(req.user.id);
    } catch (err) {
      // If staff not found, allow admin fallback when possible
      const isAdminUser = req.user && (
        req.user.role === 'admin' ||
        (Array.isArray(req.user.roles) && req.user.roles.includes('admin')) ||
        req.user.isAdmin === true
      );

      if (err && /staff not found/i.test(err.message) && isAdminUser) {
        // create a minimal pseudo-staff object so permission checks that only
        // require a staff presence will continue to work for admins
        staff = {
          id: null,
          userId: req.user.id,
          name: req.user.name || req.user.email || 'admin',
          department: 'admin',
          role: 'admin',
          isActive: true,
        };
        logger.info('No staff record found; using admin fallback', { userId: req.user.id });
      } else {
        // rethrow to be handled below
        throw err;
      }
    }

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

      // Skip permission check for pseudo-staff (admin fallback with null id)
      // These are authenticated admin users without a staff DB entry
      if (req.staff.id === null && req.staff.department === 'admin') {
        logger.info('Bypassing permission check for admin pseudo-staff', {
          userId: req.staff.userId,
          permission,
          path: req.path
        });
        return next();
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