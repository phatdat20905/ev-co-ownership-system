import axios from './axios';

export const notificationAPI = {
  // Gửi notification
  sendNotification: async (data) => {
    const response = await axios.post('/notifications', data);
    return response.data;
  },

  // Gửi bulk notification (group announcements)
  sendBulkNotification: async (data) => {
    const response = await axios.post('/notifications/bulk', data); // Changed from '/send' to '/bulk'
    return response.data;
  },

  // Gửi notification theo template
  sendTemplateNotification: async (data) => {
    const response = await axios.post('/notifications/template', data);
    return response.data;
  },

  // Lấy notifications của user
  getUserNotifications: async (userId, params) => {
    const response = await axios.get(`/notifications/user/${userId}`, { params });
    return response.data;
  },

  // Lấy notifications cho current user (list) - return full axios response to match store usage
  getNotifications: async (params) => {
    const response = await axios.get('/notifications', { params });
    return response; // caller expects axios response with .data.data
  },

  // Lấy số lượng chưa đọc (computed locally as backend stats route requires userId)
  getUnreadCount: async () => {
    const response = await axios.get('/notifications');
    // backend returns { data: { notifications: [...], pagination: {...} } }
    const notifications = Array.isArray(response.data?.data?.notifications)
      ? response.data.data.notifications
      : Array.isArray(response.data?.data)
      ? response.data.data
      : Array.isArray(response.data)
      ? response.data
      : [];

    const count = notifications.filter(n => !(n.isRead || n.read)).length;
    // return an axios-like shape to be compatible with callers
    return { data: { data: { count } } };
  },

  // Lấy thống kê notifications
  getNotificationStats: async (userId) => {
    const response = await axios.get(`/notifications/stats/${userId}`);
    return response.data;
  },

  // Đánh dấu đã đọc
  markAsRead: async (notificationId) => {
    const response = await axios.put(`/notifications/${notificationId}/read`);
    return response.data;
  },

  // Xóa notification
  deleteNotification: async (notificationId) => {
    const response = await axios.delete(`/notifications/${notificationId}`);
    return response.data;
  },

  // Preferences - Lấy cài đặt
  getPreferences: async (userId) => {
    const response = await axios.get(`/notifications/preferences/${userId}`);
    return response.data;
  },

  // Preferences - Cập nhật cài đặt
  updatePreferences: async (userId, data) => {
    const response = await axios.put(`/notifications/preferences/${userId}`, data);
    return response.data;
  },

  // Devices - Đăng ký device
  registerDevice: async (data) => {
    const response = await axios.post('/notifications/preferences/devices/register', data);
    return response.data;
  },

  // Devices - Hủy đăng ký device
  unregisterDevice: async (data) => {
    const response = await axios.delete('/notifications/preferences/devices/unregister', { data });
    return response.data;
  },

  // Devices - Lấy danh sách devices
  getUserDevices: async (userId) => {
    const response = await axios.get(`/notifications/preferences/devices/${userId}`);
    return response.data;
  },

  // === FCM PUSH NOTIFICATION ENDPOINTS ===

  // Register FCM token
  registerToken: async (data) => {
    const response = await axios.post('/notifications/register-token', data);
    return response.data;
  },

  // Remove FCM token
  removeToken: async (token) => {
    const response = await axios.delete(`/notifications/token/${token}`);
    return response.data;
  },

  // Get user FCM tokens
  getUserTokens: async (userId) => {
    const response = await axios.get(`/notifications/tokens/${userId}`);
    return response.data;
  },

  // Send push notification
  sendPushNotification: async (data) => {
    const response = await axios.post('/notifications/send', data);
    return response.data;
  },

  // Send topic notification
  sendTopicNotification: async (data) => {
    const response = await axios.post('/notifications/topic/send', data);
    return response.data;
  },

  // Subscribe to topic
  subscribeToTopic: async (data) => {
    const response = await axios.post('/notifications/topic/subscribe', data);
    return response.data;
  },

  // Unsubscribe from topic
  unsubscribeFromTopic: async (data) => {
    const response = await axios.post('/notifications/topic/unsubscribe', data);
    return response.data;
  },

  // Mark all as read
  markAllAsRead: async () => {
    const response = await axios.put('/notifications/read-all');
    return response.data;
  }
};
