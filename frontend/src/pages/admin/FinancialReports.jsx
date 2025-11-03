import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { BarChart3, Download, Filter, Calendar, DollarSign, Users, Car, QrCode, TrendingUp, TrendingDown, Eye, FileText, PieChart, CreditCard, Wallet, ChevronDown, X, MoreVertical, Bell, User, LogOut, Menu, AlertTriangle, Wrench } from "lucide-react";

const FinancialReports = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dateRange, setDateRange] = useState("month");
  const [selectedReport, setSelectedReport] = useState(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Thêm state cho dropdown menus
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Refs để detect click outside
  const userMenuRef = useRef(null);
  const notificationsRef = useRef(null);

  // Notifications data
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Báo cáo mới", message: "Báo cáo tháng 11 đã sẵn sàng", time: "5 phút trước", type: "info", read: false },
    { id: 2, title: "Cập nhật hệ thống", message: "Cập nhật hệ thống lúc 02:00", time: "2 giờ trước", type: "info", read: true },
    { id: 3, title: "Báo cáo tài chính", message: "Báo cáo quý 4 đang được xử lý", time: "1 ngày trước", type: "warning", read: true }
  ]);

  // Hàm xử lý đăng xuất
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("authExpires");
    localStorage.removeItem("rememberedLogin");
    window.dispatchEvent(new Event('storage'));
    navigate("/");
  };

  // useEffect để đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Menu items cho sidebar
  const menuItems = [
    { id: "overview", label: "Tổng quan", icon: <BarChart3 className="w-5 h-5" />, link: "/admin" },
    { id: "cars", label: "Quản lý xe", icon: <Car className="w-5 h-5" />, link: "/admin/cars" },
    { id: "staff", label: "Nhân viên", icon: <Users className="w-5 h-5" />, link: "/admin/staff" },
    { id: "contracts", label: "Hợp đồng", icon: <FileText className="w-5 h-5" />, link: "/admin/contracts" },
    { id: "services", label: "Dịch vụ xe", icon: <Wrench className="w-5 h-5" />, link: "/admin/services" },
    { id: "checkinout", label: "Check in/out", icon: <QrCode className="w-5 h-5" />, link: "/admin/checkin" },
    { id: "disputes", label: "Tranh chấp", icon: <AlertTriangle className="w-5 h-5" />, link: "/admin/disputes" },
    { id: "reports", label: "Báo cáo TC", icon: <PieChart className="w-5 h-5" />, link: "/admin/financial-reports" }
  ];

  const getActiveTab = () => {
    const currentPath = location.pathname;
    const menuItem = menuItems.find(item => item.link === currentPath);
    return menuItem ? menuItem.id : "overview";
  };

  const activeTab = getActiveTab();

  const financialData = {
    revenue: {
      current: 184500000,
      previous: 156200000,
      growth: 18.1
    },
    expenses: {
      current: 89200000,
      previous: 78450000,
      growth: 13.7
    },
    profit: {
      current: 95300000,
      previous: 77750000,
      growth: 22.6
    },
    utilization: {
      current: 76,
      previous: 72,
      growth: 5.6
    }
  };

  const revenueBreakdown = [
    { category: "Thuê bao cơ bản", amount: 65400000, percentage: 35.4, trend: "up" },
    { category: "Phí sử dụng", amount: 48300000, percentage: 26.2, trend: "up" },
    { category: "Phí bảo dưỡng", amount: 31200000, percentage: 16.9, trend: "down" },
    { category: "Phí bảo hiểm", amount: 25600000, percentage: 13.9, trend: "up" },
    { category: "Khác", amount: 14000000, percentage: 7.6, trend: "up" }
  ];

  const expenseBreakdown = [
    { category: "Sạc điện", amount: 32400000, percentage: 36.3, trend: "up" },
    { category: "Bảo dưỡng", amount: 22800000, percentage: 25.6, trend: "down" },
    { category: "Bảo hiểm", amount: 15600000, percentage: 17.5, trend: "stable" },
    { category: "Nhân sự", amount: 11200000, percentage: 12.6, trend: "stable" },
    { category: "Khác", amount: 7200000, percentage: 8.1, trend: "up" }
  ];

  const reports = [
    {
      id: 1,
      title: "Báo cáo doanh thu tháng 11/2024",
      type: "Doanh thu",
      period: "01/11/2024 - 30/11/2024",
      generatedDate: "01/12/2024",
      size: "2.4 MB",
      status: "completed"
    },
    {
      id: 2,
      title: "Báo cáo chi phí vận hành",
      type: "Chi phí",
      period: "01/10/2024 - 31/10/2024",
      generatedDate: "01/11/2024",
      size: "1.8 MB",
      status: "completed"
    },
    {
      id: 3,
      title: "Báo cáo tài chính quý 4/2024",
      type: "Tổng hợp",
      period: "01/10/2024 - 31/12/2024",
      generatedDate: "Đang xử lý",
      size: "-",
      status: "processing"
    },
    {
      id: 4,
      title: "Phân tích hiệu quả đầu tư",
      type: "Phân tích",
      period: "01/01/2024 - 30/11/2024",
      generatedDate: "25/11/2024",
      size: "3.1 MB",
      status: "completed"
    }
  ];

  const carPerformance = [
    { name: "VF e34", revenue: 18450000, utilization: 78, cost: 4200000, profit: 14250000 },
    { name: "VF 8", revenue: 15680000, utilization: 65, cost: 3800000, profit: 11880000 },
    { name: "VF 9", revenue: 21450000, utilization: 82, cost: 5200000, profit: 16250000 },
    { name: "VF e34", revenue: 17230000, utilization: 71, cost: 4100000, profit: 13130000 }
  ];

  const unreadNotifications = notifications.filter(n => !n.read).length;

  const StatCard = ({ title, value, change, icon, color }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs lg:text-sm font-medium text-gray-600">{title}</p>
          <p className="text-lg lg:text-2xl font-bold text-gray-900 mt-1">
            {typeof value === 'number' ? (value / 1000000).toFixed(1) + 'M' : value}
          </p>
          <div className="flex items-center space-x-1 mt-2">
            {change > 0 ? (
              <TrendingUp className="w-3 h-3 lg:w-4 lg:h-4 text-green-600" />
            ) : (
              <TrendingDown className="w-3 h-3 lg:w-4 lg:h-4 text-red-600" />
            )}
            <span className={`text-xs lg:text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? '+' : ''}{change}%
            </span>
            <span className="text-xs text-gray-500 hidden lg:inline">so với kỳ trước</span>
          </div>
        </div>
        <div className={`p-2 lg:p-3 rounded-lg ${color} text-white shadow-sm`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );

  const ProgressBar = ({ percentage, color }) => (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className={`h-2 rounded-full ${color}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-white shadow-lg border border-gray-200"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {(sidebarOpen || mobileMenuOpen) && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", damping: 30 }}
            className="w-64 bg-white shadow-xl fixed h-full z-40 lg:z-30"
          >
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                  <Car className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">EV Co-ownership</h1>
                  <p className="text-xs text-gray-600">Admin Dashboard</p>
                </div>
              </div>
            </div>

            <nav className="p-4 space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.link}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === item.id
                      ? "bg-blue-50 text-blue-600 border border-blue-100 shadow-sm"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* User Info */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Admin</p>
                  <p className="text-xs text-gray-600">Quản trị viên</p>
                </div>
                <button 
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className={`flex-1 transition-all ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'} ${mobileMenuOpen ? 'ml-0' : ''}`}>
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-20">
          <div className="px-4 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors hidden lg:block"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Báo cáo tài chính</h1>
                <p className="text-gray-600 text-sm lg:text-base">Xuất báo cáo tài chính minh bạch cho từng nhóm</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Search Bar */}
              <div className="relative hidden md:block">
                <Download className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm kiếm báo cáo..."
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64 text-sm bg-gray-50 focus:bg-white transition-colors"
                />
              </div>

              {/* Notifications */}
              <div className="relative" ref={notificationsRef}>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setNotificationsOpen(!notificationsOpen);
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
                >
                  <Bell className="w-5 h-5 text-gray-600" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white text-xs text-white flex items-center justify-center">
                      {unreadNotifications}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {notificationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-10"
                    >
                      <div className="p-4 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-900">Thông báo</h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.map((notification) => (
                          <div key={notification.id} className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${!notification.read ? 'bg-blue-50' : ''}`}>
                            <div className="flex items-start space-x-3">
                              <div className={`w-2 h-2 rounded-full mt-2 ${
                                notification.type === 'success' ? 'bg-green-500' :
                                notification.type === 'warning' ? 'bg-amber-500' :
                                notification.type === 'info' ? 'bg-blue-500' : 'bg-red-500'
                              }`} />
                              <div className="flex-1">
                                <p className="font-medium text-gray-900 text-sm">{notification.title}</p>
                                <p className="text-gray-600 text-sm mt-1">{notification.message}</p>
                                <p className="text-gray-400 text-xs mt-2">{notification.time}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="p-4 border-t border-gray-100">
                        <button className="text-blue-600 text-sm font-medium w-full text-center hover:text-blue-800 transition-colors">
                          Xem tất cả thông báo
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Menu */}
              <div className="relative" ref={userMenuRef}>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setUserMenuOpen(!userMenuOpen);
                  }}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="text-right hidden md:block">
                    <p className="text-sm font-medium text-gray-900">Admin</p>
                    <p className="text-xs text-gray-600">Quản trị viên</p>
                  </div>
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-10"
                    >
                      <div className="p-2">
                        <button
                          onClick={() => navigate("/admin/profile")}
                          className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700"
                        >
                          <User className="w-4 h-4" />
                          <span>Hồ sơ cá́ nhân</span>
                        </button>
                        <div className="border-t border-gray-100 my-1" />
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors text-sm text-red-600"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Đăng xuất</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 lg:p-8">
          {/* Date Range and Actions */}
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between mb-6 lg:mb-8">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="px-3 lg:px-4 py-2 lg:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm lg:text-base bg-gray-50 focus:bg-white appearance-none"
                >
                  <option value="week">Tuần này</option>
                  <option value="month">Tháng này</option>
                  <option value="quarter">Quý này</option>
                  <option value="year">Năm nay</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-blue-600 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors shadow-sm text-sm lg:text-base"
              >
                <Download className="w-4 h-4 lg:w-5 lg:h-5" />
                <span>Xuất báo cáo</span>
              </motion.button>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden flex items-center space-x-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-4 h-4 text-gray-600" />
              </button>
              <button className="hidden lg:flex items-center space-x-2 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                <Filter className="w-4 h-4 text-gray-600" />
                <span>Lọc</span>
              </button>
              <button className="hidden lg:flex items-center space-x-2 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                <Calendar className="w-4 h-4 text-gray-600" />
                <span>Khoảng thời gian</span>
              </button>
            </div>
          </div>

          {/* Mobile Filters Modal */}
          <AnimatePresence>
            {mobileFiltersOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end lg:hidden z-40">
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  className="bg-white rounded-t-2xl w-full p-6 max-h-[80vh] overflow-y-auto"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Bộ lọc</h3>
                    <button 
                      onClick={() => setMobileFiltersOpen(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Khoảng thời gian</label>
                      <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="week">Tuần này</option>
                        <option value="month">Tháng này</option>
                        <option value="quarter">Quý này</option>
                        <option value="year">Năm nay</option>
                      </select>
                    </div>
                    <div className="flex gap-3 pt-4">
                      <button className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        Đặt lại
                      </button>
                      <button 
                        onClick={() => setMobileFiltersOpen(false)}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Áp dụng
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Financial Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6 lg:mb-8">
            <StatCard
              title="Tổng doanh thu"
              value={financialData.revenue.current}
              change={financialData.revenue.growth}
              icon={<DollarSign className="w-4 h-4 lg:w-6 lg:h-6" />}
              color="bg-green-500"
            />
            <StatCard
              title="Tổng chi phí"
              value={financialData.expenses.current}
              change={financialData.expenses.growth}
              icon={<CreditCard className="w-4 h-4 lg:w-6 lg:h-6" />}
              color="bg-red-500"
            />
            <StatCard
              title="Lợi nhuận"
              value={financialData.profit.current}
              change={financialData.profit.growth}
              icon={<TrendingUp className="w-4 h-4 lg:w-6 lg:h-6" />}
              color="bg-blue-500"
            />
            <StatCard
              title="Tỷ lệ sử dụng"
              value={financialData.utilization.current + '%'}
              change={financialData.utilization.growth}
              icon={<BarChart3 className="w-4 h-4 lg:w-6 lg:h-6" />}
              color="bg-purple-500"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-6 lg:mb-8">
            {/* Revenue Breakdown */}
            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Phân bổ doanh thu</h3>
                <PieChart className="w-5 h-5 text-gray-600" />
              </div>
              <div className="space-y-4">
                {revenueBreakdown.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-900">{item.category}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-gray-900">
                          {(item.amount / 1000000).toFixed(1)}M
                        </span>
                        <span className="text-xs text-gray-500">{item.percentage}%</span>
                        {item.trend === 'up' ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                    </div>
                    <ProgressBar 
                      percentage={item.percentage} 
                      color={item.trend === 'up' ? 'bg-green-500' : 'bg-red-500'}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Expense Breakdown */}
            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Phân bổ chi phí</h3>
                <Wallet className="w-5 h-5 text-gray-600" />
              </div>
              <div className="space-y-4">
                {expenseBreakdown.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-900">{item.category}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-gray-900">
                          {(item.amount / 1000000).toFixed(1)}M
                        </span>
                        <span className="text-xs text-gray-500">{item.percentage}%</span>
                        {item.trend === 'up' ? (
                          <TrendingUp className="w-4 h-4 text-red-600" />
                        ) : item.trend === 'down' ? (
                          <TrendingDown className="w-4 h-4 text-green-600" />
                        ) : (
                          <div className="w-4 h-4 text-gray-400">-</div>
                        )}
                      </div>
                    </div>
                    <ProgressBar 
                      percentage={item.percentage} 
                      color={
                        item.trend === 'up' ? 'bg-red-500' :
                        item.trend === 'down' ? 'bg-green-500' : 'bg-gray-400'
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Car Performance */}
          <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100 mb-6 lg:mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Hiệu suất theo xe</h3>
              <Car className="w-5 h-5 text-gray-600" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Xe</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doanh thu</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tỷ lệ sử dụng</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chi phí</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lợi nhuận</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hiệu suất</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {carPerformance.map((car, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <Car className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" />
                          <span className="font-medium text-gray-900 text-sm lg:text-base">{car.name}</span>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                        {(car.revenue / 1000000).toFixed(1)}M
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <ProgressBar percentage={car.utilization} color="bg-blue-500" />
                          <span className="text-sm text-gray-900">{car.utilization}%</span>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-red-600">
                        {(car.cost / 1000000).toFixed(1)}M
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                        {(car.profit / 1000000).toFixed(1)}M
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 lg:px-3 py-1 rounded-full text-xs font-medium ${
                          car.profit / car.revenue > 0.7 ? 'bg-green-100 text-green-800 border border-green-200' :
                          car.profit / car.revenue > 0.5 ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                          'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                          {((car.profit / car.revenue) * 100).toFixed(0)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Reports List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-4 lg:p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Báo cáo đã tạo</h3>
                <div className="flex items-center space-x-2">
                  <button className="hidden lg:flex items-center space-x-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                    <Filter className="w-4 h-4 text-gray-600" />
                    <span>Lọc</span>
                  </button>
                  <button className="hidden lg:flex items-center space-x-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <span>Khoảng thời gian</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Báo cáo</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kích thước</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 lg:px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" />
                          <div>
                            <div className="font-medium text-gray-900 text-sm lg:text-base">{report.title}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <span className="px-2 lg:px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium border border-blue-200">
                          {report.type}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {report.period}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {report.generatedDate}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {report.size}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => setSelectedReport(report)}
                            className="text-blue-600 hover:text-blue-900 flex items-center space-x-1 text-xs lg:text-sm"
                          >
                            <Eye className="w-4 h-4" />
                            <span>Xem</span>
                          </button>
                          <button className="text-green-600 hover:text-green-900 flex items-center space-x-1 text-xs lg:text-sm">
                            <Download className="w-4 h-4" />
                            <span>Tải</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Report Detail Modal */}
      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-xl lg:rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-4 lg:p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl lg:text-2xl font-bold text-gray-900">{selectedReport.title}</h2>
                    <p className="text-gray-600 text-sm lg:text-base">{selectedReport.period}</p>
                  </div>
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="p-4 lg:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-6 lg:mb-8">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Thông tin báo cáo</h4>
                    <div className="space-y-3 lg:space-y-4">
                      <div className="flex justify-between text-sm lg:text-base">
                        <span className="text-gray-600">Tiêu đề:</span>
                        <span className="font-medium">{selectedReport.title}</span>
                      </div>
                      <div className="flex justify-between text-sm lg:text-base">
                        <span className="text-gray-600">Loại báo cáo:</span>
                        <span className="font-medium">{selectedReport.type}</span>
                      </div>
                      <div className="flex justify-between text-sm lg:text-base">
                        <span className="text-gray-600">Thời gian:</span>
                        <span className="font-medium">{selectedReport.period}</span>
                      </div>
                      <div className="flex justify-between text-sm lg:text-base">
                        <span className="text-gray-600">Ngày tạo:</span>
                        <span className="font-medium">{selectedReport.generatedDate}</span>
                      </div>
                      <div className="flex justify-between text-sm lg:text-base">
                        <span className="text-gray-600">Kích thước:</span>
                        <span className="font-medium">{selectedReport.size}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Tóm tắt</h4>
                    <div className="space-y-3 lg:space-y-4 p-4 lg:p-6 bg-blue-50 rounded-xl border border-blue-200">
                      <div className="flex justify-between text-sm lg:text-base">
                        <span className="text-blue-900">Tổng doanh thu:</span>
                        <span className="font-semibold text-blue-900">184.5M VND</span>
                      </div>
                      <div className="flex justify-between text-sm lg:text-base">
                        <span className="text-blue-900">Tổng chi phí:</span>
                        <span className="font-semibold text-blue-900">89.2M VND</span>
                      </div>
                      <div className="flex justify-between text-sm lg:text-base">
                        <span className="text-blue-900">Lợi nhuận:</span>
                        <span className="font-semibold text-blue-900">95.3M VND</span>
                      </div>
                      <div className="flex justify-between text-sm lg:text-base">
                        <span className="text-blue-900">Tỷ lệ sử dụng:</span>
                        <span className="font-semibold text-blue-900">76%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col lg:flex-row space-y-3 lg:space-y-0 lg:space-x-3 pt-6 border-t border-gray-200">
                  <button className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 text-sm lg:text-base">
                    <Download className="w-4 h-4 lg:w-5 lg:h-5" />
                    <span>Tải PDF</span>
                  </button>
                  <button className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 text-sm lg:text-base">
                    <FileText className="w-4 h-4 lg:w-5 lg:h-5" />
                    <span>Tải Excel</span>
                  </button>
                  <button className="flex-1 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2 text-sm lg:text-base">
                    <BarChart3 className="w-4 h-4 lg:w-5 lg:h-5" />
                    <span>Phân tích nâng cao</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FinancialReports;