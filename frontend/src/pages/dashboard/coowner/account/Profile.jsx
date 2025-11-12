import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { User, Mail, Phone, MapPin, Calendar, Shield, Bell, CreditCard, FileText, Camera, Save, Edit, CheckCircle, X, Eye, EyeOff, Upload, CheckCircle2, XCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";
import Header from "../../../../components/layout/Header";
import Footer from "../../../../components/layout/Footer";
import { userService, authService } from "../../../../services";
import { showSuccessToast, showErrorToast } from "../../../../utils/toast";

export default function Profile() {
  // Helper: normalize profile fields từ API response sang frontend format
  const normalizeProfile = (p) => {
    if (!p) return {};
    return {
      // Personal info - map từ API fields
      fullName: p.fullName || p.full_name || '',
      name: p.fullName || p.full_name || '', // Alias cho compatibility
      dateOfBirth: p.dateOfBirth || p.date_of_birth || p.dob || '',
      gender: p.gender || null,
      phoneNumber: p.phoneNumber || p.phone_number || p.phone || '',
      phone: p.phoneNumber || p.phone_number || p.phone || '', // Alias
      email: p.email || '',
      address: p.address || '',
      avatarUrl: p.avatarUrl || p.avatar || p.avatar_url || p.avatar_uri || '',
      bio: p.bio || '',
      
      // Additional fields mà component mong đợi
      joinDate: p.createdAt || p.joinDate || new Date().toISOString(),
      verified: p.verified || false,
      membershipType: p.membershipType || 'Thành viên',
      idNumber: p.idNumber || p.id_card_number || '',
      driverLicense: p.driverLicense || p.driver_license || '',
      
      // Preferences và notifications
      preferences: p.preferences || {},
      notificationPreferences: p.notificationPreferences || {
        email: true,
        sms: false,
        push: true
      },
      
      // Payment methods
      paymentMethods: p.paymentMethods || []
    };
  };

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [activeTab, setActiveTab] = useState("personal");
  const fileInputRef = useRef(null);
  
  // Change password state
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // KYC state
  const [showKYCForm, setShowKYCForm] = useState(false);
  const [kycStatus, setKycStatus] = useState(null);
  const [kycData, setKycData] = useState({
    idCardNumber: '',
    driverLicenseNumber: '',
    idCardFront: null,
    idCardBack: null,
    selfie: null,
    driverLicense: null
  });
  const [kycPreviews, setKycPreviews] = useState({
    idCardFront: null,
    idCardBack: null,
    selfie: null,
    driverLicense: null
  });

  // Fetch user data from API
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        console.log('🔄 Đang tải thông tin profile...');
        const response = await userService.getProfile();
        console.log('📥 Profile API response:', response);
        
        if (response && response.success) {
          const normalized = normalizeProfile(response.data || {});
          console.log('🔄 Normalized profile data:', normalized);
          
          setUserData(normalized);
          setFormData(normalized);
        } else {
          console.error('❌ API response không thành công:', response);
          showErrorToast('Không thể tải thông tin người dùng');
        }
      } catch (error) {
        console.error('❌ Failed to fetch user data:', error);
        showErrorToast('Không thể tải thông tin người dùng');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Fetch KYC status
  useEffect(() => {
    const fetchKYCStatus = async () => {
      try {
        const response = await authService.getKYCStatus();
        if (response.success) {
          setKycStatus(response.data);
        }
      } catch (error) {
        // KYC not submitted yet - not an error
        console.log('ℹ️ No KYC submission found');
      }
    };

    fetchKYCStatus();
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
    if (!file) return;

    // Kiểm tra kích thước file (tối đa 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showErrorToast("Kích thước ảnh không được vượt quá 5MB");
      return;
    }

    // Kiểm tra loại file
    if (!file.type.startsWith('image/')) {
      showErrorToast("Vui lòng chọn file ảnh");
      return;
    }

    try {
      setLoading(true);
      
      // Upload avatar to server
      const response = await userService.uploadAvatar(file);
      
      if (response && response.success) {
        const normalized = normalizeProfile(response.data || {});
        setUserData(normalized);
        setFormData(normalized);
        showSuccessToast('Cập nhật ảnh đại diện thành công!');
      }
    } catch (error) {
      showErrorToast(error.response?.data?.message || 'Upload ảnh thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const getAvatarUrl = () => {
    if (isEditing) {
      return formData?.avatarUrl || null;
    }
    return userData?.avatarUrl || null;
  };

  const getDisplayName = () => {
    if (isEditing) {
      return formData?.fullName || formData?.name || 'Người dùng';
    }
    return userData?.fullName || userData?.name || 'Người dùng';
  };

  const getDisplayPhone = () => {
    if (isEditing) {
      return formData?.phoneNumber || formData?.phone || 'Chưa cập nhật';
    }
    return userData?.phoneNumber || userData?.phone || 'Chưa cập nhật';
  };

  const getDisplayEmail = () => {
    if (isEditing) {
      return formData?.email || 'Chưa cập nhật';
    }
    return userData?.email || 'Chưa cập nhật';
  };

  const getDisplayAddress = () => {
    if (isEditing) {
      return formData?.address || 'Chưa cập nhật';
    }
    return userData?.address || 'Chưa cập nhật';
  };

  const getDisplayJoinDate = () => {
    const date = userData?.joinDate || userData?.createdAt;
    if (!date) return 'Chưa cập nhật';
    
    try {
      return new Date(date).toLocaleDateString("vi-VN");
    } catch {
      return 'Chưa cập nhật';
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Chuẩn bị data để gửi lên API
      const updateData = {
        fullName: formData.fullName,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        address: formData.address,
        bio: formData.bio
      };

      console.log('📤 Gửi update data:', updateData);
      
      const response = await userService.updateProfile(updateData);
      
      if (response.success) {
        const normalized = normalizeProfile(response.data || updateData);
        setUserData(normalized);
        setFormData(normalized);
        setIsEditing(false);
        showSuccessToast('Cập nhật thông tin thành công!');
      }
    } catch (error) {
      console.error('❌ Update profile error:', error);
      showErrorToast(error.response?.data?.message || 'Cập nhật thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(userData);
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

  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordData;

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      showErrorToast('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (newPassword !== confirmPassword) {
      showErrorToast('Mật khẩu mới không khớp');
      return;
    }

    if (newPassword.length < 6) {
      showErrorToast('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    try {
      setLoading(true);
      await authService.changePassword(currentPassword, newPassword);
      
      showSuccessToast('Đổi mật khẩu thành công!');
      setShowChangePassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      showErrorToast(error.response?.data?.message || 'Đổi mật khẩu thất bại');
    } finally {
      setLoading(false);
    }
  };

  // KYC Handlers
  const handleKYCFileChange = (field, event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showErrorToast('Chỉ chấp nhận file ảnh');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      showErrorToast('Kích thước file không được vượt quá 10MB');
      return;
    }

    // Update file in state
    setKycData(prev => ({ ...prev, [field]: file }));

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setKycPreviews(prev => ({ ...prev, [field]: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleKYCSubmit = async () => {
    // Validation
    if (!kycData.idCardNumber) {
      showErrorToast('Vui lòng nhập số CCCD/CMT');
      return;
    }

    if (!kycData.idCardFront || !kycData.idCardBack || !kycData.selfie) {
      showErrorToast('Vui lòng upload đầy đủ: CCCD mặt trước, mặt sau và ảnh chân dung');
      return;
    }

    try {
      setLoading(true);

      // Create FormData
      const formData = new FormData();
      formData.append('idCardNumber', kycData.idCardNumber);
      if (kycData.driverLicenseNumber) {
        formData.append('driverLicenseNumber', kycData.driverLicenseNumber);
      }
      formData.append('idCardFront', kycData.idCardFront);
      formData.append('idCardBack', kycData.idCardBack);
      formData.append('selfie', kycData.selfie);
      if (kycData.driverLicense) {
        formData.append('driverLicense', kycData.driverLicense);
      }

      const response = await authService.submitKYC(formData);

      if (response.success) {
        showSuccessToast('Nộp hồ sơ xác thực thành công! Vui lòng chờ admin duyệt.');
        setShowKYCForm(false);
        
        // Reload KYC status
        const statusResponse = await authService.getKYCStatus();
        if (statusResponse.success) {
          setKycStatus(statusResponse.data);
        }

        // Reset form
        setKycData({
          idCardNumber: '',
          driverLicenseNumber: '',
          idCardFront: null,
          idCardBack: null,
          selfie: null,
          driverLicense: null
        });
        setKycPreviews({
          idCardFront: null,
          idCardBack: null,
          selfie: null,
          driverLicense: null
        });
      }
    } catch (error) {
      showErrorToast(error.response?.data?.message || 'Nộp hồ sơ thất bại');
    } finally {
      setLoading(false);
    }
  };

  const getKYCStatusBadge = () => {
    if (!kycStatus) {
      return <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">Chưa xác thực</span>;
    }

    switch (kycStatus.verificationStatus) {
      case 'pending':
        return (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm flex items-center gap-1">
            <Clock className="h-4 w-4" />
            Đang chờ duyệt
          </span>
        );
      case 'approved':
        return (
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center gap-1">
            <CheckCircle2 className="h-4 w-4" />
            Đã xác thực
          </span>
        );
      case 'rejected':
        return (
          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm flex items-center gap-1">
            <XCircle className="h-4 w-4" />
            Bị từ chối
          </span>
        );
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">Chưa xác thực</span>;
    }
  };

  const tabs = [
    { id: "personal", name: "Thông tin cá nhân", icon: User },
    { id: "security", name: "Bảo mật", icon: Shield },
    { id: "notifications", name: "Thông báo", icon: Bell },
    { id: "payment", name: "Thanh toán", icon: CreditCard },
    { id: "documents", name: "Tài liệu", icon: FileText }
  ];

  if (loading && !userData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                    {[...Array(5)].map((_, i) => (
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-20">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">
              Tài khoản{" "}
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                của tôi
              </span>
            </h1>
            <p className="text-xl text-gray-600 mt-4">
              Quản lý thông tin cá nhân và thiết lập tài khoản
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
                      <div className="w-24 h-24 rounded-full mx-auto border-4 border-white shadow-lg bg-sky-600 flex items-center justify-center">
                        <span className="text-white font-bold text-2xl">
                          {getDisplayName().charAt(0).toUpperCase()}
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
                          ? "bg-sky-600 text-white hover:bg-sky-700 cursor-pointer" 
                          : "bg-gray-400 text-gray-200 cursor-not-allowed"
                      }`}
                      disabled={!isEditing}
                      title={isEditing ? "Đổi ảnh đại diện" : "Vào chế độ chỉnh sửa để đổi ảnh"}
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mt-4">
                    {getDisplayName()}
                  </h2>
                  <p className="text-gray-600">{userData?.membershipType}</p>
                  {userData?.verified && (
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
                            ? "bg-sky-50 text-sky-600 border border-sky-200"
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
                      Quản lý {tabs.find(tab => tab.id === activeTab)?.name.toLowerCase()} của bạn
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
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-xl hover:bg-sky-700 transition-colors disabled:opacity-50"
                          >
                            <Save className="w-4 h-4" />
                            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-xl hover:bg-sky-700 transition-colors"
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
                            value={formData.fullName || ""}
                            onChange={(e) => handleInputChange("fullName", e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                          />
                        ) : (
                          <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                            {getDisplayName()}
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
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                          />
                        ) : (
                          <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                            <Mail className="w-5 h-5 text-gray-400" />
                            <span className="text-gray-900">{getDisplayEmail()}</span>
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
                            value={formData.phoneNumber || ""}
                            onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                          />
                        ) : (
                          <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                            <Phone className="w-5 h-5 text-gray-400" />
                            <span className="text-gray-900">{getDisplayPhone()}</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ngày tham gia
                        </label>
                        <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                          <Calendar className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-900">
                            {getDisplayJoinDate()}
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ngày sinh
                        </label>
                        {isEditing ? (
                          <input
                            type="date"
                            value={formData.dateOfBirth || ""}
                            onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                          />
                        ) : (
                          <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                            {userData?.dateOfBirth ? new Date(userData.dateOfBirth).toLocaleDateString("vi-VN") : 'Chưa cập nhật'}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Giới tính
                        </label>
                        {isEditing ? (
                          <select
                            value={formData.gender || ""}
                            onChange={(e) => handleInputChange("gender", e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                          >
                            <option value="">Chọn giới tính</option>
                            <option value="male">Nam</option>
                            <option value="female">Nữ</option>
                            <option value="other">Khác</option>
                          </select>
                        ) : (
                          <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                            {userData?.gender === 'male' ? 'Nam' : 
                             userData?.gender === 'female' ? 'Nữ' : 
                             userData?.gender === 'other' ? 'Khác' : 'Chưa cập nhật'}
                          </div>
                        )}
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
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                        />
                      ) : (
                        <div className="flex items-start gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                          <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                          <span className="text-gray-900">{getDisplayAddress()}</span>
                        </div>
                      )}
                    </div>

                    {/* Thông tin định danh */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Thông tin định danh
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Số CMND/CCCD
                          </label>
                          <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                            {userData?.idNumber || 'Chưa cập nhật'}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Giấy phép lái xe
                          </label>
                          <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                            {userData?.driverLicense || 'Chưa cập nhật'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Các tabs khác giữ nguyên */}
                {activeTab === "security" && (
                  <div className="space-y-6">
                    {/* Security content giữ nguyên */}
                  </div>
                )}

                {activeTab === "notifications" && (
                  <div className="space-y-6">
                    {/* Notifications content giữ nguyên */}
                  </div>
                )}

                {activeTab === "payment" && (
                  <div className="space-y-6">
                    {/* Payment content giữ nguyên */}
                  </div>
                )}

                {activeTab === "documents" && (
                  <div className="space-y-6">
                    {/* Documents content giữ nguyên */}
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}