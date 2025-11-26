import express from 'express';
import helmet from 'helmet';
import { config } from 'dotenv';
import { createCorsMiddleware } from '@ev-coownership/shared';
import { createHealthRoute } from '@ev-coownership/shared';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Shared imports
import {
  logger,
  errorHandler,
  notFoundHandler,
  generalRateLimiter
} from '@ev-coownership/shared';

import routes from './routes/index.js';

// Load .env file
config();

const app = express();

// 🛡️ Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(createCorsMiddleware());

// 📦 Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 📁 Static file serving for uploaded documents
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 🚦 Rate limiting
app.use(generalRateLimiter);

// 🧾 Request logger
app.use((req, res, next) => {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  res.locals.requestId = requestId;

  logger.info(`[${requestId}] ${req.method} ${req.url}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  next();
});

// 🩺 Health check route
app.get('/health', createHealthRoute({
  eventBus: 'healthy',
  cache: 'healthy'
}));

// 📍 API routes
app.use('/api/v1', routes);

// 🚫 404 và xử lý lỗi tổng quát
app.use(notFoundHandler);
app.use(errorHandler);

export default app;