import Joi from 'joi';

export const signatureValidators = {
  signContract: Joi.object({
    signature: Joi.string().required(),
    timestamp: Joi.date().iso().required(),
    method: Joi.string().valid('digital', 'electronic').default('digital')
  }),

  remindSignature: Joi.object({
    reminderType: Joi.string().valid('general', 'urgent', 'final').default('general'),
    message: Joi.string().max(500).optional()
  }),

  verifySignature: Joi.object({
    signature: Joi.string().required(),
    timestamp: Joi.date().iso().required()
  })
};