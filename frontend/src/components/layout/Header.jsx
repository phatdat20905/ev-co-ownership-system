import React, { useState, useEffect } from "react";
import { Search, Bell, Menu, X, Car, User, LogOut, Settings, ChevronDown } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";

// Hàm cuộn 
const smoothScrollTo = (targetPosition, duration = 600) => {
  const startPosition = window.pageYOffset;
  const distance = targetPosition - startPosition;
  if (Math.abs(distance) < 5) return;
  let startTime = null;
  const animation = (currentTime) => {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);
    const easeOutQuart = t => 1 - Math.pow(1 - t, 4);
    const run = easeOutQuart(progress) * distance + startPosition;
    window.scrollTo(0, run);
    if (timeElapsed < duration) {
      requestAnimationFrame(animation);
    }
  };

  requestAnimationFrame(animation);
};

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [activeSection, setActiveSection] = useState("");
  
  const navigate = useNavigate();
  const location = useLocation();

  // Kiểm tra trạng thái đăng nhập
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem('authToken');
      const user = JSON.parse(localStorage.getItem('userData') || 'null');
      
      if (token && user) {
        setIsLoggedIn(true);
        setUserData(user);
      } else {
        setIsLoggedIn(false);
        setUserData(null);
      }
    };

    checkAuthStatus();
    window.addEventListener('storage', checkAuthStatus);
    
    const interval = setInterval(checkAuthStatus, 1000);
    
    return () => {
      window.removeEventListener('storage', checkAuthStatus);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      
      // active
      const sections = ['features', 'process', 'about', 'testimonials', 'contact'];
      const scrollPosition = window.scrollY + 100;
      
      let currentActive = "";
      
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetBottom = offsetTop + element.offsetHeight;
          
          if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
            if (section === 'testimonials') {
              currentActive = '#about';
            } else {
              currentActive = `#${section}`;
            }
            break;
          }
        }
      }
      
      setActiveSection(currentActive);
    };
    
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      setActiveSection(window.location.hash);
    };
    
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Xử lý active 
  useEffect(() => {
    const contactPages = [
      '/quy-dinh-hoat-dong',
      '/chinh-sach-bao-mat',
      '/bang-quyen-loi-thanh-vien'
    ];
    
    if (contactPages.includes(location.pathname)) {
      setActiveSection('#contact');
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setIsLoggedIn(false);
    setUserData(null);
    setIsUserMenuOpen(false);
    navigate('/');
    window.dispatchEvent(new Event('storage'));
  };

  // Các nhóm chức năng cho Co-owner
  const coOwnerNavGroups = [
    {
      key: 'ownership',
      title: 'Quyền sở hữu',
      basePath: '/dashboard/coowner/ownership',
      items: [
        { name: 'Tỷ lệ sở hữu', href: '/dashboard/coowner/ownership', exact: true },
        { name: 'Hợp đồng', href: '/dashboard/coowner/ownership/contract', exact: false },
        { name: 'Tài liệu', href: '/dashboard/coowner/ownership/documents', exact: false }
      ]
    },
    {
      key: 'booking',
      title: 'Đặt lịch',
      basePath: '/dashboard/coowner/booking',
      items: [
        { name: 'Lịch xe', href: '/dashboard/coowner/booking', exact: true },
        { name: 'Đặt lịch', href: '/dashboard/coowner/booking/new', exact: false },
        { name: 'Lịch biểu', href: '/dashboard/coowner/booking/schedule', exact: false }
      ]
    },
    {
      key: 'financial',
      title: 'Tài chính',
      basePath: '/dashboard/coowner/financial',
      items: [
        { name: 'Chi phí', href: '/dashboard/coowner/financial', exact: true },
        { name: 'Lịch sử thanh toán', href: '/dashboard/coowner/financial/payment', exact: false },
        { name: 'Theo dõi chi phí', href: '/dashboard/coowner/financial/expense-tracking', exact: false }
      ]
    },
    {
      key: 'history',
      title: 'Lịch sử',
      basePath: '/dashboard/coowner/history',
      items: [
        { name: 'Sử dụng', href: '/dashboard/coowner/history', exact: true },
        { name: 'Phân tích', href: '/dashboard/coowner/history/analytics', exact: false }
      ]
    },
    {
      key: 'group',
      title: 'Nhóm',
      basePath: '/dashboard/coowner/group',
      items: [
        { name: 'Thành viên', href: '/dashboard/coowner/group', exact: true },
        { name: 'Bỏ phiếu', href: '/dashboard/coowner/group/voting', exact: false },
        { name: 'Quỹ chung', href: '/dashboard/coowner/group/fund', exact: false }
      ]
    }
  ];

  // Navigation items cho chưa đăng nhập
  const guestNavItems = [
    { name: "Trang chủ", href: "/", exact: true },
    { name: "Tính năng", href: "#features", exact: false },
    { name: "Quy trình", href: "#process", exact: false },
    { name: "Về chúng tôi", href: "#about", exact: false },
    { name: "Liên hệ", href: "#contact", exact: false },
  ];

  // User menu items
  const userMenuItems = [
    { name: "Hồ sơ cá nhân", icon: User, action: () => navigate('/dashboard/coowner/account/profile') },
    { name: "Đăng xuất", icon: LogOut, action: handleLogout },
  ];

  const isActive = (href, exact = false) => {
    const contactPages = [
      '/quy-dinh-hoat-dong',
      '/chinh-sach-bao-mat',
      '/bang-quyen-loi-thanh-vien'
    ];
    
    if (contactPages.includes(location.pathname) && href === '#contact') {
      return true;
    }
    
    if (href.startsWith('#')) {
      return activeSection === href;
    }
  
    if (href === '/' && exact) {
      return location.pathname === '/' && !activeSection;
    }
    
    if (exact) {
      return location.pathname === href;
    }
    
    return location.pathname.startsWith(href);
  };

  const isGroupActive = (group) => {
    return group.items.some(item => isActive(item.href, item.exact));
  };

  const isDashboardActive = () => {
    return location.pathname === '/dashboard/coowner';
  };

  const handleDropdownToggle = (key) => {
    setOpenDropdown(openDropdown === key ? null : key);
  };

  const handleDropdownItemClick = (item) => {
    navigate(item.href);
    setOpenDropdown(null);
    setIsMobileMenuOpen(false);
  };

  // Hàm xử lý click cho các trang liên hệ
  const handleContactPageClick = (pagePath) => {
    navigate(pagePath);
    setActiveSection('#contact');
    setIsMobileMenuOpen(false);
  };

  // Hàm xử lý click
  const handleGuestNavClick = (href, exact = false) => {
    if (href.startsWith('#')) {
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          const element = document.getElementById(href.substring(1));
          if (element) {
            const headerOffset = 80;
            const elementPosition = element.offsetTop - headerOffset;
            smoothScrollTo(elementPosition);
            setActiveSection(href);
            window.history.replaceState(null, '', `/#${href.substring(1)}`);
          }
        }, 100);
      } else {
        const element = document.getElementById(href.substring(1));
        if (element) {
          const headerOffset = 80;
          const elementPosition = element.offsetTop - headerOffset;
          smoothScrollTo(elementPosition);
          setActiveSection(href);
          window.history.replaceState(null, '', `/#${href.substring(1)}`);
        }
      }
      setIsMobileMenuOpen(false);
    } else {
      if (href === '/' && location.pathname === '/') {
        smoothScrollTo(0, 500);
        setActiveSection(''); 
        window.history.replaceState(null, '', '/'); 
      } else {
        navigate(href);
      }
      setIsMobileMenuOpen(false);
    }
  };

  // Xử lý click logo
  const handleLogoClick = (e) => {
    if (location.pathname === '/') {
      e.preventDefault();
      smoothScrollTo(0, 500);
      setActiveSection('');
      window.history.replaceState(null, '', '/');
    }
  };

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isUserMenuOpen && !event.target.closest('.user-menu-container')) {
        setIsUserMenuOpen(false);
      }
      if (openDropdown && !event.target.closest('.dropdown-container')) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen, openDropdown]);

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
              className="flex items-center gap-3 group"
              onClick={handleLogoClick}
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
            <nav className="hidden lg:flex items-center gap-1">
              {isLoggedIn ? (
                <>
                  {/* Dashboard Link */}
                  <Link
                    to="/dashboard/coowner"
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 hover:text-sky-600 hover:scale-105 ${
                      isDashboardActive() ? 'text-sky-600 bg-sky-50' : 'text-gray-600'
                    }`}
                  >
                    Dashboard
                  </Link>

                  {/* Dropdown Groups */}
                  {coOwnerNavGroups.map((group) => (
                    <div key={group.key} className="relative dropdown-container">
                      <button
                        onClick={() => handleDropdownToggle(group.key)}
                        className={`flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 hover:text-sky-600 hover:scale-105 ${
                          openDropdown === group.key || isGroupActive(group)
                            ? 'text-sky-600 bg-sky-50' 
                            : 'text-gray-600'
                        }`}
                      >
                        <span>{group.title}</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${
                          openDropdown === group.key ? "rotate-180" : ""
                        }`} />
                      </button>

                      {/* Dropdown Menu */}
                      {openDropdown === group.key && (
                        <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                          {group.items.map((item, index) => (
                            <button
                              key={index}
                              onClick={() => handleDropdownItemClick(item)}
                              className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                                isActive(item.href, item.exact) 
                                  ? "bg-sky-50 text-sky-600" 
                                  : "text-gray-700 hover:bg-sky-50 hover:text-sky-600"
                              }`}
                            >
                              {item.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </>
              ) : (
                // Guest navigation 
                <div className="flex items-center gap-1">
                  {guestNavItems.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => handleGuestNavClick(item.href, item.exact)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 hover:text-sky-600 hover:scale-105 ${
                        isActive(item.href, item.exact) 
                          ? "text-sky-600 bg-sky-50"
                          : "text-gray-600 hover:text-sky-600"
                      }`}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              )}
            </nav>
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Search icon */}
            <button className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full hover:bg-gray-200 cursor-pointer transition-all duration-300 hover:scale-110">
              <Search className="h-5 w-5 text-gray-600" />
            </button>

            {/* Notification icon */}
            <button className="relative flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full hover:bg-gray-200 cursor-pointer transition-all duration-300 hover:scale-110">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Auth Buttons hoặc User Menu */}
            {isLoggedIn ? (
              <div className="relative user-menu-container">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-3 px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-all duration-300"
                >
                  <div className="w-8 h-8 bg-sky-600 rounded-full flex items-center justify-center text-white font-medium">
                    {userData?.name?.charAt(0) || 'U'}
                  </div>
                  <span className="text-sm text-gray-700 font-medium">
                    {userData?.name || 'User'}
                  </span>
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{userData?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{userData?.email}</p>
                    </div>
                    {userMenuItems.map((item, index) => (
                      <button
                        key={index}
                        onClick={item.action}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-sky-50 hover:text-sky-600 transition-colors"
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`px-6 py-2 text-base rounded-full transition-all duration-300 font-medium hover:shadow-lg hover:scale-105 ${
                    location.pathname === '/login' 
                      ? 'bg-sky-700 text-white' 
                      : 'bg-sky-600 text-white hover:bg-sky-700'
                  }`}
                >
                  Đăng Nhập
                </Link>
                <Link
                  to="/register"
                  className={`px-6 py-2 text-base bg-white border rounded-full transition-all duration-300 font-medium hover:shadow-lg hover:scale-105 ${
                    location.pathname === '/register'
                      ? 'border-sky-700 text-sky-700 bg-sky-50'
                      : 'border-sky-600 text-sky-600 hover:bg-sky-50'
                  }`}
                >
                  Đăng ký
                </Link>
              </>
            )}
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
            ? "max-h-screen opacity-100 bg-white border-t border-gray-200" 
            : "max-h-0 opacity-0"
        }`}>
          <div className="px-6 py-4 space-y-2">
            {isLoggedIn ? (
              <>
                {/* Dashboard Link */}
                <Link
                  to="/dashboard/coowner"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block w-full text-left py-3 px-4 text-sm font-medium rounded-lg transition-colors ${
                    isDashboardActive() 
                      ? 'bg-sky-50 text-sky-600' 
                      : 'text-gray-700 hover:bg-sky-50 hover:text-sky-600'
                  }`}
                >
                  Dashboard
                </Link>

                {/* Dropdown Groups */}
                {coOwnerNavGroups.map((group) => (
                  <div key={group.key} className="dropdown-container">
                    <button
                      onClick={() => handleDropdownToggle(group.key)}
                      className={`flex items-center justify-between w-full text-left py-3 px-4 text-sm font-medium rounded-lg transition-colors ${
                        isGroupActive(group)
                          ? 'bg-sky-50 text-sky-600' 
                          : 'text-gray-700 hover:bg-sky-50 hover:text-sky-600'
                      }`}
                    >
                      <span>{group.title}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${
                        openDropdown === group.key ? "rotate-180" : ""
                      }`} />
                    </button>
                    
                    {openDropdown === group.key && (
                      <div className="pl-6 space-y-1 mt-1">
                        {group.items.map((item, index) => (
                          <Link
                            key={index}
                            to={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`block w-full text-left py-2 px-4 text-xs rounded-lg transition-colors ${
                              isActive(item.href, item.exact)
                                ? 'bg-sky-50 text-sky-600'
                                : 'text-gray-600 hover:bg-sky-50 hover:text-sky-600'
                            }`}
                          >
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </>
            ) : (
              // Mobile guest navigation - ĐÃ ĐƯỢC SỬA
              <>
                {guestNavItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleGuestNavClick(item.href, item.exact)}
                    className={`block w-full text-left py-3 px-4 text-sm font-medium rounded-lg transition-colors ${
                      isActive(item.href, item.exact) 
                        ? 'bg-sky-50 text-sky-600'
                        : 'text-gray-700 hover:bg-sky-50 hover:text-sky-600'
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
                
                {/* Các trang liên hệ trong mobile menu */}
                <div className="pl-4 border-l-2 border-gray-200 mt-2">
                  <p className="text-xs font-medium text-gray-500 uppercase mb-2">Thông tin</p>
                  <button
                    onClick={() => handleContactPageClick('/quy-dinh-hoat-dong')}
                    className={`block w-full text-left py-2 px-4 text-sm rounded-lg transition-colors ${
                      location.pathname === '/quy-dinh-hoat-dong' 
                        ? 'bg-sky-50 text-sky-600' 
                        : 'text-gray-600 hover:bg-sky-50 hover:text-sky-600'
                    }`}
                  >
                    Quy định hoạt động
                  </button>
                  <button
                    onClick={() => handleContactPageClick('/chinh-sach-bao-mat')}
                    className={`block w-full text-left py-2 px-4 text-sm rounded-lg transition-colors ${
                      location.pathname === '/chinh-sach-bao-mat' 
                        ? 'bg-sky-50 text-sky-600' 
                        : 'text-gray-600 hover:bg-sky-50 hover:text-sky-600'
                    }`}
                  >
                    Chính sách bảo mật
                  </button>
                  <button
                    onClick={() => handleContactPageClick('/bang-quyen-loi-thanh-vien')}
                    className={`block w-full text-left py-2 px-4 text-sm rounded-lg transition-colors ${
                      location.pathname === '/bang-quyen-loi-thanh-vien' 
                        ? 'bg-sky-50 text-sky-600' 
                        : 'text-gray-600 hover:bg-sky-50 hover:text-sky-600'
                    }`}
                  >
                    Bảng quyền lợi thành viên
                  </button>
                </div>
              </>
            )}
            
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
              
              {isLoggedIn ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-sky-600 rounded-full flex items-center justify-center text-white font-medium">
                      {userData?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{userData?.name}</p>
                      <p className="text-xs text-gray-500">Co-owner</p>
                    </div>
                  </div>
                  {userMenuItems.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        item.action();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 py-3 px-4 text-sm text-gray-700 rounded-lg hover:bg-sky-50 hover:text-sky-600 transition-colors"
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to="/login"
                    className={`py-3 text-center text-base font-medium rounded-lg transition-colors ${
                      location.pathname === '/login'
                        ? 'bg-sky-100 text-sky-700'
                        : 'text-sky-600 hover:bg-sky-50'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Đăng Nhập
                  </Link>
                  <Link
                    to="/register"
                    className={`py-3 text-center text-base font-medium rounded-lg transition-colors ${
                      location.pathname === '/register'
                        ? 'bg-sky-700 text-white'
                        : 'bg-sky-600 text-white hover:bg-sky-700'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Đăng ký
                  </Link>
                </div>
              )}
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