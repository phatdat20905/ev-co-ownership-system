// src/services/api/interceptors.js
import apiClient from './config.js';
import { getAuthToken, clearAuth } from '../../utils/storage.js';
import { showErrorToast } from '../../utils/toast.js';

/**
 * Request Interceptor
 * Automatically attach JWT token to all requests
 */
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = getAuthToken();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request in development
    if (import.meta.env.VITE_APP_ENV === 'development') {
      console.log(`🚀 API Request: ${config.method.toUpperCase()} ${config.url}`, config.data);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handle responses and errors globally
 */
apiClient.interceptors.response.use(
  (response) => {
    // Log response in development
    if (import.meta.env.VITE_APP_ENV === 'development') {
      console.log(`✅ API Response: ${response.config.url}`, response.data);
    }
    
    // Return the data directly for easier usage
    return response.data;
  },
  (error) => {
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      // If the original request explicitly marked itself as a public call (skip global auth handling),
      // don't perform global 401 logout/redirect for that call. This is used for registration->createProfile
      // flows where createProfile may be unauthenticated.
      const requestConfig = error.response.config || {};
      const skipAuthHeader = requestConfig.headers && (requestConfig.headers['x-skip-auth'] || requestConfig.headers['X-Skip-Auth']);
      const skipAuth = skipAuthHeader === '1' || skipAuthHeader === 1 || skipAuthHeader === true;

      switch (status) {
        case 401:
          // Unauthorized - token expired or invalid
          if (!skipAuth) {
            showErrorToast('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            clearAuth();
            window.location.href = '/login';
          } else {
            // Let the caller handle 401 for public calls
            console.warn('Received 401 for skip-auth request, skipping global logout:', requestConfig.url);
          }
          break;

        case 403:
          // Forbidden - insufficient permissions
          showErrorToast('Bạn không có quyền thực hiện thao tác này.');
          break;

        case 404:
          // Not found
          showErrorToast('Không tìm thấy dữ liệu yêu cầu.');
          break;

        case 422:
          // Validation error
          const validationErrors = data.errors || {};
          const firstError = Object.values(validationErrors)[0];
          showErrorToast(firstError || 'Dữ liệu không hợp lệ.');
          break;

        case 429:
          // Too many requests
          showErrorToast('Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.');
          break;

        case 500:
        case 502:
        case 503:
          // Server error
          showErrorToast('Lỗi máy chủ. Vui lòng thử lại sau.');
          break;

        default:
          showErrorToast(data.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
      }

      console.error(`❌ API Error [${status}]:`, data);
    } else if (error.request) {
      // Request made but no response received
      showErrorToast('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
      console.error('❌ Network Error:', error.request);
    } else {
      // Something else happened
      showErrorToast('Đã xảy ra lỗi không xác định.');
      console.error('❌ Error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;