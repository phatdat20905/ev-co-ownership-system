import Joi from 'joi';

export const templateValidators = {
  createTemplate: Joi.object({
    templateName: Joi.string().max(255).required(),
    templateType: Joi.string().valid('co_ownership', 'amendment', 'termination', 'general').required(),
    content: Joi.string().required(),
    variables: Joi.array().items(Joi.string()).default([]),
    isActive: Joi.boolean().default(true),
    version: Joi.string().max(20).default('1.0')
  }),

  updateTemplate: Joi.object({
    templateName: Joi.string().max(255),
    content: Joi.string(),
    variables: Joi.array().items(Joi.string()),
    isActive: Joi.boolean(),
    version: Joi.string().max(20)
  }),

  getTemplates: Joi.object({
    type: Joi.string().valid('co_ownership', 'amendment', 'termination', 'general'),
    isActive: Joi.boolean().default(true),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    includeFileTemplates: Joi.boolean().default(false)
  }),

  generateContract: Joi.object({
    variables: Joi.object().required()
  })
};