// src/app.js
import express from 'express';
import helmet from 'helmet';
import { config } from 'dotenv';
import { createCorsMiddleware, logger, errorHandler, notFoundHandler, generalRateLimiter, createHealthRoute } from '@ev-coownership/shared';
import routes from './routes/index.js';
import { requestLogger } from './middlewares/requestLogger.js';

config();

const app = express();

app.use(helmet());
app.use(createCorsMiddleware());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// global rate limiter
app.use(generalRateLimiter);

// request logger & requestId
app.use(requestLogger);

// health
app.get('/health', createHealthRoute({ cache: 'ok', gateway: 'healthy' }));

// proxy routes
app.use('/api/v1', routes);

// 404 + error handler
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
