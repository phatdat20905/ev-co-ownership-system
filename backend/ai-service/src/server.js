import app from './app.js';
import database from './config/database.js';
import eventService from './services/eventService.js';
import aiService from './services/aiService.js';
import {
  logger,
  redisClient,
  rabbitMQClient
} from '@ev-coownership/shared';

const PORT = process.env.PORT || 3009;

async function startServer() {
  try {
    logger.info('🚀 Starting AI Service...');

    // 🔗 Connect to MongoDB
    await database.connect();
    logger.info('✅ MongoDB connected successfully for AI Service.');

    // 🐇 Initialize Event Service
    await eventService.initialize();
    await eventService.startEventConsumers();
    logger.info('✅ Event service initialized successfully.');

    // 🧪 Perform health check
    const health = await aiService.getServiceHealth();
    logger.info('🔍 AI Service health check completed', { health });

    // 🚀 Start Express app
    app.listen(PORT, () => {
      logger.info(`🎯 AI Service running on port ${PORT} [${process.env.NODE_ENV}]`);
      logger.info(`📊 API available at: http://localhost:${PORT}/api/v1`);
      logger.info(`🩺 Health check: http://localhost:${PORT}/api/v1/health`);
    });

    // Start periodic health monitoring
    startHealthMonitoring();

  } catch (error) {
    logger.error('❌ AI Service failed to start', { error: error.message });
    process.exit(1);
  }
}

// Periodic health monitoring
function startHealthMonitoring() {
  const MONITORING_INTERVAL = 5 * 60 * 1000; // 5 minutes

  setInterval(async () => {
    try {
      const health = await aiService.getServiceHealth();
      
      if (!health.healthy) {
        logger.warn('⚠️ AI Service health check failed', { health });
        
        // Publish health event
        await eventService.publishAIServiceHealthUpdate(health);
      } else {
        logger.debug('✅ AI Service health check passed', { 
          timestamp: new Date().toISOString() 
        });
      }
    } catch (error) {
      logger.error('❌ Health monitoring failed', { error: error.message });
    }
  }, MONITORING_INTERVAL);

  logger.info('🔍 Health monitoring started');
}

// Graceful shutdown
const shutdown = async (signal) => {
  logger.info(`${signal} received. Cleaning up AI Service...`);
  
  try {
    // Close database connection
    await database.disconnect();
    
    // Disconnect from Redis
    await redisClient.disconnect();
    
    // Disconnect from RabbitMQ
    await rabbitMQClient.disconnect();
    
    logger.info('✅ AI Service cleanup complete. Exiting.');
    process.exit(0);
  } catch (err) {
    logger.error('❌ Error during AI Service shutdown', { error: err.message });
    process.exit(1);
  }
};

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