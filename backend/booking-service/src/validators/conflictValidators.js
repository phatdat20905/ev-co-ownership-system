import Joi from 'joi';
import { uuidSchema } from '@ev-coownership/shared';

export const conflictValidators = {
  resolveConflict: {
    params: Joi.object({
      conflictId: uuidSchema.required()
    }),
    body: Joi.object({
      resolution: Joi.string().max(1000).required()
        .messages({
          'any.required': 'Resolution description is required',
          'string.max': 'Resolution cannot exceed 1000 characters'
        })
    })
  },

  getConflicts: {
    query: Joi.object({
      resolved: Joi.boolean().optional(),
      conflictType: Joi.string().valid(
        'TIME_OVERLAP', 
        'VEHICLE_UNAVAILABLE', 
        'USER_QUOTA_EXCEEDED', 
        'MAINTENANCE_SCHEDULE', 
        'GROUP_RESTRICTION'
      ).optional(),
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(50).default(20)
    })
  },

  getConflict: {
    params: Joi.object({
      conflictId: uuidSchema.required()
    })
  },

  adminResolveConflict: {
    params: Joi.object({
      conflictId: uuidSchema.required()
    }),
    body: Joi.object({
      resolution: Joi.string().max(1000).required(),
      action: Joi.string().valid(
        'cancel_booking1',
        'cancel_booking2', 
        'cancel_both',
        'confirm_booking1',
        'no_action'
      ).default('no_action')
    })
  }
};