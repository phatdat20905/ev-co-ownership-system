import Joi from 'joi';

export const templateValidators = {
  createTemplate: Joi.object({
    templateName: Joi.string().max(255).required(),
    templateType: Joi.string().valid('co_ownership', 'amendment', 'termination').required(),
    content: Joi.string().required(),
    variables: Joi.array().items(Joi.string()).default([])
  }),

  updateTemplate: Joi.object({
    templateName: Joi.string().max(255),
    content: Joi.string(),
    variables: Joi.array().items(Joi.string()),
    isActive: Joi.boolean(),
    version: Joi.string().max(20)
  }),

  getTemplates: Joi.object({
    type: Joi.string().valid('co_ownership', 'amendment', 'termination'),
    isActive: Joi.boolean().default(true),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20)
  }),

  generateContract: Joi.object({
    variables: Joi.object().required()
  })
};