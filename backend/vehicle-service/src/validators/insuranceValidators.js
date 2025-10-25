// src/validators/insuranceValidators.js
import Joi from 'joi';

export const insuranceValidators = {
  create: {
    params: Joi.object({
      vehicleId: Joi.string().uuid().required().messages({
        'string.guid': 'Vehicle ID must be a valid UUID',
        'any.required': 'Vehicle ID is required'
      })
    }),
    body: Joi.object({
      insuranceProvider: Joi.string().min(1).max(255).required().messages({
        'string.min': 'Insurance provider must be at least 1 character long',
        'string.max': 'Insurance provider cannot exceed 255 characters',
        'any.required': 'Insurance provider is required'
      }),
      policyNumber: Joi.string().min(1).max(100).required().messages({
        'string.min': 'Policy number must be at least 1 character long',
        'string.max': 'Policy number cannot exceed 100 characters',
        'any.required': 'Policy number is required'
      }),
      coverageType: Joi.string().max(100).optional(),
      premiumAmount: Joi.number().precision(2).min(0).max(100000).required().messages({
        'number.min': 'Premium amount cannot be negative',
        'number.max': 'Premium amount cannot exceed 100,000',
        'any.required': 'Premium amount is required'
      }),
      startDate: Joi.date().required().messages({
        'any.required': 'Start date is required'
      }),
      endDate: Joi.date().greater(Joi.ref('startDate')).required().messages({
        'date.greater': 'End date must be after start date',
        'any.required': 'End date is required'
      }),
      documentUrl: Joi.string().uri().optional().messages({
        'string.uri': 'Document URL must be a valid URL'
      })
    })
  },

  list: {
    params: Joi.object({
      vehicleId: Joi.string().uuid().required().messages({
        'string.guid': 'Vehicle ID must be a valid UUID',
        'any.required': 'Vehicle ID is required'
      })
    })
  },

  getCurrent: {
    params: Joi.object({
      vehicleId: Joi.string().uuid().required().messages({
        'string.guid': 'Vehicle ID must be a valid UUID',
        'any.required': 'Vehicle ID is required'
      })
    })
  },

  update: {
    params: Joi.object({
      insuranceId: Joi.string().uuid().required().messages({
        'string.guid': 'Insurance ID must be a valid UUID',
        'any.required': 'Insurance ID is required'
      })
    }),
    body: Joi.object({
      insuranceProvider: Joi.string().min(1).max(255).optional(),
      policyNumber: Joi.string().min(1).max(100).optional(),
      coverageType: Joi.string().max(100).optional(),
      premiumAmount: Joi.number().precision(2).min(0).max(100000).optional(),
      startDate: Joi.date().optional(),
      endDate: Joi.date().optional(),
      documentUrl: Joi.string().uri().optional()
    }).min(1).messages({
      'object.min': 'At least one field must be provided for update'
    })
  },

  updateStatus: {
    params: Joi.object({
      insuranceId: Joi.string().uuid().required().messages({
        'string.guid': 'Insurance ID must be a valid UUID',
        'any.required': 'Insurance ID is required'
      })
    }),
    body: Joi.object({
      isActive: Joi.boolean().required().messages({
        'any.required': 'isActive status is required'
      })
    })
  }
};