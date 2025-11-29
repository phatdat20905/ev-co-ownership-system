import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { User, Mail, Phone, MapPin, Calendar, Shield, Bell, CreditCard, FileText, Camera, Save, Edit, CheckCircle, X } from "lucide-react";
import { motion } from "framer-motion";
import Header from "../../../../components/layout/Header";
import Footer from "../../../../components/layout/Footer";

export default function Profile() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [activeTab, setActiveTab] = useState("personal");
  const fileInputRef = useRef(null);

  // Mock data với avatar mặc định
  useEffect(() => {
    const fetchUserData = async () => {
      setTimeout(() => {
        const data = {
          id: 1,
          name: "Nguyễn Văn A",
          email: "nguyenvana@example.com",
          phone: "+84 912 345 678",
          address: "123 Nguyễn Huệ, Q.1, TP.HCM",
          joinDate: "2023-01-15",
          membershipType: "Co-owner Premium",
          verified: true,
          avatar: null, // Avatar mặc định - null sẽ dùng avatar mặc định
          idNumber: "012345678901",
          driverLicense: "A123456789",
          notificationPreferences: {
            email: true,
            sms: true,
            push: true,
            bookingReminders: true,
            maintenanceAlerts: true,
            paymentReminders: true
          },
          paymentMethods: [
            {
              id: 1,
              type: "credit_card",
              lastFour: "4242",
              brand: "visa",
              isDefault: true
            },
            {
              id: 2,
              type: "bank_account",
              bankName: "Techcombank",
              accountNumber: "***6789"
            }
          ]
        };
        setUserData(data);
        setFormData(data);
        setLoading(false);
      }, 1000);
    };

    fetchUserData();
  }, []);

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
      // Kiểm tra kích thước file (tối đa 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Kích thước ảnh không được vượt quá 5MB");
        return;
      }

      // Kiểm tra loại file
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
    return userData?.avatar;
  };

  const handleSave = () => {
    // Gọi API để lưu thông tin
    setUserData(formData);
    setIsEditing(false);
    // Trong thực tế: await api.updateProfile(formData);
    console.log("Data saved:", formData);
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

  const tabs = [
    { id: "personal", name: "Thông tin cá nhân", icon: User },
    { id: "security", name: "Bảo mật", icon: Shield },
    { id: "notifications", name: "Thông báo", icon: Bell },
    { id: "payment", name: "Thanh toán", icon: CreditCard },
    { id: "documents", name: "Tài liệu", icon: FileText }
  ];

  if (loading) {
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
                          {userData?.name ? userData.name.charAt(0).toUpperCase() : 'U'}
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
                    {userData?.name}
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
                            className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-xl hover:bg-sky-700 transition-colors"
                          >
                            <Save className="w-4 h-4" />
                            Lưu thay đổi
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
                            value={formData.name || ""}
                            onChange={(e) => handleInputChange("name", e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                          />
                        ) : (
                          <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                            {userData?.name}
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
                            <span className="text-gray-900">{userData?.email}</span>
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
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                          />
                        ) : (
                          <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                            <Phone className="w-5 h-5 text-gray-400" />
                            <span className="text-gray-900">{userData?.phone}</span>
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
                            {new Date(userData?.joinDate).toLocaleDateString("vi-VN")}
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
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                        />
                      ) : (
                        <div className="flex items-start gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                          <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                          <span className="text-gray-900">{userData?.address}</span>
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
                            {userData?.idNumber}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Giấy phép lái xe
                          </label>
                          <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">
                            {userData?.driverLicense}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "security" && (
                  <div className="space-y-6">
                    <div className="bg-sky-50 border border-sky-200 rounded-2xl p-6">
                      <h3 className="text-lg font-semibold text-sky-900 mb-2">
                        Bảo mật tài khoản
                      </h3>
                      <p className="text-sky-700">
                        Bảo vệ tài khoản của bạn bằng các thiết lập bảo mật mạnh mẽ
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                        <div>
                          <h4 className="font-medium text-gray-900">Đổi mật khẩu</h4>
                          <p className="text-sm text-gray-600">Cập nhật mật khẩu định kỳ</p>
                        </div>
                        <button className="px-4 py-2 bg-sky-600 text-white rounded-xl hover:bg-sky-700 transition-colors">
                          Đổi mật khẩu
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                        <div>
                          <h4 className="font-medium text-gray-900">Xác thực 2 yếu tố</h4>
                          <p className="text-sm text-gray-600">Bảo vệ tài khoản tốt hơn</p>
                        </div>
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors">
                          Kích hoạt
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                        <div>
                          <h4 className="font-medium text-gray-900">Thiết bị đang đăng nhập</h4>
                          <p className="text-sm text-gray-600">Quản lý các thiết bị truy cập</p>
                        </div>
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors">
                          Xem chi tiết
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "notifications" && (
                  <div className="space-y-6">
                    <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6">
                      <h3 className="text-lg font-semibold text-purple-900 mb-2">
                        Tùy chỉnh thông báo
                      </h3>
                      <p className="text-purple-700">
                        Chọn loại thông báo bạn muốn nhận
                      </p>
                    </div>

                    <div className="space-y-4">
                      {Object.entries(formData.notificationPreferences || {}).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                          <div>
                            <h4 className="font-medium text-gray-900 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Nhận thông báo qua {key.includes('email') ? 'email' : key.includes('sms') ? 'SMS' : 'ứng dụng'}
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={value}
                              onChange={(e) => handleNotificationChange(key, e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "payment" && (
                  <div className="space-y-6">
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                      <h3 className="text-lg font-semibold text-green-900 mb-2">
                        Phương thức thanh toán
                      </h3>
                      <p className="text-green-700">
                        Quản lý các phương thức thanh toán của bạn
                      </p>
                    </div>

                    <div className="space-y-4">
                      {userData?.paymentMethods?.map((method) => (
                        <div key={method.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                              {method.type === 'credit_card' ? (
                                <CreditCard className="w-6 h-6 text-gray-600" />
                              ) : (
                                <div className="text-xs font-medium text-gray-600">TKNH</div>
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {method.type === 'credit_card' 
                                  ? `Thẻ ${method.brand?.toUpperCase()} •••• ${method.lastFour}`
                                  : `${method.bankName} •••• ${method.accountNumber}`
                                }
                              </h4>
                              <p className="text-sm text-gray-600">
                                {method.isDefault ? "Phương thức mặc định" : "Phương thức thanh toán"}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {method.isDefault && (
                              <span className="px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-sm">
                                Mặc định
                              </span>
                            )}
                            <button className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">
                              Chỉnh sửa
                            </button>
                          </div>
                        </div>
                      ))}

                      <button className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-colors flex items-center justify-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        Thêm phương thức thanh toán
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === "documents" && (
                  <div className="space-y-6">
                    <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6">
                      <h3 className="text-lg font-semibold text-orange-900 mb-2">
                        Tài liệu và hợp đồng
                      </h3>
                      <p className="text-orange-700">
                        Quản lý các tài liệu liên quan đến đồng sở hữu
                      </p>
                    </div>

                    <div className="space-y-4">
                      {[
                        { name: "Hợp đồng đồng sở hữu", date: "2023-01-15", type: "PDF" },
                        { name: "Điều khoản và điều kiện", date: "2023-01-15", type: "PDF" },
                        { name: "Chính sách bảo hiểm", date: "2023-06-20", type: "PDF" },
                        { name: "Giấy tờ xe", date: "2023-01-10", type: "PDF" }
                      ].map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                              <FileText className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{doc.name}</h4>
                              <p className="text-sm text-gray-600">
                                Cập nhật: {new Date(doc.date).toLocaleDateString("vi-VN")}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                              {doc.type}
                            </span>
                            <button className="px-4 py-2 bg-sky-600 text-white rounded-xl hover:bg-sky-700 transition-colors">
                              Tải xuống
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
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