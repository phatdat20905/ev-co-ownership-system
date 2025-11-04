// src/utils/circuitBreaker.js
import CircuitBreaker from 'opossum';
import { logger } from '@ev-coownership/shared';

/**
 * Tạo circuit breaker cho một service
 * @param {string} serviceName - tên service
 * @param {string} target - URL service (ví dụ: http://localhost:3001)
 */
export const create = (serviceName, target) => {
  // Hàm health check đơn giản để test breaker
  const healthCheck = async () => true;

  const options = {
    timeout: 5000, // Nếu service không phản hồi sau 5s
    errorThresholdPercentage: 50, // 50% lỗi thì mở circuit
    resetTimeout: 30000, // 30s sau thử lại
    rollingCountBuckets: 5,
    rollingCountTimeout: 10000,
  };

  // ✅ Phải dùng “new CircuitBreaker” thay vì opossum(...)
  const breaker = new CircuitBreaker(healthCheck, options);

  // Logging trạng thái breaker
  breaker.on('open', () => logger.warn(`⚠️ Circuit open for ${serviceName}`));
  breaker.on('halfOpen', () => logger.info(`🟡 Circuit half-open for ${serviceName}`));
  breaker.on('close', () => logger.info(`✅ Circuit closed for ${serviceName}`));
  breaker.on('fallback', () => logger.warn(`↩️ Fallback invoked for ${serviceName}`));

  // API đơn giản hóa cho gateway
  return {
    /**
     * Kiểm tra xem service có sẵn sàng không
     * @returns {Promise<boolean>}
     */
    fire: async () => {
      try {
        await breaker.fire();
        return true;
      } catch (err) {
        logger.debug(`🚫 Circuit breaker blocked: ${serviceName}`, { error: err.message });
        return false;
      }
    },
  };
};

export default { create };
