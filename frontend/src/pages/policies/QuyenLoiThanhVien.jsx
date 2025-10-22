import { motion } from "framer-motion";
import { Users, ShieldCheck, CreditCard, Settings } from "lucide-react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import logo from "../../assets/footer-1.png"; 

const memberBenefits = [
  {
    title: "Quyền lợi cơ bản",
    items: [
      "Sử dụng xe theo lịch đã đăng ký, đảm bảo quyền sử dụng công bằng.",
      "Xem chi tiết lịch sử sử dụng xe và chi phí phát sinh cá nhân.",
      "Quản lý tỉ lệ sở hữu, thông tin cá nhân và hợp đồng đồng sở hữu.",
    ],
    icon: <Users className="w-6 h-6 text-sky-600" />,
  },
  {
    title: "Quyền lợi nâng cao",
    items: [
      "Ưu tiên đặt lịch dựa trên tỉ lệ sở hữu và lịch sử sử dụng công bằng.",
      "Bảng tổng kết chi phí chi tiết theo tháng và quý, dễ dàng theo dõi.",
      "Nhận gợi ý AI thông minh giúp phân bổ lịch sử dụng xe hợp lý giữa các thành viên.",
    ],
    icon: <ShieldCheck className="w-6 h-6 text-sky-600" />,
  },
  {
    title: "Quyền lợi nhóm đồng sở hữu",
    items: [
      "Quản lý nhóm: thêm/xóa thành viên, phân quyền admin/thành viên linh hoạt.",
      "Tham gia bỏ phiếu và quyết định chung các vấn đề như nâng cấp pin, bảo hiểm hoặc bán xe.",
      "Quỹ chung minh bạch: theo dõi số dư, lịch sử chi và đóng góp của từng thành viên.",
    ],
    icon: <CreditCard className="w-6 h-6 text-sky-600" />,
  },
  {
    title: "Hỗ trợ & dịch vụ",
    items: [
      "Hỗ trợ xử lý khiếu nại, tranh chấp và thắc mắc liên quan đến quyền sở hữu.",
      "Nhận thông báo cập nhật, nhắc nhở về lịch sử sử dụng, chính sách và khuyến mãi.",
      "Hỗ trợ thanh toán trực tuyến an toàn, tiện lợi qua e-wallet hoặc ngân hàng.",
    ],
    icon: <Settings className="w-6 h-6 text-sky-600" />,
  },
];

export default function QuyenLoiThanhVien() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white via-sky-50 to-sky-100">
      <Header />
      <main className="flex-grow container mx-auto px-6 lg:px-10 pt-32 pb-16">
        {/* Header với logo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <img src={logo} alt="Logo" className="w-400 h-auto mx-auto" />
          <h1 className="mt-4 text-3xl font-bold text-sky-600 mb-2">
            Bảng quyền lợi thành viên
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Tất cả quyền lợi cho thành viên EV Co-ownership sẽ minh bạch, rõ ràng và dễ dàng theo dõi.
          </p>
        </motion.div>

        {/* Grid bảng quyền lợi */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {memberBenefits.map((benefit, idx) => (
            <motion.div
              key={idx}
              className="bg-white border border-sky-100 rounded-2xl shadow-sm p-6 flex flex-col h-full"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ type: "spring", stiffness: 200, damping: 18, delay: idx * 0.05 }}
              whileHover={{ scale: 1.03, boxShadow: "0 8px 20px rgba(0,0,0,0.12)" }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-sky-50 p-2 rounded-lg">{benefit.icon}</div>
                <h2 className="text-xl font-semibold text-sky-800">{benefit.title}</h2>
              </div>
              <ul className="list-disc list-inside text-gray-700 space-y-2 flex-grow">
                {benefit.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
