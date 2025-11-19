// src/validators/paymentValidators.js
import Joi from 'joi';

export const paymentValidators = {
  createPayment: {
    body: Joi.object({
      costSplitId: Joi.string().uuid().required(),
      amount: Joi.number().positive().precision(2).required(),
      paymentMethod: Joi.string().valid('e_wallet', 'vnpay', 'bank_transfer', 'internal_wallet').required(),
      providerName: Joi.string().max(50).optional()
    })
  },

  getPayment: {
    params: Joi.object({
      id: Joi.string().uuid().required()
    })
  },

  getPaymentSummary: {
    params: Joi.object({
      groupId: Joi.string().uuid().required()
    }),
    query: Joi.object({
      period: Joi.string().valid('week', 'month', 'quarter', 'year').default('month')
    })
  }
,
  schedulePayment: {
    body: Joi.object({
      costSplitId: Joi.string().uuid().required(),
      amount: Joi.number().positive().precision(2).required(),
      scheduleAt: Joi.string().isoDate().required(),
      paymentMethod: Joi.string().valid('e_wallet', 'vnpay', 'bank_transfer', 'internal_wallet').optional(),
      providerName: Joi.string().max(50).optional()
    })
  }

  ,
  autoSetup: {
    body: Joi.object({
      providerName: Joi.string().max(50).required(),
      providerConfig: Joi.object().optional(),
      enabled: Joi.boolean().optional().default(true)
    })
  }
,
  setupAutoPayment: {
    body: Joi.object({
      groupId: Joi.string().uuid().required(),
      providerName: Joi.string().max(50).required(),
      amount: Joi.number().positive().precision(2).required(),
      frequency: Joi.string().valid('monthly', 'weekly').default('monthly'),
      enabled: Joi.boolean().default(true)
    })
  }
};