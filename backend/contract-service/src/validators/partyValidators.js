import Joi from 'joi';

export const partyValidators = {
  addParty: Joi.object({
    userId: Joi.string().uuid().required(),
    role: Joi.string().valid('owner', 'co_owner', 'witness', 'legal_representative').required(),
    ownershipPercentage: Joi.number().min(0).max(100).precision(2),
    signingOrder: Joi.number().integer().min(1)
  }),

  updateParty: Joi.object({
    role: Joi.string().valid('owner', 'co_owner', 'witness', 'legal_representative'),
    ownershipPercentage: Joi.number().min(0).max(100).precision(2),
    signingOrder: Joi.number().integer().min(1)
  })
};