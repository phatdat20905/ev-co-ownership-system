import React, { useState, useEffect } from "react";
import { Search, Bell, Menu, X, Car } from "lucide-react";
import { Link } from "react-router-dom";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.offsetTop - headerOffset;
      smoothScrollTo(elementPosition, 700);
      setIsMobileMenuOpen(false);
    }
  };

  const navItems = [
    { name: "Trang chủ", href: "/", action: () => window.scrollTo({ top: 0, behavior: "smooth" }) },
    { name: "Tính năng", href: "#features", action: (e) => handleAnchorClick(e, "features") },
    { name: "Quy trình", href: "#process", action: (e) => handleAnchorClick(e, "process") },
    { name: "Về chúng tôi", href: "#about", action: (e) => handleAnchorClick(e, "about") },
    { name: "Liên hệ", href: "#contact", action: (e) => handleAnchorClick(e, "contact") },
  ];

  return (
    <>
      <header className={`w-full fixed top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-200/50" 
          : "bg-white/90 backdrop-blur-md border-b border-gray-200"
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo + Nav */}
          <div className="flex items-center gap-8">
            <Link
              to="/"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="flex items-center gap-3 group"
            >
              <div className={`p-2 rounded-2xl transition-all duration-300 ${
                isScrolled 
                  ? "bg-sky-600 text-white shadow-lg" 
                  : "bg-sky-600 text-white shadow-lg"
              } group-hover:bg-sky-700`}>
                <Car className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className={`text-xl font-bold transition-colors ${
                  isScrolled ? "text-gray-900" : "text-gray-900"
                } group-hover:text-sky-600`}>
                  EV Co-ownership
                </span>
                <span className={`text-xs transition-colors ${
                  isScrolled ? "text-gray-600" : "text-gray-600"
                }`}>
                  Drive Smart, Share Smarter
                </span>
              </div>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6 text-gray-600 font-medium">
              {navItems.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  onClick={item.action}
                  className="hover:text-sky-600 transition-all duration-300 hover:scale-105"
                >
                  {item.name}
                </a>
              ))}
            </nav>
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Search icon */}
            <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full hover:bg-gray-200 cursor-pointer transition-all duration-300 hover:scale-110">
              <Search className="h-5 w-5 text-gray-600" />
            </div>

            {/* Notification icon */}
            <div className="relative flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full hover:bg-gray-200 cursor-pointer transition-all duration-300 hover:scale-110">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </div>

            {/* Auth Buttons */}
            <Link
              to="/login"
              className="px-6 py-2 text-white bg-sky-600 rounded-full hover:bg-sky-700 transition-all duration-300 font-medium hover:shadow-lg hover:scale-105"
            >
              Đăng Nhập
            </Link>
            <Link
              to="/register"
              className="px-6 py-2 text-sky-600 bg-white border border-sky-600 rounded-full hover:bg-sky-50 transition-all duration-300 font-medium hover:shadow-lg hover:scale-105"
            >
              Đăng Ký
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-all duration-300"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6 text-gray-600" /> : <Menu className="w-6 h-6 text-gray-600" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className={`lg:hidden transition-all duration-300 overflow-hidden ${
          isMobileMenuOpen 
            ? "max-h-96 opacity-100 bg-white border-t border-gray-200" 
            : "max-h-0 opacity-0"
        }`}>
          <div className="px-6 py-4 space-y-2">
            {navItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                onClick={item.action}
                className="block py-3 px-4 text-gray-700 font-medium rounded-lg hover:bg-sky-50 hover:text-sky-600 transition-colors"
              >
                {item.name}
              </a>
            ))}
            
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <button className="flex-1 p-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                  <Search className="w-5 h-5 mx-auto" />
                </button>
                <button className="flex-1 p-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors relative">
                  <Bell className="w-5 h-5 mx-auto" />
                  <span className="absolute top-2 right-6 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/login"
                  className="py-3 text-center text-sky-600 font-medium rounded-lg hover:bg-sky-50 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Đăng Nhập
                </Link>
                <Link
                  to="/register"
                  className="py-3 text-center bg-sky-600 text-white font-medium rounded-lg hover:bg-sky-700 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Đăng Ký
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}