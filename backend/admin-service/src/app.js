// src/app.js
import express from 'express';
import helmet from 'helmet';
import { config } from 'dotenv';
import { createCorsMiddleware } from '@ev-coownership/shared';
import { createHealthRoute } from '@ev-coownership/shared';

// Shared imports
import {
  logger,
  errorHandler,
  notFoundHandler,
  generalRateLimiter
} from '@ev-coownership/shared';

// Middleware
import { adminRequestLogger } from './middleware/requestLogger.js';

// Routes
import routes from './routes/index.js';

// Load .env file
config();

const app = express();

// 🛡️ Security middleware
app.use(helmet());
app.use(createCorsMiddleware());

// 📦 Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// � Static file serving for uploads
app.use('/uploads', express.static('uploads'));

// �🚦 Rate limiting
app.use(generalRateLimiter);

// 🧾 Request logger
app.use(adminRequestLogger);

// 🩺 Health check route
app.get('/health', createHealthRoute({
  eventBus: 'healthy',
  cache: 'healthy',
  database: 'healthy'
}));

// 📍 API routes
app.use('/api/v1', routes);

// 🚫 404 and error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;