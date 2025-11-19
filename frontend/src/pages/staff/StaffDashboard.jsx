import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Users,
  Car,
  FileText,
  CreditCard,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  MessageCircle,
  Bell,
  User,
  LogOut,
  Search,
  Wrench,
  CheckCircle,
  DollarSign,
  Calendar,
  PieChart,
  ChevronDown,
  Menu,
  X,
  QrCode,
  Clock,
  MapPin,
  Battery,
  Shield,
  Loader2,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { staffAPI } from "../../api/staff";
import { adminAPI } from "../../api/admin";
import showToast from "../../utils/toast";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const StaffDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuthStore();
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [time, setTime] = useState(new Date());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Loading state
  const [loading, setLoading] = useState(true);

  // Real data states
  const [stats, setStats] = useState({
    assignedCars: 0,
    todayBookings: 0,
    pendingServices: 0,
    completedServices: 0,
    monthlyRevenue: 0,
    utilizationRate: 0,
    activeUsers: 0,
    resolvedIssues: 0,
  });
  const [assignedCars, setAssignedCars] = useState([]);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  const [notifications, setNotifications] = useState([]);

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
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Hàm xử lý logout
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Fetch dashboard data on mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      // Helper to resolve common axios/response shapes used across services
      const resolveData = (res) => {
        if (!res) return undefined;
        // Common pattern: { success, message, data }
        if (res.success !== undefined && res.data !== undefined) return res.data;
        // Some APIs return { data: ... }
        if (res.data !== undefined) return res.data;
        // Otherwise return raw
        return res;
      };

      try {
        // Try to use admin endpoints for global stats/activities/overview when available.
        // Fall back to staff-specific APIs if admin endpoints fail (permissions or 404).

        let statsData = null;
        try {
          const adminStats = await adminAPI.getDashboardStats();
          statsData = resolveData(adminStats);
        } catch (e) {
          // fallback to staff API
          const staffStats = await staffAPI.getStaffStats();
          statsData = resolveData(staffStats);
        }

        if (statsData && typeof statsData === 'object') {
          setStats((prev) => ({ ...prev, ...statsData }));
        }

        // Try to get overview (revenue/trends)
        try {
          const overviewResp = await adminAPI.getDashboardOverview();
          const overview = resolveData(overviewResp);
          if (overview && typeof overview === 'object') {
            setStats((prev) => ({ ...prev, monthlyRevenue: overview.monthlyRevenue ?? prev.monthlyRevenue, utilizationRate: overview.utilizationRate ?? prev.utilizationRate }));
          }
        } catch (e) {
          // ignore - overview optional for staff dashboard
        }

        // Assigned cars & schedule (staff-scoped) - keep using staffAPI
        try {
          const vehiclesRes = await staffAPI.getAssignedVehicles({ limit: 10 });
          const vehData = resolveData(vehiclesRes);
          setAssignedCars(Array.isArray(vehData) ? vehData : (vehData?.items || []));
        } catch (e) {
          console.warn('Failed to load assigned vehicles', e);
        }

        try {
          const scheduleRes = await staffAPI.getTodaySchedule();
          const scheduleData = resolveData(scheduleRes);
          setTodaySchedule(Array.isArray(scheduleData) ? scheduleData : (scheduleData?.items || []));
        } catch (e) {
          console.warn('Failed to load today schedule', e);
        }

        // Activities - prefer admin recent activities (system-wide), fallback to staff version
        try {
          const activitiesResp = await adminAPI.getRecentActivities(10);
          const activitiesData = resolveData(activitiesResp);
          setRecentActivities(Array.isArray(activitiesData) ? activitiesData : (activitiesData?.items || []));
        } catch (e) {
          try {
            const activitiesResp = await staffAPI.getRecentActivities(10);
            const activitiesData = resolveData(activitiesResp);
            setRecentActivities(Array.isArray(activitiesData) ? activitiesData : (activitiesData?.items || []));
          } catch (err) {
            console.warn('Failed to load recent activities', err);
          }
        }

        // Notifications - try admin notifications (may be permission-protected), fallback to staff notifications
        try {
          const notiResp = await adminAPI.getNotifications({ limit: 20 });
          const notiData = resolveData(notiResp);
          setNotifications(Array.isArray(notiData) ? notiData : (notiData?.items || []));
        } catch (e) {
          try {
            const notiResp = await staffAPI.getNotifications({ limit: 20 });
            const notiData = resolveData(notiResp);
            setNotifications(Array.isArray(notiData) ? notiData : (notiData?.items || []));
          } catch (err) {
            console.warn('Failed to load notifications', err);
          }
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        showToast.error('Không thể tải dữ liệu dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Handler for marking notification as read
  const handleMarkNotificationAsRead = async (notificationId) => {
    const result = await staffAPI.markNotificationAsRead(notificationId);
    if (result.success) {
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
    }
  };

  // Handler for marking all notifications as read
  const handleMarkAllAsRead = async () => {
    const result = await staffAPI.markAllNotificationsAsRead();
    if (result.success) {
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      showToast.success('Đã đánh dấu tất cả thông báo');
    } else {
      showToast.error(result.message);
    }
  };

  const menuItems = [
    {
      id: "overview",
      label: "Tổng quan",
      icon: <BarChart3 className="w-5 h-5" />,
      link: "/staff",
    },
    {
      id: "cars",
      label: "Quản lý xe",
      icon: <Car className="w-5 h-5" />,
      link: "/staff/cars",
    },
    {
      id: "contracts",
      label: "Hợp đồng",
      icon: <FileText className="w-5 h-5" />,
      link: "/staff/contracts",
    },
    {
      id: "services",
      label: "Dịch vụ xe",
      icon: <Wrench className="w-5 h-5" />,
      link: "/staff/services",
    },
    {
      id: "checkin",
      label: "Check-in/out",
      icon: <QrCode className="w-5 h-5" />,
      link: "/staff/checkin",
    },
  ];

  const getActiveTab = () => {
    const currentPath = location.pathname;
    const menuItem = menuItems.find((item) => item.link === currentPath);
    return menuItem ? menuItem.id : "overview";
  };

  const activeTab = getActiveTab();

  const unreadNotifications = Array.isArray(notifications)
    ? notifications.filter((n) => !n.read).length
    : 0;

  // Show loading while fetching data
  if (loading) {
    return <LoadingSpinner />;
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_use': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'maintenance': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'available': return 'Sẵn sàng';
      case 'in_use': return 'Đang sử dụng';
      case 'maintenance': return 'Bảo dưỡng';
      default: return 'Không xác định';
    }
  };

  const StatCard = ({
    title,
    value,
    change,
    icon,
    color,
    onClick,
    subtitle,
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all duration-200"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          {change && (
            <div className="flex items-center mt-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  change > 0 ? "bg-green-500" : "bg-red-500"
                } mr-2`}
              />
              <p
                className={`text-xs font-medium ${
                  change > 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {change > 0 ? "+" : ""}
                {change}% so với tháng trước
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

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            Tổng quan công việc
          </h1>
          <p className="text-gray-600 mt-1">
            {time.toLocaleDateString("vi-VN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="text-right">
          <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <p className="text-lg font-semibold text-gray-900">
              {time.toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}
            </p>
          </div>
          <p className="text-gray-500 text-sm mt-1">Cập nhật mỗi phút</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Xe được phân công"
          value={stats.assignedCars}
          change={5}
          icon={<Car className="w-5 h-5" />}
          color="bg-blue-500"
        />
        <StatCard
          title="Đặt lịch hôm nay"
          value={stats.todayBookings}
          subtitle={`${stats.todayBookings} lượt check-in`}
          icon={<Calendar className="w-5 h-5" />}
          color="bg-purple-500"
        />
        <StatCard
          title="Doanh thu tháng"
          value={`${(stats.monthlyRevenue / 1000000).toFixed(1)}M`}
          change={8}
          icon={<DollarSign className="w-5 h-5" />}
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
          title="Dịch vụ đang chờ"
          value={stats.pendingServices}
          change={-2}
          icon={<Wrench className="w-5 h-5" />}
          color="bg-amber-500"
        />
        <StatCard
          title="Dịch vụ hoàn thành"
          value={stats.completedServices}
          change={15}
          icon={<CheckCircle className="w-5 h-5" />}
          color="bg-green-500"
        />
        <StatCard
          title="Thành viên hoạt động"
          value={stats.activeUsers}
          change={12}
          icon={<Users className="w-5 h-5" />}
          color="bg-teal-500"
        />
        <StatCard
          title="Sự cố đã xử lý"
          value={stats.resolvedIssues}
          change={8}
          icon={<AlertTriangle className="w-5 h-5" />}
          color="bg-red-500"
        />
      </div>

      {/* Today's Schedule - ĐÃ CHUYỂN LÊN TRÊN */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Lịch trình hôm nay
          </h3>
          <button className="text-blue-600 text-sm font-medium hover:text-blue-800 transition-colors">
            Xem lịch đầy đủ
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {todaySchedule.map((schedule, index) => (
            <div
              key={index}
              className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors group cursor-pointer"
              onClick={() => navigate("/staff/checkin")}
            >
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">{schedule.time}</p>
                <p className="text-xs text-gray-500 capitalize">{schedule.type}</p>
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                  {schedule.car}
                </p>
                <p className="text-sm text-gray-600">{schedule.user}</p>
              </div>
              <div
                className={`w-3 h-3 rounded-full ${
                  schedule.type === "check-in"
                    ? "bg-blue-500"
                    : schedule.type === "check-out"
                    ? "bg-green-500"
                    : "bg-amber-500"
                }`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Assigned Cars & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assigned Cars */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Xe được phân công
            </h3>
            <button
              onClick={() => navigate("/staff/cars")}
              className="text-blue-600 text-sm font-medium hover:text-blue-800 transition-colors flex items-center gap-1"
            >
              Xem tất cả <ChevronDown className="w-4 h-4 rotate-270" />
            </button>
          </div>
          <div className="space-y-4">
            {assignedCars.map((car) => (
              <div
                key={car.id}
                className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors group border border-gray-200"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm">
                    <Car className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                      {car.name}
                    </p>
                    <p className="text-sm text-gray-600">{car.license}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Battery className="w-3 h-3" />
                        <span>{car.battery}%</span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" />
                        <span>{car.location}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <TrendingUp className="w-3 h-3" />
                        <span>{car.utilization}%</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(car.status)}`}>
                    {getStatusText(car.status)}
                  </span>
                  <p className="text-sm text-gray-600 mt-1">{car.nextBooking}</p>
                  <p className="text-xs text-gray-500">Bảo dưỡng: {car.lastService}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Hoạt động gần đây
            </h3>
            <button className="text-blue-600 text-sm font-medium hover:text-blue-800 transition-colors flex items-center gap-1">
              Xem tất cả <ChevronDown className="w-4 h-4 rotate-270" />
            </button>
          </div>
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.type === "success"
                        ? "bg-green-100 text-green-600"
                        : activity.type === "warning"
                        ? "bg-amber-100 text-amber-600"
                        : activity.type === "error"
                        ? "bg-red-100 text-red-600"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {activity.type === "success" ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : activity.type === "warning" ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : activity.type === "error" ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : (
                      <Clock className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                      {activity.user}
                    </p>
                    <p className="text-sm text-gray-600">{activity.action}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {activity.time}
                  </p>
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
          {mobileMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
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
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">
                    EV Co-ownership
                  </h1>
                  <p className="text-xs text-gray-600">Staff Dashboard</p>
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
                  <p className="text-sm font-medium text-gray-900">
                    {user?.fullName || user?.email || 'Staff'}
                  </p>
                  <p className="text-xs text-gray-600">Nhân viên vận hành</p>
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
      <div
        className={`flex-1 transition-all ${
          sidebarOpen ? "lg:ml-64" : "lg:ml-0"
        } ${mobileMenuOpen ? "ml-0" : ""}`}
      >
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
                {menuItems.find((item) => item.id === activeTab)?.label ||
                  "Tổng quan"}
              </h2>
            </div>

            <div className="flex items-center space-x-3">
              {/* Search Bar */}
              <div className="relative hidden md:block">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm kiếm xe, thành viên..."
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
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900">
                            Thông báo
                          </h3>
                          {unreadNotifications > 0 && (
                            <button
                              onClick={handleMarkAllAsRead}
                              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                            >
                              Đánh dấu tất cả đã đọc
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-gray-500">
                            <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                            <p>Không có thông báo mới</p>
                          </div>
                        ) : (
                          notifications.map((notification) => (
                            <div
                              key={notification.id}
                              onClick={() => {
                                if (!notification.read) {
                                  handleMarkNotificationAsRead(notification.id);
                                }
                              }}
                              className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                                !notification.read ? "bg-blue-50" : ""
                              }`}
                            >
                              <div className="flex items-start space-x-3">
                                <div
                                  className={`w-2 h-2 rounded-full mt-2 ${
                                    notification.type === "success"
                                      ? "bg-green-500"
                                      : notification.type === "warning"
                                      ? "bg-amber-500"
                                      : notification.type === "info"
                                      ? "bg-blue-500"
                                      : "bg-red-500"
                                  }`}
                                />
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900 text-sm">
                                    {notification.title}
                                  </p>
                                  <p className="text-gray-600 text-sm mt-1">
                                    {notification.message}
                                  </p>
                                  <p className="text-gray-400 text-xs mt-2">
                                    {notification.time || notification.createdAt}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
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
                    <p className="text-sm font-medium text-gray-900">
                      {user?.fullName || user?.email || 'Staff'}
                    </p>
                    <p className="text-xs text-gray-600">Nhân viên vận hành</p>
                  </div>
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-600 transition-transform ${
                      userMenuOpen ? "rotate-180" : ""
                    }`}
                  />
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
                          onClick={() => navigate("/staff/profile")}
                          className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-700"
                        >
                          <User className="w-4 h-4" />
                          <span>Hồ sơ cá nhân</span>
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
          {activeTab === "overview" && renderOverview()}
          {activeTab !== "overview" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                {menuItems.find((item) => item.id === activeTab)?.icon}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {menuItems.find((item) => item.id === activeTab)?.label}
              </h2>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Chức năng này đã được chuyển hướng đến trang riêng. Vui lòng sử
                dụng menu bên trái để điều hướng.
              </p>
              <button
                onClick={() =>
                  navigate(
                    menuItems.find((item) => item.id === activeTab)?.link ||
                      "/staff"
                  )
                }
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
              >
                Đi đến trang{" "}
                {menuItems.find((item) => item.id === activeTab)?.label}
              </button>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
};

export default StaffDashboard;