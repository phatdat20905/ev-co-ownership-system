// src/server.js
import app from './app.js';
import db from './models/index.js';
import { mongoDBClient } from './config/mongodb.js';
import eventService from './services/eventService.js';
import healthMonitorService from './services/healthMonitorService.js';
import analyticsJob from './jobs/analyticsJob.js';
import healthCheckJob from './jobs/healthCheckJob.js';
import cleanupJob from './jobs/cleanupJob.js';

import {
  logger,
  redisClient,
  rabbitMQClient
} from '@ev-coownership/shared';

const PORT = process.env.PORT || 3007;

async function startServer() {
  try {
    logger.info('Starting Admin Service...');

    // 🔗 Connect to PostgreSQL
    await db.sequelize.authenticate();
    logger.info('✅ PostgreSQL connected successfully.');

    if (process.env.NODE_ENV === 'development') {
      await db.sequelize.sync({ alter: true });
      logger.info('🗂 Database synced successfully (dev mode).');
    }

    // 🔗 Connect to MongoDB
    await mongoDBClient.connect();
    logger.info('✅ MongoDB connected successfully.');

    // 🐇 Initialize RabbitMQ and Event Service
    await eventService.initialize();
    await eventService.startEventConsumers();
    logger.info('✅ Event service initialized successfully.');

    // 📊 Start background jobs
    healthMonitorService.startMonitoring();
    analyticsJob.start();
    healthCheckJob.start();
    cleanupJob.start();
    logger.info('✅ Background jobs started successfully.');

    // 🚀 Start Express app
    app.listen(PORT, () => {
      logger.info(`🚀 Admin Service running on port ${PORT} [${process.env.NODE_ENV}]`);
      logger.info(`📊 Admin Dashboard: http://localhost:${PORT}/api/v1/dashboard`);
      logger.info(`🩺 Health Check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('❌ Server failed to start', { error: error.message });
    process.exit(1);
  }
}

// Graceful shutdown
const shutdown = async (signal) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);
  
  try {
    // Stop background jobs
    healthMonitorService.stopMonitoring();
    analyticsJob.stop();
    healthCheckJob.stop();
    cleanupJob.stop();
    logger.info('✅ Background jobs stopped.');

    // Close database connections
    await db.sequelize.close();
    logger.info('✅ PostgreSQL connection closed.');

    // Close MongoDB connection
    await mongoDBClient.disconnect();
    logger.info('✅ MongoDB connection closed.');

    // Close Redis connection
    await redisClient.disconnect();
    logger.info('✅ Redis connection closed.');

    // Close RabbitMQ connection
    await rabbitMQClient.disconnect();
    logger.info('✅ RabbitMQ connection closed.');

    logger.info('✅ Graceful shutdown completed. Exiting.');
    process.exit(0);
  } catch (err) {
    logger.error('❌ Error during shutdown', { error: err.message });
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('❌ Uncaught Exception', { error: error.message });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('❌ Unhandled Rejection', { 
    reason: reason?.message || reason,
    promise 
  });
  process.exit(1);
});

startServer();