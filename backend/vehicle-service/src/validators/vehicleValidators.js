// src/validators/vehicleValidators.js
import Joi from 'joi';

export const vehicleValidators = {
  create: {
    body: Joi.object({
      groupId: Joi.string().uuid().required().messages({
        'string.guid': 'Group ID must be a valid UUID',
        'any.required': 'Group ID is required'
      }),
      vehicleName: Joi.string().min(1).max(255).required().messages({
        'string.min': 'Vehicle name must be at least 1 character long',
        'string.max': 'Vehicle name cannot exceed 255 characters',
        'any.required': 'Vehicle name is required'
      }),
      brand: Joi.string().max(100).optional(),
      model: Joi.string().max(100).optional(),
      year: Joi.number().integer().min(2000).max(new Date().getFullYear() + 1).optional().messages({
        'number.min': 'Year must be 2000 or later',
        'number.max': 'Year cannot be in the future'
      }),
      licensePlate: Joi.string().pattern(/^[A-Z0-9-]{1,20}$/).required().messages({
        'string.pattern.base': 'License plate must contain only uppercase letters, numbers, and hyphens',
        'any.required': 'License plate is required'
      }),
      vin: Joi.string().pattern(/^[A-HJ-NPR-Z0-9]{17}$/).optional().messages({
        'string.pattern.base': 'VIN must be exactly 17 alphanumeric characters (excluding I, O, Q)'
      }),
      color: Joi.string().max(50).optional(),
      batteryCapacityKwh: Joi.number().precision(2).min(10).max(200).optional().messages({
        'number.min': 'Battery capacity must be at least 10 kWh',
        'number.max': 'Battery capacity cannot exceed 200 kWh'
      }),
      currentOdometer: Joi.number().integer().min(0).max(1000000).optional().messages({
        'number.min': 'Odometer cannot be negative',
        'number.max': 'Odometer cannot exceed 1,000,000 km'
      }),
      purchaseDate: Joi.date().max('now').optional().messages({
        'date.max': 'Purchase date cannot be in the future'
      }),
      // Allow large purchase prices (VNĐ) up to a high ceiling to accommodate vehicle prices
      purchasePrice: Joi.number().precision(2).min(0).max(1000000000000).optional().messages({
        'number.min': 'Purchase price cannot be negative',
        'number.max': 'Purchase price is too large'
      }),
      images: Joi.array().items(Joi.string().uri()).optional(),
      specifications: Joi.object().optional()
    })
  },

  list: {
    query: Joi.object({
      groupId: Joi.string().uuid().optional().messages({
        'string.guid': 'Group ID must be a valid UUID'
      }),
      status: Joi.string().valid('available', 'in_use', 'maintenance', 'unavailable').optional(),
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(20)
    })
  },

  getById: {
    params: Joi.object({
      vehicleId: Joi.string().uuid().required().messages({
        'string.guid': 'Vehicle ID must be a valid UUID',
        'any.required': 'Vehicle ID is required'
      })
    })
  },

  update: {
    params: Joi.object({
      vehicleId: Joi.string().uuid().required().messages({
        'string.guid': 'Vehicle ID must be a valid UUID',
        'any.required': 'Vehicle ID is required'
      })
    }),
    body: Joi.object({
      vehicleName: Joi.string().min(1).max(255).optional(),
      brand: Joi.string().max(100).optional(),
      model: Joi.string().max(100).optional(),
      year: Joi.number().integer().min(2000).max(new Date().getFullYear() + 1).optional(),
      licensePlate: Joi.string().pattern(/^[A-Z0-9-]{1,20}$/).optional(),
      color: Joi.string().max(50).optional(),
      batteryCapacityKwh: Joi.number().precision(2).min(10).max(200).optional(),
      currentOdometer: Joi.number().integer().min(0).max(1000000).optional(),
      purchaseDate: Joi.date().max('now').optional(),
  purchasePrice: Joi.number().precision(2).min(0).max(1000000000000).optional(),
      images: Joi.array().items(Joi.string().uri()).optional(),
      specifications: Joi.object().optional()
    }).min(1).messages({
      'object.min': 'At least one field must be provided for update'
    })
  },

  delete: {
    params: Joi.object({
      vehicleId: Joi.string().uuid().required().messages({
        'string.guid': 'Vehicle ID must be a valid UUID',
        'any.required': 'Vehicle ID is required'
      })
    })
  },

  updateStatus: {
    params: Joi.object({
      vehicleId: Joi.string().uuid().required().messages({
        'string.guid': 'Vehicle ID must be a valid UUID',
        'any.required': 'Vehicle ID is required'
      })
    }),
    body: Joi.object({
      status: Joi.string().valid('available', 'in_use', 'maintenance', 'unavailable').required().messages({
        'any.only': 'Status must be one of: available, in_use, maintenance, unavailable',
        'any.required': 'Status is required'
      }),
      reason: Joi.string().max(500).optional()
    })
  },

  search: {
    query: Joi.object({
      query: Joi.string().min(1).max(100).required().messages({
        'string.min': 'Search query must be at least 1 character long',
        'string.max': 'Search query cannot exceed 100 characters',
        'any.required': 'Search query is required'
      }),
      groupId: Joi.string().uuid().optional().messages({
        'string.guid': 'Group ID must be a valid UUID'
      })
    })
  }
,

  bulkStats: {
    body: Joi.object({
      ids: Joi.array().items(Joi.string().uuid().messages({ 'string.guid': 'Each vehicle ID must be a valid UUID' })).min(1).required().messages({
        'array.min': 'At least one vehicle ID must be provided',
        'any.required': 'ids is required'
      })
    })
  }
};