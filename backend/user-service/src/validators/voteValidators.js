// src/validators/voteValidators.js
import Joi from 'joi';

export const voteValidators = {
  createVote: Joi.object({
    groupId: Joi.string().uuid().required(),
    title: Joi.string().min(5).max(255).required(),
    description: Joi.string().max(1000).optional(),
    voteType: Joi.string().valid('upgrade', 'maintenance', 'insurance', 'sell_vehicle', 'other').required(),
    deadline: Joi.date().greater('now').required(),
    options: Joi.array().items(Joi.string().min(1).max(255)).min(2).max(10).required()
  }),

  castVote: Joi.object({
    optionId: Joi.string().uuid().required()
  })
};