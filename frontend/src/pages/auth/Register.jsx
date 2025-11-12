import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle,
  Circle,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  User,
  Calendar,
  MapPin,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../../components/layout/Footer";
import Header from "../../components/layout/Header";
import { authService, userService } from "../../services";
import { setAuthToken, setUserData, setAuthExpiry } from "../../utils/storage";
import { showSuccessToast, showErrorToast } from "../../utils/toast";
import LoadingSkeleton from '../../components/LoadingSkeleton';

export default function Register() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    dateOfBirth: "",
    gender: "male",
    address: ""
  });
  const navigate = useNavigate();

  const conditions = [
    { id: 1, label: "Tối thiểu 8 ký tự", valid: password.length >= 8 },
    {
      id: 2,
      label: "Bao gồm chữ, số và ký tự đặc biệt",
      valid: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/.test(password),
    },
    { id: 3, label: "Tối thiểu 3 ký tự khác nhau", valid: new Set(password).size >= 3 },
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
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'password') {
      setPassword(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      showErrorToast('Mật khẩu xác nhận không khớp!');
      return;
    }
    
    // Validate password strength
    if (strength < 3) {
      showErrorToast('Mật khẩu chưa đủ mạnh!');
      return;
    }
    
    // Validate age >= 18
    if (formData.dateOfBirth) {
      const today = new Date();
      const birthDate = new Date(formData.dateOfBirth);
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (age < 18 || (age === 18 && monthDiff < 0)) {
        showErrorToast('Bạn phải đủ 18 tuổi để đăng ký!');
        return;
      }
    }
    
    setLoading(true);

    try {
      // Step 1: Register account (only email, phone, password)
      const registerResponse = await authService.register({
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });

      console.log('Register response:', registerResponse);

      if (registerResponse.success) {
        // If register returns tokens/user, persist auth info so client can call protected endpoints if needed
        try {
          const { accessToken, token, refreshToken, user } = registerResponse.data || {};
          const authToken = accessToken || token;
          if (authToken) {
            // Persist via storage helpers (updates zustand store + localStorage fallback)
            setAuthToken(authToken);
            if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
            if (user) setUserData(user);

            // set expiry (7 days)
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 7);
            setAuthExpiry(expiryDate.toISOString());

            // Trigger storage event for legacy listeners
            window.dispatchEvent(new Event('storage'));
          }
        } catch (e) {
          console.warn('Failed to persist auth tokens after register', e);
        }
        // Step 2: Create profile immediately using returned user info if possible
        const profileData = {
          full_name: formData.fullName,
          date_of_birth: formData.dateOfBirth,
          gender: formData.gender,
          address: formData.address,
          phone: formData.phone,
          email: formData.email,
        };

        // Try to extract userId from register response
        const userId = registerResponse.data?.user?.id || registerResponse.data?.id || registerResponse.data?.userId;

        try {
          if (userId) {
            // attach userId to profile payload for public create endpoint
            profileData.userId = userId;
          }

          // Mark createProfile as a public call so interceptors won't treat 401 as global logout
          const createResp = await userService.createProfile(profileData, { headers: { 'x-skip-auth': '1' } });

          if (createResp && createResp.success) {
            showSuccessToast('Đăng ký và lưu hồ sơ thành công! Vui lòng kiểm tra email để xác thực tài khoản.');
          } else {
            // If creation failed, keep pending data to attempt again after verification
              // store via helper
              const { setPendingProfileData } = require('../../utils/storage');
              setPendingProfileData(profileData);
              showSuccessToast('Đăng ký thành công! Hồ sơ tạm thời được lưu. Vui lòng kiểm tra email để xác thực tài khoản.');
          }
        } catch (profileErr) {
          console.error('Create profile error:', profileErr);
          // Fallback: store pending profile data so VerifyEmail can try later
          const { setPendingProfileData } = require('../../utils/storage');
          setPendingProfileData(profileData);
          showSuccessToast('Đăng ký thành công! Hồ sơ tạm thời được lưu. Vui lòng kiểm tra email để xác thực tài khoản.');
        }

        // Redirect đến trang verify email instructions
        setTimeout(() => {
          navigate("/login");
        }, 1200);
      }
    } catch (error) {
      console.error('Register error:', error);
      showErrorToast(error.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-sky-50 via-white to-sky-100">
      <Header />

      <main className="flex-grow flex items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative w-full max-w-md bg-white/70 backdrop-blur-xl border border-sky-100 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] p-10"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-sky-100/50 via-transparent to-sky-200/40 rounded-3xl blur-2xl -z-10" />

          <h2 className="text-3xl font-bold text-center text-sky-700 mb-2">
            Đăng ký tài khoản
          </h2>
          <p className="text-center text-gray-500 mb-8">
            Tham gia hệ thống đồng sở hữu xe điện
          </p>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Full Name */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center border border-gray-200 rounded-xl px-3 py-2 bg-white/80 focus-within:ring-2 focus-within:ring-sky-400 transition">
                <User className="h-5 w-5 text-sky-500 mr-2" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  placeholder="Nguyễn Văn A"
                  className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center border border-gray-200 rounded-xl px-3 py-2 bg-white/80 focus-within:ring-2 focus-within:ring-sky-400 transition">
                <Mail className="h-5 w-5 text-sky-500 mr-2" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="example@email.com"
                  className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Số điện thoại
              </label>
              <div className="flex items-center border border-gray-200 rounded-xl px-3 py-2 bg-white/80 focus-within:ring-2 focus-within:ring-sky-400 transition">
                <Phone className="h-5 w-5 text-sky-500 mr-2" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="0901234567"
                  pattern="[0-9]{10,15}"
                  className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Tùy chọn - Có thể đăng nhập bằng số điện thoại</p>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Ngày sinh <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center border border-gray-200 rounded-xl px-3 py-2 bg-white/80 focus-within:ring-2 focus-within:ring-sky-400 transition">
                <Calendar className="h-5 w-5 text-sky-500 mr-2" />
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                  max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                  className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Bạn phải đủ 18 tuổi để đăng ký</p>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Giới tính <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center border border-gray-200 rounded-xl px-3 py-2 bg-white/80 focus-within:ring-2 focus-within:ring-sky-400 transition">
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className="w-full bg-transparent outline-none text-gray-700"
                >
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Địa chỉ <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center border border-gray-200 rounded-xl px-3 py-2 bg-white/80 focus-within:ring-2 focus-within:ring-sky-400 transition">
                <MapPin className="h-5 w-5 text-sky-500 mr-2" />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  placeholder="123 Đường ABC, Quận XYZ, TP. HCM"
                  className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Mật khẩu <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center border border-gray-200 rounded-xl px-3 py-2 bg-white/80 focus-within:ring-2 focus-within:ring-sky-400 transition">
                <Lock className="h-5 w-5 text-sky-500 mr-2" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => !password && setIsPasswordFocused(false)}
                  required
                  placeholder="Nhập mật khẩu"
                  className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="ml-2 text-gray-400 hover:text-sky-500 transition"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

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

            {/* Confirm Password */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Xác nhận mật khẩu <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center border border-gray-200 rounded-xl px-3 py-2 bg-white/80 focus-within:ring-2 focus-within:ring-sky-400 transition">
                <Lock className="h-5 w-5 text-sky-500 mr-2" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Nhập lại mật khẩu"
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
              className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-sky-500 to-sky-600 text-white hover:from-sky-600 hover:to-sky-700 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                  <>
                    <LoadingSkeleton.Skeleton variant="circular" className="h-5 w-5" />
                    Đang xử lý...
                  </>
                ) : (
                  "Đăng ký"
                )}
            </button>

            {/* Links */}
            <p className="text-sm text-center text-gray-600 mt-4">
              Đã có tài khoản?{" "}
              <Link to="/login" className="text-sky-600 hover:underline font-medium">
                Đăng nhập ngay
              </Link>
            </p>

            <p className="text-xs text-center text-gray-500 mt-4">
              Bằng việc đăng ký, bạn đồng ý với{" "}
              <Link to="/quy-dinh-hoat-dong" className="text-sky-600 hover:underline">
                Điều khoản dịch vụ
              </Link>{" "}
              và{" "}
              <Link to="/chinh-sach-bao-mat" className="text-sky-600 hover:underline">
                Chính sách bảo mật
              </Link>
            </p>
          </form>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}