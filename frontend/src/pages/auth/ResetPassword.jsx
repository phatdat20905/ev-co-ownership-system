import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, Circle, Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Footer from "../../components/layout/Footer";
import Header from "../../components/layout/Header";
import { authAPI } from "../../api";
import { showToast } from "../../utils/toast";


export default function ResetPassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get token from URL query params
  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (!tokenParam) {
      setError("Link đặt lại mật khẩu không hợp lệ. Vui lòng yêu cầu link mới.");
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  // Các điều kiện mật khẩu
  const conditions = [
    { id: 1, label: "Tối thiểu 8 ký tự", valid: password.length >= 8 },
    {
      id: 2,
      label: "Bao gồm chữ, số và ký tự đặc biệt",
      valid: /(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9])/.test(password),
    },
    {
      id: 3,
      label: "Tối thiểu 3 ký tự khác nhau",
      valid: new Set(password).size >= 3,
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (!token) {
      const errorMsg = "Link đặt lại mật khẩu không hợp lệ!";
      setError(errorMsg);
      showToast.error(errorMsg);
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      const errorMsg = "Mật khẩu xác nhận không khớp!";
      setError(errorMsg);
      showToast.error(errorMsg);
      setLoading(false);
      return;
    }

    if (strength < 3) {
      const errorMsg = "Mật khẩu chưa đủ mạnh! Vui lòng thỏa mãn tất cả điều kiện.";
      setError(errorMsg);
      showToast.warning(errorMsg);
      setLoading(false);
      return;
    }

    try {
      await authAPI.resetPassword(token, password);

      setSuccess(true);
      showToast.success("Đặt lại mật khẩu thành công! Đang chuyển đến trang đăng nhập...");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Đặt lại mật khẩu thất bại. Link có thể đã hết hạn!";
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
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative w-full max-w-md bg-white/70 backdrop-blur-xl border border-sky-100 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] p-10"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-sky-100/50 via-transparent to-sky-200/40 rounded-3xl blur-2xl -z-10" />

          {!success ? (
            <>
              <h2 className="text-3xl font-bold text-center text-sky-700 mb-8 tracking-tight">
                Đặt lại mật khẩu
              </h2>

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

              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Mật khẩu mới */}
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Mật khẩu mới
                  </label>
                  <div className="flex items-center border border-gray-200 rounded-xl px-3 py-2 bg-white/80 focus-within:ring-2 focus-within:ring-sky-400 transition">
                    <Lock className="h-5 w-5 text-sky-500 mr-2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => {
                        if (password === "") setIsFocused(false);
                      }}
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

                  <AnimatePresence>
                    {isFocused && (
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
                        <p className="text-xs text-gray-500 mt-4">
                          Để bảo vệ tài khoản, vui lòng không tiết lộ mật khẩu
                          cho người khác.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Xác nhận mật khẩu */}
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Xác nhận mật khẩu
                  </label>
                  <div className="flex items-center border border-gray-200 rounded-xl px-3 py-2 bg-white/80 focus-within:ring-2 focus-within:ring-sky-400 transition">
                    <Lock className="h-5 w-5 text-sky-500 mr-2" />
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="Nhập lại mật khẩu mới"
                      className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="ml-2 text-gray-400 hover:text-sky-500 transition"
                    >
                      {showConfirm ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Nút cập nhật */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-sky-500 to-sky-600 text-white hover:from-sky-600 hover:to-sky-700 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Đang cập nhật...
                    </>
                  ) : (
                    "Đặt lại mật khẩu"
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-sky-700 mb-2">
                Mật khẩu đã được đặt lại!
              </h3>
              <p className="text-gray-600 mb-6 text-sm">
                Bạn sẽ được chuyển về trang đăng nhập trong giây lát...
              </p>
            </div>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
