// booking-service/src/server.js (bổ sung)
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import app from './app.js';
import db from './models/index.js';
import eventService from './services/eventService.js';
import socketService from './services/socketService.js';
import bookingReminderJob from './jobs/bookingReminderJob.js';
import cacheWarmupJob from './jobs/cacheWarmupJob.js';
import conflictDetectionJob from './jobs/conflictDetectionJob.js';
import cleanupJob from './jobs/cleanupJob.js';
import {
  logger,
  redisClient,
  rabbitMQClient
} from '@ev-coownership/shared';

const PORT = process.env.PORT || 3003;

// Tạo HTTP server cho cả Express và Socket.io
const httpServer = createServer(app);
const io = new SocketServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Job schedules
const JOB_SCHEDULES = {
  BOOKING_REMINDER: 15 * 60 * 1000, // 15 phút
  CACHE_WARMUP: 30 * 60 * 1000,     // 30 phút  
  CONFLICT_DETECTION: 15 * 60 * 1000, // 15 phút
  CLEANUP: 24 * 60 * 60 * 1000      // 24 giờ
};

let jobIntervals = [];

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

    // 🔌 Initialize Socket.io
    socketService.initialize(io);

    // 🎯 Start Background Jobs
    startBackgroundJobs();

    // 🚀 Start HTTP server (cả Express và Socket.io)
    httpServer.listen(PORT, () => {
      logger.info(`🚀 Booking Service running on port ${PORT} [${process.env.NODE_ENV}]`);
      logger.info(`🔌 Socket.io ready for real-time connections`);
      logger.info(`🎯 Background jobs started`);
    });
  } catch (error) {
    logger.error('❌ Server failed to start', { error: error.message });
    process.exit(1);
  }
}

function startBackgroundJobs() {
  // Booking Reminder Job - mỗi 15 phút
  jobIntervals.push(setInterval(() => {
    bookingReminderJob.run().catch(error => {
      logger.error('Booking reminder job execution failed', { error: error.message });
    });
  }, JOB_SCHEDULES.BOOKING_REMINDER));

  // Cache Warmup Job - mỗi 30 phút
  jobIntervals.push(setInterval(() => {
    cacheWarmupJob.run().catch(error => {
      logger.error('Cache warmup job execution failed', { error: error.message });
    });
  }, JOB_SCHEDULES.CACHE_WARMUP));

  // Conflict Detection Job - mỗi 15 phút
  jobIntervals.push(setInterval(() => {
    conflictDetectionJob.run().catch(error => {
      logger.error('Conflict detection job execution failed', { error: error.message });
    });
  }, JOB_SCHEDULES.CONFLICT_DETECTION));

  // Cleanup Job - mỗi 24 giờ
  jobIntervals.push(setInterval(() => {
    cleanupJob.run().catch(error => {
      logger.error('Cleanup job execution failed', { error: error.message });
    });
  }, JOB_SCHEDULES.CLEANUP));

  // Chạy jobs ngay lần đầu
  setTimeout(() => {
    bookingReminderJob.run().catch(console.error);
    cacheWarmupJob.run().catch(console.error);
    conflictDetectionJob.run().catch(console.error);
  }, 5000); // Chạy sau 5 giây khi server khởi động

  logger.info('Background jobs scheduled', {
    bookingReminder: `${JOB_SCHEDULES.BOOKING_REMINDER / 60000} minutes`,
    cacheWarmup: `${JOB_SCHEDULES.CACHE_WARMUP / 60000} minutes`,
    conflictDetection: `${JOB_SCHEDULES.CONFLICT_DETECTION / 60000} minutes`,
    cleanup: `${JOB_SCHEDULES.CLEANUP / (60 * 60000)} hours`
  });
}

// Graceful shutdown
const shutdown = async (signal) => {
  logger.info(`${signal} received. Cleaning up...`);
  try {
    // Dừng tất cả jobs
    jobIntervals.forEach(interval => clearInterval(interval));
    jobIntervals = [];

    // Đóng kết nối
    await db.sequelize.close();
    await redisClient.disconnect();
    await rabbitMQClient.disconnect();
    
    // Đóng Socket.io connections
    io.close();
    
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