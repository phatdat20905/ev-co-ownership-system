import { motion } from "framer-motion";
import {
  CheckCircle,
  Circle,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Phone,
  Calendar,
  MapPin,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../../components/layout/Footer";
import Header from "../../components/layout/Header";
import { authService } from "../../services";
import { showSuccessToast, showErrorToast } from "../../utils/toast";

// Form Input Component
const FormInput = ({ icon, label, name, type = "text", value, onChange, placeholder, requiredField }) => (
  <div>
    <label className="block text-gray-700 font-medium mb-1">
      {label} {requiredField && <span className="text-red-500">*</span>}
    </label>
    <div className="flex items-center border border-gray-200 rounded-xl px-3 py-2 bg-white/80 focus-within:ring-2 focus-within:ring-sky-400">
      {icon && <div className="text-sky-500 mr-2">{icon}</div>}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={requiredField}
        placeholder={placeholder}
        className="w-full bg-transparent outline-none text-gray-700"
      />
    </div>
  </div>
);

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Form data
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    gender: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (password !== confirmPassword) {
      showErrorToast("Mật khẩu xác nhận không khớp");
      return;
    }

    if (strength < 3) {
      showErrorToast("Mật khẩu chưa đủ mạnh");
      return;
    }

    const age = new Date().getFullYear() - new Date(formData.dateOfBirth).getFullYear();
    if (age < 18) {
      showErrorToast("Bạn phải từ 18 tuổi trở lên");
      return;
    }

    if (!formData.gender) {
      showErrorToast("Vui lòng chọn giới tính");
      return;
    }

    setLoading(true);
    try {
      // Register user
      const registerData = {
        email: formData.email,
        phone: formData.phone,
        password: password,
        role: "co_owner",
      };

      const authResponse = await authService.register(registerData);
      
      if (authResponse.success) {
        // Store profile data for after verification
        localStorage.setItem("pendingProfile", JSON.stringify({
          fullName: formData.fullName,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          address: formData.address,
        }));

        showSuccessToast("Đăng ký thành công! Vui lòng kiểm tra email để xác thực.");
        navigate("/verify-email", { state: { email: formData.email } });
      }
    } catch (error) {
      showErrorToast(error.message || "Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-cyan-50 flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          className="w-full max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Card container */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-cyan-500 mb-2">
                Đăng ký tài khoản
              </h1>
              <p className="text-gray-600">
                Tạo tài khoản để trải nghiệm dịch vụ sở hữu xe điện
              </p>
            </div>

            {/* Form */}
            <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
              <FormInput
                icon={<User />}
                label="Họ và tên"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Nguyễn Văn A"
                requiredField
              />
              
              <FormInput
                icon={<Mail />}
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="example@email.com"
                requiredField
              />
              
              <FormInput
                icon={<Phone />}
                label="Số điện thoại"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="090xxxxxxx"
                requiredField
              />
              
              <FormInput
                icon={<Calendar />}
                label="Ngày sinh"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                requiredField
              />

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Giới tính <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center border border-gray-200 rounded-xl px-3 py-2 bg-white/80 focus-within:ring-2 focus-within:ring-sky-400">
                  <User className="h-5 w-5 text-sky-500 mr-2" />
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-transparent outline-none text-gray-700"
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
              </div>

              <FormInput
                icon={<MapPin />}
                label="Địa chỉ"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="123 Lê Lợi, Quận 1, TP.HCM"
                requiredField
              />

              {/* Mật khẩu */}
              <div className="col-span-1 md:col-span-2">
                <label className="block text-gray-700 font-medium mb-1">
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center border border-gray-200 rounded-xl px-3 py-2 bg-white/80 focus-within:ring-2 focus-within:ring-sky-400">
                  <Lock className="h-5 w-5 text-sky-500 mr-2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={() => !password && setIsPasswordFocused(false)}
                    required
                    placeholder="Nhập mật khẩu"
                    className="w-full bg-transparent outline-none text-gray-700"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="ml-2 text-gray-400 hover:text-sky-500 transition"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                {/* Password Strength Meter */}
                {isPasswordFocused && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3"
                  >
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${progressColor}`}
                        style={{ width: progressWidth }}
                      />
                    </div>
                    <ul className="mt-2 space-y-1 text-sm">
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
              </div>

              {/* Xác nhận mật khẩu */}
              <div className="col-span-1 md:col-span-2">
                <label className="block text-gray-700 font-medium mb-1">
                  Xác nhận mật khẩu <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center border border-gray-200 rounded-xl px-3 py-2 bg-white/80 focus-within:ring-2 focus-within:ring-sky-400">
                  <Lock className="h-5 w-5 text-sky-500 mr-2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Nhập lại mật khẩu"
                    className="w-full bg-transparent outline-none text-gray-700"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="col-span-1 md:col-span-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-sky-500 to-sky-600 text-white hover:from-sky-600 hover:to-sky-700 transition-all shadow-md mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Đang xử lý..." : "Đăng ký"}
                </button>
                <p className="text-sm text-center text-gray-500 mt-4">
                  Đã có tài khoản?{" "}
                  <Link to="/login" className="text-sky-600 hover:underline font-medium">
                    Đăng nhập ngay
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
