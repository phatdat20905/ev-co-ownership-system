import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Users, Car, FileText, CreditCard, AlertTriangle, TrendingUp, BarChart3, MessageCircle, Bell, User, LogOut, Search, Wrench, CheckCircle, DollarSign, Calendar, PieChart, ChevronDown, Menu, X } from "lucide-react";


const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [time, setTime] = useState(new Date());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const [notifications, setNotifications] = useState([
    { id: 1, title: "Bảo dưỡng định kỳ", message: "Xe VF e34 cần bảo dưỡng tháng 11", time: "2 giờ trước", type: "warning", read: false },
    { id: 2, title: "Thanh toán thành công", message: "Co-owner Minh Nguyễn đã thanh toán tháng 10", time: "5 giờ trước", type: "success", read: true },
    { id: 3, title: "Đặt lịch mới", message: "Co-owner Lan Phương đặt lịch sử dụng 15/11", time: "1 ngày trước", type: "info", read: true }
  ]);

  // Cập nhật thời gian mỗi phút
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = () => {
      setUserMenuOpen(false);
      setNotificationsOpen(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const stats = {
    totalUsers: 156,
    totalCars: 24,
    activeContracts: 89,
    monthlyRevenue: 184500000,
    utilizationRate: 76,
    pendingIssues: 3,
    staffMembers: 8,
    activeDisputes: 2,
    todayBookings: 12,
    maintenanceDue: 4,
    totalRevenue: 452300000
  };

  const recentActivities = [
    { id: 1, user: "Minh Nguyễn", action: "Check-in xe VF e34", time: "10 phút trước", type: "success" },
    { id: 2, user: "Lan Phương", action: "Thanh toán thành công", time: "30 phút trước", type: "success" },
    { id: 3, user: "Tuấn Anh", action: "Yêu cầu bảo dưỡng", time: "1 giờ trước", type: "warning" },
    { id: 4, user: "Hồng Nhung", action: "Tranh chấp lịch sử dụng", time: "2 giờ trước", type: "error" },
    { id: 5, user: "Văn Nam", action: "Đăng ký thành viên mới", time: "3 giờ trước", type: "info" }
  ];

  const quickActions = [
    {
      title: "Quản lý xe",
      description: "Thêm, sửa, xóa xe trong hệ thống",
      icon: <Car className="w-6 h-6" />,
      color: "from-blue-500 to-blue-600",
      link: "/admin/cars"
    },
    {
      title: "Quản lý nhân viên",
      description: "Thêm, xóa, phân quyền staff",
      icon: <Users className="w-6 h-6" />,
      color: "from-green-500 to-green-600",
      link: "/admin/staff"
    },
    {
      title: "Hợp đồng",
      description: "E-contract & quản lý pháp lý",
      icon: <FileText className="w-6 h-6" />,
      color: "from-purple-500 to-purple-600",
      link: "/admin/contracts"
    },
    {
      title: "Dịch vụ xe",
      description: "Lịch bảo dưỡng & sửa chữa",
      icon: <Wrench className="w-6 h-6" />,
      color: "from-orange-500 to-orange-600",
      link: "/admin/services"
    },
    {
      title: "Xử lý tranh chấp",
      description: "Giải quyết vấn đề thành viên",
      icon: <AlertTriangle className="w-6 h-6" />,
      color: "from-red-500 to-red-600",
      link: "/admin/disputes"
    },
    {
      title: "Báo cáo tài chính",
      description: "Xuất báo cáo doanh thu",
      icon: <BarChart3 className="w-6 h-6" />,
      color: "from-indigo-500 to-indigo-600",
      link: "/admin/financial-reports"
    }
  ];

  const carGroups = [
    { id: 1, name: "Nhóm VF e34", cars: 8, coOwners: 32, utilization: 78, status: "active", revenue: 18450000 },
    { id: 2, name: "Nhóm VF 8", cars: 6, coOwners: 18, utilization: 65, status: "active", revenue: 15680000 },
    { id: 3, name: "Nhóm VF 9", cars: 4, coOwners: 20, utilization: 82, status: "active", revenue: 21450000 },
    { id: 4, name: "Nhóm Premium", cars: 6, coOwners: 24, utilization: 71, status: "maintenance", revenue: 17230000 }
  ];

  const revenueData = {
    monthly: [45, 52, 48, 58, 65, 72, 68, 76, 80, 78, 82, 85],
    categories: [
      { name: "Thuê bao", amount: 65400000, percentage: 35.4, color: "bg-blue-500" },
      { name: "Sử dụng", amount: 48300000, percentage: 26.2, color: "bg-green-500" },
      { name: "Bảo dưỡng", amount: 31200000, percentage: 16.9, color: "bg-amber-500" },
      { name: "Bảo hiểm", amount: 25600000, percentage: 13.9, color: "bg-purple-500" },
      { name: "Khác", amount: 14000000, percentage: 7.6, color: "bg-gray-400" }
    ]
  };

  const menuItems = [
    { id: "overview", label: "Tổng quan", icon: <BarChart3 className="w-5 h-5" />, link: "/admin" },
    { id: "cars", label: "Quản lý xe", icon: <Car className="w-5 h-5" />, link: "/admin/cars" },
    { id: "staff", label: "Nhân viên", icon: <Users className="w-5 h-5" />, link: "/admin/staff" },
    { id: "contracts", label: "Hợp đồng", icon: <FileText className="w-5 h-5" />, link: "/admin/contracts" },
    { id: "services", label: "Dịch vụ xe", icon: <Wrench className="w-5 h-5" />, link: "/admin/services" },
    { id: "disputes", label: "Tranh chấp", icon: <AlertTriangle className="w-5 h-5" />, link: "/admin/disputes" },
    { id: "reports", label: "Báo cáo TC", icon: <PieChart className="w-5 h-5" />, link: "/admin/financial-reports" }
  ];

  const getActiveTab = () => {
    const currentPath = location.pathname;
    const menuItem = menuItems.find(item => item.link === currentPath);
    return menuItem ? menuItem.id : "overview";
  };

  const activeTab = getActiveTab();

  const unreadNotifications = notifications.filter(n => !n.read).length;

  const StatCard = ({ title, value, change, icon, color, onClick, subtitle }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all duration-200"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          {change && (
            <div className="flex items-center mt-2">
              <div className={`w-2 h-2 rounded-full ${change > 0 ? 'bg-green-500' : 'bg-red-500'} mr-2`} />
              <p className={`text-xs font-medium ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {change > 0 ? '+' : ''}{change}% so với tháng trước
              </p>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color} text-white shadow-sm`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );

  const QuickActionCard = ({ title, description, icon, color, link, action }) => (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all duration-200 group"
      onClick={link ? () => navigate(link) : action}
    >
      <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${color} flex items-center justify-center text-white shadow-sm group-hover:shadow-md transition-all mb-3`}>
        {icon}
      </div>
      <h3 className="font-semibold text-gray-900 text-base mb-1">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </motion.div>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Tổng quan hệ thống</h1>
          <p className="text-gray-600 mt-1">{time.toLocaleDateString('vi-VN', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>
        </div>
        <div className="text-right">
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <p className="text-lg font-semibold text-gray-900">
              {time.toLocaleTimeString('vi-VN', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: false 
              })}
            </p>
          </div>
          <p className="text-gray-500 text-sm mt-1">Cập nhật mỗi phút</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tổng người dùng"
          value={stats.totalUsers}
          change={12}
          icon={<Users className="w-5 h-5" />}
          color="bg-blue-500"
        />
        <StatCard
          title="Tổng xe"
          value={stats.totalCars}
          change={5}
          icon={<Car className="w-5 h-5" />}
          color="bg-green-500"
        />
        <StatCard
          title="Doanh thu tháng"
          value={`${(stats.monthlyRevenue / 1000000).toFixed(1)}M`}
          change={15}
          icon={<CreditCard className="w-5 h-5" />}
          color="bg-amber-500"
          subtitle="VND"
        />
        <StatCard
          title="Tỷ lệ sử dụng"
          value={`${stats.utilizationRate}%`}
          change={3}
          icon={<TrendingUp className="w-5 h-5" />}
          color="bg-indigo-500"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Đặt lịch hôm nay"
          value={stats.todayBookings}
          subtitle="12 check-in dự kiến"
          icon={<Calendar className="w-5 h-5" />}
          color="bg-purple-500"
        />
        <StatCard
          title="Bảo dưỡng đã đến hạn"
          value={stats.maintenanceDue}
          subtitle="Cần xử lý"
          icon={<Wrench className="w-5 h-5" />}
          color="bg-orange-500"
        />
        <StatCard
          title="Tranh chấp đang chờ"
          value={stats.activeDisputes}
          change={-2}
          icon={<AlertTriangle className="w-5 h-5" />}
          color="bg-red-500"
          onClick={() => navigate('/admin/disputes')}
        />
        <StatCard
          title="Tổng doanh thu"
          value={`${(stats.totalRevenue / 1000000000).toFixed(1)}B`}
          change={22}
          icon={<DollarSign className="w-5 h-5" />}
          color="bg-teal-500"
          subtitle="VND"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Hành động nhanh</h3>
          <div className="text-sm text-gray-500">Truy cập nhanh các tính năng</div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <QuickActionCard key={index} {...action} />
          ))}
        </div>
      </div>

      {/* Charts and Data */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Doanh thu hàng tháng</h3>
            <div className="text-sm text-gray-500">Triệu VND</div>
          </div>
          <div className="h-64 flex items-end justify-between space-x-1">
            {revenueData.monthly.map((value, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${value}%` }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg hover:from-blue-600 hover:to-blue-500 transition-all cursor-pointer relative group"
                >
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {value} triệu
                  </div>
                </motion.div>
                <span className="text-xs text-gray-500 mt-2 font-medium">{index + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Phân bổ doanh thu</h3>
          <div className="space-y-4">
            {revenueData.categories.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-900">{item.name}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-gray-900">
                      {(item.amount / 1000000).toFixed(1)}M
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{item.percentage}%</span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    className={`h-2 rounded-full ${item.color}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Car Groups & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Car Groups */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Nhóm xe đồng sở hữu</h3>
            <button 
              onClick={() => navigate('/admin/cars')}
              className="text-blue-600 text-sm font-medium hover:text-blue-800 transition-colors flex items-center gap-1"
            >
              Xem tất cả <ChevronDown className="w-4 h-4 rotate-270" />
            </button>
          </div>
          <div className="space-y-3">
            {carGroups.map((group) => (
              <div key={group.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors group">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm">
                    <Car className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{group.name}</p>
                    <p className="text-xs text-gray-600">{group.cars} xe • {group.coOwners} thành viên</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{group.utilization}%</p>
                  <p className="text-sm text-green-600 font-medium">{(group.revenue / 1000000).toFixed(1)}M</p>
                  <p className={`text-xs ${group.status === 'active' ? 'text-green-600' : 'text-amber-600'} font-medium`}>
                    {group.status === 'active' ? 'Đang hoạt động' : 'Bảo dưỡng'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Hoạt động gần đây</h3>
            <button className="text-blue-600 text-sm font-medium hover:text-blue-800 transition-colors flex items-center gap-1">
              Xem tất cả <ChevronDown className="w-4 h-4 rotate-270" />
            </button>
          </div>
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors group">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.type === 'success' ? 'bg-green-100 text-green-600' : 
                    activity.type === 'warning' ? 'bg-amber-100 text-amber-600' : 
                    activity.type === 'error' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {activity.type === 'success' ? <CheckCircle className="w-4 h-4" /> :
                     activity.type === 'warning' ? <AlertTriangle className="w-4 h-4" /> :
                     activity.type === 'error' ? <AlertTriangle className="w-4 h-4" /> :
                     <User className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{activity.user}</p>
                    <p className="text-sm text-gray-600">{activity.action}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
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
                  <p className="text-sm font-medium text-gray-900">Admin User</p>
                  <p className="text-xs text-gray-600">Quản trị viên</p>
                </div>
                <button 
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={() => {
                    console.log('Đăng xuất');
                  }}
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
              <h2 className="text-xl font-semibold text-gray-900">
                {menuItems.find(item => item.id === activeTab)?.label || "Tổng quan"}
              </h2>
            </div>

            <div className="flex items-center space-x-3">
              {/* Search Bar */}
              <div className="relative hidden md:block">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64 text-sm bg-gray-50 focus:bg-white transition-colors"
                />
              </div>

              {/* Notifications */}
              <div className="relative">
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
              <div className="relative">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setUserMenuOpen(!userMenuOpen);
                  }}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="text-right hidden md:block">
                    <p className="text-sm font-medium text-gray-900">Admin User</p>
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
                        <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700">
                          <User className="w-4 h-4" />
                          <span>Hồ sơ</span>
                        </button>
                        <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700">
                          <Settings className="w-4 h-4" />
                          <span>Cài đặt</span>
                        </button>
                        <div className="border-t border-gray-100 my-1" />
                        <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors text-sm text-red-600">
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
          {activeTab === "overview" && renderOverview()}
          {activeTab !== "overview" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                {menuItems.find(item => item.id === activeTab)?.icon}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {menuItems.find(item => item.id === activeTab)?.label}
              </h2>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Chức năng này đã được chuyển hướng đến trang riêng. Vui lòng sử dụng menu bên trái để điều hướng.
              </p>
              <button
                onClick={() => navigate(menuItems.find(item => item.id === activeTab)?.link || "/admin")}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
              >
                Đi đến trang {menuItems.find(item => item.id === activeTab)?.label}
              </button>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;