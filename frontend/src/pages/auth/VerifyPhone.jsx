import { motion } from "framer-motion";
import { CheckCircle, Loader2, Phone } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../../components/layout/Footer";
import Header from "../../components/layout/Header";

export default function VerifyPhone() {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const inputs = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (inputs.current[0]) inputs.current[0].focus();
  }, []);

  const handleChange = (e, index) => {
    const value = e.target.value.replace(/\D/, ""); // chỉ cho phép số
    if (!value) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (index < 3) inputs.current[index + 1].focus();
  };

  const handleBackspace = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (otp.some((digit) => digit === "")) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/reset-password"); // chuyển sang đổi mật khẩu
    }, 1200);
  };

  const isOtpComplete = otp.every((digit) => digit !== "");

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-sky-50 via-white to-sky-100">
      <Header />
      <main className="flex-grow flex items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative w-full max-w-md bg-white/70 backdrop-blur-xl border border-sky-100 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] p-10 text-center"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-sky-100/50 via-transparent to-sky-200/40 rounded-3xl blur-2xl -z-10" />

          <Phone className="mx-auto h-14 w-14 text-sky-600 mb-4" />
          <h2 className="text-2xl font-bold text-sky-700 mb-3">
            Xác minh số điện thoại của bạn
          </h2>
          <p className="text-gray-600 mb-6">
            Nhập mã xác minh gồm 4 chữ số đã được gửi đến số điện thoại của bạn.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="flex justify-center gap-3 mb-6">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputs.current[index] = el)}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleChange(e, index)}
                  onKeyDown={(e) => handleBackspace(e, index)}
                  className="w-14 h-14 text-center text-lg font-semibold border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white/80 text-gray-700"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={!isOtpComplete || loading}
              className={`w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 shadow-md transition-all
                ${
                  !isOtpComplete || loading
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 hover:shadow-lg"
                }`}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Đang xác minh...
                </>
              ) : (
                <>
                  {isOtpComplete && <CheckCircle className="h-5 w-5" />}
                  Xác minh
                </>
              )}
            </button>

            <p className="text-sm text-gray-500 mt-6">
              Không nhận được mã?{" "}
              <button
                type="button"
                className="text-sky-600 hover:underline"
                onClick={() => alert("Mã xác minh đã được gửi lại!")}
              >
                Gửi lại
              </button>
            </p>

            <p className="text-sm text-gray-500 mt-4">
              <Link to="/login" className="text-sky-600 hover:underline">
                Quay lại đăng nhập
              </Link>
            </p>
          </form>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
