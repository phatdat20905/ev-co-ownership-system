// src/server.js
import app from './app.js';
import db from './models/index.js';
import eventService from './services/eventService.js';
import {
  logger,
  redisClient,
  rabbitMQClient
} from '@ev-coownership/shared';

const PORT = process.env.PORT || 3005;

async function startServer() {
  try {
    // 🔗 Connect DB
    await db.sequelize.authenticate();
    logger.info('✅ Cost Service Database connected successfully.');

    if (process.env.NODE_ENV === 'development') {
      await db.sequelize.sync({ alter: true });
      logger.info('🗂 Cost Service Database synced successfully (dev mode).');
    }

    // 🐇 Init Event Service
    await eventService.initialize();
    await eventService.startEventConsumers();

    // 🚀 Start Express app
    app.listen(PORT, () => {
      logger.info(`🚀 Cost Service running on port ${PORT} [${process.env.NODE_ENV}]`);
    });
  } catch (error) {
    logger.error('❌ Cost Service failed to start', { error: error.message });
    process.exit(1);
  }
}

// Graceful shutdown
const shutdown = async (signal) => {
  logger.info(`${signal} received. Cleaning up Cost Service...`);
  try {
    await db.sequelize.close();
    await redisClient.disconnect();
    await rabbitMQClient.disconnect();
    logger.info('✅ Cost Service cleanup complete. Exiting.');
    process.exit(0);
  } catch (err) {
    logger.error('❌ Error during Cost Service shutdown', { error: err.message });
    process.exit(1);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

startServer();