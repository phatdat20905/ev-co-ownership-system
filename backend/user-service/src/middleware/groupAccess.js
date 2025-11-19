// src/middleware/groupAccess.js
import db from '../models/index.js';
import { AppError } from '@ev-coownership/shared';

export const groupAccess = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!groupId) {
      return next(new AppError('Group ID is required', 'GROUP_ID_REQUIRED', 400));
    }

    // Admin và staff có thể truy cập tất cả groups
    if (userRole === 'admin' || userRole === 'staff') {
      req.groupMembership = null; // Không cần membership cho admin/staff
      return next();
    }

    // User thường cần kiểm tra membership
    const membership = await db.GroupMember.findOne({
      where: {
        groupId,
        userId,
        isActive: true
      }
    });

    if (!membership) {
      return next(new AppError('Access denied to group', 'GROUP_ACCESS_DENIED', 403));
    }

    req.groupMembership = membership;
    next();
  } catch (error) {
    next(error);
  }
};