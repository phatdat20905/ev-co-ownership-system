import Joi from 'joi';
import { errorResponse } from '../utils/responseFormatter.js';

export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return errorResponse(res, { 
        code: 'VALIDATION_ERROR', 
        message: error.details[0].message 
      }, 400);
    }
    
    next();
  };
};

// Validation schemas
export const authSchemas = {
  register: Joi.object({
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^[0-9]{10,15}$/).optional(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('co_owner', 'staff', 'admin').default('co_owner')
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  refreshToken: Joi.object({
    refreshToken: Joi.string().required()
  }),

  forgotPassword: Joi.object({
    email: Joi.string().email().required()
  }),

  resetPassword: Joi.object({
    token: Joi.string().required(),
    newPassword: Joi.string().min(6).required()
  }),

  kycSubmission: Joi.object({
    idCardNumber: Joi.string().required(),
    idCardFrontUrl: Joi.string().uri().required(),
    idCardBackUrl: Joi.string().uri().required(),
    driverLicenseNumber: Joi.string().optional(),
    driverLicenseUrl: Joi.string().uri().optional()
  }),

  kycVerification: Joi.object({
    status: Joi.string().valid('approved', 'rejected').required(),
    rejectionReason: Joi.string().when('status', {
      is: 'rejected',
      then: Joi.string().required(),
      otherwise: Joi.string().optional()
    })
  })
};