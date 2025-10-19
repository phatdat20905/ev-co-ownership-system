import logger from '../utils/logger.js';
import { errorResponse } from '../utils/responseFormatter.js';

export const errorHandler = (err, req, res, next) => {
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    const details = err.errors.map(error => ({
      field: error.path,
      message: error.message
    }));

    return errorResponse(res, {
      code: 'VALIDATION_ERROR',
      message: 'Database validation failed',
      details
    }, 400);
  }

  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    return errorResponse(res, {
      code: 'DUPLICATE_ENTRY',
      message: 'Resource already exists',
      details: {
        field: err.errors[0]?.path
      }
    }, 409);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, {
      code: 'INVALID_TOKEN',
      message: 'Invalid token'
    }, 401);
  }

  if (err.name === 'TokenExpiredError') {
    return errorResponse(res, {
      code: 'TOKEN_EXPIRED',
      message: 'Token has expired'
    }, 401);
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;

  return errorResponse(res, {
    code: 'INTERNAL_ERROR',
    message
  }, statusCode);
};