import Joi from 'joi';

export const uuidSchema = Joi.string().uuid().required();

export const emailSchema = Joi.string().email().required().messages({
  'string.email': 'Email must be a valid email address',
  'any.required': 'Email is required'
});

export const phoneSchema = Joi.string().pattern(/^[0-9]{10,15}$/).optional().messages({
  'string.pattern.base': 'Phone must be a valid phone number'
});

export const passwordSchema = Joi.string().min(8).required().messages({
  'string.min': 'Password must be at least 8 characters long',
  'any.required': 'Password is required'
});

export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sort: Joi.string().optional(),
  order: Joi.string().valid('asc', 'desc').default('desc')
});

export const idParamSchema = Joi.object({
  id: uuidSchema
});