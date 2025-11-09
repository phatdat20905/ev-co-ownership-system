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
  Calendar,
  MapPin,
  IdCard,
  Car,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../../components/layout/Footer";
import Header from "../../components/layout/Header";
import { authService } from "../../services";
import { showSuccessToast, showErrorToast } from "../../utils/toast";

export default function Register() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    nationalId: "",
    driverLicense: "",
    password: "",
    confirmPassword: ""
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
    
    setLoading(true);

    try {
      const response = await authService.register({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        address: formData.address,
        nationalId: formData.nationalId,
        driverLicense: formData.driverLicense,
        password: formData.password,
      });

      if (response.success) {
        setShowSuccess(true);
        showSuccessToast('Đăng ký thành công!');
        setTimeout(() => {
          setShowSuccess(false);
          navigate("/verify-identity");
        }, 1500);
      }
    } catch (error) {
      showErrorToast(error.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
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
          className="relative w-full max-w-2xl bg-white/70 backdrop-blur-xl border border-sky-100 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] p-10"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-sky-100/50 via-transparent to-sky-200/40 rounded-3xl blur-2xl -z-10" />

          <h2 className="text-3xl font-bold text-center text-sky-700 mb-2">
            Đăng ký tài khoản
          </h2>
          <p className="text-center text-gray-500 mb-8">
            Tham gia hệ thống đồng sở hữu xe điện
          </p>

          {/* 🔹 Thanh tiến trình động */}
          <div className="relative flex justify-between items-center mb-10">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 rounded-full -translate-y-1/2" />
            <motion.div
              className="absolute top-1/2 left-0 h-1 bg-sky-500 rounded-full -translate-y-1/2"
              initial={{ width: "0%" }}
              animate={{ width: "25%" }} 
              transition={{ duration: 0.6, ease: "easeInOut" }}
            />

            {["Thông tin cơ bản", "Giấy tờ tùy thân", "Xác thực OTP", "Hoàn thành"].map(
              (step, index) => (
                <div key={index} className="relative z-10 flex flex-col items-center w-1/4">
                  <div
                    className={`w-9 h-9 flex items-center justify-center rounded-full border-2 transition-all duration-300 ${
                      index === 0
                        ? "border-sky-500 bg-sky-500 text-white shadow-md"
                        : "border-gray-300 bg-white text-gray-400"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <p
                    className={`text-xs mt-2 transition-colors duration-300 ${
                      index === 0 ? "text-sky-600 font-semibold" : "text-gray-400"
                    }`}
                  >
                    {step}
                  </p>
                </div>
              )
            )}
          </div>

          {/* 🔸 Form */}
          <form
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            onSubmit={handleSubmit}
          >
            <FormInput icon={<User />} label="Họ và tên" placeholder="Nguyễn Văn A" requiredField />
            <FormInput
              icon={<Mail />}
              label="Email"
              type="email"
              placeholder="example@email.com"
              requiredField
            />
            <FormInput
              icon={<Phone />}
              label="Số điện thoại"
              type="tel"
              placeholder="090xxxxxxx"
              requiredField
            />
            <FormInput icon={<Calendar />} label="Ngày sinh" type="date" requiredField />

            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Giới tính <span className="text-red-500">*</span>
              </label>
              <select
                required
                className="w-full border border-gray-200 rounded-xl px-3 py-2 bg-white/80 text-gray-700 focus:ring-2 focus:ring-sky-400 outline-none"
              >
                <option value="">Chọn giới tính</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>

            <FormInput
              icon={<MapPin />}
              label="Địa chỉ"
              placeholder="123 Lê Lợi, Quận 1, TP.HCM"
              requiredField
            />
            <FormInput icon={<IdCard />} label="Số CMND/CCCD" placeholder="0123456789" requiredField />
            <FormInput icon={<Car />} label="Số GPLX" placeholder="123456789" requiredField />

            {/* Mật khẩu */}
            <div className="col-span-2">
              <label className="block text-gray-700 font-medium mb-1">
                Mật khẩu <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center border border-gray-200 rounded-xl px-3 py-2 bg-white/80">
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

            <FormInput
              icon={<Users />}
              label="Người liên hệ khẩn cấp"
              placeholder="Nguyễn Thị B"
              requiredField
            />
            <FormInput
              icon={<Phone />}
              label="SĐT người liên hệ"
              placeholder="090xxxxxxx"
              type="tel"
              requiredField
            />

            <div className="col-span-2">
              <button
                type="submit"
                className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-sky-500 to-sky-600 text-white hover:from-sky-600 hover:to-sky-700 transition-all shadow-md mt-2"
              >
                Tiếp tục
              </button>
              <p className="text-sm text-center text-gray-500 mt-4">
                Đã có tài khoản?{" "}
                <Link to="/login" className="text-sky-600 hover:underline">
                  Đăng nhập ngay
                </Link>
              </p>
            </div>
          </form>
        </motion.div>
      </main>

      {/* Popup đăng ký thành công */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          >
            <motion.div className="bg-white/90 backdrop-blur-xl border border-sky-100 rounded-2xl p-8 flex flex-col items-center shadow-lg">
              <CheckCircle className="w-12 h-12 text-sky-500 mb-4" />
              <h3 className="text-xl font-semibold text-sky-700 mb-2">
                Đăng ký thành công!
              </h3>
              <p className="text-gray-500 text-center">
                Đang chuyển sang bước xác thực giấy tờ...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}

/* ==== COMPONENT INPUT TÁI SỬ DỤNG ==== */
function FormInput({ icon, label, type = "text", placeholder, requiredField = false }) {
  return (
    <div>
      <label className="block text-gray-700 font-medium mb-1">
        {label} {requiredField && <span className="text-red-500">*</span>}
      </label>
      <div className="flex items-center border border-gray-200 rounded-xl px-3 py-2 bg-white/80 focus-within:ring-2 focus-within:ring-sky-400 transition">
        <span className="text-sky-500 mr-2">{icon}</span>
        <input
          type={type}
          required={requiredField}
          placeholder={placeholder}
          className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400"
        />
      </div>
    </div>
  );
}
