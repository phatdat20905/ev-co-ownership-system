import cors from 'cors';
import logger from '../utils/logger.js';

export const createCorsMiddleware = () => {
  // Lấy danh sách domain được phép từ .env
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : ['http://localhost:3000', 'http://localhost:5173'];

  logger.info(`🔒 CORS allowed origins: ${allowedOrigins.join(', ')}`);

  return cors({
    origin: (origin, callback) => {
      // ✅ Trường hợp request không có origin (VD: Postman, internal service)
      if (!origin) return callback(null, true);

      // ✅ Cho phép nếu origin nằm trong danh sách được khai báo
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // ❌ Chặn origin lạ
      logger.warn(`🚫 CORS blocked request from origin: ${origin}`);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Authorization'],
  });
};
