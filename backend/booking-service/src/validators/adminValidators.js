import Joi from 'joi';
import { uuidSchema } from '@ev-coownership/shared';

export const adminValidators = {
  getBookings: {
    query: Joi.object({
      status: Joi.string().valid('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'conflict'),
      groupId: uuidSchema,
      vehicleId: uuidSchema,
      userId: uuidSchema,
      startDate: Joi.date().iso(),
      endDate: Joi.date().iso().greater(Joi.ref('startDate')),
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(20)
    })
  },

  getBooking: {
    params: Joi.object({
      bookingId: uuidSchema.required()
    })
  },

  updateBookingStatus: {
    params: Joi.object({
      bookingId: uuidSchema.required()
    }),
    body: Joi.object({
      status: Joi.string().valid('pending', 'confirmed', 'cancelled', 'completed').required(),
      reason: Joi.string().max(500).optional()
    })
  },

  deleteBooking: {
    params: Joi.object({
      bookingId: uuidSchema.required()
    }),
    body: Joi.object({
      reason: Joi.string().max(500).required()
    })
  },

  getVehicleUtilization: {
    query: Joi.object({
      period: Joi.string().valid('7d', '30d', '90d', '1y').default('30d'),
      vehicleId: uuidSchema.optional()
    })
  },

  getGroupTrends: {
    params: Joi.object({
      groupId: uuidSchema.required()
    }),
    query: Joi.object({
      period: Joi.string().valid('7d', '30d', '90d', '1y').default('30d')
    })
  },

  generateBookingReport: {
    query: Joi.object({
      startDate: Joi.date().iso().required(),
      endDate: Joi.date().iso().greater(Joi.ref('startDate')).required(),
      reportType: Joi.string().valid('summary', 'detailed', 'financial').default('detailed')
    })
  }
};