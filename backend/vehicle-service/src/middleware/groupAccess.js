// src/middleware/groupAccess.js
import { 
  AppError,
  logger 
} from '@ev-coownership/shared';

export const groupAccess = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let groupId = req.params.groupId;

    // If groupId is not in params, try to get it from body or query
    if (!groupId) {
      groupId = req.body.groupId || req.query.groupId;
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
    const response = await fetch(`${process.env.USER_SERVICE_URL}/api/v1/groups/${groupId}/members/${userId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.INTERNAL_SERVICE_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    return response.ok;
  } catch (error) {
    logger.error('Failed to check group access', { error: error.message, groupId, userId });
    return false;
  }
}