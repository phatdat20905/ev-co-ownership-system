import { createClient } from 'redis';
import logger from '../utils/logger.js';
import { URL } from 'url';

export class RedisClient {
  constructor(serviceName = 'unknown-service') {
    this.client = null;
    this.serviceName = serviceName;
    this.connect();
  }

  async connect() {
    try {
      let redisConfig = {};

      // ✅ Ưu tiên REDIS_URL (chuẩn cloud & Docker Compose)
      if (process.env.REDIS_URL) {
        const redisUrl = new URL(process.env.REDIS_URL);
        redisConfig = {
          socket: {
            host: redisUrl.hostname,
            port: parseInt(redisUrl.port || '6379', 10),
            connectTimeout: parseInt(process.env.REDIS_CONNECT_TIMEOUT || '20000', 10),
            reconnectStrategy: (retries) => {
              const delay = Math.min(retries * 500, 5000); // tăng dần mỗi lần reconnect
              logger.info(`Redis reconnect attempt #${retries} after ${delay}ms`, {
                service: this.serviceName,
              });
              return delay;
            },
          },
          password: redisUrl.password || undefined,
          database: parseInt(redisUrl.pathname.replace('/', '') || '0', 10),
        };
      } else {
        // ✅ fallback khi dev local không có REDIS_URL
        redisConfig = {
          socket: {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379', 10),
            connectTimeout: parseInt(process.env.REDIS_CONNECT_TIMEOUT || '20000', 10),
            reconnectStrategy: (retries) => {
              const delay = Math.min(retries * 500, 5000);
              logger.info(`Redis reconnect attempt #${retries} after ${delay}ms`, {
                service: this.serviceName,
              });
              return delay;
            },
          },
          password: process.env.REDIS_PASSWORD || 'redis123',
          database: parseInt(process.env.REDIS_DB || '0', 10),
        };
      }

      this.client = createClient(redisConfig);

      // === Event listeners ===
      this.client.on('error', (err) => {
        logger.error(`Redis Client Error for ${this.serviceName}: ${err.message}`, {
          service: this.serviceName,
          stack: err.stack,
        });
      });

      this.client.on('connect', () => {
        logger.info(`Redis Client Connected for ${this.serviceName}`);
      });

      this.client.on('reconnecting', () => {
        logger.info(`Redis Client Reconnecting for ${this.serviceName}`);
      });

      this.client.on('ready', () => {
        logger.info(`Redis Client Ready for ${this.serviceName}`);
      });

      await this.client.connect();
    } catch (error) {
      logger.error(`❌ Failed to connect to Redis for ${this.serviceName}: ${error.message}`, {
        stack: error.stack,
      });
      throw error;
    }
  }

  // === Utility methods ===
  async get(key) {
    try {
      return await this.client.get(key);
    } catch (error) {
      logger.error(`Redis GET error for ${this.serviceName}: ${error.message}`);
      return null;
    }
  }

  async set(key, value, expireTime = 3600) {
    try {
      await this.client.set(key, value, { EX: expireTime });
    } catch (error) {
      logger.error(`Redis SET error for ${this.serviceName}: ${error.message}`);
    }
  }

  async del(key) {
    try {
      await this.client.del(key);
    } catch (error) {
      logger.error(`Redis DEL error for ${this.serviceName}: ${error.message}`);
    }
  }

  async exists(key) {
    try {
      return await this.client.exists(key);
    } catch (error) {
      logger.error(`Redis EXISTS error for ${this.serviceName}: ${error.message}`);
      return 0;
    }
  }

  async incr(key) {
    try {
      return await this.client.incr(key);
    } catch (error) {
      logger.error(`Redis INCR error for ${this.serviceName}: ${error.message}`);
      return null;
    }
  }

  async expire(key, seconds) {
    try {
      await this.client.expire(key, seconds);
    } catch (error) {
      logger.error(`Redis EXPIRE error for ${this.serviceName}: ${error.message}`);
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.quit();
      logger.info(`Redis Client Disconnected for ${this.serviceName}`);
    }
  }
}

// ✅ Default shared instance
export const redisClient = new RedisClient('shared');
