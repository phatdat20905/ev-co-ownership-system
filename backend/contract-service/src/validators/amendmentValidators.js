import Joi from 'joi';

export const amendmentValidators = {
  createAmendment: Joi.object({
    reason: Joi.string().max(1000).required(),
    changesSummary: Joi.string().required(),
    content: Joi.string().optional(),
    effectiveDate: Joi.date().iso().greater('now')
  })
};