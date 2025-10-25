import Joi from 'joi';

export const documentValidators = {
  uploadDocument: Joi.object({
    documentName: Joi.string().max(255).required(),
    documentType: Joi.string().max(50).optional()
  })
};