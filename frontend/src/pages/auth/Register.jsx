import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle,
  Circle,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Phone,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../../components/layout/Footer";
import Header from "../../components/layout/Header";
import { useAuthStore } from "../../store";
import { userAPI } from "../../api/user";
import { showToast } from "../../utils/toast";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const navigate = useNavigate();
  const { register } = useAuthStore();

  const conditions = [
    { id: 1, label: "Tối thiểu 8 ký tự", valid: formData.password.length >= 8 },
    {
      id: 2,
      label: "Bao gồm chữ, số và ký tự đặc biệt",
      valid: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/.test(formData.password),
    },
    { id: 3, label: "Tối thiểu 3 ký tự khác nhau", valid: new Set(formData.password).size >= 3 },
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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      showToast.error("Mật khẩu xác nhận không khớp!");
      setLoading(false);
      return;
    }

    if (strength < 3) {
      setError("Mật khẩu chưa đủ mạnh!");
      showToast.warning("Mật khẩu chưa đủ mạnh! Vui lòng thỏa mãn tất cả điều kiện.");
      setLoading(false);
      return;
    }

    try {
      // Step 1: Create pending user profile in user-service (without userId)
      await userAPI.createProfile({
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phone
      });

      // Step 2: Register user in auth-service
      await register({
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: 'co_owner'
      });

      // Show success message
      setRegisteredEmail(formData.email);
      setSuccess(true);
      showToast.success(`Email xác thực đã được gửi đến ${formData.email}`);
      setLoading(false);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại!";
      setError(errorMsg);
      showToast.error(errorMsg);
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
          className="relative w-full max-w-2xl bg-white/70 backdrop-blur-xl border border-sky-100 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] p-10"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-sky-100/50 via-transparent to-sky-200/40 rounded-3xl blur-2xl -z-10" />

          {!success ? (
            <>
              <h2 className="text-3xl font-bold text-center text-sky-700 mb-2">
                Đăng ký tài khoản
              </h2>
              <p className="text-center text-gray-500 mb-8">
                Tham gia hệ thống đồng sở hữu xe điện
              </p>

              {/* Error message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm"
                >
                  {error}
                </motion.div>
              )}

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
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
                  required
                  value={formData.fullName}
                  onChange={handleChange}
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
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@email.com"
                  className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center border border-gray-200 rounded-xl px-3 py-2 bg-white/80 focus-within:ring-2 focus-within:ring-sky-400 transition">
                <Phone className="h-5 w-5 text-sky-500 mr-2" />
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="090xxxxxxx"
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
                  onBlur={() => !formData.password && setIsPasswordFocused(false)}
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

              {/* Password Strength */}
              <AnimatePresence>
                {isPasswordFocused && formData.password && (
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
                      {conditions.map((c) => (
                        <li
                          key={c.id}
                          className={`flex items-center gap-2 ${
                            c.valid ? "text-green-600" : "text-gray-400"
                          }`}
                        >
                          {c.valid ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <Circle className="h-4 w-4" />
                          )}
                          {c.label}
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
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Nhập lại mật khẩu"
                  className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400"
                />
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
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Đang đăng ký...
                </>
              ) : (
                "Đăng ký"
              )}
            </button>

            <p className="text-sm text-center text-gray-500 mt-6">
              Đã có tài khoản?{" "}
              <Link to="/login" className="text-sky-600 hover:underline">
                Đăng nhập ngay
              </Link>
            </p>
          </form>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl"
          >
            <p className="text-sm text-blue-800 text-center">
              Sau khi đăng ký, kiểm tra email để xác thực tài khoản.
            </p>
          </motion.div>
            </>
          ) : (
            /* Success Message */
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="mb-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  Đăng ký thành công!
                </h3>
                <p className="text-gray-600 mb-4">
                  Chúng tôi đã gửi email xác thực đến:
                </p>
                <p className="text-sky-600 font-semibold text-lg mb-6">
                  {registeredEmail}
                </p>
              </div>

              <div className="bg-sky-50 border border-sky-200 rounded-xl p-6 mb-6">
                <Mail className="h-12 w-12 text-sky-500 mx-auto mb-3" />
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Vui lòng kiểm tra hộp thư của bạn</strong>
                </p>
                <p className="text-sm text-gray-600">
                  Nhấp vào link trong email để xác thực tài khoản. Link có hiệu lực trong 24 giờ.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-sky-500 to-sky-600 text-white hover:from-sky-600 hover:to-sky-700 transition-all shadow-md hover:shadow-lg"
                >
                  Đi đến trang đăng nhập
                </button>
                
                <p className="text-sm text-gray-500">
                  Không nhận được email?{" "}
                  <button 
                    onClick={() => setSuccess(false)}
                    className="text-sky-600 hover:underline"
                  >
                    Đăng ký lại
                  </button>
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
