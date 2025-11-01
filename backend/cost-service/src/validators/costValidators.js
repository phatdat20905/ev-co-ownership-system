// src/validators/costValidators.js
import Joi from 'joi';

export const costValidators = {
  createCost: {
    body: Joi.object({
      groupId: Joi.string().uuid().required(),
      vehicleId: Joi.string().uuid().required(),
      categoryId: Joi.string().uuid().optional(),
      costName: Joi.string().max(255).required(),
      totalAmount: Joi.number().positive().precision(2).required(),
      splitType: Joi.string().valid('ownership_ratio', 'usage_based', 'equal', 'custom').default('ownership_ratio'),
      costDate: Joi.date().iso().required(),
      description: Joi.string().max(1000).optional()
    })
  },

  getCost: {
    params: Joi.object({
      id: Joi.string().uuid().required()
    })
  },

  updateCost: {
    params: Joi.object({
      id: Joi.string().uuid().required()
    }),
    body: Joi.object({
      costName: Joi.string().max(255).optional(),
      totalAmount: Joi.number().positive().precision(2).optional(),
      description: Joi.string().max(1000).optional()
    }).min(1)
  },

  deleteCost: {
    params: Joi.object({
      id: Joi.string().uuid().required()
    })
  },

  getCostsByGroup: {
    params: Joi.object({
      groupId: Joi.string().uuid().required()
    }),
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(20),
      categoryId: Joi.string().uuid().optional(),
      startDate: Joi.date().iso().optional(),
      endDate: Joi.date().iso().optional()
    })
  },

  getCostSummary: {
    params: Joi.object({
      groupId: Joi.string().uuid().required()
    }),
    query: Joi.object({
      period: Joi.string().valid('week', 'month', 'quarter', 'year').default('month')
    })
  }
};