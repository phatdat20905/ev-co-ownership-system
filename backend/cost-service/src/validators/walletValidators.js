// src/validators/walletValidators.js
import Joi from 'joi';

export const walletValidators = {
  deposit: {
    body: Joi.object({
      amount: Joi.number().positive().precision(2).required(),
      description: Joi.string().max(500).optional()
    })
  },

  withdraw: {
    body: Joi.object({
      amount: Joi.number().positive().precision(2).required(),
      description: Joi.string().max(500).optional()
    })
  }
};

export const groupWalletValidators = {
  getGroupWallet: {
    params: Joi.object({
      groupId: Joi.string().uuid().required()
    })
  },

  deposit: {
    params: Joi.object({
      groupId: Joi.string().uuid().required()
    }),
    body: Joi.object({
      amount: Joi.number().positive().precision(2).required(),
      description: Joi.string().max(500).optional()
    })
  },

  withdraw: {
    params: Joi.object({
      groupId: Joi.string().uuid().required()
    }),
    body: Joi.object({
      amount: Joi.number().positive().precision(2).required(),
      description: Joi.string().max(500).optional()
    })
  },

  payCost: {
    params: Joi.object({
      groupId: Joi.string().uuid().required()
    }),
    body: Joi.object({
      costId: Joi.string().uuid().required(),
      amount: Joi.number().positive().precision(2).required(),
      description: Joi.string().max(500).optional()
    })
  },

  getTransactions: {
    params: Joi.object({
      groupId: Joi.string().uuid().required()
    }),
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(20),
      type: Joi.string().valid('deposit', 'withdraw', 'expense', 'refund').optional()
    })
  }
};