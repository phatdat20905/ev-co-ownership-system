// src/server.js
import app from './app.js';
import db from './models/index.js';
import eventService from './services/eventService.js';
import invoiceGenerationJob from './jobs/invoiceGenerationJob.js';
import overdueReminderJob from './jobs/overdueReminderJob.js';
import {
  logger,
  redisClient,
  rabbitMQClient
} from '@ev-coownership/shared';

const PORT = process.env.PORT || 3004;

async function startServer() {
  try {
    logger.info('🚀 Starting Cost Service...');

    // 🔗 Connect DB
    await db.sequelize.authenticate();
    logger.info('✅ Database connected');

    if (process.env.NODE_ENV === 'development') {
      await db.sequelize.sync({ alter: true });
      logger.info('🗂 Database synced (dev mode)');
    }

    // 🐇 Init Event Service
    await eventService.initialize();
    await eventService.startEventConsumers();
    logger.info('✅ Event service started');

    // 📅 Start Background Jobs
    await invoiceGenerationJob.run();
    await overdueReminderJob.run();
    logger.info('✅ Background jobs started');

    // 🚀 Start Express app
    app.listen(PORT, () => {
      logger.info(`💰 Cost Service running on port ${PORT}`);
    });

  } catch (error) {
    logger.error('❌ Failed to start Cost Service', { error: error.message });
    process.exit(1);
  }
}

// Graceful shutdown
async function shutdown(signal) {
  logger.info(`${signal} received. Shutting down...`);
  
  try {
    // Close background jobs first
    await invoiceGenerationJob.close();
    await overdueReminderJob.close();
    logger.info('✅ Jobs stopped');

    // Close connections
    await db.sequelize.close();
    logger.info('✅ Database closed');

    await redisClient.disconnect();
    logger.info('✅ Redis closed');

    await rabbitMQClient.disconnect();
    logger.info('✅ RabbitMQ closed');

    logger.info('✅ Shutdown complete');
    process.exit(0);
  } catch (err) {
    logger.error('❌ Error during shutdown', { error: err.message });
    process.exit(1);
  }
}

// Handle shutdown signals
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle errors
process.on('uncaughtException', (error) => {
  logger.error('❌ Uncaught Exception', { error: error.message });
  shutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('❌ Unhandled Rejection', { reason: reason?.message });
  shutdown('UNHANDLED_REJECTION');
});

// Start server
startServer();