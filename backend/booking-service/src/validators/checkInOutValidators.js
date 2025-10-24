import Joi from 'joi';
import { uuidSchema } from '@ev-coownership/shared';

export const checkInOutValidators = {
  checkIn: {
    params: Joi.object({
      bookingId: uuidSchema.required()
    }),
    body: Joi.object({
      odometerReading: Joi.number().integer().min(0).required()
        .messages({
          'any.required': 'Odometer reading is required',
          'number.min': 'Odometer reading cannot be negative',
          'number.integer': 'Odometer reading must be an integer'
        }),
      fuelLevel: Joi.number().min(0).max(100).required()
        .messages({
          'any.required': 'Fuel level is required',
          'number.min': 'Fuel level cannot be negative',
          'number.max': 'Fuel level cannot exceed 100%'
        }),
      images: Joi.array().items(Joi.string().uri()).max(5).optional()
        .messages({
          'array.max': 'Maximum 5 images allowed',
          'string.uri': 'Image URL must be valid'
        }),
      notes: Joi.string().max(500).optional(),
      qrCode: Joi.string().optional(),
      digitalSignature: Joi.string().optional(),
      location: Joi.object({
        lat: Joi.number().min(-90).max(90).required(),
        lng: Joi.number().min(-180).max(180).required(),
        address: Joi.string().optional()
      }).optional()
    })
  },

  checkOut: {
    params: Joi.object({
      bookingId: uuidSchema.required()
    }),
    body: Joi.object({
      odometerReading: Joi.number().integer().min(0).required(),
      fuelLevel: Joi.number().min(0).max(100).required(),
      images: Joi.array().items(Joi.string().uri()).max(5).optional(),
      notes: Joi.string().max(500).optional(),
      qrCode: Joi.string().optional(),
      digitalSignature: Joi.string().optional(),
      location: Joi.object({
        lat: Joi.number().min(-90).max(90).required(),
        lng: Joi.number().min(-180).max(180).required(),
        address: Joi.string().optional()
      }).optional()
    })
  },

  getCheckLogs: {
    params: Joi.object({
      bookingId: uuidSchema.required()
    })
  },

  getQRCode: {
    params: Joi.object({
      bookingId: uuidSchema.required()
    })
  },

  validateQR: {
    body: Joi.object({
      qrCode: Joi.string().required()
        .messages({
          'any.required': 'QR code is required'
        }),
      secret: Joi.string().optional()
    })
  }
};