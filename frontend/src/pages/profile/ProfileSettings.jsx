import { motion } from "framer-motion";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Camera,
  Save,
  Lock,
  Shield
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import userService from "../../services/user.service";
import { showSuccessToast, showErrorToast } from "../../utils/toast";

export default function ProfileSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await userService.getProfile();
      
      if (response.success && response.data) {
        setProfile(response.data);
        setFormData({
          fullName: response.data.fullName || "",
          phone: response.data.phone || "",
          dateOfBirth: response.data.dateOfBirth?.split('T')[0] || "",
          gender: response.data.gender || "",
          address: response.data.address || "",
        });
        
        if (response.data.avatarUrl) {
          setAvatarPreview(response.data.avatarUrl);
        }
      }
    } catch (error) {
      showErrorToast(error.message || "Không thể tải thông tin cá nhân");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showErrorToast("Kích thước ảnh không được vượt quá 5MB");
        return;
      }
      
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate age (18+)
    if (formData.dateOfBirth) {
      const age = new Date().getFullYear() - new Date(formData.dateOfBirth).getFullYear();
      if (age < 18) {
        showErrorToast("Bạn phải từ 18 tuổi trở lên");
        return;
      }
    }

    setSaving(true);
    try {
      // Update profile data
      const updateResponse = await userService.updateProfile(formData);
      
      if (updateResponse.success) {
        // Upload avatar if selected
        if (avatarFile) {
          const formDataAvatar = new FormData();
          formDataAvatar.append('avatar', avatarFile);
          await userService.uploadAvatar(formDataAvatar);
        }
        
        showSuccessToast("Cập nhật thông tin thành công!");
        await fetchProfile();
      }
    } catch (error) {
      showErrorToast(error.message || "Không thể cập nhật thông tin");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-cyan-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-sky-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-cyan-50 flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Cài đặt tài khoản
            </h1>
            <p className="text-gray-600">
              Quản lý thông tin cá nhân và cài đặt bảo mật
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sidebar - Avatar & Quick Actions */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
                {/* Avatar */}
                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-sky-100 shadow-md">
                      {avatarPreview ? (
                        <img 
                          src={avatarPreview} 
                          alt="Avatar" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-sky-400 to-cyan-400 flex items-center justify-center">
                          <User className="h-16 w-16 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <label 
                      htmlFor="avatar-upload"
                      className="absolute bottom-0 right-0 bg-sky-500 hover:bg-sky-600 text-white p-2 rounded-full cursor-pointer shadow-lg transition"
                    >
                      <Camera className="h-5 w-5" />
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-800 mt-4">
                    {profile?.fullName || "Chưa có tên"}
                  </h3>
                  <p className="text-sm text-gray-500">{profile?.email || ""}</p>
                </div>

                {/* Quick Actions */}
                <div className="space-y-2">
                  <button
                    onClick={() => navigate('/profile/kyc-status')}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-sky-50 transition text-left"
                  >
                    <Shield className="h-5 w-5 text-sky-600" />
                    <div>
                      <p className="font-medium text-gray-800">Xác minh KYC</p>
                      <p className="text-xs text-gray-500">Trạng thái: {profile?.kycStatus || "Chưa nộp"}</p>
                    </div>
                  </button>

                  <button
                    onClick={() => navigate('/profile/change-password')}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-sky-50 transition text-left"
                  >
                    <Lock className="h-5 w-5 text-sky-600" />
                    <div>
                      <p className="font-medium text-gray-800">Đổi mật khẩu</p>
                      <p className="text-xs text-gray-500">Cập nhật bảo mật</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content - Profile Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                  <User className="h-5 w-5 text-sky-600" />
                  Thông tin cá nhân
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center border border-gray-300 rounded-xl px-4 py-2 bg-white focus-within:ring-2 focus-within:ring-sky-400 transition">
                      <User className="h-5 w-5 text-gray-400 mr-2" />
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                        placeholder="Nguyễn Văn A"
                        className="w-full bg-transparent outline-none text-gray-700"
                      />
                    </div>
                  </div>

                  {/* Email (Read-only) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <div className="flex items-center border border-gray-200 rounded-xl px-4 py-2 bg-gray-50">
                      <Mail className="h-5 w-5 text-gray-400 mr-2" />
                      <input
                        type="email"
                        value={profile?.email || ""}
                        disabled
                        className="w-full bg-transparent outline-none text-gray-500 cursor-not-allowed"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Email không thể thay đổi</p>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số điện thoại
                    </label>
                    <div className="flex items-center border border-gray-300 rounded-xl px-4 py-2 bg-white focus-within:ring-2 focus-within:ring-sky-400 transition">
                      <Phone className="h-5 w-5 text-gray-400 mr-2" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="0901234567"
                        pattern="[0-9]{10,11}"
                        className="w-full bg-transparent outline-none text-gray-700"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Date of Birth */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ngày sinh
                      </label>
                      <div className="flex items-center border border-gray-300 rounded-xl px-4 py-2 bg-white focus-within:ring-2 focus-within:ring-sky-400 transition">
                        <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleChange}
                          max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                          className="w-full bg-transparent outline-none text-gray-700"
                        />
                      </div>
                    </div>

                    {/* Gender */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Giới tính
                      </label>
                      <div className="flex items-center border border-gray-300 rounded-xl px-4 py-2 bg-white focus-within:ring-2 focus-within:ring-sky-400 transition">
                        <User className="h-5 w-5 text-gray-400 mr-2" />
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          className="w-full bg-transparent outline-none text-gray-700"
                        >
                          <option value="">Chọn giới tính</option>
                          <option value="male">Nam</option>
                          <option value="female">Nữ</option>
                          <option value="other">Khác</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Địa chỉ
                    </label>
                    <div className="flex items-center border border-gray-300 rounded-xl px-4 py-2 bg-white focus-within:ring-2 focus-within:ring-sky-400 transition">
                      <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="123 Lê Lợi, Quận 1, TP.HCM"
                        className="w-full bg-transparent outline-none text-gray-700"
                      />
                    </div>
                  </div>

                  {/* Save Button */}
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-sky-500 to-sky-600 text-white hover:from-sky-600 hover:to-sky-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5" />
                        Lưu thay đổi
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
