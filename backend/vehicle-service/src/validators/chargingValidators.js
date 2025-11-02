// src/validators/chargingValidators.js
import Joi from 'joi';


export const chargingValidators = {
  createSession: {
    params: Joi.object({
      vehicleId: Joi.string().uuid().required().messages({
        'string.guid': 'Vehicle ID must be a valid UUID',
        'any.required': 'Vehicle ID is required'
      })
    }),
    body: Joi.object({
      chargingStationLocation: Joi.string().max(255).optional(),
      startTime: Joi.date().required().messages({
        'any.required': 'Start time is required'
      }),
      endTime: Joi.date().greater(Joi.ref('startTime')).optional().messages({
        'date.greater': 'End time must be after start time'
      }),
      startBatteryLevel: Joi.number().precision(2).min(0).max(100).optional().messages({
        'number.min': 'Start battery level must be between 0 and 100',
        'number.max': 'Start battery level must be between 0 and 100'
      }),
      endBatteryLevel: Joi.number().precision(2).min(0).max(100).optional().messages({
        'number.min': 'End battery level must be between 0 and 100',
        'number.max': 'End battery level must be between 0 and 100'
      }),
      energyConsumedKwh: Joi.number().precision(2).min(0).max(1000).optional().messages({
        'number.min': 'Energy consumed cannot be negative',
        'number.max': 'Energy consumed cannot exceed 1000 kWh'
      }),
      cost: Joi.number().precision(2).min(0).max(10000).optional().messages({
        'number.min': 'Cost cannot be negative',
        'number.max': 'Cost cannot exceed 10,000'
      }),
      paymentMethod: Joi.string().max(50).optional()
    }).with('endBatteryLevel', 'startBatteryLevel').messages({
      'object.with': 'Start battery level is required when end battery level is provided'
    })
  },

  listSessions: {
    params: Joi.object({
      vehicleId: Joi.string().uuid().required().messages({
        'string.guid': 'Vehicle ID must be a valid UUID',
        'any.required': 'Vehicle ID is required'
      })
    }),
    query: Joi.object({
      startDate: Joi.date().optional(),
      endDate: Joi.date().optional(),
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(20)
    })
  },

  getSession: {
    params: Joi.object({
      sessionId: Joi.string().uuid().required().messages({
        'string.guid': 'Session ID must be a valid UUID',
        'any.required': 'Session ID is required'
      })
    })
  },

  getStats: {
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

  getCosts: {
    params: Joi.object({
      vehicleId: Joi.string().uuid().required().messages({
        'string.guid': 'Vehicle ID must be a valid UUID',
        'any.required': 'Vehicle ID is required'
      })
    }),
    query: Joi.object({
      year: Joi.number().integer().min(2000).max(new Date().getFullYear() + 1).default(new Date().getFullYear())
    })
  }
};