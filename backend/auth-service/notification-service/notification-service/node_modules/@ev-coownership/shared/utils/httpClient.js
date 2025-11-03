import axios from 'axios';
import { AppError } from './errorClasses.js';
import logger from './logger.js';

export class HttpClient {
  constructor(baseURL, serviceName) {
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': `EV-Coownership-${serviceName}`
      }
    });

    this.setupInterceptors(serviceName);
  }

  setupInterceptors(serviceName) {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const requestId = `http_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        config.headers['X-Request-ID'] = requestId;
        
        logger.debug('HTTP request outgoing', {
          service: serviceName,
          method: config.method?.toUpperCase(),
          url: config.url,
          requestId
        });

        return config;
      },
      (error) => {
        logger.error('HTTP request setup failed', {
          service: serviceName,
          error: error.message
        });
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        logger.debug('HTTP response received', {
          service: serviceName,
          method: response.config.method?.toUpperCase(),
          url: response.config.url,
          status: response.status,
          duration: response.duration
        });

        return response;
      },
      (error) => {
        const errorInfo = {
          service: serviceName,
          method: error.config?.method?.toUpperCase(),
          url: error.config?.url,
          status: error.response?.status,
          message: error.message
        };

        if (error.response) {
          logger.warn('HTTP response error', errorInfo);
        } else if (error.request) {
          logger.error('HTTP no response received', errorInfo);
        } else {
          logger.error('HTTP request setup error', errorInfo);
        }

        return Promise.reject(error);
      }
    );
  }

  async get(url, config = {}) {
    try {
      const response = await this.client.get(url, config);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async post(url, data = {}, config = {}) {
    try {
      const response = await this.client.post(url, data, config);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async put(url, data = {}, config = {}) {
    try {
      const response = await this.client.put(url, data, config);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async patch(url, data = {}, config = {}) {
    try {
      const response = await this.client.patch(url, data, config);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async delete(url, config = {}) {
    try {
      const response = await this.client.delete(url, config);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  handleError(error) {
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          throw new AppError(data.message || 'Bad request', status, 'BAD_REQUEST', data.details);
        case 401:
          throw new AppError('Unauthorized', status, 'UNAUTHORIZED');
        case 403:
          throw new AppError('Forbidden', status, 'FORBIDDEN');
        case 404:
          throw new AppError('Resource not found', status, 'NOT_FOUND');
        case 409:
          throw new AppError(data.message || 'Conflict', status, 'CONFLICT');
        case 422:
          throw new AppError(data.message || 'Validation failed', status, 'VALIDATION_ERROR', data.details);
        case 429:
          throw new AppError('Rate limit exceeded', status, 'RATE_LIMIT_EXCEEDED');
        case 500:
          throw new AppError('Internal server error', status, 'INTERNAL_SERVER_ERROR');
        case 502:
          throw new AppError('Bad gateway', status, 'BAD_GATEWAY');
        case 503:
          throw new AppError('Service unavailable', status, 'SERVICE_UNAVAILABLE');
        default:
          throw new AppError(
            data.message || `HTTP error: ${status}`,
            status,
            'HTTP_ERROR'
          );
      }
    } else if (error.request) {
      throw new AppError('No response received from service', 502, 'SERVICE_UNAVAILABLE');
    } else {
      throw new AppError('Request setup failed', 500, 'REQUEST_SETUP_ERROR');
    }
  }
}

// Factory function to create HTTP clients for different services
export const createHttpClient = (baseURL, serviceName) => {
  return new HttpClient(baseURL, serviceName);
};

// Pre-configured clients for known services
export const userServiceClient = createHttpClient(
  process.env.USER_SERVICE_URL || 'http://localhost:3002',
  'user-service'
);

export const notificationServiceClient = createHttpClient(
  process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3008', 
  'notification-service'
);

export const adminServiceClient = createHttpClient(
  process.env.ADMIN_SERVICE_URL || 'http://localhost:3007',
  'admin-service'
);