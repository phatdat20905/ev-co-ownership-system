import { create } from 'zustand';
import { notificationAPI } from '../api';

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,

  // Fetch all notifications
  fetchNotifications: async () => {
    set({ loading: true, error: null });
    try {
      const response = await notificationAPI.getNotifications();
      // Normalize possible response shapes: response.data.data (service) or response.data (fallback)
      const respData = response?.data;
      const list = Array.isArray(respData?.data)
        ? respData.data
        : Array.isArray(respData)
        ? respData
        : [];
      const unreadCount = Array.isArray(list) ? list.filter(n => !n.isRead && !n.read).length : 0;
      set({ notifications: list, unreadCount, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Lỗi tải thông báo', loading: false });
    }
  },

  // Fetch unread count
  fetchUnreadCount: async () => {
    try {
      const response = await notificationAPI.getUnreadCount();
      set({ unreadCount: response.data.data.count });
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      set((state) => ({
        notifications: state.notifications.map(n =>
          n.id === notificationId ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      }));
    } catch (error) {
      set({ error: error.response?.data?.message || 'Lỗi đánh dấu đã đọc' });
    }
  },

  // Mark all as read
  markAllAsRead: async () => {
    set({ loading: true, error: null });
    try {
      await notificationAPI.markAllAsRead();
      set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, isRead: true })),
        unreadCount: 0,
        loading: false
      }));
    } catch (error) {
      set({ error: error.response?.data?.message || 'Lỗi đánh dấu tất cả', loading: false });
    }
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    try {
      await notificationAPI.deleteNotification(notificationId);
      set((state) => {
        const notification = state.notifications.find(n => n.id === notificationId);
        return {
          notifications: state.notifications.filter(n => n.id !== notificationId),
          unreadCount: notification && !notification.isRead
            ? Math.max(0, state.unreadCount - 1)
            : state.unreadCount
        };
      });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Lỗi xóa thông báo' });
    }
  },

  // Get notification preferences
  getPreferences: async () => {
    try {
      const response = await notificationAPI.getPreferences();
      return response.data.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Lỗi tải cài đặt' });
      throw error;
    }
  },

  // Update notification preferences
  updatePreferences: async (preferences) => {
    set({ loading: true, error: null });
    try {
      const response = await notificationAPI.updatePreferences(preferences);
      set({ loading: false });
      return response.data.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Lỗi cập nhật cài đặt', loading: false });
      throw error;
    }
  },

  // Add notification (for real-time updates)
  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1
    }));
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Reset store
  reset: () => set({
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null
  })
}));
