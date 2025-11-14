import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config) => {
    const authData = localStorage.getItem('auth-storage');
    if (authData) {
      try {
        const { state } = JSON.parse(authData);
        if (state?.token) {
          config.headers.Authorization = `Bearer ${state.token}`;
        }
      } catch (error) {
        console.error('Failed to parse auth data:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => {
    // Return data directly from response
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Try to refresh token
      const authData = localStorage.getItem('auth-storage');
      if (authData) {
        try {
          const { state } = JSON.parse(authData);
          if (state?.refreshToken) {
            const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
              refreshToken: state.refreshToken,
            });

            if (response.data?.data?.accessToken) {
              const newToken = response.data.data.accessToken;
              
              // Update token in localStorage
              state.token = newToken;
              localStorage.setItem('auth-storage', JSON.stringify({ state }));

              // Retry original request
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return apiClient(originalRequest);
            }
          }
        } catch (refreshError) {
          // Refresh failed, clear auth and redirect to login
          localStorage.removeItem('auth-storage');
          localStorage.removeItem('user-storage');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }

      // No refresh token available, redirect to login
      localStorage.removeItem('auth-storage');
      localStorage.removeItem('user-storage');
      window.location.href = '/login';
    }

    // Handle other errors
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    const errorData = {
      success: false,
      message: errorMessage,
      error: error.response?.data?.error || error.message,
      statusCode: error.response?.status,
    };

    return Promise.reject(errorData);
  }
);

export default apiClient;
