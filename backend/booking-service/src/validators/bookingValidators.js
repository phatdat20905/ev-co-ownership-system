import Joi from 'joi';
import { uuidSchema } from '@ev-coownership/shared';

export const bookingValidators = {
  createBooking: {
    body: Joi.object({
      vehicleId: uuidSchema.required()
        .messages({
          'any.required': 'Vehicle ID is required',
          'string.guid': 'Vehicle ID must be a valid UUID'
        }),
      groupId: uuidSchema.required()
        .messages({
          'any.required': 'Group ID is required',
          'string.guid': 'Group ID must be a valid UUID'
        }),
      startTime: Joi.date().iso().greater('now').required()
        .messages({
          'any.required': 'Start time is required',
          'date.format': 'Start time must be in ISO format',
          'date.greater': 'Start time must be in the future'
        }),
      endTime: Joi.date().iso().greater(Joi.ref('startTime')).required()
        .messages({
          'any.required': 'End time is required',
          'date.format': 'End time must be in ISO format',
          'date.greater': 'End time must be after start time'
        }),
      purpose: Joi.string().max(500).required()
        .messages({
          'any.required': 'Purpose is required',
          'string.max': 'Purpose cannot exceed 500 characters'
        }),
      destination: Joi.string().max(500).optional()
        .messages({
          'string.max': 'Destination cannot exceed 500 characters'
        }),
      estimatedDistance: Joi.number().positive().max(9999.99).optional()
        .messages({
          'number.positive': 'Estimated distance must be positive',
          'number.max': 'Estimated distance cannot exceed 9999.99 km'
        }),
      notes: Joi.string().max(1000).optional()
        .messages({
          'string.max': 'Notes cannot exceed 1000 characters'
        })
    })
  },

  getBooking: {
    params: Joi.object({
      bookingId: uuidSchema.required()
        .messages({
          'any.required': 'Booking ID is required',
          'string.guid': 'Booking ID must be a valid UUID'
        })
    })
  },

  getBookings: {
    query: Joi.object({
      status: Joi.string().valid('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'conflict')
        .messages({
          'any.only': 'Status must be one of: pending, confirmed, in_progress, completed, cancelled, conflict'
        }),
      vehicleId: uuidSchema
        .messages({
          'string.guid': 'Vehicle ID must be a valid UUID'
        }),
      page: Joi.number().integer().min(1).default(1)
        .messages({
          'number.min': 'Page must be at least 1',
          'number.integer': 'Page must be an integer'
        }),
      limit: Joi.number().integer().min(1).max(10000).default(10)
        .messages({
          'number.min': 'Limit must be at least 1',
          'number.max': 'Limit cannot exceed 10000',
          'number.integer': 'Limit must be an integer'
        }),
      startDate: Joi.date().iso()
        .messages({
          'date.format': 'Start date must be in ISO format'
        }),
      endDate: Joi.date().iso().greater(Joi.ref('startDate'))
        .messages({
          'date.format': 'End date must be in ISO format',
          'date.greater': 'End date must be after start date'
        })
    })
  },

  getBookingHistory: {
    query: Joi.object({
      // Accept a wider set of period values from frontend (including 'all' and '365d')
      period: Joi.string().valid('7d', '30d', '90d', '1y', '365d', 'all').default('30d')
        .messages({
          'any.only': 'Period must be one of: 7d, 30d, 90d, 1y, 365d, all'
        }),
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(50).default(20)
    })
  },

  updateBooking: {
    params: Joi.object({
      bookingId: uuidSchema.required()
    }),
    body: Joi.object({
      startTime: Joi.date().iso().greater('now')
        .messages({
          'date.format': 'Start time must be in ISO format',
          'date.greater': 'Start time must be in the future'
        }),
      endTime: Joi.date().iso().greater(Joi.ref('startTime'))
        .messages({
          'date.format': 'End time must be in ISO format',
          'date.greater': 'End time must be after start time'
        }),
      purpose: Joi.string().max(500)
        .messages({
          'string.max': 'Purpose cannot exceed 500 characters'
        }),
      notes: Joi.string().max(1000)
        .messages({
          'string.max': 'Notes cannot exceed 1000 characters'
        })
    }).min(1)
    .messages({
      'object.min': 'At least one field must be provided for update'
    })
  },

  cancelBooking: {
    params: Joi.object({
      bookingId: uuidSchema.required()
    }),
    body: Joi.object({
      reason: Joi.string().max(500).required()
        .messages({
          'any.required': 'Cancellation reason is required',
          'string.max': 'Reason cannot exceed 500 characters'
        })
    })
  },

  getVehicleRevenue: {
    params: Joi.object({
      vehicleId: uuidSchema.required()
        .messages({
          'any.required': 'Vehicle ID is required',
          'string.guid': 'Vehicle ID must be a valid UUID'
        })
    })
  }
};