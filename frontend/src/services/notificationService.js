import apiClient from '../lib/api/client.js';

/**
 * Notification Service
 */
class NotificationService {
  /**
   * Send notification
   */
  async sendNotification(notificationData) {
    return await apiClient.post('/notifications', notificationData);
  }

  /**
   * Send template notification
   */
  async sendTemplateNotification(templateData) {
    return await apiClient.post('/notifications/template', templateData);
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(userId) {
    return await apiClient.get(`/notifications/user/${userId}`);
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(userId) {
    return await apiClient.get(`/notifications/stats/${userId}`);
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId) {
    return await apiClient.put(`/notifications/${notificationId}/read`);
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId) {
    return await apiClient.delete(`/notifications/${notificationId}`);
  }
}

export default new NotificationService();
