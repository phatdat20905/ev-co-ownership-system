import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Shield, ArrowLeft } from "lucide-react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

export default function VerifyOTP() {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [showSuccess, setShowSuccess] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  const steps = [
    "Thông tin cơ bản",
    "Giấy tờ tùy thân",
    "Xác thực OTP",
    "Hoàn thành",
  ];
  const currentStep = 3;

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 3) inputRefs.current[index + 1].focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (otp.some((d) => d === "")) {
      alert("Vui lòng nhập đủ 4 số OTP!");
      return;
    }
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      navigate("/verify-success");
    }, 1500);
  };

  const isOtpFilled = otp.every((d) => d !== "");

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

          {/* Tiêu đề */}
          <h2 className="text-3xl font-bold text-center text-sky-700 mb-2 tracking-tight">
            Xác thực OTP
          </h2>
          <p className="text-center text-gray-500 mb-8">
            Bước 3 / 4 — Nhập mã xác thực được gửi đến số điện thoại của bạn
          </p>

          {/* Thanh tiến trình */}
          <div className="relative flex items-center justify-between mb-10">
            <div className="absolute top-1/2 left-[12px] right-[12px] h-[3px] bg-gray-200 -translate-y-1/2 z-0" />
            <motion.div
              className="absolute top-1/2 left-[12px] h-[3px] bg-sky-500 -translate-y-1/2 z-10 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "75%" }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            />

            {steps.map((step, index) => {
              const isCompleted = index + 1 < currentStep;
              const isCurrent = index + 1 === currentStep;
              return (
                <div
                  key={index}
                  className="relative z-20 flex flex-col items-center text-center w-1/4"
                >
                  <div
                    className={`w-9 h-9 flex items-center justify-center rounded-full border-2 text-sm font-semibold transition-all ${
                      isCurrent
                        ? "border-sky-600 bg-sky-500 text-white scale-110 shadow-md"
                        : isCompleted
                        ? "border-sky-400 bg-sky-400 text-white"
                        : "border-gray-300 bg-white text-gray-400"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-white" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <p
                    className={`mt-2 text-xs transition-colors ${
                      isCurrent ? "text-sky-600 font-medium" : "text-gray-400"
                    }`}
                  >
                    {step}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Form OTP */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col items-center space-y-6"
          >
            <div className="flex justify-center gap-3">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleChange(e.target.value, i)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  className="w-12 h-14 border-2 border-sky-300 text-center text-xl font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white/80 transition-all"
                />
              ))}
            </div>

            <div className="flex flex-col items-center gap-3">
              <button
                type="submit"
                className={`px-6 py-3 rounded-xl font-semibold transition-all shadow-md flex items-center justify-center gap-2 ${
                  isOtpFilled
                    ? "bg-gradient-to-r from-sky-500 to-sky-600 text-white hover:from-sky-600 hover:to-sky-700"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
                disabled={!isOtpFilled}
              >
                {isOtpFilled && <CheckCircle className="w-5 h-5 text-white" />}
                Xác nhận OTP
              </button>

              <button
                type="button"
                className="text-sky-600 hover:text-sky-700 text-sm"
                onClick={() => alert("Mã OTP mới đã được gửi!")}
              >
                Gửi lại mã OTP
              </button>
            </div>

            {/* 🔙 Nút Quay lại — căn sát trái */}
            <div className="w-full mt-4 flex justify-start">
              <motion.button
                type="button"
                onClick={() => navigate("/verify-identity")}
                whileHover={{ x: -4 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center text-sky-600 hover:text-sky-700 font-medium transition-all"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại
              </motion.button>
            </div>
          </form>
        </motion.div>
      </main>

      {/* Popup xác thực thành công */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          >
            <motion.div className="bg-white rounded-2xl p-8 flex flex-col items-center shadow-lg">
              <Shield className="w-12 h-12 text-green-500 mb-4 animate-pulse" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Xác thực OTP thành công!
              </h3>
              <p className="text-gray-500 text-center">
                Đang chuyển sang bước hoàn thành...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
