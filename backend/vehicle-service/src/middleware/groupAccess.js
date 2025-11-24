// src/middleware/groupAccess.js
import { 
  AppError,
  logger 
} from '@ev-coownership/shared';
import { internalFetch } from '../utils/internalAuth.js';
import db from '../models/index.js';

export const groupAccess = async (req, res, next) => {
  try {
    const userId = req.user.id;
    // Prefer explicit groupId in params, then body (if present), then query
    let groupId = req.params.groupId || (req.body && req.body.groupId) || req.query.groupId;

    // If no groupId but we have a vehicleId param, derive groupId from vehicle record
    if (!groupId && req.params?.vehicleId) {
      const vehicle = await db.Vehicle.findByPk(req.params.vehicleId, { attributes: ['groupId'] });
      if (vehicle) groupId = vehicle.groupId;
    }

    // Allow system admin/staff to bypass group membership checks
    const userRole = req.user?.role;
    if (userRole === 'admin' || userRole === 'staff') {
      req.groupId = groupId;
      return next();
    }

    if (!groupId) {
      throw new AppError('Group ID is required', 400, 'GROUP_ID_REQUIRED');
    }

    // Check if user has access to the group
    const hasAccess = await checkGroupAccess(groupId, userId);
    
    if (!hasAccess) {
      throw new AppError('You do not have access to this group', 403, 'ACCESS_DENIED');
    }

    // Add groupId to request for use in controllers
    req.groupId = groupId;
    next();
  } catch (error) {
    logger.error('Group access check failed', { 
      error: error.message, 
      userId: req.user?.id,
      groupId: req.params?.groupId || (req.body && req.body.groupId) 
    });
    next(error);
  }
};

// Helper function to check group access
async function checkGroupAccess(groupId, userId) {
  try {
    const url = `${process.env.USER_SERVICE_URL}/api/v1/internal/groups/${groupId}/members/${userId}`;
    const response = await internalFetch(url, { headers: { 'Content-Type': 'application/json' } });
    return response.ok;
  } catch (error) {
    logger.error('Failed to check group access', { error: error.message, groupId, userId });
    return false;
  }
}