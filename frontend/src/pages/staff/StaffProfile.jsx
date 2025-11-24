import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, MapPin, Calendar, Shield, Bell, Camera, Save, Edit, CheckCircle, X, Building, Clock, Key } from "lucide-react";
import { staffAPI } from "../../api/staff";
import { userAPI } from "../../api/user";
import { useAuthStore } from "../../store/authStore";
import showToast from "../../utils/toast";
import DashboardLayout from "../../components/layout/DashboardLayout";

const StaffProfile = () => {
  const { user } = useAuthStore();
  const [staffData, setStaffData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [activeTab, setActiveTab] = useState("personal");
  const fileInputRef = useRef(null);

  // Normalize user-service profile -> staff UI shape
  const normalizeUserProfile = (user) => {
    if (!user) return null;
    return {
      id: user.id ?? null,
      userId: user.userId ?? null,
      name: user.fullName || user.name || null,
      email: user.email || null,
      phone: user.phoneNumber || user.phone || null,
      address: user.address || null,
      position: user.position || 'Nhân viên',
      // Provide sensible mock defaults when user-service doesn't include org data
      department: user.department || 'Hỗ trợ',
      employeeId: user.employeeId || user.employee_id || null,
      accessLevel: user.accessLevel || 'Nhân viên',
      joinDate: user.createdAt || user.joinDate || null,
      avatar: user.avatarUrl || user.avatar || null,
      verified: user.verified !== undefined ? user.verified : false,
      // If lastLogin missing, mock a recent timestamp (7 days ago) so UI isn't empty
      lastLogin: user.lastLogin || user.last_login || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      notificationPreferences: (user.preferences && user.preferences.notifications) || user.notificationPreferences || {},
      securitySettings: user.securitySettings || user.security_settings || {},
      permissions: user.permissions || []
    };
  };

  // Notification handler for layout
  const handleNotificationRead = async (notificationId) => {
    // Implement notification read logic if needed
  };

  // Fetch staff profile data
  useEffect(() => {
    const fetchStaffData = async () => {
      setLoading(true);
      try {
        // Prefer user-service profile which contains canonical user info
        const resp = await userAPI.getProfile();
        const data = resp.data || resp;
        const normalized = normalizeUserProfile(data);
        setStaffData(normalized);
        setFormData(normalized);
      } catch (error) {
        console.error('Error fetching staff data:', error);
        showToast.error('Đã có lỗi xảy ra khi tải thông tin');
      } finally {
        setLoading(false);
      }
    };

    fetchStaffData();
  }, []);

  // Hàm xử lý chọn ảnh
  const handleAvatarClick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  // Hàm xử lý thay đổi ảnh
  const handleAvatarChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast.error("Kích thước ảnh không được vượt quá 5MB");
        return;
      }

      if (!file.type.startsWith('image/')) {
        showToast.error("Vui lòng chọn file ảnh");
        return;
      }

      // Upload avatar
      setSaving(true);
      try {
        const form = new FormData();
        form.append('avatar', file);
        const result = await userAPI.uploadAvatar(form);
        const resp = result.data || result;
        showToast.success(resp.message || 'Cập nhật ảnh đại diện thành công');
        // Update local state
        const avatarUrl = resp.avatar || resp.avatarUrl || resp;
        setStaffData(prev => ({ ...prev, avatar: avatarUrl }));
        setFormData(prev => ({ ...prev, avatar: avatarUrl }));
      } catch (error) {
        console.error('Error uploading avatar:', error);
        showToast.error('Đã có lỗi khi tải ảnh lên');
      } finally {
        setSaving(false);
      }
    }
  };

  const getAvatarUrl = () => {
    if (isEditing && formData.avatar) {
      return formData.avatar;
    }
    return staffData?.avatar || staffData?.avatarUrl;
  };

  const handleSave = async () => {
    if (!hasChanges()) {
      setIsEditing(false);
      return;
    }

    setSaving(true);
    try {
      // Forward profile updates to user-service canonical profile
      const payload = {
        fullName: formData.name,
        email: formData.email,
        phoneNumber: formData.phone,
        address: formData.address,
        position: formData.position,
        department: formData.department
      };
      const result = await userAPI.updateProfile(payload);
      const resp = result.data || result;
      showToast.success(resp.message || 'Cập nhật thông tin thành công');
      const normalized = normalizeUserProfile(resp);
      setStaffData(normalized);
      setFormData(normalized);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast.error('Đã có lỗi khi cập nhật thông tin');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(staffData);
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNotificationChange = (preference, value) => {
    setFormData(prev => ({
      ...prev,
      notificationPreferences: {
        ...prev.notificationPreferences,
        [preference]: value
      }
    }));
  };

  const handleSecurityChange = (setting, value) => {
    setFormData(prev => ({
      ...prev,
      securitySettings: {
        ...prev.securitySettings,
        [setting]: value
      }
    }));
  };

  // Kiểm tra xem có thay đổi không
  const hasChanges = () => {
    return JSON.stringify(formData) !== JSON.stringify(staffData);
  };

  const tabs = [
    { id: "personal", name: "Thông tin cá nhân", icon: User },
    { id: "security", name: "Bảo mật", icon: Shield },
    { id: "notifications", name: "Thông báo", icon: Bell }
  ];

  if (loading) {
    return (
      <DashboardLayout
        userRole="staff"
        notifications={[]}
        onNotificationRead={handleNotificationRead}
      >
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-4 bg-gray-200 rounded w-full mb-3"></div>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-3">
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-6"></div>
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      userRole="staff"
      notifications={[]}
      onNotificationRead={handleNotificationRead}
    >
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">
            Nhân viên{" "}
            <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Hệ thống
            </span>
          </h1>
          <p className="text-xl text-gray-600 mt-4">
            Quản lý thông tin nhân viên và thiết lập tài khoản
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 sticky top-32">
              {/* Avatar */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  {getAvatarUrl() ? (
                    <img
                      src={getAvatarUrl()}
                      alt="Avatar"
                      className="w-24 h-24 rounded-full mx-auto border-4 border-white shadow-lg object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full mx-auto border-4 border-white shadow-lg bg-blue-600 flex items-center justify-center">
                      <span className="text-white font-bold text-2xl">
                        {staffData?.name ? staffData.name.charAt(0).toUpperCase() : 'S'}
                      </span>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <button 
                    onClick={handleAvatarClick}
                    className={`absolute bottom-0 right-0 p-2 rounded-full shadow-lg transition-colors ${
                      isEditing 
                        ? "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer" 
                        : "bg-gray-400 text-gray-200 cursor-not-allowed"
                    }`}
                    disabled={!isEditing}
                    title={isEditing ? "Đổi ảnh đại diện" : "Vào chế độ chỉnh sửa để đổi ảnh"}
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mt-4">
                  {staffData?.name}
                </h2>
                <p className="text-gray-600">{staffData?.position}</p>
                {staffData?.verified && (
                  <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm mt-2">
                    <CheckCircle className="w-4 h-4" />
                    Đã xác thực
                  </div>
                )}
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                        activeTab === tab.id
                          ? "bg-blue-50 text-blue-600 border border-blue-200"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                      <span className="font-medium">{tab.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100"
            >
              {/* Header với nút Edit/Save */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {tabs.find(tab => tab.id === activeTab)?.name}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Quản lý {tabs.find(tab => tab.id === activeTab)?.name.toLowerCase()} của nhân viên
                  </p>
                </div>
                
                {/* Hiển thị nút điều khiển phù hợp với từng tab */}
                {activeTab === "personal" ? (
                  <div className="flex gap-3">
                    {isEditing ? (
                      <>
                        <button
                          onClick={handleCancel}
                          disabled={saving}
                          className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <X className="w-4 h-4" />
                          Hủy
                        </button>
                        <button
                          onClick={handleSave}
                          disabled={!hasChanges() || saving}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                            hasChanges() && !saving
                              ? "bg-blue-600 text-white hover:bg-blue-700" 
                              : "bg-gray-300 text-gray-500 cursor-not-allowed"
                          }`}
                        >
                          <Save className="w-4 h-4" />
                          {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        Chỉnh sửa
                      </button>
                    )}
                  </div>
                ) : (
                  // Nút lưu cho các tab khác
                  <div className="flex gap-3">
                    <button
                      onClick={handleCancel}
                      disabled={!hasChanges() || saving}
                      className={`flex items-center gap-2 px-4 py-2 border rounded-xl transition-colors ${
                        hasChanges() && !saving
                          ? "text-gray-600 border-gray-300 hover:bg-gray-50"
                          : "text-gray-400 border-gray-200 cursor-not-allowed"
                      }`}
                    >
                      <X className="w-4 h-4" />
                      Hủy
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={!hasChanges() || saving}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                        hasChanges() && !saving
                          ? "bg-blue-600 text-white hover:bg-blue-700" 
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      <Save className="w-4 h-4" />
                      {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                  </div>
                )}
              </div>

              {/* Tab Content */}
              {activeTab === "personal" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Họ và tên
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.name || ""}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                      ) : (
                        <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                          {staffData?.name}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      {isEditing ? (
                        <input
                          type="email"
                          value={formData.email || ""}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                      ) : (
                        <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                          <Mail className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-900">{staffData?.email}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số điện thoại
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={formData.phone || ""}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                      ) : (
                        <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                          <Phone className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-900">{staffData?.phone}</span>
                        </div>
                      )}
                    </div>

                    {/* employeeId removed - not used */}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Chức vụ
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.position || ""}
                          onChange={(e) => handleInputChange("position", e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                      ) : (
                        <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                          <User className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-900">{staffData?.position}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phòng ban
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.department || ""}
                          onChange={(e) => handleInputChange("department", e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                      ) : (
                        <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                          <Building className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-900">{staffData?.department}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cấp độ truy cập
                      </label>
                      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                        <Shield className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-900">{staffData?.accessLevel || 'Nhân viên'}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ngày tham gia
                      </label>
                      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-900">
                          {staffData?.joinDate ? new Date(staffData.joinDate).toLocaleDateString("vi-VN") : 'Chưa có'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Địa chỉ
                    </label>
                    {isEditing ? (
                      <textarea
                        value={formData.address || ""}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    ) : (
                      <div className="flex items-start gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                        <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                        <span className="text-gray-900">{staffData?.address}</span>
                      </div>
                    )}
                  </div>

                  {/* Thông tin đăng nhập */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Thông tin đăng nhập
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Đăng nhập lần cuối
                        </label>
                        <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                          {staffData?.lastLogin ? new Date(staffData.lastLogin).toLocaleString("vi-VN") : "Chưa đăng nhập"}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Trạng thái tài khoản
                        </label>
                        <div className="px-4 py-3 bg-green-50 text-green-700 rounded-xl font-medium">
                          Đang hoạt động
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">
                      Bảo mật tài khoản
                    </h3>
                    <p className="text-blue-700">
                      Bảo vệ tài khoản của bạn bằng các thiết lập bảo mật
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                      <div>
                        <h4 className="font-medium text-gray-900">Đổi mật khẩu</h4>
                        <p className="text-sm text-gray-600">Cập nhật mật khẩu định kỳ để bảo mật tốt hơn</p>
                      </div>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                        Đổi mật khẩu
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                      <div>
                        <h4 className="font-medium text-gray-900">Xác thực 2 yếu tố (2FA)</h4>
                        <p className="text-sm text-gray-600">Bảo vệ tài khoản bằng mã xác thực</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.securitySettings?.twoFactor || false}
                          onChange={(e) => handleSecurityChange("twoFactor", e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                      <div>
                        <h4 className="font-medium text-gray-900">Cảnh báo đăng nhập</h4>
                        <p className="text-sm text-gray-600">Nhận thông báo khi có đăng nhập mới</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.securitySettings?.loginAlerts || false}
                          onChange={(e) => handleSecurityChange("loginAlerts", e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="p-4 border border-gray-200 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">Thời gian timeout phiên làm việc</h4>
                          <p className="text-sm text-gray-600">Tự động đăng xuất sau khi không hoạt động</p>
                        </div>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                          {formData.securitySettings?.sessionTimeout || 30} phút
                        </span>
                      </div>
                      <select 
                        value={formData.securitySettings?.sessionTimeout || 30}
                        onChange={(e) => handleSecurityChange("sessionTimeout", parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value={15}>15 phút</option>
                        <option value={30}>30 phút</option>
                        <option value={60}>1 giờ</option>
                        <option value={120}>2 giờ</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">
                      Cài đặt thông báo
                    </h3>
                    <p className="text-blue-700">
                      Chọn loại thông báo bạn muốn nhận
                    </p>
                  </div>

                  <div className="space-y-4">
                    {formData.notificationPreferences && Object.entries(formData.notificationPreferences).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                        <div>
                          <h4 className="font-medium text-gray-900 capitalize">
                            {key === 'bookingAlerts' ? 'Cảnh báo đặt lịch' :
                             key === 'serviceAlerts' ? 'Cảnh báo dịch vụ' :
                             key === 'systemUpdates' ? 'Cập nhật hệ thống' :
                             key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {key === 'bookingAlerts' ? 'Thông báo khi có đặt lịch mới' :
                             key === 'serviceAlerts' ? 'Cảnh báo dịch vụ cần xử lý' :
                             key === 'systemUpdates' ? 'Cập nhật từ hệ thống' :
                             `Nhận thông báo qua ${key.includes('email') ? 'email' : key.includes('sms') ? 'SMS' : 'ứng dụng'}`}
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => handleNotificationChange(key, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
      </DashboardLayout>
    );
};

export default StaffProfile;