// src/app.js
import express from 'express';
import helmet from 'helmet';
import { config } from 'dotenv';
import { createCorsMiddleware, logger, errorHandler, notFoundHandler, generalRateLimiter, createHealthRoute } from '@ev-coownership/shared';
import routes from './routes/index.js';
import { requestLogger } from './middlewares/requestLogger.js';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { serviceMap } from './config/serviceMap.js';

config();

const app = express();

app.use(helmet());
app.use(createCorsMiddleware());

// ⚠️ IMPORTANT: Do NOT parse body here for proxy routes
// Body parsing will break http-proxy-middleware
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true }));

// global rate limiter
app.use(generalRateLimiter);

// request logger & requestId
app.use(requestLogger);

// health
app.get('/health', createHealthRoute({ cache: 'ok', gateway: 'healthy' }));

// Static uploads proxy (so frontend can always call gateway for file assets)
// - KYC images -> auth service
// - Avatars -> user service
app.use('/uploads/kyc', createProxyMiddleware({
	target: serviceMap.auth,
	changeOrigin: true,
	secure: false,
	onError(err, req, res) {
		// lightweight error handling for static proxy
		if (!res.headersSent) {
			res.status(502).json({ success: false, code: 'UPLOAD_PROXY_ERROR', message: 'Failed to proxy uploads/kyc' });
		}
	}
}));

app.use('/uploads/avatars', createProxyMiddleware({
	target: serviceMap.user,
	changeOrigin: true,
	secure: false,
	onError(err, req, res) {
		if (!res.headersSent) {
			res.status(502).json({ success: false, code: 'UPLOAD_PROXY_ERROR', message: 'Failed to proxy uploads/avatars' });
		}
	}
}));

// proxy routes
app.use('/api/v1', routes);

// 404 + error handler
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
