// src/middleware/groupAccess.js
import { 
  AppError,
  logger 
} from '@ev-coownership/shared';
import { internalFetch } from '../utils/internalAuth.js';

export const groupAccess = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let groupId = req.params.groupId;

    // If groupId is not in params, try to get it from body or query
    if (!groupId) {
      groupId = req.body.groupId || req.query.groupId;
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
      groupId: req.params.groupId 
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