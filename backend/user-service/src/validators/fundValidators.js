// src/validators/fundValidators.js
import Joi from 'joi';

export const fundValidators = {
  deposit: Joi.object({
    amount: Joi.number().min(1000).max(1000000000).required(),
    description: Joi.string().max(500).optional()
  }),

  withdraw: Joi.object({
    amount: Joi.number().min(1000).max(1000000000).required(),
    description: Joi.string().max(500).required()
  })
};