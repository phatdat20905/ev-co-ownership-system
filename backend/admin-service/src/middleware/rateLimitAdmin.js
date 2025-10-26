// src/middleware/rateLimitAdmin.js
import { createRateLimiter, AppError, logger } from '@ev-coownership/shared';

// More restrictive rate limits for admin endpoints
export const adminRateLimiter = createRateLimiter({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // Limit each staff to 100 requests per windowMs
  keyGenerator: (req) => {
    return `admin:${req.staff?.id || req.ip}`;
  },
  handler: (req, res) => {
    logger.warn('Admin rate limit exceeded', {
      staffId: req.staff?.id,
      ip: req.ip,
      path: req.path
    });
    
    throw new AppError(
      'Too many requests from this staff account. Please try again later.',
      429,
      'RATE_LIMIT_EXCEEDED'
    );
  },
  skip: (req) => {
    // Skip rate limiting for super admins in development
    return process.env.NODE_ENV === 'development' && req.staff?.department === 'admin';
  }
});

// Even more restrictive for sensitive endpoints
export const sensitiveEndpointRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Only 10 requests per window for sensitive operations
  keyGenerator: (req) => {
    return `admin_sensitive:${req.staff?.id}`;
  },
  handler: (req, res) => {
    logger.warn('Sensitive admin endpoint rate limit exceeded', {
      staffId: req.staff?.id,
      path: req.path
    });
    
    throw new AppError(
      'Too many sensitive operations. Please contact super administrator.',
      429,
      'SENSITIVE_RATE_LIMIT_EXCEEDED'
    );
  }
});