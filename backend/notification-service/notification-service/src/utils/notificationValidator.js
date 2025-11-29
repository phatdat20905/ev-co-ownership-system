// src/utils/notificationValidator.js
import Joi from 'joi';
import { AppError } from '@ev-coownership/shared';

const notificationSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  type: Joi.string().max(100).required(),
  title: Joi.string().max(255).required(),
  message: Joi.string().required(),
  channels: Joi.array().items(
    Joi.string().valid('email', 'push', 'sms', 'in_app')
  ).min(1).required(),
  metadata: Joi.object().optional(),
});

const templateSchema = Joi.object({
  name: Joi.string().max(100).required(),
  type: Joi.string().max(100).required(),
  subject: Joi.string().max(255).optional(),
  body: Joi.string().required(),
  channels: Joi.array().items(
    Joi.string().valid('email', 'push', 'sms', 'in_app')
  ).min(1).required(),
  variables: Joi.array().items(
    Joi.object({
      key: Joi.string().required(),
      required: Joi.boolean().default(false),
    })
  ).optional(),
  isActive: Joi.boolean().default(true),
});

const preferenceSchema = Joi.object({
  preferences: Joi.object({
    email: Joi.boolean().required(),
    push: Joi.boolean().required(),
    sms: Joi.boolean().required(),
    in_app: Joi.boolean().required(),
  }).required(),
});

export const validateNotification = (data) => {
  const { error, value } = notificationSchema.validate(data);
  if (error) {
    throw new AppError(`Notification validation failed: ${error.details[0].message}`, 400, 'VALIDATION_ERROR');
  }
  return value;
};

export const validateTemplate = (data) => {
  const { error, value } = templateSchema.validate(data);
  if (error) {
    throw new AppError(`Template validation failed: ${error.details[0].message}`, 400, 'VALIDATION_ERROR');
  }
  return value;
};

export const validatePreference = (data) => {
  const { error, value } = preferenceSchema.validate(data);
  if (error) {
    throw new AppError(`Preference validation failed: ${error.details[0].message}`, 400, 'VALIDATION_ERROR');
  }
  return value;
};