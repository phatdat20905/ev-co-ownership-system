import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, Eye, EyeOff, CheckCircle, Circle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const navigate = useNavigate(); 

  // Các điều kiện mật khẩu
  const conditions = [
    { id: 1, label: "Tối thiểu 8 ký tự", valid: password.length >= 8 },
    { 
      id: 2, 
      label: "Bao gồm chữ, số và ký tự đặc biệt", 
      valid: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/.test(password) 
    },
    { id: 3, label: "Tối thiểu 3 ký tự khác nhau", valid: new Set(password).size >= 3 },
  ];
  const strength = conditions.filter((c) => c.valid).length;
  const progressWidth = `${(strength / 3) * 100}%`;
  const progressColor =
    strength === 1 ? "bg-red-400" : strength === 2 ? "bg-yellow-400" : strength === 3 ? "bg-green-500" : "bg-gray-200";

  // Xử lý đăng ký
  const handleSubmit = (e) => {
    e.preventDefault();
    setShowSuccess(true); 
    setTimeout(() => {
      setShowSuccess(false);
      navigate("/login");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-sky-50 via-white to-sky-100">
      <Header />

      <main className="flex-grow flex items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative w-full max-w-md bg-white/70 backdrop-blur-xl border border-sky-100 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] p-10"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-sky-100/50 via-transparent to-sky-200/40 rounded-3xl blur-2xl -z-10" />

          <h2 className="text-3xl font-bold text-center text-sky-700 mb-8 tracking-tight">
            Tạo tài khoản mới
          </h2>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Họ và tên */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">Họ và tên</label>
              <div className="flex items-center border border-gray-200 rounded-xl px-3 py-2 bg-white/80 focus-within:ring-2 focus-within:ring-sky-400 transition">
                <User className="h-5 w-5 text-sky-500 mr-2" />
                <input
                  type="text"
                  required
                  placeholder="Nguyễn Văn A"
                  className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">Email</label>
              <div className="flex items-center border border-gray-200 rounded-xl px-3 py-2 bg-white/80 focus-within:ring-2 focus-within:ring-sky-400 transition">
                <Mail className="h-5 w-5 text-sky-500 mr-2" />
                <input
                  type="email"
                  required
                  placeholder="example@gmail.com"
                  className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Mật khẩu */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Mật khẩu đăng nhập
              </label>
              <div className="flex items-center border border-gray-200 rounded-xl px-3 py-2 bg-white/80 focus-within:ring-2 focus-within:ring-sky-400 transition">
                <Lock className="h-5 w-5 text-sky-500 mr-2" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => {
                    if (password === "") setIsPasswordFocused(false);
                  }}
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

                    {/* Điều kiện */}
                    <ul className="mt-3 space-y-1 text-sm">
                      {conditions.map((item) => (
                        <li
                          key={item.id}
                          className={`flex items-center gap-2 ${item.valid ? "text-green-600" : "text-gray-400"}`}
                        >
                          {item.valid ? <CheckCircle className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                          {item.label}
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-gray-500 mt-4">
                      Để bảo vệ tài khoản, vui lòng không tiết lộ mật khẩu cho người khác.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Xác nhận mật khẩu */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">Xác nhận mật khẩu</label>
              <div className="flex items-center border border-gray-200 rounded-xl px-3 py-2 bg-white/80 focus-within:ring-2 focus-within:ring-sky-400 transition">
                <Lock className="h-5 w-5 text-sky-500 mr-2" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
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

            <button
              type="submit"
              className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-sky-500 to-sky-600 text-white hover:from-sky-600 hover:to-sky-700 transition-all shadow-md hover:shadow-lg"
            >
              Đăng Ký
            </button>

            <p className="text-sm text-center text-gray-500 mt-6">
              Đã có tài khoản?{" "}
              <Link to="/login" className="text-sky-600 hover:underline">
                Đăng nhập ngay
              </Link>
            </p>
          </form>
        </motion.div>
      </main>

      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          >
            <motion.div className="bg-white rounded-2xl p-8 flex flex-col items-center shadow-lg">
              <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Đăng ký thành công!
              </h3>
              <p className="text-gray-500 text-center">
                Bạn sẽ được chuyển đến trang đăng nhập...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
