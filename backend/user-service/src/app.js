  import express from 'express';
  import cors from 'cors';
  import helmet from 'helmet';
  import { config } from 'dotenv';

  // Load environment variables
  config();

  // Import từ shared modules
  import { 
    logger, 
    errorHandler, 
    notFoundHandler,
    redisClient,
    rabbitMQClient,
    generalRateLimiter
  } from '@ev-coownership/shared';

  import db from './models/index.js';
  import routes from './routes/index.js';
  import eventService from './services/eventService.js'; // Thêm import này

  const app = express();
  const PORT = process.env.PORT || 3001;

  // Security middleware
  app.use(helmet());
  app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true
  }));

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Rate limiting
  app.use(generalRateLimiter);

  // Request logging middleware
  app.use((req, res, next) => {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    res.locals.requestId = requestId;
    
    logger.info('Incoming request', {
      requestId,
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    next();
  });

  // Health check endpoint với event service status
  app.get('/health', async (req, res) => {
    const eventServiceHealth = await eventService.healthCheck();
    
    res.status(200).json({
      success: true,
      message: 'User Service is healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      services: {
        database: 'healthy',
        redis: 'healthy', 
        eventBus: eventServiceHealth.healthy ? 'healthy' : 'unhealthy'
      }
    });
  });

  // API routes
  app.use('/api/v1', routes);

  // 404 handler từ shared
  app.use(notFoundHandler);

  // Error handling middleware từ shared
  app.use(errorHandler);

  // Database connection and server startup
  async function startServer() {
    try {
      // Test database connection
      await db.sequelize.authenticate();
      logger.info('Database connection established successfully');

      // Sync database (in development)
      if (process.env.NODE_ENV === 'development') {
        await db.sequelize.sync({ alter: true });
        logger.info('Database synced successfully');
      }

      // Initialize event service
      await eventService.initialize();
      
      // Start event consumers
      await eventService.startEventConsumers();

      // Start server
      app.listen(PORT, () => {
        logger.info(`User Service running on port ${PORT} in ${process.env.NODE_ENV} mode`);
      });
    } catch (error) {
      logger.error('Failed to start server', { error: error.message });
      process.exit(1);
    }
  }

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, shutting down gracefully');
    await db.sequelize.close();
    await redisClient.disconnect();
    await rabbitMQClient.disconnect();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    logger.info('SIGINT received, shutting down gracefully');
    await db.sequelize.close();
    await redisClient.disconnect();
    await rabbitMQClient.disconnect();
    process.exit(0);
  });

  startServer();

  export default app;