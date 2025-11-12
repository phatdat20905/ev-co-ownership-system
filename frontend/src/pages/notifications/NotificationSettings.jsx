// src/pages/notifications/NotificationSettings.jsx
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  Bell as BellIcon,
  Mail as EnvelopeIcon,
  Smartphone as DevicePhoneMobileIcon,
  CheckCircle as CheckCircleIcon,
  XCircle as XCircleIcon,
  Settings as Cog6ToothIcon,
} from 'lucide-react';
import notificationService from '../../services/notification.service';
import LoadingSkeleton from '../../components/LoadingSkeleton';

const NotificationSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState({
    email: {
      enabled: true,
      booking_confirmation: true,
      booking_reminder: true,
      booking_cancellation: true,
      payment_due: true,
      payment_received: true,
      vehicle_maintenance: true,
      contract_expiry: true,
      group_notifications: true,
      system_updates: false,
    },
    sms: {
      enabled: false,
      booking_confirmation: false,
      booking_reminder: true,
      booking_cancellation: true,
      payment_due: true,
      payment_received: false,
      vehicle_maintenance: false,
      contract_expiry: true,
      group_notifications: false,
      system_updates: false,
    },
    push: {
      enabled: true,
      booking_confirmation: true,
      booking_reminder: true,
      booking_cancellation: true,
      payment_due: true,
      payment_received: true,
      vehicle_maintenance: true,
      contract_expiry: true,
      group_notifications: true,
      system_updates: true,
    },
  });

  const [channels, setChannels] = useState([]);

  useEffect(() => {
    fetchPreferences();
    fetchChannels();
  }, []);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getPreferences();
      if (response.data) {
        setPreferences(response.data);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
      toast.error('Không thể tải cài đặt thông báo');
    } finally {
      setLoading(false);
    }
  };

  const fetchChannels = async () => {
    try {
      const response = await notificationService.getSubscribedChannels();
      setChannels(response.data || []);
    } catch (error) {
      console.error('Error fetching channels:', error);
    }
  };

  const handleChannelToggle = (channel, enabled) => {
    setPreferences((prev) => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        enabled: enabled,
      },
    }));
  };

  const handleNotificationToggle = (channel, notificationType) => {
    setPreferences((prev) => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        [notificationType]: !prev[channel][notificationType],
      },
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await notificationService.updatePreferences(preferences);
      toast.success('Đã lưu cài đặt thông báo');
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Không thể lưu cài đặt');
    } finally {
      setSaving(false);
    }
  };

  const notificationTypes = [
    { id: 'booking_confirmation', label: 'Xác nhận đặt xe', description: 'Thông báo khi booking được xác nhận' },
    { id: 'booking_reminder', label: 'Nhắc nhở booking', description: 'Nhắc nhở trước giờ sử dụng xe' },
    { id: 'booking_cancellation', label: 'Hủy booking', description: 'Thông báo khi booking bị hủy' },
    { id: 'payment_due', label: 'Thanh toán đến hạn', description: 'Nhắc nhở thanh toán sắp đến hạn' },
    { id: 'payment_received', label: 'Đã nhận thanh toán', description: 'Xác nhận khi thanh toán thành công' },
    { id: 'vehicle_maintenance', label: 'Bảo trì xe', description: 'Thông báo lịch bảo trì và sửa chữa' },
    { id: 'contract_expiry', label: 'Hợp đồng hết hạn', description: 'Nhắc nhở khi hợp đồng sắp hết hạn' },
    { id: 'group_notifications', label: 'Thông báo nhóm', description: 'Hoạt động và thảo luận trong nhóm' },
    { id: 'system_updates', label: 'Cập nhật hệ thống', description: 'Tin tức và cập nhật từ hệ thống' },
  ];

  if (loading) {
    return <LoadingSkeleton.NotificationSettingsSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cài đặt thông báo</h1>
          <p className="text-gray-600 mt-1">Quản lý các kênh và loại thông báo bạn muốn nhận</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <LoadingSkeleton.Skeleton variant="circular" className="w-5 h-5 bg-white" />
              Đang lưu...
            </>
          ) : (
            <>
              <CheckCircleIcon className="w-5 h-5" />
              Lưu cài đặt
            </>
          )}
        </button>
      </div>

      {/* Channel Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Email Notifications */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <EnvelopeIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Email</h3>
                  <p className="text-sm text-gray-600">Nhận qua email</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.email.enabled}
                  onChange={(e) => handleChannelToggle('email', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
          {preferences.email.enabled && (
            <div className="p-4 space-y-3">
              {notificationTypes.map((type) => (
                <div key={type.id} className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={preferences.email[type.id]}
                    onChange={() => handleNotificationToggle('email', type.id)}
                    className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{type.label}</p>
                    <p className="text-xs text-gray-500">{type.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SMS Notifications */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DevicePhoneMobileIcon className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">SMS</h3>
                  <p className="text-sm text-gray-600">Nhận qua tin nhắn</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.sms.enabled}
                  onChange={(e) => handleChannelToggle('sms', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
          </div>
          {preferences.sms.enabled && (
            <div className="p-4 space-y-3">
              {notificationTypes.map((type) => (
                <div key={type.id} className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={preferences.sms[type.id]}
                    onChange={() => handleNotificationToggle('sms', type.id)}
                    className="mt-1 w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{type.label}</p>
                    <p className="text-xs text-gray-500">{type.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Push Notifications */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <BellIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Push</h3>
                  <p className="text-sm text-gray-600">Thông báo trình duyệt</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.push.enabled}
                  onChange={(e) => handleChannelToggle('push', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>
          {preferences.push.enabled && (
            <div className="p-4 space-y-3">
              {notificationTypes.map((type) => (
                <div key={type.id} className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={preferences.push[type.id]}
                    onChange={() => handleNotificationToggle('push', type.id)}
                    className="mt-1 w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{type.label}</p>
                    <p className="text-xs text-gray-500">{type.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Subscribed Channels Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <Cog6ToothIcon className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Lưu ý quan trọng</h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Thông báo quan trọng (booking, thanh toán) được khuyến nghị bật ít nhất 1 kênh</li>
              <li>SMS có thể phát sinh phí từ nhà mạng</li>
              <li>Push notification cần cấp quyền từ trình duyệt</li>
              <li>Email notification được gửi đến địa chỉ email đã đăng ký</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <button
          onClick={() => {
            if (window.confirm('Bạn có chắc muốn tắt tất cả thông báo?')) {
              setPreferences({
                email: { ...preferences.email, enabled: false },
                sms: { ...preferences.sms, enabled: false },
                push: { ...preferences.push, enabled: false },
              });
            }
          }}
          className="text-red-600 hover:text-red-700 font-medium"
        >
          Tắt tất cả thông báo
        </button>
        <div className="flex gap-3">
          <button
            onClick={fetchPreferences}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Hủy thay đổi
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
