// src/validators/userValidators.js
import Joi from 'joi';

export const userValidators = {
  updateProfile: Joi.object({
    fullName: Joi.string().min(2).max(255).optional(),
    dateOfBirth: Joi.date().max('now').optional(),
    address: Joi.string().max(1000).optional(),
    avatarUrl: Joi.string().uri().max(500).optional(),
    bio: Joi.string().max(1000).optional(),
    preferences: Joi.object().optional()
  })
};