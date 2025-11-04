// src/middlewares/requestLogger.js
import { logger } from '@ev-coownership/shared';

export const requestLogger = (req, res, next) => {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2,9)}`;
  res.locals.requestId = requestId;
  logger.info(`[Gateway] ${req.method} ${req.originalUrl}`, {
    requestId,
    ip: req.ip,
    ua: req.get('User-Agent'),
  });
  next();
};
