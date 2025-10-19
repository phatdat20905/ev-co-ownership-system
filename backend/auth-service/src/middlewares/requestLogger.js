import logger from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

export const requestLogger = (req, res, next) => {
  const requestId = uuidv4();
  const startTime = Date.now();

  // Store request ID for response
  res.locals.requestId = requestId;

  // Log request
  logger.info('Incoming request', {
    requestId,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Hook into response finish to log response
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info('Request completed', {
      requestId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`
    });
  });

  next();
};