// src/services/notification.service.js
import apiClient from './api/interceptors.js';

/**
 * Notification Service
 * Handles notifications, preferences, and WebSocket connections
 */
class NotificationService {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
  }

  // ==================== NOTIFICATIONS ====================

  /**
   * Get user notifications
   * GET /notifications
   */
  async getNotifications(params = {}) {
    const response = await apiClient.get('/notifications', { params });
    return response;
  }

  /**
   * Get unread notifications
   * GET /notifications/unread
   */
  async getUnreadNotifications() {
    const response = await apiClient.get('/notifications/unread');
    return response;
  }

  /**
   * Get notification count
   * GET /notifications/count
   */
  async getNotificationCount() {
    const response = await apiClient.get('/notifications/count');
    return response;
  }

  /**
   * Mark notification as read
   * PUT /notifications/:notificationId/read
   */
  async markAsRead(notificationId) {
    const response = await apiClient.put(`/notifications/${notificationId}/read`);
    return response;
  }

  /**
   * Mark all notifications as read
   * PUT /notifications/read-all
   */
  async markAllAsRead() {
    const response = await apiClient.put('/notifications/read-all');
    return response;
  }

  /**
   * Delete notification
   * DELETE /notifications/:notificationId
   */
  async deleteNotification(notificationId) {
    const response = await apiClient.delete(`/notifications/${notificationId}`);
    return response;
  }

  /**
   * Delete all notifications
   * DELETE /notifications/all
   */
  async deleteAllNotifications() {
    const response = await apiClient.delete('/notifications/all');
    return response;
  }

  // ==================== PREFERENCES ====================

  /**
   * Get notification preferences
   * GET /notifications/preferences
   */
  async getPreferences() {
    const response = await apiClient.get('/notifications/preferences');
    return response;
  }

  /**
   * Update notification preferences
   * PUT /notifications/preferences
   */
  async updatePreferences(preferences) {
    const response = await apiClient.put('/notifications/preferences', preferences);
    return response;
  }

  /**
   * Update email preferences
   * PUT /notifications/preferences/email
   */
  async updateEmailPreferences(emailPreferences) {
    const response = await apiClient.put('/notifications/preferences/email', emailPreferences);
    return response;
  }

  /**
   * Update SMS preferences
   * PUT /notifications/preferences/sms
   */
  async updateSMSPreferences(smsPreferences) {
    const response = await apiClient.put('/notifications/preferences/sms', smsPreferences);
    return response;
  }

  /**
   * Update push preferences
   * PUT /notifications/preferences/push
   */
  async updatePushPreferences(pushPreferences) {
    const response = await apiClient.put('/notifications/preferences/push', pushPreferences);
    return response;
  }

  // ==================== CHANNELS ====================

  /**
   * Subscribe to notification channel
   * POST /notifications/channels/:channel/subscribe
   */
  async subscribeToChannel(channel) {
    const response = await apiClient.post(`/notifications/channels/${channel}/subscribe`);
    return response;
  }

  /**
   * Unsubscribe from notification channel
   * POST /notifications/channels/:channel/unsubscribe
   */
  async unsubscribeFromChannel(channel) {
    const response = await apiClient.post(`/notifications/channels/${channel}/unsubscribe`);
    return response;
  }

  /**
   * Get subscribed channels
   * GET /notifications/channels
   */
  async getSubscribedChannels() {
    const response = await apiClient.get('/notifications/channels');
    return response;
  }

  // ==================== WEBSOCKET ====================

  /**
   * Connect to WebSocket for real-time notifications
   * @param {string} userId - User ID
   * @param {function} onMessage - Callback for received messages
   * @param {function} onError - Callback for errors
   */
  connectWebSocket(userId, onMessage, onError) {
    try {
      // Get WebSocket URL from environment or default
      const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3007/ws';
      const token = localStorage.getItem('accessToken');

      // Create WebSocket connection with auth token
      this.ws = new WebSocket(`${wsUrl}?token=${token}&userId=${userId}`);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (onMessage) {
            onMessage(data);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        if (onError) {
          onError(error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        // Attempt to reconnect
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
          setTimeout(() => {
            this.connectWebSocket(userId, onMessage, onError);
          }, this.reconnectDelay);
        }
      };

      return this.ws;
    } catch (error) {
      console.error('Error connecting WebSocket:', error);
      if (onError) {
        onError(error);
      }
      return null;
    }
  }

  /**
   * Disconnect WebSocket
   */
  disconnectWebSocket() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.reconnectAttempts = 0;
    }
  }

  /**
   * Send message through WebSocket
   * @param {object} message - Message to send
   */
  sendWebSocketMessage(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  /**
   * Check if WebSocket is connected
   */
  isWebSocketConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  // ==================== TEMPLATES ====================

  /**
   * Get notification templates
   * GET /notifications/templates
   */
  async getTemplates() {
    const response = await apiClient.get('/notifications/templates');
    return response;
  }

  /**
   * Get template by ID
   * GET /notifications/templates/:templateId
   */
  async getTemplate(templateId) {
    const response = await apiClient.get(`/notifications/templates/${templateId}`);
    return response;
  }

  /**
   * Create custom notification
   * POST /notifications/custom
   */
  async createCustomNotification(notificationData) {
    const response = await apiClient.post('/notifications/custom', notificationData);
    return response;
  }

  // ==================== HISTORY ====================

  /**
   * Get notification history
   * GET /notifications/history
   */
  async getHistory(params = {}) {
    const response = await apiClient.get('/notifications/history', { params });
    return response;
  }

  /**
   * Export notification history
   * GET /notifications/history/export
   */
  async exportHistory(format = 'csv') {
    const response = await apiClient.get('/notifications/history/export', {
      params: { format },
      responseType: 'blob',
    });
    return response;
  }
}

export default new NotificationService();
