// src/validators/reportValidators.js
import Joi from 'joi';

export const reportValidators = {
  getSummary: {
    query: Joi.object({
      groupId: Joi.string().uuid().required(),
      period: Joi.string().valid('week', 'month', 'quarter', 'year').default('month')
    })
  },

  getUserUsage: {
    query: Joi.object({
      period: Joi.string().valid('week', 'month', 'quarter', 'year').default('month'),
      userId: Joi.string().uuid().optional() // For admin viewing other users
    })
  },

  getCostAnalysis: {
    query: Joi.object({
      groupId: Joi.string().uuid().required(),
      startDate: Joi.date().iso().required(),
      endDate: Joi.date().iso().required().greater(Joi.ref('startDate'))
    })
  },

  getPaymentAnalysis: {
    query: Joi.object({
      groupId: Joi.string().uuid().required(),
      period: Joi.string().valid('week', 'month', 'quarter', 'year').default('month')
    })
  }
};