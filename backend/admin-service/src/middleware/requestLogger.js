// src/middleware/requestLogger.js
import { logger } from '@ev-coownership/shared';
import analyticsRepository from '../repositories/analyticsRepository.js';

export const adminRequestLogger = (req, res, next) => {
  const start = Date.now();
  const requestId = res.locals.requestId;

  // Log request details
  logger.info(`[${requestId}] ADMIN ${req.method} ${req.path}`, {
    requestId,
    method: req.method,
    path: req.path,
    query: req.query,
    staffId: req.staff?.id,
    userAgent: req.get('User-Agent'),
    ip: req.ip
  });

  // Capture response
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    logger.info(`[${requestId}] ADMIN ${req.method} ${req.path} ${res.statusCode} - ${duration}ms`, {
      requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      staffId: req.staff?.id,
      contentLength: res.get('Content-Length')
    });

    // Log to analytics for admin actions
    if (req.staff && res.statusCode < 400) {
      analyticsRepository.logAnalyticsEvent({
        event_type: 'admin.action.performed',
        user_id: req.staff.userId,
        user_role: 'staff',
        service: 'admin-service',
        action: `${req.method.toLowerCase()}_${req.path.replace(/\//g, '_')}`,
        metadata: {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          duration
        },
        timestamp: new Date(),
        environment: process.env.NODE_ENV || 'development'
      }).catch(err => logger.error('Failed to log admin action', { error: err.message }));
    }
  });

  next();
};