import Joi from 'joi';

export const kycSubmitValidator = Joi.object({
  idCardNumber: Joi.string().pattern(/^[0-9]{9,12}$/).optional(),
  driverLicenseNumber: Joi.string().pattern(/^[A-Z0-9]{8,15}$/).optional(),
  idCardFrontUrl: Joi.string().uri().optional(),
  idCardBackUrl: Joi.string().uri().optional(),
  driverLicenseUrl: Joi.string().uri().optional()
}).or('idCardNumber', 'driverLicenseNumber');

export const kycVerifyValidator = Joi.object({
  verificationStatus: Joi.string().valid('approved', 'rejected').required(),
  rejectionReason: Joi.string().when('verificationStatus', {
    is: 'rejected',
    then: Joi.string().required(),
    otherwise: Joi.string().optional()
  })
});