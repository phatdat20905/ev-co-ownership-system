// src/validators/invoiceValidators.js
import Joi from 'joi';

export const invoiceValidators = {
  generateInvoice: {
    body: Joi.object({
      groupId: Joi.string().uuid().required(),
      periodStart: Joi.date().iso().required(),
      periodEnd: Joi.date().iso().required().greater(Joi.ref('periodStart')),
      costIds: Joi.array().items(Joi.string().uuid()).optional()
    })
  },

  getInvoice: {
    params: Joi.object({
      id: Joi.string().uuid().required()
    })
  },

  getInvoices: {
    params: Joi.object({
      groupId: Joi.string().uuid().required()
    }),
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(20),
      status: Joi.string().valid('unpaid', 'paid', 'overdue', 'cancelled').optional()
    })
  },

  markPaid: {
    params: Joi.object({
      id: Joi.string().uuid().required()
    })
  }
};