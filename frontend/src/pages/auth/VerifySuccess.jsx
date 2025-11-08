import { motion } from "framer-motion";
import { CheckCircle2, Sparkles, Home } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

export default function VerifySuccess() {
  const navigate = useNavigate();

  // 🕒 Tự động chuyển sang trang login sau 3 giây
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/login");
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  const steps = [
    "Thông tin cơ bản",
    "Giấy tờ tùy thân",
    "Xác thực OTP",
    "Hoàn thành",
  ];
  const currentStep = 4;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-sky-50 via-white to-sky-100">
      <Header />

      <main className="flex-grow flex items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative w-full max-w-md bg-white/80 backdrop-blur-xl border border-sky-100 rounded-3xl shadow-xl p-10 text-center"
        >
          {/* Thanh tiến trình */}
          <div className="relative flex items-center justify-between mb-10">
            <div className="absolute top-1/2 left-[12px] right-[12px] h-[3px] bg-gray-200 -translate-y-1/2 z-0" />
            <motion.div
              className="absolute top-1/2 left-[12px] h-[3px] bg-green-500 -translate-y-1/2 z-10 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            />

            {steps.map((step, index) => {
              const isCompleted = index + 1 <= currentStep;
              const isCurrent = index + 1 === currentStep;
              return (
                <div
                  key={index}
                  className="relative z-20 flex flex-col items-center text-center w-1/4"
                >
                  <div
                    className={`w-9 h-9 flex items-center justify-center rounded-full border-2 text-sm font-semibold transition-all ${
                      isCurrent
                        ? "border-green-600 bg-green-500 text-white scale-110 shadow-md"
                        : isCompleted
                        ? "border-green-400 bg-green-400 text-white"
                        : "border-gray-300 bg-white text-gray-400"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <p
                    className={`mt-2 text-xs transition-colors ${
                      isCurrent ? "text-green-600 font-medium" : "text-gray-400"
                    }`}
                  >
                    {step}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Hiệu ứng hoàn thành */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 120, delay: 0.2 }}
            className="flex flex-col items-center justify-center"
          >
            <div className="relative mb-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 bg-green-200 rounded-full blur-2xl opacity-40"
              />
              <CheckCircle2 className="w-20 h-20 text-green-500 relative z-10" />
            </div>

            <h2 className="text-3xl font-bold text-gray-800 mb-3">
              Xác thực thành công!
            </h2>
            <p className="text-gray-500 mb-8">
              Bạn đã hoàn tất quá trình đăng ký.  
              Cảm ơn vì đã trở thành một phần của cộng đồng{" "}
              <span className="text-sky-600 font-medium">
                EV Co-ownership
              </span>.
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/login")}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold px-6 py-3 rounded-xl shadow-md hover:from-green-600 hover:to-green-700"
            >
              <Home className="w-5 h-5" /> Quay về Đăng nhập
            </motion.button>
          </motion.div>

          <div className="mt-8 flex justify-center items-center text-green-500 gap-1">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span className="text-sm font-medium">
              Hệ thống đang chuyển bạn đến trang đăng nhập...
            </span>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
