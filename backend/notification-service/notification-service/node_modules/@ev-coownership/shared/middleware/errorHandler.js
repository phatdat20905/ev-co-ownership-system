import logger from '../utils/logger.js';
import { errorResponse } from '../utils/responseFormatter.js';
import { AppError } from '../utils/errorClasses.js';

export const errorHandler = (err, req, res, next) => {
  let error = err;

  // Log error
  logger.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userId: req.user?.id,
    userAgent: req.get('User-Agent')
  });

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token', 401, 'INVALID_TOKEN');
  }

  if (error.name === 'TokenExpiredError') {
    error = new AppError('Token expired', 401, 'TOKEN_EXPIRED');
  }

  // Handle Sequelize errors
  if (error.name === 'SequelizeValidationError') {
    const details = error.errors.map(e => ({
      field: e.path,
      message: e.message,
      value: e.value
    }));
    error = new AppError('Database validation failed', 400, 'VALIDATION_ERROR', details);
  }

  if (error.name === 'SequelizeUniqueConstraintError') {
    error = new AppError('Resource already exists', 409, 'DUPLICATE_ENTRY', {
      field: error.errors[0]?.path
    });
  }

  if (error.name === 'SequelizeForeignKeyConstraintError') {
    error = new AppError('Referenced resource not found', 400, 'FOREIGN_KEY_VIOLATION');
  }

  if (error.name === 'SequelizeDatabaseError') {
    error = new AppError('Database error occurred', 500, 'DATABASE_ERROR');
  }

  // Default to 500 error if not an operational error
  if (!error.isOperational) {
    error = new AppError(
      process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
      500,
      'INTERNAL_ERROR'
    );
  }

  // Send error response
  return errorResponse(res, error, error.statusCode || 500);
};

export const notFoundHandler = (req, res) => {
  return errorResponse(res, {
    code: 'NOT_FOUND',
    message: `Route ${req.method} ${req.url} not found`
  }, 404);
};

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};