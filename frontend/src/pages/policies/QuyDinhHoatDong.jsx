import { motion } from "framer-motion";
import { AlertTriangle,Calendar, ChevronRight, CreditCard, Settings, ShieldCheck, Users,}
from "lucide-react";
import Footer from "../../components/layout/Footer";
import Header from "../../components/layout/Header";

const sections = [
  {
    id: "pham-vi",
    title: "1. Phạm vi áp dụng",
    icon: <ShieldCheck className="w-6 h-6 text-sky-600" />,
    content: (
      <>
        <p>
          Quy định này áp dụng cho toàn bộ người dùng của hệ thống{" "}
          <strong>EV Co-ownership</strong> bao gồm:
          <strong> Co-owner</strong> (người đồng sở hữu), <strong>Staff</strong>{" "}
          (nhân viên vận hành), và <strong>Admin</strong> (quản trị viên hệ
          thống).
        </p>
        <p>
          Tất cả thành viên khi đăng ký tài khoản và tham gia nền tảng đều đồng
          ý tuân thủ quy định này. Mục tiêu là đảm bảo tính minh bạch, công bằng
          và vận hành bền vững.
        </p>
      </>
    ),
  },
  {
    id: "quyen-nghia-vu",
    title: "2. Quyền & nghĩa vụ của Co-owner",
    icon: <Users className="w-6 h-6 text-sky-600" />,
    content: (
      <>
        <ul className="list-decimal list-inside space-y-2">
          <li>
            <strong>Đăng ký tài khoản:</strong> cung cấp thông tin hợp lệ (CMND,
            GPLX, tài khoản ngân hàng).
          </li>
          <li>
            <strong>Sử dụng xe đúng mục đích:</strong> không dùng vào hoạt động
            trái pháp luật, kinh doanh dịch vụ không được phép.
          </li>
          <li>
            <strong>Thanh toán chi phí đầy đủ:</strong> theo tỉ lệ sở hữu hoặc
            mức sử dụng xe hàng tháng.
          </li>
          <li>
            <strong>Bảo quản tài sản chung:</strong> chịu trách nhiệm khi gây hư
            hỏng, thất lạc hoặc vi phạm giao thông.
          </li>
          <li>
            <strong>Không tự ý chuyển nhượng:</strong> quyền sở hữu hoặc chia sẻ
            xe phải được thông qua nhóm.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "dat-lich",
    title: "3. Quy định đặt lịch & sử dụng xe",
    icon: <Calendar className="w-6 h-6 text-sky-600" />,
    content: (
      <>
        <p>
          Việc đặt lịch và sử dụng xe được quản lý hoàn toàn trên nền tảng. Hệ
          thống tự động kiểm tra quyền ưu tiên theo lịch sử và tỉ lệ sở hữu.
        </p>
        <ul className="list-disc list-inside space-y-2 mt-2">
          <li>
            <strong>Đặt xe trước:</strong> tối đa 14 ngày, hủy trước 24h không
            bị tính phí.
          </li>
          <li>
            <strong>Check-in/Check-out:</strong> bằng mã QR hoặc chữ ký điện tử
            để ghi nhận thời gian thực.
          </li>
          <li>
            <strong>Trễ giờ:</strong> quá 15 phút không nhận xe có thể bị hủy
            quyền sử dụng trong lượt đó.
          </li>
          <li>
            <strong>Ưu tiên:</strong> thành viên ít sử dụng xe hơn trong tháng
            sẽ được ưu tiên đặt lịch.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "chi-phi",
    title: "4. Chi phí & thanh toán",
    icon: <CreditCard className="w-6 h-6 text-sky-600" />,
    content: (
      <>
        <p>
          Chi phí được phân bổ minh bạch và tự động thông qua hệ thống thanh
          toán điện tử.
        </p>
        <ul className="list-disc list-inside space-y-2 mt-2">
          <li>
            Bao gồm: phí điện sạc, bảo trì định kỳ, bảo hiểm, vệ sinh và bến đỗ.
          </li>
          <li>
            Tự động chia theo công thức:{" "}
            <em>(chi phí tháng) × (tỉ lệ sở hữu hoặc giờ sử dụng)</em>.
          </li>
          <li>
            Thanh toán chậm quá 7 ngày sẽ bị tạm khóa quyền đặt xe cho đến khi
            hoàn tất.
          </li>
          <li>
            Hệ thống hỗ trợ liên kết ví điện tử (Momo, ZaloPay) hoặc tài khoản
            ngân hàng.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "xu-ly",
    title: "5. Xử lý vi phạm",
    icon: <AlertTriangle className="w-6 h-6 text-sky-600" />,
    content: (
      <>
        <p>
          Vi phạm được phân loại theo mức độ và có hình thức xử lý tương ứng.
        </p>
        <ul className="list-disc list-inside space-y-2 mt-2">
          <li>
            <strong>Nhẹ:</strong> cảnh cáo, trừ điểm tín nhiệm hoặc khóa tạm
            thời.
          </li>
          <li>
            <strong>Nghiêm trọng:</strong> hủy quyền sở hữu, khóa tài khoản vĩnh
            viễn hoặc chuyển cho cơ quan chức năng.
          </li>
          <li>
            <strong>Tái phạm nhiều lần:</strong> đưa vào danh sách đen của hệ
            thống, không được tham gia lại.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "dieu-khoan",
    title: "6. Điều khoản chung",
    icon: <Settings className="w-6 h-6 text-sky-400" />,
    content: (
      <>
        <p>
          Khi tham gia hệ thống EV Co-ownership, người dùng mặc định chấp nhận
          các điều khoản nêu trên. Hệ thống có quyền cập nhật, chỉnh sửa và công
          bố lại khi cần thiết.
        </p>
        <p className="mt-2">
          Phiên bản hiện hành có hiệu lực kể từ ngày <strong>18/10/2025</strong>{" "}
          và được áp dụng toàn quốc.
        </p>
      </>
    ),
  },
];

export default function QuyDinhHoatDong() {
  const handleScrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white via-sky-50 to-sky-100">
      <Header />
      <main className="flex-grow container mx-auto px-6 lg:px-10 pt-32 pb-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center mb-4"
        >
          <img
            src="/src/assets/footer-1.png"
            alt="Logo"
            className="w-400 h-auto mx-auto"
          />
          <h1 className="mt-4 text-4xl md:text-4xl font-bold text-sky-600 mb-4">
            Quy định hoạt động
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Nguyên tắc vận hành và đảm bảo minh bạch trong EV Co-ownership.
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
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Mục lục
              </h3>
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
                Cập nhật lần cuối: <strong>18/10/2025</strong>
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
                  <h2 className="text-2xl font-semibold text-sky-800">
                    {section.title}
                  </h2>
                </div>
                <div className="text-gray-700 leading-relaxed text-justify">
                  {section.content}
                </div>
              </motion.div>
            ))}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
