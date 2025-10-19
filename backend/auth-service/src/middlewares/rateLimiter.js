import rateLimit from 'express-rate-limit';
import { redisClient } from '../config/redis.js';
import logger from '../utils/logger.js';

// Redis store for rate limiting
const RedisStore = (redisClient) => ({
  increment: async (key) => {
    const current = await redisClient.get(key);
    const count = current ? parseInt(current) + 1 : 1;
    await redisClient.setEx(key, 60, count.toString());
    return count;
  }
});

// General rate limiter
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again later'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Strict limiter for auth endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many login attempts, please try again later'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true // Don't count successful requests
});

// KYC submission limiter
export const kycLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each user to 3 KYC submissions per hour
  keyGenerator: (req) => {
    return req.user ? req.user.userId : req.ip;
  },
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many KYC submission attempts, please try again later'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});