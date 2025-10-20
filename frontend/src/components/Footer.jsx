import React from "react";
import { Phone, Mail } from "lucide-react";
import GooglePlayBadge from "../assets/google-play.png";
import AppStoreBadge from "../assets/app-store.png";

export default function Footer() {
  return (
    <footer id="contact" className="bg-gray-900 text-gray-300 py-16">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Thông tin công ty */}
        <div>
          <h4 className="text-xl font-bold text-white mb-4">Cộng Đồng EV Co-ownership</h4>
          <p className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M3 3h18v18H3V3z"/></svg>
            Công ty TNHH EV Co-ownership
          </p>
          <p className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 12h3v8h14v-8h3L12 2z"/></svg>
            123 Đường Tô Ký, Quận 12, TP. Hồ Chí Minh
          </p>
          <p className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12a5 5 0 100-10 5 5 0 000 10z"/></svg>
            Người chịu trách nhiệm: Nguyễn Thành Chiến
          </p>
          <p className="flex items-center gap-2 mb-2 text-gray-500 text-sm">
            Giấy phép MXH: 001/EV-2025, cấp ngày 18/10/2025
          </p>
        </div>

        {/* Chính sách */}
        <div>
          <h4 className="text-xl font-bold text-white mb-4">Chính Sách</h4>
          <ul className="space-y-2 text-gray-400">
            <li><a href="/quy-dinh-hoat-dong" className="hover:text-sky-500 hover:underline">Quy định hoạt động</a></li>
            <li><a href="/chinh-sach-bao-mat" className="hover:text-sky-500 hover:underline">Chính sách bảo mật</a></li>
            <li><a href="/bang-quyen-loi-thanh-vien" className="hover:text-sky-500 hover:underline">Bảng quyền lợi thành viên</a></li>
            <li><a href="/chinh-sach-thong-bao" className="hover:text-sky-500 hover:underline">Chính sách và Thông báo</a></li>
          </ul>
        </div>

        {/* Liên hệ */}
        <div>
          <h4 className="text-xl font-bold text-white mb-4">Liên hệ</h4>

          <p className="mb-2 flex items-center">
            <Phone className="inline-block w-5 h-5 text-sky-500 mr-2" />
            <a href="tel:1900232389" className="text-sky-500 hover:underline">
              1900 23 23 67
            </a>
          </p>

          <p className="mb-4 flex items-center">
            <Mail className="inline-block w-5 h-5 text-sky-500 mr-2" />
            <a href="mailto:support@evcoownership.com" className="text-sky-500 hover:underline">
              support@evcoownership.com
            </a>
          </p>

          <div className="flex items-center gap-4 mt-4">
            <img src={GooglePlayBadge} alt="Google Play" className="h-10 rounded-lg" />
            <img src={AppStoreBadge} alt="App Store" className="h-10 rounded-lg" />
          </div>
        </div>
      </div>

      <div className="mt-12 text-center text-gray-500 text-sm">
        © 2025 EV Co-ownership System. All rights reserved.
      </div>
    </footer>
  );
}
