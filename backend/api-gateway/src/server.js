// src/server.js
import app from './app.js';
import { logger, redisClient } from '@ev-coownership/shared';
import { config } from 'dotenv';
config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // connect redis (shared)
    try {
      await redisClient.connect();
      logger.info('Redis connected (gateway).');
    } catch (e) {
      logger.warn('Redis connect failed (gateway) - continuing without redis cache', { err: e.message });
    }

    app.listen(PORT, () => {
      logger.info(`API Gateway listening on port ${PORT} [${process.env.NODE_ENV}]`);
    });
  } catch (err) {
    logger.error('Gateway failed to start', { err: err.message });
    process.exit(1);
  }
};

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, exiting');
  process.exit(0);
});
process.on('SIGINT', () => {
  logger.info('SIGINT received, exiting');
  process.exit(0);
});

startServer();
