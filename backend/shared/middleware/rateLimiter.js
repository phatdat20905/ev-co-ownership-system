import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { redisClient } from '../config/redis.js';
import { AppError } from '../utils/errorClasses.js';
import logger from '../utils/logger.js';

/**
 * Create a reusable rate limiter
 * Supports Redis store for distributed environments
 */
export const createRateLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100, // limit each IP to 100 requests per windowMs
    message = 'Too many requests, please try again later',
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    keyGenerator = (req) => ipKeyGenerator(req), // ✅ Use safe IP generator
    serviceName = 'unknown-service'
  } = options;

  return rateLimit({
    windowMs,
    max,
    message,
    skipSuccessfulRequests,
    skipFailedRequests,
    keyGenerator,
    // Skip option: allow caller to provide a skip function or
    // automatically skip when not in production or when request comes from localhost
    skip: options.skip || ((req) => {
      try {
        // In non-production (development/test) skip rate limiting by default
        if (process.env.NODE_ENV !== 'production') return true;
        const localIps = ['::1', '127.0.0.1', '::ffff:127.0.0.1'];
        return localIps.includes(req.ip);
      } catch (e) {
        return false;
      }
    }),
    handler: (req, res, next, optionsUsed) => {
      // Log warning for monitoring
      logger.warn('Rate limit exceeded', {
        service: serviceName,
        ip: req.ip,
        url: req.originalUrl || req.url,
        method: req.method
      });

      // Use next() with AppError instead of throwing to ensure Express error handlers catch it
      return next(new AppError(message, 429, 'RATE_LIMIT_EXCEEDED'));
    },
    standardHeaders: true, // Adds RateLimit-* headers
    legacyHeaders: false,  // Disables X-RateLimit-* headers

    // Optional: Redis-based store for distributed systems
    store: redisClient?.client
      ? new RedisStore({
          sendCommand: (...args) => redisClient.client.sendCommand(args),
        })
      : undefined,
  });
};

// ✅ Preconfigured rate limiters for various services
export const generalRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  serviceName: 'general'
});

export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  serviceName: 'auth'
});

export const strictRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 10,
  serviceName: 'strict'
});

export const fileUploadRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 5,
  serviceName: 'file-upload'
});

export const loginRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100, // Increased for development testing
  skipSuccessfulRequests: true,
  serviceName: 'login'
});
