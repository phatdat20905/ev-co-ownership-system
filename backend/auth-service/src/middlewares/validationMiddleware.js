import { errorResponse } from '../utils/responseFormatter.js';

export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return errorResponse(res, {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: errorDetails
      }, 400);
    }

    req.body = value;
    next();
  };
};