import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, IdCard, Car, Upload, ArrowLeft } from "lucide-react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

export default function VerifyIdentity() {
  const [cccdFront, setCccdFront] = useState(null);
  const [cccdBack, setCccdBack] = useState(null);
  const [gplx, setGplx] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const steps = [
    "Thông tin cơ bản",
    "Giấy tờ tùy thân",
    "Xác thực OTP",
    "Hoàn thành",
  ];
  const currentStep = 2;

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (type === "cccdFront") setCccdFront(file);
    if (type === "cccdBack") setCccdBack(file);
    if (type === "gplx") setGplx(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!cccdFront || !cccdBack || !gplx)
      return alert("Vui lòng tải đủ ảnh CCCD (2 mặt) và GPLX!");
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      navigate("/verify-otp"); // Sang bước 3
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
          className="relative w-full max-w-2xl bg-white/70 backdrop-blur-xl border border-sky-100 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] p-10"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-sky-100/50 via-transparent to-sky-200/40 rounded-3xl blur-2xl -z-10" />

          {/* Tiêu đề */}
          <h2 className="text-3xl font-bold text-center text-sky-700 mb-2">
            Xác thực giấy tờ tùy thân
          </h2>
          <p className="text-center text-gray-500 mb-8">
            Bước 2 / 4 — Cung cấp giấy tờ xác thực danh tính
          </p>

          {/* Thanh tiến trình */}
          <div className="relative flex items-center justify-between mb-10">
            <div className="absolute top-1/2 left-[12px] right-[12px] h-[3px] bg-gray-200 -translate-y-1/2 z-0" />

            <motion.div
              className="absolute top-1/2 left-[12px] h-[3px] bg-sky-500 -translate-y-1/2 z-10 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "calc(50%)" }}
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

          {/* Form tải giấy tờ */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* CCCD mặt trước */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Ảnh CCCD mặt trước *
              </label>
              <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-sky-300 rounded-2xl p-6 cursor-pointer bg-white/70 hover:bg-sky-50 transition">
                <IdCard className="w-10 h-10 text-sky-500 mb-3" />
                <span className="text-gray-600 text-sm">
                  {cccdFront ? cccdFront.name : "Tải lên ảnh mặt trước CCCD"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, "cccdFront")}
                />
              </label>
            </div>

            {/* CCCD mặt sau */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Ảnh CCCD mặt sau *
              </label>
              <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-sky-300 rounded-2xl p-6 cursor-pointer bg-white/70 hover:bg-sky-50 transition">
                <IdCard className="w-10 h-10 text-sky-500 mb-3" />
                <span className="text-gray-600 text-sm">
                  {cccdBack ? cccdBack.name : "Tải lên ảnh mặt sau CCCD"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, "cccdBack")}
                />
              </label>
            </div>

            {/* GPLX */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Ảnh Giấy phép lái xe *
              </label>
              <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-sky-300 rounded-2xl p-6 cursor-pointer bg-white/70 hover:bg-sky-50 transition">
                <Car className="w-10 h-10 text-sky-500 mb-3" />
                <span className="text-gray-600 text-sm">
                  {gplx ? gplx.name : "Tải lên ảnh GPLX của bạn"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, "gplx")}
                />
              </label>
            </div>

            {/* Nút điều hướng */}
            <div className="flex justify-between items-center pt-4">
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="flex items-center text-sky-600 hover:text-sky-700 font-medium"
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Quay lại
              </button>

              <button
                type="submit"
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-sky-500 to-sky-600 text-white hover:from-sky-600 hover:to-sky-700 transition-all shadow-md hover:shadow-lg"
              >
                <Upload className="w-5 h-5" />
                Tiếp tục
              </button>
            </div>
          </form>
        </motion.div>
      </main>

      {/* Popup thành công */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          >
            <motion.div className="bg-white/90 rounded-2xl p-8 flex flex-col items-center backdrop-blur-xl border border-sky-100 shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
              <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Xác thực giấy tờ thành công!
              </h3>
              <p className="text-gray-500 text-center">
                Đang chuyển sang bước xác thực OTP...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
