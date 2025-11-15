import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, MapPin, Calendar, Shield, Bell, CreditCard, FileText, Camera, Save, Edit, CheckCircle, X, Users, Building, Badge, Key } from "lucide-react";
import userService from "../../services/userService";
import { useUserStore } from "../../stores/useUserStore";
import { useAuthStore } from "../../stores/useAuthStore";
import { showSuccessToast, showErrorToast } from "../../utils/toast";

const AdminProfile = () => {
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [activeTab, setActiveTab] = useState("personal");
  const fileInputRef = useRef(null);
  const { user } = useAuthStore();
  const { profile, setProfile } = useUserStore();

  // Fetch admin data from API
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const profileData = await userService.getProfile();
        
        const transformedData = {
          id: profileData.id,
          name: profileData.fullName || user?.email || "Admin",
          email: profileData.email || user?.email,
          phone: profileData.phone || "",
          address: profileData.address || "",
          joinDate: profileData.createdAt?.split('T')[0] || "",
          position: profileData.role === 'admin' ? "Quản trị viên hệ thống" : "Quản trị viên",
          department: "IT & Quản lý hệ thống",
          permissions: profileData.permissions || ["full_access", "user_management", "car_management", "financial_reports"],
          verified: profileData.kycStatus === 'approved',
          avatar: profileData.avatar || null,
          employeeId: `ADM${String(profileData.id).padStart(3, '0')}`,
          accessLevel: profileData.role === 'admin' ? "Super Admin" : "Admin",
          lastLogin: profileData.lastLogin || new Date().toISOString(),
          notificationPreferences: profileData.notificationPreferences || {
            email: true,
            sms: false,
            push: true,
            systemAlerts: true,
            securityAlerts: true,
            reportNotifications: true
          },
          securitySettings: profileData.securitySettings || {
            twoFactor: false,
            sessionTimeout: 30,
            loginAlerts: true,
            passwordExpiry: 90
          }
        };
        
        setAdminData(transformedData);
        setFormData(transformedData);
        setProfile(profileData);
      } catch (error) {
        console.error('Error fetching admin profile:', error);
        showErrorToast(error.response?.data?.message || 'Không thể tải thông tin profile');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [user, setProfile]);

  // Hàm xử lý chọn ảnh
  const handleAvatarClick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  // Hàm xử lý thay đổi ảnh
  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Kích thước ảnh không được vượt quá 5MB");
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert("Vui lòng chọn file ảnh");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const newAvatarUrl = e.target.result;
        setFormData(prev => ({
          ...prev,
          avatar: newAvatarUrl
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const getAvatarUrl = () => {
    if (isEditing) {
      return formData.avatar;
    }
    return adminData?.avatar;
  };

  const handleSave = () => {
    setAdminData(formData);
    setIsEditing(false);
    console.log("Admin data saved:", formData);
  };

  const handleCancel = () => {
    setFormData(adminData);
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

  const tabs = [
    { id: "personal", name: "Thông tin cá nhân", icon: User },
    { id: "security", name: "Bảo mật", icon: Shield },
    { id: "notifications", name: "Thông báo", icon: Bell },
    { id: "permissions", name: "Quyền hạn", icon: Key }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  {[...Array(4)].map((_, i) => (
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">
            Quản trị viên{" "}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Hệ thống
            </span>
          </h1>
          <p className="text-xl text-gray-600 mt-4">
            Quản lý thông tin quản trị viên và thiết lập hệ thống
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
                        {adminData?.name ? adminData.name.charAt(0).toUpperCase() : 'A'}
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
                  {adminData?.name}
                </h2>
                <p className="text-gray-600">{adminData?.position}</p>
                {adminData?.verified && (
                  <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm mt-2">
                    <CheckCircle className="w-4 h-4" />
                    Super Admin
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
                    Quản lý {tabs.find(tab => tab.id === activeTab)?.name.toLowerCase()} của quản trị viên
                  </p>
                </div>
                
                {activeTab === "personal" && (
                  <div className="flex gap-3">
                    {isEditing ? (
                      <>
                        <button
                          onClick={handleCancel}
                          className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                          <X className="w-4 h-4" />
                          Hủy
                        </button>
                        <button
                          onClick={handleSave}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                        >
                          <Save className="w-4 h-4" />
                          Lưu thay đổi
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
                          {adminData?.name}
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
                          <span className="text-gray-900">{adminData?.email}</span>
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
                          <span className="text-gray-900">{adminData?.phone}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mã nhân viên
                      </label>
                      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                        <Badge className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-900">{adminData?.employeeId}</span>
                      </div>
                    </div>

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
                          <span className="text-gray-900">{adminData?.position}</span>
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
                          <span className="text-gray-900">{adminData?.department}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cấp độ truy cập
                      </label>
                      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                        <Shield className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-900">{adminData?.accessLevel}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ngày tham gia
                      </label>
                      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-900">
                          {new Date(adminData?.joinDate).toLocaleDateString("vi-VN")}
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
                        <span className="text-gray-900">{adminData?.address}</span>
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
                          {new Date(adminData?.lastLogin).toLocaleString("vi-VN")}
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
                      Bảo mật hệ thống
                    </h3>
                    <p className="text-blue-700">
                      Cài đặt bảo mật nâng cao cho tài khoản quản trị viên
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
                          checked={formData.securitySettings?.twoFactor}
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
                          checked={formData.securitySettings?.loginAlerts}
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
                          {formData.securitySettings?.sessionTimeout} phút
                        </span>
                      </div>
                      <select 
                        value={formData.securitySettings?.sessionTimeout}
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
                  <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-purple-900 mb-2">
                      Cài đặt thông báo hệ thống
                    </h3>
                    <p className="text-purple-700">
                      Quản lý thông báo cho tài khoản quản trị viên
                    </p>
                  </div>

                  <div className="space-y-4">
                    {Object.entries(formData.notificationPreferences || {}).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                        <div>
                          <h4 className="font-medium text-gray-900 capitalize">
                            {key === 'systemAlerts' ? 'Cảnh báo hệ thống' :
                             key === 'securityAlerts' ? 'Cảnh báo bảo mật' :
                             key === 'reportNotifications' ? 'Thông báo báo cáo' :
                             key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {key === 'systemAlerts' ? 'Nhận cảnh báo quan trọng từ hệ thống' :
                             key === 'securityAlerts' ? 'Cảnh báo về các vấn đề bảo mật' :
                             key === 'reportNotifications' ? 'Thông báo khi có báo cáo mới' :
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

              {activeTab === "permissions" && (
                <div className="space-y-6">
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-amber-900 mb-2">
                      Quyền hạn và Phân quyền
                    </h3>
                    <p className="text-amber-700">
                      Quản lý các quyền truy cập và chức năng của quản trị viên
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 border border-gray-200 rounded-xl">
                      <div className="flex items-center gap-3 mb-4">
                        <Users className="w-6 h-6 text-blue-600" />
                        <h4 className="text-lg font-semibold text-gray-900">Quản lý người dùng</h4>
                      </div>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2 text-gray-700">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Thêm/Xóa người dùng
                        </li>
                        <li className="flex items-center gap-2 text-gray-700">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Phân quyền người dùng
                        </li>
                        <li className="flex items-center gap-2 text-gray-700">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Xem lịch sử người dùng
                        </li>
                      </ul>
                    </div>

                    <div className="p-6 border border-gray-200 rounded-xl">
                      <div className="flex items-center gap-3 mb-4">
                        <CreditCard className="w-6 h-6 text-green-600" />
                        <h4 className="text-lg font-semibold text-gray-900">Quản lý xe</h4>
                      </div>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2 text-gray-700">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Thêm/Xóa xe
                        </li>
                        <li className="flex items-center gap-2 text-gray-700">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Quản lý bảo dưỡng
                        </li>
                        <li className="flex items-center gap-2 text-gray-700">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Theo dõi lịch sử sử dụng
                        </li>
                      </ul>
                    </div>

                    <div className="p-6 border border-gray-200 rounded-xl">
                      <div className="flex items-center gap-3 mb-4">
                        <FileText className="w-6 h-6 text-purple-600" />
                        <h4 className="text-lg font-semibold text-gray-900">Báo cáo & Phân tích</h4>
                      </div>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2 text-gray-700">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Xem báo cáo tài chính
                        </li>
                        <li className="flex items-center gap-2 text-gray-700">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Xuất báo cáo
                        </li>
                        <li className="flex items-center gap-2 text-gray-700">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Phân tích hiệu suất
                        </li>
                      </ul>
                    </div>

                    <div className="p-6 border border-gray-200 rounded-xl">
                      <div className="flex items-center gap-3 mb-4">
                        <Shield className="w-6 h-6 text-red-600" />
                        <h4 className="text-lg font-semibold text-gray-900">Quản trị hệ thống</h4>
                      </div>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2 text-gray-700">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Cấu hình hệ thống
                        </li>
                        <li className="flex items-center gap-2 text-gray-700">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Quản lý sao lưu
                        </li>
                        <li className="flex items-center gap-2 text-gray-700">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          Theo dõi nhật ký hệ thống
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="p-6 border border-blue-200 bg-blue-50 rounded-xl">
                    <h4 className="text-lg font-semibold text-blue-900 mb-2">Tổng quan quyền hạn</h4>
                    <p className="text-blue-700">
                      Tài khoản của bạn có toàn quyền truy cập và quản lý hệ thống. 
                      Đây là cấp độ truy cập cao nhất trong hệ thống.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;