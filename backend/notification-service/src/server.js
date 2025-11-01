// src/server.js
import http from 'http';
import app from './app.js';
import db from './models/index.js';
import eventService from './services/eventService.js';
import socketService from './providers/inApp/socketService.js';
import {
  logger,
  redisClient,
  rabbitMQClient
} from '@ev-coownership/shared';

// Import job runners
import resendFailedJob from './jobs/resendFailedJob.js';
import cleanupOldNotifications from './jobs/cleanupOldNotifications.js';
import metricsAggregationJob from './jobs/metricsAggregationJob.js';

const PORT = process.env.PORT || 3008;

// Create HTTP server for Socket.IO
const server = http.createServer(app);

async function startServer() {
  try {
    // 🔗 Connect DB
    await db.sequelize.authenticate();
    logger.info('✅ Notification Service Database connected successfully.');

    if (process.env.NODE_ENV === 'development') {
      await db.sequelize.sync({ alter: true });
      logger.info('🗂 Notification Service Database synced successfully (dev mode).');
    }

    // 🔌 Connect Redis
    await redisClient.connect();
    logger.info('✅ Redis connected successfully.');

    // 🐇 Init RabbitMQ & Event Service
    await eventService.initialize();
    await eventService.startEventConsumers();

    // 🔌 Initialize Socket.IO
    socketService.initialize(server);

    // 🚀 Start Express app
    server.listen(PORT, () => {
      logger.info(`🚀 Notification Service running on port ${PORT} [${process.env.NODE_ENV}]`);
      
      // Start background jobs in production
      if (process.env.NODE_ENV === 'production') {
        startBackgroundJobs();
      }
    });
  } catch (error) {
    logger.error('❌ Notification Service failed to start', { error: error.message });
    process.exit(1);
  }
}

function startBackgroundJobs() {
  // This would typically use a proper job scheduler like node-cron or Bull
  logger.info('🕒 Background jobs scheduler started');
  
  // Example: Run cleanup job daily at 2 AM
  setInterval(async () => {
    try {
      await cleanupOldNotifications.run();
    } catch (error) {
      logger.error('Background job failed', { job: 'cleanup', error: error.message });
    }
  }, 24 * 60 * 60 * 1000); // 24 hours

  // Example: Run resend job every 6 hours
  setInterval(async () => {
    try {
      await resendFailedJob.run();
    } catch (error) {
      logger.error('Background job failed', { job: 'resend', error: error.message });
    }
  }, 6 * 60 * 60 * 1000); // 6 hours

  // Example: Run metrics job every hour
  setInterval(async () => {
    try {
      await metricsAggregationJob.run();
    } catch (error) {
      logger.error('Background job failed', { job: 'metrics', error: error.message });
    }
  }, 60 * 60 * 1000); // 1 hour
}

// Graceful shutdown
const shutdown = async (signal) => {
  logger.info(`${signal} received. Cleaning up Notification Service...`);
  try {
    // Close HTTP server
    server.close(() => {
      logger.info('HTTP server closed');
    });

    // Close database connections
    await db.sequelize.close();
    logger.info('Database connections closed');

    // Close Redis connection
    await redisClient.disconnect();
    logger.info('Redis connection closed');

    // Close RabbitMQ connection
    await rabbitMQClient.disconnect();
    logger.info('RabbitMQ connection closed');

    logger.info('✅ Notification Service cleanup complete. Exiting.');
    process.exit(0);
  } catch (err) {
    logger.error('❌ Error during Notification Service shutdown', { error: err.message });
    process.exit(1);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('❌ Uncaught Exception', { error: error.message, stack: error.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('❌ Unhandled Rejection', { reason, promise });
  process.exit(1);
});

startServer();