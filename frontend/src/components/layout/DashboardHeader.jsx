import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Menu, 
  Bell, 
  User, 
  LogOut, 
  ChevronDown,
  X 
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { getMenuItemsByRole } from "../../config/menuConfig";

/**
 * DashboardHeader Component
 * Shared header/navbar for Admin and Staff dashboards
 * 
 * @param {Object} props
 * @param {boolean} props.sidebarOpen - Desktop sidebar open state
 * @param {Function} props.setSidebarOpen - Desktop sidebar state setter
 * @param {Function} props.setMobileMenuOpen - Mobile menu state setter
 * @param {string} props.userRole - User role ('admin' or 'staff')
 * @param {Array} props.notifications - Notifications array
 * @param {Function} props.onNotificationRead - Callback for marking notification as read
 */
const DashboardHeader = ({
  sidebarOpen,
  setSidebarOpen,
  setMobileMenuOpen,
  userRole = "staff",
  notifications = [],
  onNotificationRead = () => {},
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuthStore();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [time, setTime] = useState(new Date());

  const userMenuRef = useRef(null);
  const notificationsRef = useRef(null);

  const menuItems = getMenuItemsByRole(userRole);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getActiveTab = () => {
    const currentPath = location.pathname;
    const menuItem = menuItems.find((item) => item.link === currentPath);
    return menuItem ? menuItem.id : "overview";
  };

  const activeTab = getActiveTab();
  const unreadNotifications = notifications.filter((n) => !n.read).length;

  const getNotificationTypeColor = (type) => {
    switch (type) {
      case "success":
        return "text-green-600 bg-green-50";
      case "warning":
        return "text-amber-600 bg-amber-50";
      case "error":
        return "text-red-600 bg-red-50";
      default:
        return "text-blue-600 bg-blue-50";
    }
  };

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 bg-white border-b border-gray-200 z-20 transition-all duration-300">
      <div className="flex items-center justify-between px-4 lg:px-6 py-3">
        {/* Left Section - Mobile Menu & Page Title */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Desktop Sidebar Toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:block p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Page Title - Desktop */}
          <div className="hidden lg:block">
            <div className="flex items-center space-x-2">
              {menuItems.find((item) => item.id === activeTab)?.icon}
              <h2 className="text-xl font-semibold text-gray-900">
                {menuItems.find((item) => item.id === activeTab)?.label ||
                  "Dashboard"}
              </h2>
            </div>
          </div>

          {/* Page Title - Mobile */}
          <div className="lg:hidden">
            <h2 className="text-lg font-semibold text-gray-900">
              {menuItems.find((item) => item.id === activeTab)?.label ||
                "Dashboard"}
            </h2>
          </div>
        </div>

        {/* Right Section - Time, Notifications & User Menu */}
        <div className="flex items-center space-x-2 lg:space-x-4">
          {/* Current Time - Desktop Only */}
          <div className="hidden lg:block text-sm text-gray-600">
            {time.toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setNotificationsOpen(!notificationsOpen);
                setUserMenuOpen(false);
              }}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadNotifications > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>

            <AnimatePresence>
              {notificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
                >
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">Thông báo</h3>
                      {unreadNotifications > 0 && (
                        <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                          {unreadNotifications} mới
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => onNotificationRead(notification.id)}
                          className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                            !notification.read ? "bg-blue-50" : ""
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-medium text-gray-900 text-sm">
                              {notification.title}
                            </h4>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${getNotificationTypeColor(
                                notification.type
                              )}`}
                            >
                              {notification.type}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            {notification.message}
                          </p>
                          <span className="text-xs text-gray-500">
                            {notification.time}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-gray-500">
                        <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Không có thông báo mới</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Menu Dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setUserMenuOpen(!userMenuOpen);
                setNotificationsOpen(false);
              }}
              className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                {(user?.fullName || user?.name || "U").charAt(0).toUpperCase()}
              </div>
              <ChevronDown className="w-4 h-4 text-gray-600 hidden lg:block" />
            </button>

            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
                >
                  <div className="p-4 border-b border-gray-200">
                    <p className="font-semibold text-gray-900">
                      {user?.fullName || user?.name || "User"}
                    </p>
                    <p className="text-sm text-gray-500 capitalize">
                      {user?.role || userRole}
                    </p>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => {
                        const profilePath = userRole === "admin" 
                          ? "/admin/profile" 
                          : "/staff/profile";
                        navigate(profilePath);
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span>Hồ sơ cá nhân</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
  );
};

export default DashboardHeader;
