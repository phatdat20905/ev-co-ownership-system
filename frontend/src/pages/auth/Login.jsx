import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, Lock, Mail, Phone } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../../components/layout/Footer";
import Header from "../../components/layout/Header";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loginType, setLoginType] = useState("email");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  
  const navigate = useNavigate();

  // Tài khoản giả lập - ĐÃ THÊM STAFF
  const demoAccounts = {
    user: {
      email: "user@evcoownership.com",
      phone: "0901234567",
      password: "123456",
      role: "co-owner",
      name: "Nguyễn Văn A",
      membershipType: "Co-owner Basic",
      avatar: "NA"
    },
    admin: {
      email: "admin@evcoownership.com",
      phone: "0909876543",
      password: "123456",
      role: "admin",
      name: "Admin",
      membershipType: "Admin Premium",
      avatar: "NA"
    },
    staff: {
      email: "staff@evcoownership.com",
      phone: "0905555555",
      password: "123456",
      role: "staff",
      name: "Nguyễn Văn B",
      membershipType: "Staff",
      avatar: "NA",
      position: "Nhân viên vận hành",
      department: "Vận hành xe",
      employeeId: "STF002"
    }
  };

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
      let userData = null;

      // Kiểm tra đăng nhập với user
      if (identifier === demoAccounts.user.email && password === demoAccounts.user.password) {
        userData = demoAccounts.user;
      }
      // Kiểm tra đăng nhập với admin
      else if (identifier === demoAccounts.admin.email && password === demoAccounts.admin.password) {
        userData = demoAccounts.admin;
      }
      // KIỂM TRA ĐĂNG NHẬP VỚI STAFF - ĐÃ THÊM
      else if (identifier === demoAccounts.staff.email && password === demoAccounts.staff.password) {
        userData = demoAccounts.staff;
      }

      if (userData) {
        // Lưu thông tin đăng nhập
        const authData = {
          token: "demo-token-" + Date.now(),
          user: {
            ...userData,
            id: userData.role === "admin" ? 2 : userData.role === "staff" ? 3 : 1,
            isVerified: true,
            loginTime: new Date().toISOString()
          },
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        };

        localStorage.setItem("authToken", authData.token);
        localStorage.setItem("userData", JSON.stringify(authData.user));
        localStorage.setItem("authExpires", authData.expiresAt.toISOString());

        if (remember) {
          localStorage.setItem(
            "rememberedLogin",
            JSON.stringify({ identifier, type: loginType })
          );
        } else {
          localStorage.removeItem("rememberedLogin");
        }

        // Trigger storage event để Header cập nhật
        window.dispatchEvent(new Event('storage'));

        // SỬA LẠI PHẦN CHUYỂN HƯỚNG - ĐÃ THÊM STAFF
        if (userData.role === "admin") {
          navigate("/admin");
        } else if (userData.role === "staff") {
          navigate("/staff"); // Route staff trong App.js là "/staff"
        } else {
          navigate("/dashboard/coowner");
        }
      } else {
        alert("Email hoặc mật khẩu không đúng!");
        setLoading(false);
      }
    }, 1500);
  };

  // Xử lý đăng nhập nhanh - ĐÃ THÊM STAFF
  const handleQuickLogin = (accountType) => {
    const account = demoAccounts[accountType];
    setIdentifier(account.email);
    setPassword(account.password);
    setLoginType("email");
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

          {/* Nút đăng nhập nhanh - ĐÃ THÊM STAFF */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleQuickLogin("user")}
              className="py-3 rounded-xl font-semibold bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg text-sm"
            >
              <span>👤 User</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleQuickLogin("staff")}
              className="py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg text-sm"
            >
              <span>👔 Staff</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleQuickLogin("admin")}
              className="py-3 rounded-xl font-semibold bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg text-sm"
            >
              <span>⚡ Admin</span>
            </motion.button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white/70 text-gray-500">Hoặc đăng nhập thủ công</span>
            </div>
          </div>

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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-sky-500 to-sky-600 text-white hover:from-sky-600 hover:to-sky-700 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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

          {/* Thông tin tài khoản demo - ĐÃ CẬP NHẬT VỚI STAFF */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl"
          >
            <p className="text-sm text-amber-800 text-center">
              <strong>Tài khoản Demo:</strong><br />
              👤 <strong>User:</strong> user@evcoownership.com / 123456<br />
              👔 <strong>Staff:</strong> staff@evcoownership.com / 123456<br />
              ⚡ <strong>Admin:</strong> admin@evcoownership.com / 123456
            </p>
          </motion.div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}