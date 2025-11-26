// src/utils/proxyFactory.js
import { createProxyMiddleware } from 'http-proxy-middleware';
import { logger } from '@ev-coownership/shared';
import CircuitBreaker from './circuitBreaker.js';

/**
 * Tạo proxy middleware có circuit breaker cho từng service
 * @param {string} serviceName - ví dụ "auth", "booking"
 * @param {string} target - ví dụ "http://localhost:3001"
 * @param {object} opts - cấu hình bổ sung
 */
export const createServiceProxy = (serviceName, target, opts = {}) => {
  const defaultOpts = {
    changeOrigin: true,
    secure: false,
    timeout: 30000,
    proxyTimeout: 30000,
    selfHandleResponse: false,
  };

  const options = { ...defaultOpts, ...opts };
  const breaker = CircuitBreaker.create(serviceName, target);

  const proxy = createProxyMiddleware({
    ...options,
    target,
    pathRewrite: (path, req) => {
      // Special handling for static file uploads - don't add /api/v1 prefix
      // These should be proxied directly to the backend service's express.static middleware
      if (serviceName.startsWith('uploads-')) {
        // For /uploads/avatars → /uploads/avatars
        // For /uploads/kyc → /uploads/kyc
        // For /uploads/documents → /uploads/documents
        const uploadType = serviceName.replace('uploads-', '');
        return `/uploads/${uploadType}${path}`;
      }
      
      // Express router strips: /api/v1 + /<serviceName>
      // So proxy receives only: /login, /register, etc.
      // We need to reconstruct: /api/v1/<serviceName><path>
      return `/api/v1/${serviceName}${path}`;
    },
    onProxyReq(proxyReq, req, res) {
      // ✅ Gắn requestId & user info vào header
      if (res.locals?.requestId) proxyReq.setHeader('x-request-id', res.locals.requestId);
      if (req.user) {
        proxyReq.setHeader('x-user-id', req.user.id || '');
        proxyReq.setHeader('x-user-role', req.user.role || '');
      }
      
      // Body will be forwarded automatically since we removed express.json()
    },
    onError(err, req, res) {
      logger.error(`❌ Proxy error [${serviceName}]`, { error: err.message, path: req.originalUrl });
      if (!res.headersSent) {
        res
          .status(502)
          .json({
            success: false,
            code: 'SERVICE_UNAVAILABLE',
            message: `Service ${serviceName} unavailable`,
          });
      }
    },
  });

  // ✅ Circuit breaker wrapper
  return async (req, res, next) => {
    try {
      const allowed = await breaker.fire();
      if (!allowed) {
        return res
          .status(503)
          .json({
            success: false,
            code: 'CIRCUIT_OPEN',
            message: `${serviceName} temporarily unavailable`,
          });
      }
      return proxy(req, res, next);
    } catch (err) {
      logger.error(`🚨 Circuit breaker proxy error [${serviceName}]`, { error: err.message });
      return res
        .status(502)
        .json({ success: false, code: 'PROXY_ERROR', message: 'Proxy error' });
    }
  };
};
