// src/server.js
import app from './app.js';
import db from './models/index.js';
import eventService from './services/eventService.js';
import {
  logger,
  redisClient,
  rabbitMQClient
} from '@ev-coownership/shared';

// Jobs
import maintenanceReminderJob from './jobs/maintenanceReminderJob.js';
import insuranceExpiryJob from './jobs/insuranceExpiryJob.js';
import batteryHealthCheckJob from './jobs/batteryHealthCheckJob.js';
import vehicleMetricsJob from './jobs/vehicleMetricsJob.js';

const PORT = process.env.PORT || 3005;

async function startServer() {
  try {
    // 🔗 Connect DB
    await db.sequelize.authenticate();
    logger.info('✅ Vehicle Service Database connected successfully.');

    if (process.env.NODE_ENV === 'development') {
      await db.sequelize.sync({ alter: true });
      logger.info('🗂 Vehicle Service Database synced successfully (dev mode).');
    }

    // 🐇 Init Event Service
    await eventService.initialize();
    await eventService.startEventConsumers();

    // 🔄 Start Background Jobs
    await maintenanceReminderJob.start();
    await insuranceExpiryJob.start();
    await batteryHealthCheckJob.start();
    await vehicleMetricsJob.start();
    logger.info('✅ Vehicle Service Background jobs started successfully.');

    // 🚀 Start Express app
    app.listen(PORT, () => {
      logger.info(`🚀 Vehicle Service running on port ${PORT} [${process.env.NODE_ENV}]`);
    });
  } catch (error) {
    logger.error('❌ Vehicle Service failed to start', { error: error.message });
    process.exit(1);
  }
}

// Graceful shutdown
const shutdown = async (signal) => {
  logger.info(`${signal} received. Cleaning up Vehicle Service...`);
  try {
    // Stop background jobs first to avoid them using clients during shutdown
    try {
      await maintenanceReminderJob.stop();
      await insuranceExpiryJob.stop();
      await batteryHealthCheckJob.stop();
      await vehicleMetricsJob.stop();
    } catch (jobErr) {
      logger.warn('Error while stopping jobs', { error: jobErr?.message });
    }

    // Close DB and external clients
    await db.sequelize.close();
    await rabbitMQClient.disconnect();
    await redisClient.disconnect();
    logger.info('✅ Vehicle Service cleanup complete. Exiting.');
    process.exit(0);
  } catch (err) {
    logger.error('❌ Error during Vehicle Service shutdown', { error: err.message });
    process.exit(1);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Uncaught exception handlers
process.on('uncaughtException', (error) => {
  logger.error('💥 Vehicle Service Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('💥 Vehicle Service Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

startServer();