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
};