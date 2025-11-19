// src/validators/userValidators.js
import Joi from 'joi';

export const userValidators = {
  createProfile: Joi.object({
    userId: Joi.string().uuid().optional(), // Optional, can come from token
    fullName: Joi.string().min(1).max(255).optional().allow(null, ''),
    full_name: Joi.string().min(1).max(255).optional().allow(null, ''),
    dateOfBirth: Joi.date().max('now').optional().allow(null),
    date_of_birth: Joi.date().max('now').optional().allow(null),
    gender: Joi.string().valid('male', 'female', 'other').optional().allow(null),
    phoneNumber: Joi.string().max(20).optional().allow(null, ''),
    phone_number: Joi.string().max(20).optional().allow(null, ''),
    phone: Joi.string().max(20).optional().allow(null, ''),
    email: Joi.string().email().max(255).optional().allow(null, ''),
    address: Joi.string().max(1000).optional().allow(null, ''),
  // avatar can be a full URL, localhost URL or a stored filename/path. We
  // accept it as a plain string (max 500) instead of enforcing URI format
  // so local/dev hosts and relative paths are allowed.
  avatarUrl: Joi.string().max(500).optional().allow(null, ''),
  avatar_url: Joi.string().max(500).optional().allow(null, ''),
    bio: Joi.string().max(1000).optional().allow(null, ''),
    preferences: Joi.object().optional()
  }),

  updateProfile: Joi.object({
    fullName: Joi.string().min(1).max(255).optional(),
    full_name: Joi.string().min(1).max(255).optional(),
    dateOfBirth: Joi.date().max('now').optional(),
    date_of_birth: Joi.date().max('now').optional(),
    gender: Joi.string().valid('male', 'female', 'other').optional(),
    phoneNumber: Joi.string().max(20).optional(),
    phone_number: Joi.string().max(20).optional(),
    phone: Joi.string().max(20).optional(),
    email: Joi.string().email().max(255).optional(),
    address: Joi.string().max(1000).optional(),
  avatarUrl: Joi.string().max(500).optional(),
  avatar_url: Joi.string().max(500).optional(),
    bio: Joi.string().max(1000).optional(),
    preferences: Joi.object().optional()
  })
};