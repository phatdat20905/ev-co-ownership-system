import app from './app.js';
import db from './models/index.js';
import eventService from './services/eventService.js';
import {
  logger,
  redisClient,
  rabbitMQClient
} from '@ev-coownership/shared';

const PORT = process.env.PORT || 3006;

async function startServer() {
  try {
    // 🔗 Connect DB
    await db.sequelize.authenticate();
    logger.info('✅ Database connected successfully.');

    if (process.env.NODE_ENV === 'development') {
      await db.sequelize.sync({ alter: true });
      logger.info('🗂 Database synced successfully (dev mode).');
    }

    // 🐇 Init RabbitMQ
    await eventService.initialize();
    await eventService.startEventConsumers();

    // 🚀 Start Express app
    app.listen(PORT, () => {
      logger.info(`🚀 Contract Service running on port ${PORT} [${process.env.NODE_ENV}]`);
    });
  } catch (error) {
    logger.error('❌ Server failed to start', { error: error.message });
    process.exit(1);
  }
}

// Graceful shutdown
const shutdown = async (signal) => {
  logger.info(`${signal} received. Cleaning up...`);
  try {
    await db.sequelize.close();
    await redisClient.disconnect();
    await rabbitMQClient.disconnect();
    logger.info('✅ Cleanup complete. Exiting.');
    process.exit(0);
  } catch (err) {
    logger.error('❌ Error during shutdown', { error: err.message });
    process.exit(1);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

startServer();