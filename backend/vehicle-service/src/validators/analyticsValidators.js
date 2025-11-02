// src/validators/analyticsValidators.js
import Joi from 'joi';

export const analyticsValidators = {
  utilization: {
    params: Joi.object({
      vehicleId: Joi.string().uuid().required().messages({
        'string.guid': 'Vehicle ID must be a valid UUID',
        'any.required': 'Vehicle ID is required'
      })
    }),
    query: Joi.object({
      period: Joi.string().valid('weekly', 'monthly', 'quarterly', 'yearly').default('monthly')
    })
  },

  maintenanceCosts: {
    params: Joi.object({
      vehicleId: Joi.string().uuid().required().messages({
        'string.guid': 'Vehicle ID must be a valid UUID',
        'any.required': 'Vehicle ID is required'
      })
    }),
    query: Joi.object({
      year: Joi.number().integer().min(2000).max(new Date().getFullYear() + 1).default(new Date().getFullYear())
    })
  },

  batteryHealth: {
    params: Joi.object({
      vehicleId: Joi.string().uuid().required().messages({
        'string.guid': 'Vehicle ID must be a valid UUID',
        'any.required': 'Vehicle ID is required'
      })
    })
  },

  operatingCosts: {
    params: Joi.object({
      vehicleId: Joi.string().uuid().required().messages({
        'string.guid': 'Vehicle ID must be a valid UUID',
        'any.required': 'Vehicle ID is required'
      })
    }),
    query: Joi.object({
      period: Joi.string().valid('weekly', 'monthly', 'quarterly', 'yearly').default('quarterly')
    })
  },

  groupSummary: {
    params: Joi.object({
      groupId: Joi.string().uuid().required().messages({
        'string.guid': 'Group ID must be a valid UUID',
        'any.required': 'Group ID is required'
      })
    })
  }
};