import { AnimatePresence, motion } from "framer-motion";
import { Car, FileCheck, Users, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import evCar from "../assets/ev-car.png";
import evCar1 from "../assets/ev-car1.png";
import evCar2 from "../assets/ev-car2.png";
import evCar3 from "../assets/ev-car3.png";
import evCar4 from "../assets/ev-car4.png";
import Footer from "../components/layout/Footer";
import Header from "../components/layout/Header";


export default function Home() {
  const images = [evCar, evCar1, evCar2, evCar3];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-800">
      {/* ===== HEADER ===== */}
      <Header />

      {/* ===== HERO SECTION ===== */}
      <section className="flex flex-col items-center justify-center text-center px-6 pt-32 pb-20 bg-gradient-to-b from-sky-50 to-white">
        <motion.h2
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-6xl font-extrabold text-gray-800 mb-4"
        >
          Chia sẻ xe điện,{" "}
          <span className="text-sky-600">tiết kiệm chi phí</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="max-w-2xl text-gray-600 mb-4"
        >
          Quản lý đồng sở hữu xe điện một cách minh bạch, thông minh và công
          bằng – cùng trải nghiệm di chuyển xanh, tiết kiệm và tiện lợi.
        </motion.p>

        <div className="w-[1250px] h-[500px] relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentIndex}
              src={images[currentIndex]}
              alt="EV Car"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 1 }}
              className="w-full h-full object-cover"
            />
          </AnimatePresence>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-3 bg-sky-600 text-white font-semibold rounded-full shadow-md hover:bg-sky-700 transition mt-4"
        >
          Khám phá ngay
        </motion.button>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="py-8 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h3 className="text-3xl font-bold mb-12 text-gray-800">
            Tính năng nổi bật
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Car className="w-12 h-12 text-sky-500 mx-auto mb-4" />,
                title: "Đặt lịch thông minh",
                desc: "Quản lý xe dễ dàng, ưu tiên công bằng giữa các đồng sở hữu.",
              },
              {
                icon: (
                  <Wallet className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                ),
                title: "Chia chi phí tự động",
                desc: "Mọi chi phí sạc, bảo dưỡng, bảo hiểm được chia minh bạch theo tỷ lệ.",
              },
              {
                icon: (
                  <FileCheck className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
                ),
                title: "Hợp đồng điện tử",
                desc: "Ký kết và lưu trữ hợp đồng online, đảm bảo an toàn & tiện lợi.",
              },
              {
                icon: (
                  <Users className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                ),
                title: "Đề xuất lịch công bằng",
                desc: "Hệ thống gợi ý lịch sử sử dụng công bằng cho tất cả thành viên.",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition"
              >
                {feature.icon}
                <h4 className="font-semibold text-lg mb-2">{feature.title}</h4>
                <p className="text-gray-600 text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ABOUT ===== */}
      <section id="about" className="py-24 bg-white px-6">
        <div className="max-w-7xl mx-auto flex flex-col-reverse md:flex-row items-center gap-12">
          {/* Text content */}
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-4xl font-extrabold mb-6 text-gray-900">
              Về hệ thống <span className="text-sky-600">EV Co-ownership</span>
            </h3>
            <p className="text-gray-600 mb-12 text-lg leading-relaxed max-w-lg">
              EV Co-ownership thúc đẩy mô hình <b>chia sẻ xe điện</b>, giúp
              người dùng cùng sở hữu, cùng sử dụng và cùng tiết kiệm. Hệ thống
              minh bạch, thân thiện và ứng dụng công nghệ tiên tiến, tạo ra cộng
              đồng di chuyển xanh, thông minh và bền vững.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                {
                  title: "Minh bạch",
                  desc: "Mọi chi phí và lịch sử sử dụng rõ ràng, dễ theo dõi.",
                },
                {
                  title: "Tiết kiệm",
                  desc: "Chia sẻ chi phí, tối ưu quãng đường, tiết kiệm ngân sách.",
                },
                {
                  title: "Cộng đồng xanh",
                  desc: "Thúc đẩy di chuyển bền vững, giảm khí thải.",
                },
                {
                  title: "Thông minh & tiện lợi",
                  desc: "AI gợi ý lịch công bằng và quản lý hợp đồng dễ dàng.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition transform hover:-translate-y-1"
                >
                  <h4 className="font-bold text-lg mb-2 text-gray-800">
                    {item.title}
                  </h4>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 flex justify-center relative w-full max-w-md h-[400px] md:h-[500px]">
            <img
              src={evCar4}
              alt="EV Illustration"
              className="absolute top-0 left-0 w-full h-full object-cover rounded-xl shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <Footer />
    </div>
  );
}
