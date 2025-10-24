import Joi from 'joi';
import { uuidSchema } from '@ev-coownership/shared';

export const calendarValidators = {
  getVehicleCalendar: {
    params: Joi.object({
      vehicleId: uuidSchema.required()
        .messages({
          'any.required': 'Vehicle ID is required',
          'string.guid': 'Vehicle ID must be a valid UUID'
        })
    }),
    query: Joi.object({
      startDate: Joi.date().iso().required()
        .messages({
          'any.required': 'Start date is required',
          'date.format': 'Start date must be in ISO format'
        }),
      endDate: Joi.date().iso().greater(Joi.ref('startDate')).required()
        .messages({
          'any.required': 'End date is required',
          'date.format': 'End date must be in ISO format',
          'date.greater': 'End date must be after start date'
        })
    })
  },

  getGroupCalendar: {
    params: Joi.object({
      groupId: uuidSchema.required()
        .messages({
          'any.required': 'Group ID is required',
          'string.guid': 'Group ID must be a valid UUID'
        })
    }),
    query: Joi.object({
      startDate: Joi.date().iso().required(),
      endDate: Joi.date().iso().greater(Joi.ref('startDate')).required()
    })
  },

  checkAvailability: {
    body: Joi.object({
      vehicleId: uuidSchema.required(),
      startTime: Joi.date().iso().greater('now').required(),
      endTime: Joi.date().iso().greater(Joi.ref('startTime')).required()
    })
  },

  getAvailableVehicles: {
    query: Joi.object({
      startTime: Joi.date().iso().greater('now').required(),
      endTime: Joi.date().iso().greater(Joi.ref('startTime')).required(),
      groupId: uuidSchema.optional()
    })
  },

  getPersonalCalendar: {
    query: Joi.object({
      startDate: Joi.date().iso().required(),
      endDate: Joi.date().iso().greater(Joi.ref('startDate')).required()
    })
  },

  broadcastUpdate: Joi.object({
    groupId: uuidSchema,
    vehicleId: uuidSchema.optional(),
    updateType: Joi.string().valid(
      'calendar_updated',
      'availability_changed',
      'maintenance_scheduled',
      'vehicle_status_changed'
    ).required(),
    data: Joi.object().optional()
  })
};