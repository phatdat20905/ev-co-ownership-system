// src/components/notifications/NotificationItem.jsx
import { Check, Trash2, Clock, Bell, DollarSign, Car, FileText, Vote, AlertCircle, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

// Icon mapping for different notification types
const ICON_MAP = {
  booking_created: Car,
  booking_cancelled: Car,
  booking_reminder: Car,
  cost_added: DollarSign,
  cost_updated: DollarSign,
  payment_required: DollarSign,
  payment_received: DollarSign,
  payment_reminder: DollarSign,
  contract_signed: FileText,
  contract_approved: FileText,
  contract_rejected: FileText,
  vote_created: Vote,
  vote_closed: Vote,
  ai_fairness_analysis: AlertCircle,
  dispute_created: AlertCircle,
  dispute_updated: AlertCircle,
  dispute_resolved: AlertCircle,
  group_invitation: Users,
  group_member_added: Users,
  group_member_removed: Users,
  system: Bell,
};

// Color mapping for different notification types
const COLOR_MAP = {
  booking_created: 'text-blue-600 bg-blue-100',
  booking_cancelled: 'text-red-600 bg-red-100',
  booking_reminder: 'text-yellow-600 bg-yellow-100',
  cost_added: 'text-green-600 bg-green-100',
  cost_updated: 'text-green-600 bg-green-100',
  payment_required: 'text-orange-600 bg-orange-100',
  payment_received: 'text-green-600 bg-green-100',
  payment_reminder: 'text-orange-600 bg-orange-100',
  contract_signed: 'text-purple-600 bg-purple-100',
  contract_approved: 'text-green-600 bg-green-100',
  contract_rejected: 'text-red-600 bg-red-100',
  vote_created: 'text-indigo-600 bg-indigo-100',
  vote_closed: 'text-gray-600 bg-gray-100',
  ai_fairness_analysis: 'text-pink-600 bg-pink-100',
  dispute_created: 'text-red-600 bg-red-100',
  dispute_updated: 'text-yellow-600 bg-yellow-100',
  dispute_resolved: 'text-green-600 bg-green-100',
  group_invitation: 'text-blue-600 bg-blue-100',
  group_member_added: 'text-green-600 bg-green-100',
  group_member_removed: 'text-red-600 bg-red-100',
  system: 'text-gray-600 bg-gray-100',
};

export default function NotificationItem({ notification, onMarkAsRead, onDelete }) {
  const isUnread = !notification.isRead && !notification.readAt;
  const Icon = ICON_MAP[notification.type] || Bell;
  const colorClass = COLOR_MAP[notification.type] || 'text-gray-600 bg-gray-100';

  const handleClick = () => {
    if (isUnread) {
      onMarkAsRead(notification.id);
    }

    // Navigate to related page if URL provided
    if (notification.data?.url) {
      window.location.href = notification.data.url;
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(notification.id);
  };

  const handleMarkAsRead = (e) => {
    e.stopPropagation();
    onMarkAsRead(notification.id);
  };

  const formatTime = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: vi
      });
    } catch (error) {
      return '';
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer transition-colors ${
        isUnread ? 'bg-blue-50 dark:bg-blue-900/10' : ''
      }`}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}>
          <Icon className="h-5 w-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className={`text-sm font-medium text-gray-900 dark:text-white ${
              isUnread ? 'font-semibold' : ''
            }`}>
              {notification.title}
            </h4>
            
            {/* Unread indicator */}
            {isUnread && (
              <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-1.5" />
            )}
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
            {notification.message || notification.body}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <Clock className="h-3 w-3" />
              <span>{formatTime(notification.createdAt)}</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {isUnread && (
                <button
                  onClick={handleMarkAsRead}
                  className="p-1 text-gray-400 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                  title="Đánh dấu đã đọc"
                >
                  <Check className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={handleDelete}
                className="p-1 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                title="Xóa"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
