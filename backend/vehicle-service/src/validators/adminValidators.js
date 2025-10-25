// src/validators/adminValidators.js
import Joi from 'joi';

export const adminValidators = {
  listVehicles: {
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(50),
      status: Joi.string().valid('available', 'in_use', 'maintenance', 'unavailable').optional(),
      groupId: Joi.string().uuid().optional().messages({
        'string.guid': 'Group ID must be a valid UUID'
      })
    })
  }
};