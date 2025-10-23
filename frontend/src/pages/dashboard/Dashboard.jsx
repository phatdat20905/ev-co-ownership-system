import { AnimatePresence, motion } from "framer-motion";
import {ArrowRight, Award, Car, CheckCircle, FileCheck, MessageCircle, Play, Settings, Shield, Star, TrendingUp, Users, Wallet, Zap,} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/layout/Footer";
import Header from "../../components/layout/Header";
import evCar from "../../assets/ev-car.png";
import evCar1 from "../../assets/ev-car1.png";
import evCar2 from "../../assets/ev-car2.png";
import evCar3 from "../../assets/ev-car3.png";
import evCar4 from "../../assets/ev-car4.png";

export default function Home() {
  const navigate = useNavigate();
  const images = [evCar, evCar1, evCar2, evCar3];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const testimonials = [
    {
      name: "Minh Nguyễn",
      role: "Đồng sở hữu 6 tháng",
      content:
        "Từ khi tham gia EV Co-ownership, tôi tiết kiệm được hơn 70% chi phí di chuyển mà vẫn sử dụng xe điện đời mới.",
      rating: 5,
      avatar: "MN",
      company: "Tech Startup",
    },
    {
      name: "Lan Phương",
      role: "Thành viên 1 năm",
      content:
        "Hệ thống chia chi phí minh bạch và lịch trình công bằng giúp tôi hoàn toàn yên tâm khi đồng sở hữu.",
      rating: 5,
      avatar: "LP",
      company: "Marketing Agency",
    },
    {
      name: "Tuấn Anh",
      role: "Đồng sở hữu 8 tháng",
      content:
        "Ứng dụng rất dễ sử dụng, AI đề xuất lịch trình thông minh giúp mọi người đều có cơ hội sử dụng xe.",
      rating: 4,
      avatar: "TA",
      company: "Freelancer",
    },
  ];

  const processSteps = [
    {
      step: "01",
      title: "Đăng ký & Xác minh",
      description: "Tạo tài khoản và xác minh danh tính để tham gia cộng đồng",
      icon: <Shield className="w-6 h-6" />,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      step: "02",
      title: "Chọn gói sở hữu",
      description: "Lựa chọn tỷ lệ sở hữu phù hợp với nhu cầu và ngân sách",
      icon: <Settings className="w-6 h-6" />,
      gradient: "from-green-500 to-emerald-500",
    },
    {
      step: "03",
      title: "Ký hợp đồng điện tử",
      description: "Hoàn tất thủ tục pháp lý với hợp đồng thông minh",
      icon: <FileCheck className="w-6 h-6" />,
      gradient: "from-purple-500 to-pink-500",
    },
    {
      step: "04",
      title: "Bắt đầu sử dụng",
      description: "Đặt lịch và trải nghiệm xe điện ngay lập tức",
      icon: <Car className="w-6 h-6" />,
      gradient: "from-orange-500 to-amber-500",
    },
  ];

  const features = [
    {
      icon: <Car className="w-8 h-8" />,
      title: "Đặt lịch thông minh",
      desc: "Quản lý xe dễ dàng, ưu tiên công bằng giữa các đồng sở hữu.",
      gradient: "from-blue-500 to-cyan-500",
      stats: "Tiết kiệm 5h/tuần",
    },
    {
      icon: <Wallet className="w-8 h-8" />,
      title: "Chia chi phí tự động",
      desc: "Mọi chi phí sạc, bảo dưỡng, bảo hiểm được chia minh bạch theo tỷ lệ.",
      gradient: "from-green-500 to-emerald-500",
      stats: "Giảm 60% chi phí",
    },
    {
      icon: <FileCheck className="w-8 h-8" />,
      title: "Hợp đồng điện tử",
      desc: "Ký kết và lưu trữ hợp đồng online, đảm bảo an toàn & tiện lợi.",
      gradient: "from-purple-500 to-pink-500",
      stats: "100% bảo mật",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Đề xuất lịch công bằng",
      desc: "Hệ thống gợi ý lịch sử sử dụng công bằng cho tất cả thành viên.",
      gradient: "from-orange-500 to-amber-500",
      stats: "AI thông minh",
    },
  ];

  const handleRegister = () => {
    navigate("/register");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-800 overflow-hidden">
      {/* ===== HEADER ===== */}
      <Header />

      {/* ===== HERO SECTION ===== */}
      <section
        id="home"
        className="relative min-h-screen flex items-center justify-center px-6 pt-20 pb-20 bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50"
      >
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-200 rounded-full blur-3xl opacity-30 animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-100 rounded-full blur-3xl opacity-20"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-blue-200 text-blue-700 text-sm font-medium mb-8"
            >
              <TrendingUp className="w-4 h-4" />
              Nền tảng chia sẻ xe điện số 1 Việt Nam
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-5xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight"
            >
              Cùng sở hữu
              <span className="block bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Xe Điện
              </span>
              Tương Lai
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl"
            >
              Quản lý đồng sở hữu xe điện một cách{" "}
              <span className="font-semibold text-blue-600">
                minh bạch, thông minh
              </span>{" "}
              và công bằng. Cùng trải nghiệm di chuyển xanh, tiết kiệm và tiện
              lợi.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4 items-center"
            >
              <motion.button
                onClick={handleLogin}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 20px 40px -10px rgba(59, 130, 246, 0.4)",
                }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center gap-3 group"
              >
                <span>Bắt đầu ngay</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-gray-200/50"
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">4.9/5</div>
                <div className="text-sm text-gray-600">Đánh giá</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">99%</div>
                <div className="text-sm text-gray-600">Hài lòng</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">24/7</div>
                <div className="text-sm text-gray-600">Hỗ trợ</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Image Carousel */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <div className="aspect-[4/3] relative">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentIndex}
                    src={images[currentIndex]}
                    alt="EV Car"
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 1.2 }}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </AnimatePresence>

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>

              {/* Control Buttons */}
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                >
                  <Play
                    className={`w-4 h-4 text-white ${
                      isPlaying ? "hidden" : "block"
                    }`}
                  />
                  <div
                    className={`w-4 h-4 flex items-center justify-center ${
                      !isPlaying ? "hidden" : "block"
                    }`}
                  >
                    <div className="w-1 h-3 bg-white mx-0.5"></div>
                    <div className="w-1 h-3 bg-white mx-0.5"></div>
                  </div>
                </button>

                <div className="flex gap-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setCurrentIndex(index);
                        setIsPlaying(false);
                      }}
                      className={`w-3 h-3 rounded-full transition-all ${
                        index === currentIndex
                          ? "bg-white scale-125"
                          : "bg-white/50 hover:bg-white/80"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="absolute -top-4 -right-4 bg-white rounded-2xl p-4 shadow-xl border border-gray-100"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-xl">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Giải thưởng</div>
                  <div className="text-sm text-gray-600">Top 10 Startup</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 }}
              className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-4 shadow-xl border border-gray-100"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Sạc nhanh</div>
                  <div className="text-sm text-gray-600">60 phút</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section
        id="features"
        className="py-12 bg-white relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-gray-40 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-4"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-4">
              <Zap className="w-4 h-4" />
              Tính năng đột phá
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Trải nghiệm{" "}
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                công nghệ
              </span>{" "}
              vượt trội
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Khám phá những tính năng độc đáo được thiết kế để mang lại sự tiện
              lợi và minh bạch tuyệt đối
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                className="group relative bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100"
              >
                <div className="flex items-start gap-6">
                  <div
                    className={`p-4 rounded-2xl bg-gradient-to-r ${feature.gradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-900">
                        {feature.title}
                      </h3>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        {feature.stats}
                      </span>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </div>

                {/* Hover effect */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="process"
        className="py-20 bg-gradient-to-br from-slate-50 to-blue-50 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-200 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-200 rounded-full blur-3xl opacity-20"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-blue-200 text-blue-700 text-sm font-medium mb-4">
              <Settings className="w-4 h-4" />
              Quy trình đơn giản
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Bắt đầu trong{" "}
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                4 bước
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Connecting Line */}
            <div className="hidden lg:block absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-cyan-200 to-emerald-200 -z-10"></div>

            {processSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center relative group"
              >
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-4 group-hover:shadow-xl transition-all duration-300">
                    <div
                      className={`p-3 rounded-xl bg-gradient-to-r ${step.gradient} text-white shadow-md`}
                    >
                      {step.icon}
                    </div>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                    {step.step}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ABOUT ===== */}
      <section id="about" className="py-20 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col-reverse lg:flex-row items-center gap-16">
            {/* Text content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="flex-1 text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-4">
                <Users className="w-4 h-4" />
                Về chúng tôi
              </div>

              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Hệ thống{" "}
                <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  EV Co-ownership
                </span>
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-2xl">
                EV Co-ownership thúc đẩy mô hình{" "}
                <span className="font-semibold text-blue-600">
                  chia sẻ xe điện
                </span>
                , giúp người dùng cùng sở hữu, cùng sử dụng và cùng tiết kiệm.
                Hệ thống minh bạch, thân thiện và ứng dụng công nghệ tiên tiến,
                tạo ra cộng đồng di chuyển xanh, thông minh và bền vững.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  "Mọi chi phí và lịch sử sử dụng rõ ràng, dễ theo dõi",
                  "Chia sẻ chi phí, tối ưu quãng đường, tiết kiệm ngân sách",
                  "Thúc đẩy di chuyển bền vững, giảm khí thải",
                  "AI gợi ý lịch công bằng và quản lý hợp đồng dễ dàng",
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </motion.div>
                ))}
              </div>

              <motion.button
                onClick={handleRegister}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 20px 40px -10px rgba(59, 130, 246, 0.4)",
                }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center gap-3 group"
              >
                <span>Tham gia ngay</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </motion.div>

            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="flex-1 flex justify-center relative w-full max-w-lg h-[500px]"
            >
              <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src={evCar4}
                  alt="EV Illustration"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section
        id="testimonials"
        className="py-20 bg-gradient-to-br from-slate-50 to-blue-50 relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 text-amber-700 text-sm font-medium mb-4">
              <Star className="w-4 h-4 fill-current" />
              Được tin tưởng
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Những{" "}
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                câu chuyện
              </span>{" "}
              thành công
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="group relative bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                {/* Rating */}
                <div className="flex mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < testimonial.rating
                          ? "text-amber-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>

                {/* Content */}
                <p className="text-gray-700 text-lg leading-relaxed mb-6 italic">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl flex items-center justify-center font-semibold text-lg shadow-lg">
                    {testimonial.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {testimonial.role}
                    </div>
                    <div className="text-xs text-gray-500">
                      {testimonial.company}
                    </div>
                  </div>
                </div>

                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section
        id="contact"
        className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 relative overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-cyan-400/20 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Sẵn sàng cho tương lai?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
              Tham gia cộng đồng đồng sở hữu xe điện thông minh ngay hôm nay và
              bắt đầu hành trình di chuyển xanh, tiết kiệm
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.button
                onClick={handleRegister}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 20px 40px -10px rgba(255, 255, 255, 0.3)",
                }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center gap-3 group"
              >
                <span>Đăng ký ngay</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-transparent text-white font-semibold rounded-2xl border-2 border-white/30 hover:border-white transition-all flex items-center gap-3 group backdrop-blur-sm"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Tư vấn miễn phí</span>
              </motion.button>
            </div>

            <p className="text-blue-200 text-sm mt-6">
              Đã có hơn 500+ thành viên tin tưởng • Hỗ trợ 24/7
            </p>
          </motion.div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <Footer />
    </div>
  );
}
