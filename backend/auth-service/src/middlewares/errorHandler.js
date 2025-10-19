import logger from '../utils/logger.js';

export const errorHandler = (error, req, res, next) => {
  logger.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  // Handle known error types
  if (error.message === 'USER_ALREADY_EXISTS') {
    return res.status(409).json({
      success: false,
      error: {
        code: 'USER_ALREADY_EXISTS',
        message: 'User with this email already exists'
      }
    });
  }

  if (error.message === 'INVALID_CREDENTIALS') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password'
      }
    });
  }

  if (error.message === 'INVALID_REFRESH_TOKEN') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_REFRESH_TOKEN',
        message: 'Invalid or expired refresh token'
      }
    });
  }

  if (error.message === 'INVALID_RESET_TOKEN') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_RESET_TOKEN',
        message: 'Invalid or expired reset token'
      }
    });
  }

  if (error.message === 'KYC_ALREADY_SUBMITTED') {
    return res.status(409).json({
      success: false,
      error: {
        code: 'KYC_ALREADY_SUBMITTED',
        message: 'KYC already submitted for this user'
      }
    });
  }

  // Default error
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An internal server error occurred'
    }
  });
};