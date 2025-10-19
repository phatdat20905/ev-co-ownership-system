import RedisClient from '../config/redis.js';
import { errorResponse } from '../utils/responseFormatter.js';

export const rateLimiter = (windowMs = 900000, maxRequests = 100) => {
  return async (req, res, next) => {
    const clientIp = req.ip;
    const key = `rate_limit:${clientIp}`;
    
    try {
      const current = await RedisClient.get(key);
      const currentCount = current ? parseInt(current) : 0;

      if (currentCount >= maxRequests) {
        return errorResponse(res, {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests, please try again later'
        }, 429);
      }

      if (currentCount === 0) {
        await RedisClient.set(key, '1', windowMs / 1000);
      } else {
        await RedisClient.set(key, (currentCount + 1).toString(), windowMs / 1000);
      }

      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', maxRequests - currentCount - 1);
      
      next();
    } catch (error) {
      // If Redis fails, allow the request to proceed
      console.error('Rate limiter Redis error:', error);
      next();
    }
  };
};

// Specific rate limiters for sensitive endpoints
export const loginRateLimiter = rateLimiter(900000, 5); // 5 attempts per 15 minutes
export const generalRateLimiter = rateLimiter(60000, 100); // 100 requests per minute