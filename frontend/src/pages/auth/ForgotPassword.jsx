import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../../components/layout/Footer";
import Header from "../../components/layout/Header";
import authService from "../../services/auth.service";
import { showSuccessToast, showErrorToast } from "../../utils/toast";

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      showErrorToast("Vui lòng nhập email");
      return;
    }

    setLoading(true);

    try {
      const response = await authService.forgotPassword(email);
      
      if (response.success) {
        setEmailSent(true);
        showSuccessToast("Email đặt lại mật khẩu đã được gửi! Vui lòng kiểm tra hộp thư.");
      } else {
        showErrorToast(response.message || "Có lỗi xảy ra. Vui lòng thử lại.");
      }
    } catch (error) {
      showErrorToast(error.message || "Có lỗi xảy ra. Vui lòng thử lại.");
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
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative w-full max-w-md bg-white/70 backdrop-blur-xl border border-sky-100 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] p-10"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-sky-100/50 via-transparent to-sky-200/40 rounded-3xl blur-2xl -z-10" />

          <h2 className="text-3xl font-bold text-center text-sky-700 mb-2 tracking-tight">
            Quên mật khẩu
          </h2>

          <p className="text-gray-600 text-center mb-6 text-sm">
            {emailSent 
              ? "Email đã được gửi! Kiểm tra hộp thư để đặt lại mật khẩu."
              : "Nhập email của bạn để nhận link đặt lại mật khẩu."
            }
          </p>

          {!emailSent ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Nhập Email */}
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Email
                </label>
                <div className="flex items-center border border-gray-200 rounded-xl px-3 py-2 bg-white/80 focus-within:ring-2 focus-within:ring-sky-400 transition">
                  <Mail className="h-5 w-5 text-sky-500 mr-2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@gmail.com"
                    className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Nút gửi */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-sky-500 to-sky-600 text-white hover:from-sky-600 hover:to-sky-700 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  "Gửi email đặt lại mật khẩu"
                )}
              </button>

              <div className="text-center mt-6">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-sky-600 border border-sky-300 rounded-full bg-sky-50/60 hover:bg-sky-100 hover:text-sky-700 transition-all duration-300 shadow-sm"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Quay lại đăng nhập
                </Link>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <Mail className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">
                  Chúng tôi đã gửi link đặt lại mật khẩu đến:
                </p>
                <p className="text-sky-600 font-semibold mb-4">{email}</p>
                <p className="text-sm text-gray-500">
                  Link có hiệu lực trong 60 phút. Nếu không thấy email, vui lòng kiểm tra thư mục spam.
                </p>
              </div>

              <div className="text-center space-y-3">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-sky-600 border border-sky-300 rounded-full bg-sky-50/60 hover:bg-sky-100 hover:text-sky-700 transition-all duration-300 shadow-sm"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Quay lại đăng nhập
                </Link>
                
                <button
                  onClick={() => setEmailSent(false)}
                  className="block w-full text-sm text-gray-500 hover:text-sky-600 transition"
                >
                  Gửi lại email
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
