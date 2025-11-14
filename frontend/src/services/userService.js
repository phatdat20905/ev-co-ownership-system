import apiClient from '../lib/api/client.js';

/**
 * User Service
 */
class UserService {
  /**
   * Create user profile after email verification
   */
  async createProfile(profileData) {
    return await apiClient.post('/user/profile/create', profileData);
  }

  /**
   * Get current user profile
   */
  async getProfile() {
    return await apiClient.get('/user/profile');
  }

  /**
   * Update user profile
   */
  async updateProfile(profileData) {
    return await apiClient.put('/user/profile', profileData);
  }

  /**
   * Upload user avatar
   */
  async uploadAvatar(formData) {
    return await apiClient.post('/user/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * Search users
   */
  async searchUsers(query) {
    return await apiClient.get('/user/search', { params: { query } });
  }

  /**
   * Get user by ID
   */
  async getUserById(userId) {
    return await apiClient.get(`/user/${userId}`);
  }
}

export default new UserService();
