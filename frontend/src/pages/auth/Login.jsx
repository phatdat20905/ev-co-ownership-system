import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, Lock, Mail, Phone } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Footer from "../../components/layout/Footer";
import Header from "../../components/layout/Header";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loginType, setLoginType] = useState("email"); // "email" hoặc "phone"
  const [identifier, setIdentifier] = useState("");

  // Lấy dữ liệu từ localStorage khi load
  useEffect(() => {
    const saved = localStorage.getItem("rememberedLogin");
    if (saved) {
      const data = JSON.parse(saved);
      setIdentifier(data.identifier);
      setLoginType(data.type);
      setRemember(true);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Giả lập đăng nhập
    setTimeout(() => {
      setLoading(false);
      if (remember) {
        localStorage.setItem(
          "rememberedLogin",
          JSON.stringify({ identifier, type: loginType })
        );
      } else {
        localStorage.removeItem("rememberedLogin");
      }
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
            Chào mừng trở lại
          </h2>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Chọn loại đăng nhập */}
            <div className="flex justify-center gap-4 mb-2">
              <button
                type="button"
                onClick={() => setLoginType("email")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
                  loginType === "email"
                    ? "bg-sky-100 border-sky-400 text-sky-600"
                    : "border-gray-200 text-gray-500 hover:border-sky-200"
                }`}
              >
                <Mail className="h-4 w-4" />
                Email
              </button>
              <button
                type="button"
                onClick={() => setLoginType("phone")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
                  loginType === "phone"
                    ? "bg-sky-100 border-sky-400 text-sky-600"
                    : "border-gray-200 text-gray-500 hover:border-sky-200"
                }`}
              >
                <Phone className="h-4 w-4" />
                Số điện thoại
              </button>
            </div>

            {/* Ô nhập */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                {loginType === "email" ? "Email" : "Số điện thoại"}
              </label>
              <div className="flex items-center border border-gray-200 rounded-xl px-3 py-2 bg-white/80 focus-within:ring-2 focus-within:ring-sky-400 transition">
                {loginType === "email" ? (
                  <Mail className="h-5 w-5 text-sky-500 mr-2" />
                ) : (
                  <Phone className="h-5 w-5 text-sky-500 mr-2" />
                )}
                <input
                  type={loginType === "email" ? "email" : "tel"}
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={
                    loginType === "email"
                      ? "example@gmail.com"
                      : "090xxxxxxx"
                  }
                  className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Mật khẩu */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Mật khẩu
              </label>
              <div className="flex items-center border border-gray-200 rounded-xl px-3 py-2 bg-white/80 focus-within:ring-2 focus-within:ring-sky-400 transition">
                <Lock className="h-5 w-5 text-sky-500 mr-2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="ml-2 text-gray-400 hover:text-sky-500 transition"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between mt-3">
                <label className="flex items-center text-sm text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={() => setRemember(!remember)}
                    className="mr-2 accent-sky-500"
                  />
                  Ghi nhớ tôi
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-sky-600 hover:underline"
                >
                  Quên mật khẩu?
                </Link>
              </div>
            </div>

            {/* Nút đăng nhập */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-sky-500 to-sky-600 text-white hover:from-sky-600 hover:to-sky-700 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Đang đăng nhập...
                </>
              ) : (
                "Đăng Nhập"
              )}
            </button>

            <p className="text-sm text-center text-gray-500 mt-6">
              Chưa có tài khoản?{" "}
              <Link to="/register" className="text-sky-600 hover:underline">
                Đăng ký ngay
              </Link>
            </p>
          </form>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
