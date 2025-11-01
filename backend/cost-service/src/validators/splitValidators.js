// src/validators/splitValidators.js
import Joi from 'joi';

export const splitValidators = {
  getCostSplits: {
    params: Joi.object({
      costId: Joi.string().uuid().required()
    })
  },

  updateSplitStatus: {
    params: Joi.object({
      id: Joi.string().uuid().required()
    }),
    body: Joi.object({
      status: Joi.string().valid('pending', 'paid', 'overdue', 'partial').required(),
      paidAmount: Joi.number().positive().precision(2).optional()
    })
  }
};