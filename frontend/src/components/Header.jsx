import React from "react";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";

export default function Header() {
  const smoothScrollTo = (targetY, duration = 600) => {
    const startY = window.scrollY;
    const distance = targetY - startY;
    let startTime = null;

    const easeInOutQuad = (t) =>
      t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    const animation = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      window.scrollTo(0, startY + distance * easeInOutQuad(progress));
      if (timeElapsed < duration) requestAnimationFrame(animation);
    };

    requestAnimationFrame(animation);
  };
  const handleAnchorClick = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) smoothScrollTo(element.offsetTop, 700);
  };

  return (
    <header className="w-full fixed top-0 bg-white/90 backdrop-blur-md border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link
            to="/"
            onClick={(e) => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="text-2xl font-bold text-sky-600 hover:text-sky-700 transition"
          >
            EV Co-ownership
          </Link>
          <nav className="flex items-center gap-6 text-gray-600 font-medium">
            <Link
              to="/"
              onClick={(e) => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="hover:text-sky-600 transition"
            >
              Trang chủ
            </Link>
            <a
              href="#features"
              onClick={(e) => handleAnchorClick(e, "features")}
              className="hover:text-sky-600 transition"
            >
              Tính năng
            </a>
            <a
              href="#about"
              onClick={(e) => handleAnchorClick(e, "about")}
              className="hover:text-sky-600 transition"
            >
              Về chúng tôi
            </a>
            <a
              href="#contact"
              onClick={(e) => handleAnchorClick(e, "contact")}
              className="hover:text-sky-600 transition"
            >
              Liên hệ
            </a>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full hover:bg-gray-200 cursor-pointer transition">
            <Search className="h-5 w-5 text-gray-600" />
          </div>
          <Link
            to="/login"
            className="px-6 py-2 text-white bg-sky-600 rounded-full hover:bg-sky-700 transition font-medium"
          >
            Đăng Nhập
          </Link>
          <Link
            to="/register"
            className="px-6 py-2 text-sky-600 bg-white border border-sky-600 rounded-full hover:bg-sky-50 transition font-medium"
          >
            Đăng Ký
          </Link>
        </div>
      </div>
    </header>
  );
}
