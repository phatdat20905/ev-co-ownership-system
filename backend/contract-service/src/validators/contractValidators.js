import Joi from 'joi';

export const contractValidators = {
  createContract: Joi.object({
    groupId: Joi.string().uuid().required(),
    contractType: Joi.string().valid('co_ownership', 'amendment', 'termination', 'renewal').required(),
    title: Joi.string().max(255).required(),
    content: Joi.string().required(),
    parties: Joi.array().items(
      Joi.object({
        userId: Joi.string().uuid().required(),
        role: Joi.string().valid('owner', 'co_owner', 'witness', 'legal_representative').required(),
        ownershipPercentage: Joi.number().min(0).max(100).precision(2),
        signingOrder: Joi.number().integer().min(1)
      })
    ).min(1).required(),
    effectiveDate: Joi.date().iso().greater('now'),
    expiryDate: Joi.date().iso().greater(Joi.ref('effectiveDate')),
    autoRenew: Joi.boolean().default(false),
    parentContractId: Joi.string().uuid()
  }),

  updateContract: Joi.object({
    title: Joi.string().max(255),
    content: Joi.string(),
    effectiveDate: Joi.date().iso(),
    expiryDate: Joi.date().iso().greater(Joi.ref('effectiveDate')),
    autoRenew: Joi.boolean()
  }),

  getContracts: Joi.object({
    status: Joi.string().valid('draft', 'pending_signatures', 'active', 'expired', 'terminated', 'executed'),
    contractType: Joi.string().valid('co_ownership', 'amendment', 'termination', 'renewal'),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string().valid('created_at', 'updated_at', 'effective_date', 'expiry_date').default('created_at'),
    sortOrder: Joi.string().valid('ASC', 'DESC').default('DESC')
  })
};