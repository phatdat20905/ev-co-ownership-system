import apiClient from '../lib/api/client.js';

/**
 * Authentication Service
 */
class AuthService {
  /**
   * Register new user
   */
  async register(userData) {
    return await apiClient.post('/auth/register', userData);
  }

  /**
   * Login user
   */
  async login(credentials) {
    return await apiClient.post('/auth/login', credentials);
  }

  /**
   * Logout user
   */
  async logout() {
    return await apiClient.post('/auth/logout');
  }

  /**
   * Get current user profile
   */
  async getProfile() {
    return await apiClient.get('/auth/profile');
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(refreshToken) {
    return await apiClient.post('/auth/refresh-token', { refreshToken });
  }

  /**
   * Forgot password - send reset email
   */
  async forgotPassword(email) {
    return await apiClient.post('/auth/forgot-password', { email });
  }

  /**
   * Reset password with token
   */
  async resetPassword(token, password) {
    return await apiClient.post('/auth/reset-password', { token, password });
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token) {
    return await apiClient.post('/auth/verify-email', { token });
  }

  /**
   * Send verification email
   */
  async sendVerificationEmail() {
    return await apiClient.post('/auth/send-verification-email');
  }

  /**
   * Change password
   */
  async changePassword(oldPassword, newPassword) {
    return await apiClient.post('/auth/change-password', { oldPassword, newPassword });
  }
}

export default new AuthService();
