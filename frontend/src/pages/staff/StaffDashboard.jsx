import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Users,
  Car,
  FileText,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Wrench,
  CheckCircle,
  DollarSign,
  Calendar,
  ChevronDown,
  QrCode,
  Clock,
  MapPin,
  Battery,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { staffAPI } from "../../api/staff";
import { adminAPI } from "../../api/admin";
import showToast from "../../utils/toast";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import DashboardLayout from "../../components/layout/DashboardLayout";

const StaffDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  
  const [time, setTime] = useState(new Date());

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
    <DashboardLayout 
      userRole="staff" 
      notifications={notifications} 
      onNotificationRead={handleMarkNotificationAsRead}
    >
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
    </DashboardLayout>
  );
};

export default StaffDashboard;