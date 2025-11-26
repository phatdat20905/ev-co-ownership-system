import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Footer from "../../components/layout/Footer";
import Header from "../../components/layout/Header";
import { authAPI } from "../../api";
import { showToast } from "../../utils/toast";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("verifying"); // verifying | success | error
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  
  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get("token");
      
      if (!token) {
        const errorMsg = "Thiếu mã xác thực. Vui lòng kiểm tra lại email của bạn.";
        setStatus("error");
        setMessage(errorMsg);
        showToast.error(errorMsg);
        return;
      }

      try {
        const response = await authAPI.verifyEmail(token);
        setStatus("success");
        const successMsg = response.message || "Xác thực email thành công!";
        setMessage(successMsg);
        showToast.success(successMsg);
        
        // Auto redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } catch (error) {
        const errorMsg = error.response?.data?.message || 
          "Xác thực thất bại. Link có thể đã hết hạn hoặc không hợp lệ.";
        setStatus("error");
        setMessage(errorMsg);
        showToast.error(errorMsg);
      }
    };

    verifyToken();
  }, [searchParams, navigate]);

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

          <div className="text-center">
            {status === "verifying" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="w-20 h-20 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Loader2 className="h-10 w-10 text-sky-600 animate-spin" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                  Đang xác thực email...
                </h2>
                <p className="text-gray-600">
                  Vui lòng chờ trong giây lát
                </p>
              </motion.div>
            )}

            {status === "success" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                  Xác thực thành công!
                </h2>
                <p className="text-gray-600 mb-6">
                  {message}
                </p>
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                  <p className="text-sm text-green-700">
                    Tài khoản của bạn đã được kích hoạt. Bạn có thể đăng nhập ngay bây giờ.
                  </p>
                </div>
                <Link
                  to="/login"
                  className="inline-block w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-sky-500 to-sky-600 text-white hover:from-sky-600 hover:to-sky-700 transition-all shadow-md hover:shadow-lg"
                >
                  Đăng nhập ngay
                </Link>
                <p className="text-sm text-gray-500 mt-4">
                  Tự động chuyển hướng sau 3 giây...
                </p>
              </motion.div>
            )}

            {status === "error" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <XCircle className="h-10 w-10 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                  Xác thực thất bại
                </h2>
                <p className="text-gray-600 mb-6">
                  {message}
                </p>
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                  <Mail className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <p className="text-sm text-red-700 mb-2">
                    <strong>Link có thể đã hết hạn</strong>
                  </p>
                  <p className="text-sm text-gray-600">
                    Vui lòng đăng nhập và yêu cầu gửi lại email xác thực.
                  </p>
                </div>
                <div className="space-y-3">
                  <Link
                    to="/login"
                    className="inline-block w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-sky-500 to-sky-600 text-white hover:from-sky-600 hover:to-sky-700 transition-all shadow-md hover:shadow-lg"
                  >
                    Đi đến trang đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    className="inline-block w-full py-3 rounded-xl font-semibold border-2 border-sky-500 text-sky-600 hover:bg-sky-50 transition-all"
                  >
                    Đăng ký lại
                  </Link>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
