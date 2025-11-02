import { redisClient } from '@ev-coownership/shared';
import { logger } from '@ev-coownership/shared';
import { CACHE_KEYS } from '../utils/constants.js';

export class CacheService {
  constructor() {
    this.defaultTTL = 3600; // 1 hour in seconds
  }

  async getCachedRecommendation(cacheKey) {
    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        logger.debug('Cache hit', { cacheKey });
        return parsed;
      }
      logger.debug('Cache miss', { cacheKey });
      return null;
    } catch (error) {
      logger.error('Error reading from cache', { error: error.message, cacheKey });
      return null;
    }
  }

  async cacheRecommendation(cacheKey, recommendation, ttl = null) {
    try {
      const cacheTTL = ttl || this.defaultTTL;
      await redisClient.set(cacheKey, JSON.stringify(recommendation), cacheTTL);
      logger.debug('Recommendation cached', { cacheKey, ttl: cacheTTL });
    } catch (error) {
      logger.error('Error caching recommendation', { error: error.message, cacheKey });
    }
  }

  async invalidateGroupCache(groupId) {
    try {
      const patterns = [
        CACHE_KEYS.SCHEDULE_OPTIMIZATION(groupId),
        CACHE_KEYS.COST_ANALYSIS(groupId),
        CACHE_KEYS.DISPUTE_PATTERNS(groupId),
        CACHE_KEYS.USAGE_PATTERNS(groupId)
      ];

      for (const pattern of patterns) {
        const keys = await redisClient.keys(pattern);
        for (const key of keys) {
          await redisClient.del(key);
        }
      }

      logger.info('Group cache invalidated', { groupId, patterns: patterns.length });
    } catch (error) {
      logger.error('Error invalidating group cache', { error: error.message, groupId });
    }
  }

  async getCacheStats() {
    try {
      // This is a simplified implementation
      // In production, you might want more detailed Redis stats
      return {
        connected: true,
        service: 'redis-cache'
      };
    } catch (error) {
      return {
        connected: false,
        service: 'redis-cache',
        error: error.message
      };
    }
  }

  // Feature-specific cache methods
  async getCachedScheduleOptimization(groupId) {
    const cacheKey = CACHE_KEYS.SCHEDULE_OPTIMIZATION(groupId);
    return this.getCachedRecommendation(cacheKey);
  }

  async cacheScheduleOptimization(groupId, optimization) {
    const cacheKey = CACHE_KEYS.SCHEDULE_OPTIMIZATION(groupId);
    // Schedule optimizations might be cached shorter (30 minutes)
    return this.cacheRecommendation(cacheKey, optimization, 1800);
  }

  async getCachedCostAnalysis(groupId) {
    const cacheKey = CACHE_KEYS.COST_ANALYSIS(groupId);
    return this.getCachedRecommendation(cacheKey);
  }

  async cacheCostAnalysis(groupId, analysis) {
    const cacheKey = CACHE_KEYS.COST_ANALYSIS(groupId);
    return this.cacheRecommendation(cacheKey, analysis);
  }
}

export default new CacheService();