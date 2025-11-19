import { validationErrorResponse } from '../utils/responseFormatter.js';

export const validate = (schema) => {
  return (req, res, next) => {
    // Support both direct Joi schema and object format { body, params, query }
    if (typeof schema.validate !== 'function') {
      // Object format - validate each part
      const errors = [];
      
      if (schema.body) {
        const { error } = schema.body.validate(req.body, {
          abortEarly: false,
          stripUnknown: true,
          allowUnknown: true
        });
        if (error) {
          errors.push(...error.details.map(detail => ({
            field: `body.${detail.path.join('.')}`,
            message: detail.message,
            type: detail.type
          })));
        }
      }
      
      if (schema.params) {
        const { error } = schema.params.validate(req.params, {
          abortEarly: false,
          stripUnknown: true
        });
        if (error) {
          errors.push(...error.details.map(detail => ({
            field: `params.${detail.path.join('.')}`,
            message: detail.message,
            type: detail.type
          })));
        }
      }
      
      if (schema.query) {
        const { error } = schema.query.validate(req.query, {
          abortEarly: false,
          stripUnknown: true
        });
        if (error) {
          errors.push(...error.details.map(detail => ({
            field: `query.${detail.path.join('.')}`,
            message: detail.message,
            type: detail.type
          })));
        }
      }
      
      if (errors.length > 0) {
        return validationErrorResponse(res, errors);
      }
      
      return next();
    }
    
    // Direct Joi schema - validate body only
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: true
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        type: detail.type
      }));

      return validationErrorResponse(res, errorDetails);
    }

    req.body = value;
    next();
  };
};

export const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        type: detail.type
      }));

      return validationErrorResponse(res, errorDetails);
    }

    req.params = value;
    next();
  };
};

export const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        type: detail.type
      }));

      return validationErrorResponse(res, errorDetails);
    }

    req.query = value;
    next();
  };
};