// src/services/auth.service.js
import apiClient from './api/interceptors.js';

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */
class AuthService {
  /**
   * Register new user
   * POST /auth/register
   */
  async register(userData) {
    const response = await apiClient.post('/auth/register', userData);
    return response;
  }

  /**
   * Login user
   * POST /auth/login
   */
  async login(credentials) {
    const response = await apiClient.post('/auth/login', credentials);
    
    // Store auth data if login successful
    if (response.success && response.data) {
      const { accessToken, token, refreshToken, user } = response.data;
      // Support both accessToken (backend) and token (legacy)
      const authToken = accessToken || token;
      
      localStorage.setItem('authToken', authToken);
      localStorage.setItem('userData', JSON.stringify(user));
      
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      
      // Set expiry (7 days from now)
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 7);
      localStorage.setItem('authExpires', expiryDate.toISOString());
      
      // Trigger storage event for Header update
      window.dispatchEvent(new Event('storage'));
    }
    
    return response;
  }

  /**
   * Logout user
   * POST /auth/logout
   */
  async logout() {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      // Clear auth data regardless of API response
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('authExpires');
      localStorage.removeItem('rememberedLogin');
      
      // Trigger storage event
      window.dispatchEvent(new Event('storage'));
    }
  }

  /**
   * Refresh authentication token
   * POST /auth/refresh-token
   */
  async refreshToken(refreshToken) {
    const response = await apiClient.post('/auth/refresh-token', { refreshToken });
    
    if (response.success && response.data) {
      const { token } = response.data;
      localStorage.setItem('authToken', token);
    }
    
    return response;
  }

  /**
   * Forgot password - send reset email
   * POST /auth/forgot-password
   */
  async forgotPassword(email) {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response;
  }

  /**
   * Reset password with token
   * POST /auth/reset-password
   */
  async resetPassword(token, newPassword) {
    const response = await apiClient.post('/auth/reset-password', {
      token,
      password: newPassword,
    });
    return response;
  }

  /**
   * Verify email with token
   * POST /auth/verify-email
   */
  async verifyEmail(token) {
    const response = await apiClient.post('/auth/verify-email', { token });
    return response;
  }

  /**
   * Send verification email
   * POST /auth/send-verification-email
   */
  async sendVerificationEmail() {
    const response = await apiClient.post('/auth/send-verification-email');
    return response;
  }

  /**
   * Get current user profile
   * GET /auth/profile
   */
  async getProfile() {
    const response = await apiClient.get('/auth/profile');
    
    // Update stored user data
    if (response.success && response.data) {
      localStorage.setItem('userData', JSON.stringify(response.data));
      window.dispatchEvent(new Event('storage'));
    }
    
    return response;
  }

  /**
   * Change password (authenticated user)
   * POST /auth/change-password
   */
  async changePassword(currentPassword, newPassword) {
    const response = await apiClient.post('/auth/change-password', {
      currentPassword,
      newPassword
    });
    return response;
  }

  /**
   * Submit KYC documents
   * POST /auth/kyc/submit
   * @param {Object} kycData - KYC data object
   * @param {string} kycData.idCardNumber - ID card number
   * @param {string} kycData.driverLicenseNumber - Driver license number (optional)
   * @param {File} kycData.idCardFront - ID card front image
   * @param {File} kycData.idCardBack - ID card back image
   * @param {File} kycData.driverLicense - Driver license image (optional)
   * @param {File} kycData.selfie - Selfie image
   */
  async submitKYC(kycData) {
    const formData = new FormData();
    
    // Add text fields
    if (kycData.idCardNumber) {
      formData.append('idCardNumber', kycData.idCardNumber);
    }
    if (kycData.driverLicenseNumber) {
      formData.append('driverLicenseNumber', kycData.driverLicenseNumber);
    }
    
    // Add file fields
    if (kycData.idCardFront) {
      formData.append('idCardFront', kycData.idCardFront);
    }
    if (kycData.idCardBack) {
      formData.append('idCardBack', kycData.idCardBack);
    }
    if (kycData.driverLicense) {
      formData.append('driverLicense', kycData.driverLicense);
    }
    if (kycData.selfie) {
      formData.append('selfie', kycData.selfie);
    }
    
    const response = await apiClient.post('/auth/kyc/submit', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response;
  }

  /**
   * Get KYC verification status
   * GET /auth/kyc/status
   */
  async getKYCStatus() {
    const response = await apiClient.get('/auth/kyc/status');
    return response;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    const token = localStorage.getItem('authToken');
    const expiry = localStorage.getItem('authExpires');
    
    if (!token || !expiry) return false;
    
    return new Date() < new Date(expiry);
  }

  /**
   * Get current user data from localStorage
   */
  getCurrentUser() {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  }
}

export default new AuthService();
