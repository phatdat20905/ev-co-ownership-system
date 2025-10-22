// src/validators/groupValidators.js
import Joi from 'joi';

export const groupValidators = {
  createGroup: Joi.object({
    groupName: Joi.string().min(2).max(255).required(),
    description: Joi.string().max(1000).optional()
  }),

  updateGroup: Joi.object({
    groupName: Joi.string().min(2).max(255).optional(),
    description: Joi.string().max(1000).optional()
  }),

  addMember: Joi.object({
    userId: Joi.string().uuid().required(),
    ownershipPercentage: Joi.number().min(0.01).max(100).precision(2).required(),
    role: Joi.string().valid('admin', 'member').default('member')
  }),

  updateOwnership: Joi.object({
    ownershipPercentage: Joi.number().min(0.01).max(100).precision(2).required()
  }),

  createVote: Joi.object({
    title: Joi.string().min(5).max(255).required(),
    description: Joi.string().max(1000).optional(),
    voteType: Joi.string().valid('upgrade', 'maintenance', 'insurance', 'sell_vehicle', 'other').required(),
    deadline: Joi.date().greater('now').required(),
    options: Joi.array().items(Joi.string().min(1).max(255)).min(2).max(10).required()
  })
};