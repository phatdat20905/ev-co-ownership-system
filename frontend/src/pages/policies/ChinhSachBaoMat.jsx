import { motion } from "framer-motion";
import { ShieldCheck, Lock, Users, AlertTriangle, Settings, Mail, ChevronRight } from "lucide-react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import logo from "../../assets/footer-1.png"; // ảnh logo

const sections = [
  {
    id: "gioi-thieu",
    title: "1. Giới thiệu",
    icon: <ShieldCheck className="w-6 h-6 text-sky-600" />,
    content: (
      <p>
        Chính sách bảo mật này giải thích cách <strong>EV Co-ownership</strong> thu thập, lưu trữ, sử dụng và bảo vệ thông tin cá nhân của người dùng. Chúng tôi cam kết đảm bảo quyền riêng tư và bảo vệ dữ liệu của tất cả thành viên.
      </p>
    ),
  },
  {
    id: "thong-tin-thu-thap",
    title: "2. Thông tin thu thập",
    icon: <Users className="w-6 h-6 text-sky-600" />,
    content: (
      <ul className="list-disc list-inside mt-2 space-y-1">
        <li><strong>Thông tin cá nhân:</strong> Họ tên, email, số điện thoại, CMND/CCCD.</li>
        <li><strong>Thông tin tài khoản:</strong> Số tài khoản ngân hàng, mật khẩu, thông tin đăng nhập.</li>
        <li><strong>Dữ liệu hoạt động:</strong> Lịch sử đặt xe, tỉ lệ sở hữu, hành vi sử dụng nền tảng.</li>
        <li><strong>Thông tin liên lạc:</strong> Khi gửi yêu cầu hỗ trợ hoặc phản hồi.</li>
      </ul>
    ),
  },
  {
    id: "muc-dich-su-dung",
    title: "3. Mục đích sử dụng thông tin",
    icon: <Lock className="w-6 h-6 text-sky-600" />,
    content: (
      <ul className="list-disc list-inside mt-2 space-y-1">
        <li>Quản lý và bảo mật tài khoản người dùng.</li>
        <li>Điều phối lịch sử sử dụng xe, quyền ưu tiên và tỉ lệ sở hữu.</li>
        <li>Gửi thông báo quan trọng, nhắc nhở, cập nhật chính sách và khuyến mãi.</li>
        <li>Cải thiện trải nghiệm và hỗ trợ vận hành nền tảng hiệu quả, an toàn.</li>
      </ul>
    ),
  },
  {
    id: "bao-mat-thong-tin",
    title: "4. Bảo mật thông tin",
    icon: <ShieldCheck className="w-6 h-6 text-sky-600" />,
    content: (
      <p>
        Chúng tôi áp dụng các biện pháp kỹ thuật tiên tiến và quy trình quản lý nghiêm ngặt để bảo vệ dữ liệu cá nhân khỏi mất mát, rò rỉ, truy cập trái phép hoặc sửa đổi không được phép.
      </p>
    ),
  },
  {
    id: "luu-tru-chia-se",
    title: "5. Lưu trữ và chia sẻ thông tin",
    icon: <AlertTriangle className="w-6 h-6 text-sky-600" />,
    content: (
      <ul className="list-disc list-inside mt-2 space-y-1">
        <li>Dữ liệu được lưu trữ an toàn trên máy chủ bảo mật, sao lưu định kỳ.</li>
        <li>Chỉ chia sẻ với bên thứ 3 khi có yêu cầu pháp lý hoặc để bảo vệ quyền lợi người dùng.</li>
        <li>Không bán hoặc cho thuê thông tin cá nhân dưới bất kỳ hình thức nào.</li>
      </ul>
    ),
  },
  {
    id: "quyen-nguoi-dung",
    title: "6. Quyền của người dùng",
    icon: <Mail className="w-6 h-6 text-sky-600" />,
    content: (
      <ul className="list-disc list-inside mt-2 space-y-1">
        <li>Truy cập, kiểm tra, chỉnh sửa hoặc xóa thông tin cá nhân của mình.</li>
        <li>Hủy đăng ký nhận thông báo, email khuyến mãi hoặc quảng cáo.</li>
        <li>Yêu cầu hỗ trợ hoặc khiếu nại liên quan đến bảo mật và quyền riêng tư.</li>
        <li>Được thông báo khi có thay đổi quan trọng liên quan đến dữ liệu cá nhân.</li>
      </ul>
    ),
  },
  {
    id: "dieu-khoan-chung",
    title: "7. Điều khoản chung",
    icon: <Settings className="w-6 h-6 text-sky-400" />,
    content: (
      <p>
        Bằng việc sử dụng dịch vụ <strong>EV Co-ownership</strong>, người dùng đồng ý với Chính sách bảo mật này. Chúng tôi có quyền cập nhật, sửa đổi và thông báo phiên bản mới khi cần để đảm bảo tuân thủ pháp luật và nâng cao chất lượng dịch vụ.
      </p>
    ),
  },
];

export default function ChinhSachBaoMat() {
  const handleScrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white via-sky-50 to-sky-100">
      <Header />
      <main className="flex-grow container mx-auto px-6 lg:px-10 pt-32 pb-16">
        {/* Header với logo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-4"
        >
          <img src={logo} alt="Logo" className="w-400 h-auto mx-auto" />
          <h1 className="mt-4 text-3xl font-bold text-sky-600 mb-4">Chính sách bảo mật</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Cam kết bảo vệ dữ liệu của người dùng EV Co-ownership một cách minh bạch và an toàn.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-7xl mx-auto items-start">
          {/* Sidebar */}
          <motion.aside
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.03 } },
            }}
            className="lg:col-span-1 space-y-3 lg:sticky lg:top-28 h-fit"
          >
            <div className="bg-white/70 backdrop-blur border border-sky-100 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Mục lục</h3>
              <motion.nav className="space-y-2">
                {sections.map((s) => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ type: "spring", stiffness: 250, damping: 18 }}
                  >
                    <div
                      onClick={() => handleScrollTo(s.id)}
                      className="flex items-center gap-2 text-gray-700 hover:text-sky-600 transition text-sm cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                      {s.title.replace(/^\d+\.\s*/, "")}
                    </div>
                  </motion.div>
                ))}
              </motion.nav>
              <p className="text-xs text-gray-500 mt-4">
                Cập nhật lần cuối: <strong>21/10/2025</strong>
              </p>
            </div>
          </motion.aside>

          {/* Content */}
          <section className="lg:col-span-3 space-y-8">
            {sections.map((section, i) => (
              <motion.div
                key={section.id}
                id={section.id}
                className="scroll-mt-32 bg-white border border-sky-100 rounded-2xl shadow-sm p-6"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ amount: 0.2 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 18,
                  delay: i * 0.01,
                }}
                whileHover={{ scale: 1.02, boxShadow: "0 8px 20px rgba(0,0,0,0.12)" }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-sky-50 p-2 rounded-lg">{section.icon}</div>
                  <h2 className="text-2xl font-semibold text-sky-800">{section.title}</h2>
                </div>
                <div className="text-gray-700 leading-relaxed text-justify">{section.content}</div>
              </motion.div>
            ))}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
