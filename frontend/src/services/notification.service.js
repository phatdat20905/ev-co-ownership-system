// src/services/notification.service.js
import apiClient from './api/interceptors.js';
import { getAuthToken } from '../utils/storage.js';

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
   * GET /notifications/user/:userId
   */
  async getNotifications(params = {}) {
    // If caller provides userId, call the backend route /notifications/user/:userId
    const { userId, ...rest } = params || {};
    if (userId) {
      const response = await apiClient.get(`/notifications/user/${userId}`, { params: rest });
      return response;
    }

    // Fallback: attempt generic /notifications (may be unsupported on backend)
    const response = await apiClient.get('/notifications', { params });
    return response;
  }

  /**
   * Get unread notifications
   * GET /notifications/user/:userId?status=unread
   */
  async getUnreadNotifications(userId) {
    if (!userId) throw new Error('userId required for getUnreadNotifications');
    const response = await apiClient.get(`/notifications/user/${userId}`, { params: { status: 'unread', limit: 1 } });
    return response;
  }

  /**
   * Get notification count
   * GET /notifications/stats/:userId
   */
  async getNotificationCount(userId) {
    if (!userId) throw new Error('userId required for getNotificationCount');
    const response = await apiClient.get(`/notifications/stats/${userId}`);
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
    try {
      // Try server-side endpoint first (may not exist)
      const response = await apiClient.put('/notifications/read-all');
      return response;
    } catch (err) {
      // Fallback: caller should handle marking individually
      return { success: false, error: 'Not implemented on server' };
    }
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
      // Use Socket.IO client if available; fallback to dynamic CDN loader that exposes global `io`
      const wsBase = import.meta.env.VITE_WS_URL || 'http://localhost:3008';
    const token = getAuthToken();

      const connectWithIo = () => {
        try {
          // Use global io (from socket.io-client) if present
          const ioClient = (typeof io !== 'undefined') ? io : null;
          if (!ioClient) throw new Error('socket.io client not loaded');

          // Establish socket.io connection with auth token
          this.socket = ioClient(wsBase, {
            path: '/socket.io',
            transports: ['websocket'],
            auth: { token }
          });

          this.socket.on('connect', () => {
            console.log('Socket.IO connected', this.socket.id);
            this.reconnectAttempts = 0;
            // Identify user to server-side socket manager
            if (userId) this.socket.emit('identify', userId);
          });

          this.socket.on('disconnect', (reason) => {
            console.log('Socket.IO disconnected', reason);
          });

          this.socket.on('notification', (payload) => {
            if (onMessage) onMessage(payload);
          });

          this.socket.on('connect_error', (err) => {
            console.error('Socket.IO connect_error', err);
            if (onError) onError(err);
          });

          return this.socket;
        } catch (err) {
          console.warn('Socket.IO client not available:', err.message);
          return null;
        }
      };

      // Try to use an existing global `io`, otherwise inject socket.io client from CDN
      if (typeof io !== 'undefined') {
        // Normalize to always return a Promise so callers can await consistently
        return Promise.resolve(connectWithIo());
      }

      // Dynamically load socket.io-client from CDN and then connect
      const scriptUrl = import.meta.env.VITE_SOCKET_IO_CDN || 'https://cdn.socket.io/4.8.1/socket.io.min.js';
      return new Promise((resolve) => {
        const existing = document.querySelector(`script[src="${scriptUrl}"]`);
        if (existing) {
          existing.addEventListener('load', () => resolve(connectWithIo()));
          existing.addEventListener('error', (e) => {
            console.error('Failed to load socket.io client from CDN', e);
            if (onError) onError(e);
            resolve(null);
          });
          return;
        }

        const script = document.createElement('script');
        script.src = scriptUrl;
        script.async = true;
        script.onload = () => {
          resolve(connectWithIo());
        };
        script.onerror = (e) => {
          console.error('Failed to load socket.io client from CDN', e);
          if (onError) onError(e);
          resolve(null);
        };
        document.head.appendChild(script);
      });
    } catch (error) {
      console.error('Error connecting WebSocket:', error);
      if (onError) {
        onError(error);
      }
      // Always return a Promise for consistent API
      return Promise.resolve(null);
    }
  }

  /**
   * Disconnect WebSocket
   */
  disconnectWebSocket() {
    if (this.socket) {
      try {
        this.socket.disconnect();
      } catch (e) {
        // ignore
      }
      this.socket = null;
      this.reconnectAttempts = 0;
    }
  }

  /**
   * Send message through WebSocket
   * @param {object} message - Message to send
   */
  sendWebSocketMessage(message) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('message', message);
    } else {
      console.warn('WebSocket/socket.io is not connected');
    }
  }

  /**
   * Check if WebSocket is connected
   */
  isWebSocketConnected() {
    return this.socket && this.socket.connected;
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
