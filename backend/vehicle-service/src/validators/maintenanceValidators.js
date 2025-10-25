// src/validators/maintenanceValidators.js
import Joi from 'joi';

export const maintenanceValidators = {
  createSchedule: {
    params: Joi.object({
      vehicleId: Joi.string().uuid().required().messages({
        'string.guid': 'Vehicle ID must be a valid UUID',
        'any.required': 'Vehicle ID is required'
      })
    }),
    body: Joi.object({
      maintenanceType: Joi.string().min(1).max(100).required().messages({
        'string.min': 'Maintenance type must be at least 1 character long',
        'string.max': 'Maintenance type cannot exceed 100 characters',
        'any.required': 'Maintenance type is required'
      }),
      scheduledDate: Joi.date().greater('now').required().messages({
        'date.greater': 'Scheduled date must be in the future',
        'any.required': 'Scheduled date is required'
      }),
      odometerAtSchedule: Joi.number().integer().min(0).max(1000000).optional(),
      estimatedCost: Joi.number().precision(2).min(0).max(100000).optional().messages({
        'number.min': 'Estimated cost cannot be negative',
        'number.max': 'Estimated cost cannot exceed 100,000'
      }),
      notes: Joi.string().max(1000).optional()
    })
  },

  listSchedules: {
    params: Joi.object({
      vehicleId: Joi.string().uuid().required().messages({
        'string.guid': 'Vehicle ID must be a valid UUID',
        'any.required': 'Vehicle ID is required'
      })
    }),
    query: Joi.object({
      status: Joi.string().valid('scheduled', 'in_progress', 'completed', 'cancelled').optional()
    })
  },

  getSchedule: {
    params: Joi.object({
      scheduleId: Joi.string().uuid().required().messages({
        'string.guid': 'Schedule ID must be a valid UUID',
        'any.required': 'Schedule ID is required'
      })
    })
  },

  updateSchedule: {
    params: Joi.object({
      scheduleId: Joi.string().uuid().required().messages({
        'string.guid': 'Schedule ID must be a valid UUID',
        'any.required': 'Schedule ID is required'
      })
    }),
    body: Joi.object({
      maintenanceType: Joi.string().min(1).max(100).optional(),
      scheduledDate: Joi.date().greater('now').optional(),
      odometerAtSchedule: Joi.number().integer().min(0).max(1000000).optional(),
      estimatedCost: Joi.number().precision(2).min(0).max(100000).optional(),
      notes: Joi.string().max(1000).optional(),
      status: Joi.string().valid('scheduled', 'in_progress', 'completed', 'cancelled').optional()
    }).min(1).messages({
      'object.min': 'At least one field must be provided for update'
    })
  },

  deleteSchedule: {
    params: Joi.object({
      scheduleId: Joi.string().uuid().required().messages({
        'string.guid': 'Schedule ID must be a valid UUID',
        'any.required': 'Schedule ID is required'
      })
    })
  },

  completeSchedule: {
    params: Joi.object({
      scheduleId: Joi.string().uuid().required().messages({
        'string.guid': 'Schedule ID must be a valid UUID',
        'any.required': 'Schedule ID is required'
      })
    }),
    body: Joi.object({
      odometerReading: Joi.number().integer().min(0).max(1000000).required().messages({
        'number.min': 'Odometer reading cannot be negative',
        'number.max': 'Odometer reading cannot exceed 1,000,000 km',
        'any.required': 'Odometer reading is required'
      }),
      cost: Joi.number().precision(2).min(0).max(100000).required().messages({
        'number.min': 'Cost cannot be negative',
        'number.max': 'Cost cannot exceed 100,000',
        'any.required': 'Cost is required'
      }),
      serviceProvider: Joi.string().max(255).optional(),
      description: Joi.string().max(1000).optional(),
      receiptUrl: Joi.string().uri().optional().messages({
        'string.uri': 'Receipt URL must be a valid URL'
      })
    })
  },

  createHistory: {
    params: Joi.object({
      vehicleId: Joi.string().uuid().required().messages({
        'string.guid': 'Vehicle ID must be a valid UUID',
        'any.required': 'Vehicle ID is required'
      })
    }),
    body: Joi.object({
      maintenanceType: Joi.string().min(1).max(100).required().messages({
        'string.min': 'Maintenance type must be at least 1 character long',
        'string.max': 'Maintenance type cannot exceed 100 characters',
        'any.required': 'Maintenance type is required'
      }),
      performedDate: Joi.date().max('now').required().messages({
        'date.max': 'Performed date cannot be in the future',
        'any.required': 'Performed date is required'
      }),
      odometerReading: Joi.number().integer().min(0).max(1000000).required().messages({
        'number.min': 'Odometer reading cannot be negative',
        'number.max': 'Odometer reading cannot exceed 1,000,000 km',
        'any.required': 'Odometer reading is required'
      }),
      cost: Joi.number().precision(2).min(0).max(100000).required().messages({
        'number.min': 'Cost cannot be negative',
        'number.max': 'Cost cannot exceed 100,000',
        'any.required': 'Cost is required'
      }),
      serviceProvider: Joi.string().max(255).optional(),
      description: Joi.string().max(1000).optional(),
      receiptUrl: Joi.string().uri().optional().messages({
        'string.uri': 'Receipt URL must be a valid URL'
      })
    })
  },

  listHistory: {
    params: Joi.object({
      vehicleId: Joi.string().uuid().required().messages({
        'string.guid': 'Vehicle ID must be a valid UUID',
        'any.required': 'Vehicle ID is required'
      })
    }),
    query: Joi.object({
      startDate: Joi.date().optional(),
      endDate: Joi.date().optional()
    })
  }
};