// src/pages/admin/KYCManagement.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import KYCReview from '../../components/admin/KYCReview';

export default function KYCManagement() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-cyan-50 flex flex-col">
      <Header />
      
      <main className="flex-grow pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link
              to="/admin/dashboard"
              className="p-2 rounded-lg hover:bg-white/80 transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quản lý KYC</h1>
              <p className="text-gray-600 mt-1">Xét duyệt và quản lý hồ sơ xác thực người dùng</p>
            </div>
          </div>

          {/* KYC Review Component */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <KYCReview />
          </motion.div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Quy trình KYC</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-sky-600 font-bold">1.</span>
                  <span>Người dùng gửi hồ sơ với CMND/CCCD</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sky-600 font-bold">2.</span>
                  <span>Hệ thống AI đánh giá rủi ro tự động</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sky-600 font-bold">3.</span>
                  <span>Admin xem xét và phê duyệt</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-sky-600 font-bold">4.</span>
                  <span>Tài khoản được kích hoạt đầy đủ</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Tiêu chí đánh giá</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Ảnh giấy tờ rõ ràng, không mờ</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Thông tin trùng khớp với hồ sơ</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Giấy tờ còn hiệu lực</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Điểm rủi ro AI dưới ngưỡng</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Lưu ý quan trọng</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-red-600">⚠</span>
                  <span>Luôn kiểm tra kỹ trước khi duyệt</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600">⚠</span>
                  <span>Từ chối nếu có dấu hiệu gian lận</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600">⚠</span>
                  <span>Ghi rõ lý do khi từ chối hồ sơ</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600">⚠</span>
                  <span>Bảo mật thông tin người dùng</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
