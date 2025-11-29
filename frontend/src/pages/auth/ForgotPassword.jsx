import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Mail, Phone } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../../components/layout/Footer";
import Header from "../../components/layout/Header";

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState("email"); 
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Giả lập gửi mã xác minh
    setTimeout(() => {
      setLoading(false);
      if (method === "email") navigate("/verify-email");
      else navigate("/verify-phone");
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

          <h2 className="text-3xl font-bold text-center text-sky-700 mb-2 tracking-tight">
            Quên mật khẩu
          </h2>

          <p className="text-gray-600 text-center mb-6 text-sm">
            Chọn phương thức để nhận mã xác minh đặt lại mật khẩu.
          </p>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Chọn phương thức */}
            <div className="flex justify-center gap-4 mb-4">
              <button
                type="button"
                onClick={() => setMethod("email")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
                  method === "email"
                    ? "bg-sky-100 border-sky-400 text-sky-600"
                    : "border-gray-200 text-gray-500 hover:border-sky-200"
                }`}
              >
                <Mail className="h-4 w-4" />
                Email
              </button>
              <button
                type="button"
                onClick={() => setMethod("phone")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
                  method === "phone"
                    ? "bg-sky-100 border-sky-400 text-sky-600"
                    : "border-gray-200 text-gray-500 hover:border-sky-200"
                }`}
              >
                <Phone className="h-4 w-4" />
                Số điện thoại
              </button>
            </div>

            {/* Nhập Email hoặc Số điện thoại */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                {method === "email" ? "Email" : "Số điện thoại"}
              </label>
              <div className="flex items-center border border-gray-200 rounded-xl px-3 py-2 bg-white/80 focus-within:ring-2 focus-within:ring-sky-400 transition">
                {method === "email" ? (
                  <Mail className="h-5 w-5 text-sky-500 mr-2" />
                ) : (
                  <Phone className="h-5 w-5 text-sky-500 mr-2" />
                )}
                <input
                  type={method === "email" ? "email" : "tel"}
                  required
                  value={method === "email" ? email : phone}
                  onChange={(e) =>
                    method === "email" ? setEmail(e.target.value) : setPhone(e.target.value)
                  }
                  placeholder={method === "email" ? "example@gmail.com" : "090xxxxxxx"}
                  className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Nút gửi */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-sky-500 to-sky-600 text-white hover:from-sky-600 hover:to-sky-700 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                "Gửi mã xác minh"
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
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
