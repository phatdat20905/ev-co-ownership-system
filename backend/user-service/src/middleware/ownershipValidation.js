// src/middleware/ownershipValidation.js
import db from '../models/index.js';
import { AppError } from '@ev-coownership/shared';

export const validateOwnershipTotal = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const { ownershipPercentage } = req.body;

    if (ownershipPercentage) {
      const members = await db.GroupMember.findAll({
        where: {
          groupId,
          isActive: true
        }
      });

      const currentTotal = members.reduce((sum, member) => {
        if (member.userId === req.params.userId) {
          return sum + parseFloat(ownershipPercentage);
        }
        return sum + parseFloat(member.ownershipPercentage);
      }, 0);

      if (Math.abs(currentTotal - 100) > 0.01) {
        return next(new AppError(
          `Total ownership percentage must be 100%. Current total: ${currentTotal}%`,
          'OWNERSHIP_TOTAL_INVALID',
          400
        ));
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};