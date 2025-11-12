import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  Circle,
  ArrowLeft,
  Shield
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import authService from "../../services/auth.service";
import { showSuccessToast, showErrorToast } from "../../utils/toast";
import LoadingSkeleton from '../../components/LoadingSkeleton';

export default function ChangePassword() {
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  const navigate = useNavigate();

  const conditions = [
    { id: 1, label: "Tối thiểu 8 ký tự", valid: formData.newPassword.length >= 8 },
    {
      id: 2,
      label: "Bao gồm chữ, số và ký tự đặc biệt",
      valid: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/.test(formData.newPassword),
    },
    { 
      id: 3, 
      label: "Tối thiểu 3 ký tự khác nhau", 
      valid: new Set(formData.newPassword).size >= 3 
    },
  ];

  const strength = conditions.filter((c) => c.valid).length;
  const progressWidth = `${(strength / 3) * 100}%`;
  const progressColor =
    strength === 1
      ? "bg-red-400"
      : strength === 2
      ? "bg-yellow-400"
      : strength === 3
      ? "bg-green-500"
      : "bg-gray-200";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate password strength
    if (strength < 3) {
      showErrorToast('Mật khẩu mới chưa đủ mạnh!');
      return;
    }

    // Validate password match
    if (formData.newPassword !== formData.confirmPassword) {
      showErrorToast('Mật khẩu xác nhận không khớp!');
      return;
    }

    // Validate not same as current
    if (formData.currentPassword === formData.newPassword) {
      showErrorToast('Mật khẩu mới không được trùng với mật khẩu hiện tại!');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.changePassword({
        oldPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });

      if (response.success) {
        showSuccessToast('Đổi mật khẩu thành công!');
        
        // Reset form
        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
        
        // Redirect after 2 seconds
        setTimeout(() => {
          navigate('/profile/settings');
        }, 2000);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        showErrorToast('Mật khẩu hiện tại không đúng');
      } else {
        showErrorToast(error.response?.data?.message || error.message || 'Đổi mật khẩu thất bại');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-cyan-50 flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Back Button */}
          <button
            onClick={() => navigate('/profile/settings')}
            className="flex items-center gap-2 text-gray-600 hover:text-sky-600 mb-6 transition"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Quay lại</span>
          </button>

          {/* Card */}
          <div className="bg-white/70 backdrop-blur-xl border border-sky-100 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] p-8 relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-sky-100/50 via-transparent to-sky-200/40 rounded-3xl blur-2xl -z-10" />

            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Đổi mật khẩu
              </h2>
              <p className="text-gray-600 text-sm">
                Cập nhật mật khẩu để bảo mật tài khoản
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Current Password */}
              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">
                  Mật khẩu hiện tại <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center border border-gray-200 rounded-xl px-3 py-2 bg-white/80 focus-within:ring-2 focus-within:ring-sky-400 transition">
                  <Lock className="h-5 w-5 text-sky-500 mr-2" />
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    required
                    placeholder="Nhập mật khẩu hiện tại"
                    className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="ml-2 text-gray-400 hover:text-sky-500 transition"
                  >
                    {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">
                  Mật khẩu mới <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center border border-gray-200 rounded-xl px-3 py-2 bg-white/80 focus-within:ring-2 focus-within:ring-sky-400 transition">
                  <Lock className="h-5 w-5 text-sky-500 mr-2" />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={() => !formData.newPassword && setIsPasswordFocused(false)}
                    required
                    placeholder="Nhập mật khẩu mới"
                    className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="ml-2 text-gray-400 hover:text-sky-500 transition"
                  >
                    {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                <AnimatePresence>
                  {isPasswordFocused && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.4 }}
                      className="overflow-hidden"
                    >
                      <div className="w-full h-2 bg-gray-200 rounded-full mt-3 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${progressColor}`}
                          style={{ width: progressWidth }}
                        />
                      </div>

                      <ul className="mt-3 space-y-1 text-sm">
                        {conditions.map((item) => (
                          <li
                            key={item.id}
                            className={`flex items-center gap-2 ${
                              item.valid ? "text-green-600" : "text-gray-400"
                            }`}
                          >
                            {item.valid ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <Circle className="h-4 w-4" />
                            )}
                            {item.label}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">
                  Xác nhận mật khẩu mới <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center border border-gray-200 rounded-xl px-3 py-2 bg-white/80 focus-within:ring-2 focus-within:ring-sky-400 transition">
                  <Lock className="h-5 w-5 text-sky-500 mr-2" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="Nhập lại mật khẩu mới"
                    className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="ml-2 text-gray-400 hover:text-sky-500 transition"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-sky-500 to-sky-600 text-white hover:from-sky-600 hover:to-sky-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <LoadingSkeleton.Skeleton variant="circular" className="h-5 w-5" />
                    Đang xử lý...
                  </div>
                ) : (
                  "Đổi mật khẩu"
                )}
              </button>
            </form>

            {/* Security Tips */}
            <div className="mt-6 p-4 bg-sky-50 rounded-xl border border-sky-100">
              <h3 className="font-semibold text-gray-800 text-sm mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4 text-sky-600" />
                Mẹo bảo mật
              </h3>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Sử dụng mật khẩu duy nhất cho mỗi tài khoản</li>
                <li>• Không chia sẻ mật khẩu với bất kỳ ai</li>
                <li>• Thay đổi mật khẩu định kỳ (3-6 tháng)</li>
                <li>• Sử dụng trình quản lý mật khẩu</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
