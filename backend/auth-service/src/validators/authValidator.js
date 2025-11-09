import Joi from 'joi';

export const registerValidator = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email must be a valid email address',
    'any.required': 'Email is required'
  }),
  phone: Joi.string().pattern(/^[0-9]{10,15}$/).optional().messages({
    'string.pattern.base': 'Phone must be a valid phone number'
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'Password must be at least 8 characters long',
    'any.required': 'Password is required'
  }),
  role: Joi.string().valid('co_owner', 'staff', 'admin').default('co_owner')
});

export const loginValidator = Joi.object({
  email: Joi.string().email().optional(),
  phone: Joi.string().pattern(/^\+?[0-9]{10,15}$/).optional(),
  password: Joi.string().required()
}).or('email', 'phone').messages({
  'object.missing': 'Either email or phone is required'
});

export const refreshTokenValidator = Joi.object({
  refreshToken: Joi.string().required()
});

export const forgotPasswordValidator = Joi.object({
  email: Joi.string().email().required()
});

export const resetPasswordValidator = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(8).required()
});

export const verifyEmailValidator = Joi.object({
  token: Joi.string().required()
});