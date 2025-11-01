import express from 'express';
import helmet from 'helmet';
import { connectDatabase } from './config/database.js';
import { logger } from '@ev-coownership/shared';

const app = express();
const PORT = process.env.PORT || 3003;

// Middlewares
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Cost Service',
    timestamp: new Date().toISOString()
  });
});


// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found'
    }
  });
});

// Start server
const startServer = async () => {
  try {
    await connectDatabase();
    
    app.listen(PORT, () => {
      logger.info(`Cost Service running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error('Failed to start Cost Service:', error);
    process.exit(1);
  }
};

startServer();

export default app;