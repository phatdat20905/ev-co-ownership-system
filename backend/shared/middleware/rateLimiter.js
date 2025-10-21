import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { redisClient } from '../config/redis.js';
import { AppError } from '../utils/errorClasses.js';
import logger from '../utils/logger.js';

export const createRateLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100, // limit each IP to 100 requests per windowMs
    message = 'Too many requests, please try again later',
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    keyGenerator = (req) => req.ip,
    serviceName = 'unknown-service'
  } = options;

  return rateLimit({
    windowMs,
    max,
    message,
    skipSuccessfulRequests,
    skipFailedRequests,
    keyGenerator,
    handler: (req, res) => {
      logger.warn('Rate limit exceeded', {
        service: serviceName,
        ip: req.ip,
        url: req.url,
        method: req.method
      });

      throw new AppError(message, 429, 'RATE_LIMIT_EXCEEDED');
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    
    // Redis store for distributed rate limiting
    store: redisClient.client ? new RedisStore({
      sendCommand: (...args) => redisClient.client.sendCommand(args),
    }) : undefined
  });
};

// Pre-configured rate limiters
export const generalRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per 15 minutes
  serviceName: 'general'
});

export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes
  skipSuccessfulRequests: true, // Don't count successful logins
  serviceName: 'auth'
});

export const strictRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  serviceName: 'strict'
});

export const fileUploadRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 file uploads per minute
  serviceName: 'file-upload'
});