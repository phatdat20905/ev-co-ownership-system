// src/components/notifications/NotificationCenter.jsx
import React, { useState, useEffect } from 'react';
import { Bell, X, Check, Eye, Trash2, Mail, Phone, Calendar, DollarSign, FileText, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../../services/api/interceptors';
import { showSuccessToast, showErrorToast } from '../../utils/toast';

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    // Fetch unread count on mount
    fetchUnreadCount();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/notification/notifications', {
        params: { limit: 20 }
      });
      if (response.success) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await apiClient.get('/notification/notifications', {
        params: { unread: true }
      });
      if (response.success) {
        setUnreadCount(response.data.length);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await apiClient.put(`/notification/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      showErrorToast('Không thể đánh dấu đã đọc');
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.put('/notification/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      showSuccessToast('Đã đánh dấu tất cả là đã đọc');
    } catch (error) {
      showErrorToast('Không thể đánh dấu tất cả');
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await apiClient.delete(`/notification/notifications/${notificationId}`);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      showSuccessToast('Đã xóa thông báo');
    } catch (error) {
      showErrorToast('Không thể xóa thông báo');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'booking': return <Calendar className="w-5 h-5" />;
      case 'payment': return <DollarSign className="w-5 h-5" />;
      case 'contract': return <FileText className="w-5 h-5" />;
      case 'email': return <Mail className="w-5 h-5" />;
      case 'sms': return <Phone className="w-5 h-5" />;
      case 'alert': return <AlertCircle className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  const getColor = (type) => {
    switch (type) {
      case 'booking': return 'bg-blue-100 text-blue-600';
      case 'payment': return 'bg-green-100 text-green-600';
      case 'contract': return 'bg-purple-100 text-purple-600';
      case 'alert': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return notifDate.toLocaleDateString('vi-VN');
  };

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <Bell className="w-6 h-6 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-sky-500 to-cyan-500 p-4 text-white">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Thông báo
                  </h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded-full hover:bg-white/20 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-white/90 hover:text-white flex items-center gap-1"
                  >
                    <Check className="w-4 h-4" />
                    Đánh dấu tất cả đã đọc
                  </button>
                )}
              </div>

              {/* Notifications List */}
              <div className="max-h-[500px] overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500 mx-auto"></div>
                    <p className="mt-2">Đang tải...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Không có thông báo</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`p-4 hover:bg-gray-50 transition-colors ${
                          !notification.isRead ? 'bg-blue-50/30' : ''
                        }`}
                      >
                        <div className="flex gap-3">
                          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getColor(notification.type)}`}>
                            {getIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-semibold text-gray-900 text-sm">
                                {notification.title}
                              </h4>
                              {!notification.isRead && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="text-sky-500 hover:text-sky-600"
                                  title="Đánh dấu đã đọc"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-400">
                                {formatTime(notification.createdAt)}
                              </span>
                              <button
                                onClick={() => deleteNotification(notification.id)}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                                title="Xóa"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="border-t border-gray-200 p-3 text-center">
                  <a
                    href="/dashboard/coowner/notifications"
                    className="text-sm text-sky-600 hover:text-sky-700 font-medium"
                  >
                    Xem tất cả thông báo
                  </a>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
