import redis from 'redis';
import logger from '../utils/logger.js';

export class RedisClient {
  constructor(serviceName = 'unknown-service') {
    this.client = null;
    this.serviceName = serviceName;
    this.connect();
  }

  async connect() {
    try {
      this.client = redis.createClient({
        socket: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT) || 6379
        },
        password: process.env.REDIS_PASSWORD || 'redis123',
        database: parseInt(process.env.REDIS_DB) || 0
      });

      this.client.on('error', (err) => {
        logger.error(`Redis Client Error for ${this.serviceName}:`, err);
      });

      this.client.on('connect', () => {
        logger.info(`Redis Client Connected for ${this.serviceName}`);
      });

      this.client.on('reconnecting', () => {
        logger.info(`Redis Client Reconnecting for ${this.serviceName}`);
      });

      await this.client.connect();
    } catch (error) {
      logger.error(`Failed to connect to Redis for ${this.serviceName}:`, error);
      throw error;
    }
  }

  async get(key) {
    try {
      return await this.client.get(key);
    } catch (error) {
      logger.error(`Redis GET error for ${this.serviceName}:`, error);
      return null;
    }
  }

  async set(key, value, expireTime = 3600) {
    try {
      await this.client.set(key, value, { EX: expireTime });
    } catch (error) {
      logger.error(`Redis SET error for ${this.serviceName}:`, error);
    }
  }

  async del(key) {
    try {
      await this.client.del(key);
    } catch (error) {
      logger.error(`Redis DEL error for ${this.serviceName}:`, error);
    }
  }

  async exists(key) {
    try {
      return await this.client.exists(key);
    } catch (error) {
      logger.error(`Redis EXISTS error for ${this.serviceName}:`, error);
      return 0;
    }
  }

  async incr(key) {
    try {
      return await this.client.incr(key);
    } catch (error) {
      logger.error(`Redis INCR error for ${this.serviceName}:`, error);
      return null;
    }
  }

  async expire(key, seconds) {
    try {
      await this.client.expire(key, seconds);
    } catch (error) {
      logger.error(`Redis EXPIRE error for ${this.serviceName}:`, error);
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.quit();
      logger.info(`Redis Client Disconnected for ${this.serviceName}`);
    }
  }
}

// Create default instance
export const redisClient = new RedisClient('shared');