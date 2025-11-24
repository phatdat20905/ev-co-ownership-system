// src/components/notifications/NotificationBadge.jsx
import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useNotificationStore } from '../../store/notificationStore';
import NotificationCenter from './NotificationCenter';

export default function NotificationBadge() {
  const [showCenter, setShowCenter] = useState(false);
  const { unreadCount, fetchUnreadCount } = useNotificationStore();

  // Fetch unread count once on mount
  // Real-time updates handled by Socket.IO in Header.jsx and App.jsx
  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  const handleToggle = () => {
    setShowCenter(!showCenter);
  };

  const handleClose = () => {
    setShowCenter(false);
  };

  return (
    <div className="relative">
      {/* Bell Icon with Badge */}
      <button
        onClick={handleToggle}
        className="relative p-2 text-gray-400 hover:text-white focus:outline-none focus:text-white transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-6 w-6" />
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full min-w-[20px]">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Center Dropdown */}
      {showCenter && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={handleClose}
          />
          
          {/* Notification Center Panel */}
          <div className="absolute right-0 top-full mt-2 z-50">
            <NotificationCenter onClose={handleClose} />
          </div>
        </>
      )}
    </div>
  );
}
