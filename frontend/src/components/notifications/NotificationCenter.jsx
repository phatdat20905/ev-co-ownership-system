import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, Eye, Trash2, Mail, Phone, Calendar, DollarSign, FileText, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import notificationService from '../../services/notification.service';
import { useUserStore } from '../../stores/useUserStore';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import { showSuccessToast, showErrorToast } from '../../utils/toast';

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [endpointAvailable, setEndpointAvailable] = useState(true); // Track if endpoint exists

  const user = useUserStore(state => state.user);
  const userId = user?.id; // Extract only userId

  // Refs to manage polling lifecycle
  const pollRef = useRef(null);
  const lastFetchTs = useRef(0);
  const consecutiveErrorCount = useRef(0);
  const MAX_CONSECUTIVE_ERRORS = 3;

  // Fetch notifications when panel opens
  useEffect(() => {
    if (isOpen && endpointAvailable) {
      fetchNotifications();
    }
  }, [isOpen, endpointAvailable]);

  // Polling effect - chỉ phụ thuộc vào userId
  useEffect(() => {
    if (!userId || !endpointAvailable) return;

    // Fetch initial unread count
    fetchUnreadCount();

    // Setup polling only if endpoint is available
    if (!pollRef.current) {
      const POLL_INTERVAL = Number(import.meta.env.VITE_NOTIF_POLL_INTERVAL_MS) || 60000; // default 60s
      pollRef.current = setInterval(() => {
        if (endpointAvailable) fetchUnreadCount();
      }, POLL_INTERVAL);
    }

    // Cleanup
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [userId, endpointAvailable]); // Chỉ phụ thuộc vào userId và endpointAvailable

  const fetchNotifications = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const response = await notificationService.getNotifications({ 
        userId: userId, 
        limit: 20 
      });
      
      if (response && response.success) {
        setNotifications(response.data.notifications || []);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    if (!userId) return;

    // Debounce duplicate calls
    const now = Date.now();
    if (now - lastFetchTs.current < 2000) return; // 2 second debounce
    lastFetchTs.current = now;

    try {
      const response = await notificationService.getNotifications({ 
        userId: userId, 
        status: 'unread', 
        limit: 1 
      });
      
      if (response && response.success) {
        const total = response.data?.pagination?.total ?? 0;
        setUnreadCount(Number(total) || 0);
        // reset error counter on success
        consecutiveErrorCount.current = 0;
      }
    } catch (error) {
      handleApiError(error);
      // increment error counter and disable after threshold
      consecutiveErrorCount.current += 1;
      if (consecutiveErrorCount.current >= MAX_CONSECUTIVE_ERRORS) {
        console.warn('Notification API failing repeatedly; disabling polling');
        setEndpointAvailable(false);
        if (pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
      }
    }
  };

  // Centralized API error handling
  const handleApiError = (error) => {
    const status = error?.response?.status;

    if (status === 404) {
      console.warn('Notifications endpoint not found (404). Disabling notifications.');
      setEndpointAvailable(false);
      setUnreadCount(0);

      // Stop polling
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      return;
    }

    // For other errors, log and increment error counter elsewhere
    console.error('Notification API error:', error);
  };

  const markAsRead = async (notificationId) => {
    if (!endpointAvailable) return;
    
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      showErrorToast('Không thể đánh dấu đã đọc');
    }
  };

  const markAllAsRead = async () => {
    if (!endpointAvailable) return;
    
    try {
      const resp = await notificationService.getNotifications({ 
        userId: userId, 
        status: 'unread', 
        limit: 100 
      });
      
      if (resp && resp.success) {
        const unread = resp.data.notifications || [];
        await Promise.all(unread.map(n => notificationService.markAsRead(n.id)));
      }
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      showSuccessToast('Đã đánh dấu tất cả là đã đọc');
    } catch (error) {
      console.error('markAllAsRead error', error);
      showErrorToast('Không thể đánh dấu tất cả');
    }
  };

  const deleteNotification = async (notificationId) => {
    if (!endpointAvailable) return;
    
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      showSuccessToast('Đã xóa thông báo');
    } catch (error) {
      showErrorToast('Không thể xóa thông báo');
    }
  };

  // ... giữ nguyên các hàm helper (getIcon, getColor, formatTime)

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
        disabled={!endpointAvailable} // Disable if endpoint not available
        title={!endpointAvailable ? "Tính năng thông báo tạm thời không khả dụng" : "Thông báo"}
      >
        <Bell className={`w-6 h-6 ${endpointAvailable ? 'text-gray-600' : 'text-gray-400'}`} />
        {endpointAvailable && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel - chỉ hiển thị nếu endpoint available */}
      <AnimatePresence>
        {isOpen && endpointAvailable && (
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
              {/* Header và content giữ nguyên */}
              {/* ... */}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Hiển thị thông báo nếu endpoint không available */}
      {!endpointAvailable && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded whitespace-nowrap">
          Thông báo tạm ngừng
        </div>
      )}
    </div>
  );
}