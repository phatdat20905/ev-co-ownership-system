import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Car,
  Calendar,
  DollarSign,
  Users,
  FileText,
  BarChart3,
  Clock,
  MapPin,
  Battery,
  Settings,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  Zap,
  CheckCircle,
  Play,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CoownerLayout from "../../components/layout/CoownerLayout";
import AIRecommendations from "../../components/ai/AIRecommendations";
import userService from "../../services/userService";
import bookingService from "../../services/bookingService";
import vehicleService from "../../services/vehicleService";
import { useUserStore } from "../../stores/useUserStore";
import { useAuthStore } from "../../stores/useAuthStore";
import { showErrorToast } from "../../utils/toast";

export default function CoownerDashboard() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCarIndex, setActiveCarIndex] = useState(0);
  const [recentBookings, setRecentBookings] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const { user } = useAuthStore();
  const { profile } = useUserStore();

  // Fetch real data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch user profile, bookings, and vehicles in parallel
        const [profileData, bookingsData, vehiclesData] = await Promise.all([
          userService.getProfile(),
          bookingService.getUserBookings().catch(() => ({ bookings: [] })),
          vehicleService.getVehicles().catch(() => ({ vehicles: [] }))
        ]);

        // Transform profile data
        const transformedUserData = {
          name: profileData.fullName || user?.email || "User",
          membershipType: profileData.kycStatus === 'approved' ? "Co-owner Premium" : "Co-owner",
          totalCars: vehiclesData.vehicles?.length || 0,
          ownershipPercentage: profileData.ownershipPercentage || 0,
          groupMembers: profileData.groupMembers || 0,
          monthlyCost: profileData.monthlyCost || 0,
          nextBooking: bookingsData.bookings?.[0]?.startTime,
          totalSavings: profileData.totalSavings || 0,
          usageThisMonth: bookingsData.bookings?.filter(b => {
            const bookingDate = new Date(b.startTime);
            const now = new Date();
            return bookingDate.getMonth() === now.getMonth() && 
                   bookingDate.getFullYear() === now.getFullYear();
          }).length || 0,
          usageLimit: 30,
          recentActivity: bookingsData.bookings?.slice(0, 3).map((booking, index) => ({
            id: booking.id,
            type: booking.status === 'completed' ? 'booking' : 'pending',
            message: `${booking.status === 'completed' ? 'Đã hoàn thành' : 'Đặt lịch'} sử dụng xe ${booking.vehicleName || 'EV'}`,
            time: formatTimeAgo(booking.createdAt),
            status: booking.status
          })) || []
        };

        setUserData(transformedUserData);
        setRecentBookings(bookingsData.bookings || []);
        setVehicles(vehiclesData.vehicles || []);
        
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        showErrorToast(error.response?.data?.message || "Không thể tải dữ liệu dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  // Helper function to format time ago
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return `${diffDays} ngày trước`;
  };

  // Car images rotation
  useEffect(() => {
    if (vehicles.length === 0) return;
    const interval = setInterval(() => {
      setActiveCarIndex((prev) => (prev + 1) % vehicles.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [vehicles]);

  // Stats cards data
  const statsCards = [
    {
      title: "Tổng số xe",
      value: userData?.totalCars || 0,
      icon: Car,
      color: "from-blue-500 to-cyan-500",
      link: "/coowner/ownership",
      description: "Xe đang đồng sở hữu",
    },
    {
      title: "Tỷ lệ sở hữu",
      value: `${userData?.ownershipPercentage || 0}%`,
      icon: Users,
      color: "from-green-500 to-emerald-500",
      link: "/coowner/ownership",
      description: "Quyền sở hữu của bạn",
    },
    {
      title: "Chi phí tháng",
      value: `${(userData?.monthlyCost || 0).toLocaleString()}đ`,
      icon: DollarSign,
      color: "from-purple-500 to-pink-500",
      link: "/coowner/financial",
      description: "Tổng chi phí tháng này",
    },
    {
      title: "Thành viên nhóm",
      value: userData?.groupMembers || 0,
      icon: Users,
      color: "from-orange-500 to-amber-500",
      link: "/coowner/group",
      description: "Đồng sở hữu với",
    },
  ];

  // Quick actions
  const quickActions = [
    {
      title: "Đặt lịch sử dụng",
      description: "Đặt lịch sử dụng xe của bạn",
      icon: Calendar,
      link: "/coowner/booking",
      color: "from-blue-500 to-cyan-500",
      buttonColor: "bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200",
    },
    {
      title: "Xem hợp đồng",
      description: "Hợp đồng đồng sở hữu",
      icon: FileText,
      link: "/coowner/ownership",
      color: "from-green-500 to-emerald-500",
      buttonColor:
        "bg-green-50 text-green-600 hover:bg-green-100 border-green-200",
    },
    {
      title: "Quản lý chi phí",
      description: "Theo dõi và thanh toán",
      icon: DollarSign,
      link: "/coowner/financial",
      color: "from-purple-500 to-pink-500",
      buttonColor:
        "bg-purple-50 text-purple-600 hover:bg-purple-100 border-purple-200",
    },
    {
      title: "Phân tích sử dụng",
      description: "Thống kê và báo cáo",
      icon: BarChart3,
      link: "/coowner/history",
      color: "from-orange-500 to-amber-500",
      buttonColor:
        "bg-orange-50 text-orange-600 hover:bg-orange-100 border-orange-200",
    },
  ];

  // Transform vehicles data to match carStatus format
  const carStatus = vehicles.map(vehicle => ({
    id: vehicle.id,
    name: vehicle.name || vehicle.model,
    model: vehicle.year ? `${vehicle.year} ${vehicle.variant || ''}` : vehicle.variant || '',
    status: vehicle.status || 'available',
    battery: vehicle.batteryLevel || 0,
    location: vehicle.location || 'TP.HCM',
    nextMaintenance: vehicle.nextMaintenance || 'Chưa có lịch',
    usageThisMonth: `${userData?.usageThisMonth || 0}/${userData?.usageLimit || 30} giờ`,
    image: vehicle.imageUrl || "/api/placeholder/400/250",
    efficiency: vehicle.efficiency || "N/A",
    range: vehicle.range ? `${vehicle.range} km` : "N/A",
  }));

  // Safe reference for the currently active car (may be null if no vehicles)
  const activeCar = carStatus.length > 0 ? carStatus[activeCarIndex] : null;

  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "text-green-600 bg-green-100";
      case "in_use":
        return "text-blue-600 bg-blue-100";
      case "maintenance":
        return "text-orange-600 bg-orange-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "available":
        return "Có sẵn";
      case "in_use":
        return "Đang sử dụng";
      case "maintenance":
        return "Bảo dưỡng";
      default:
        return "Không xác định";
    }
  };

  if (loading) {
    return (
      <CoownerLayout>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CoownerLayout>
    );
  }

  return (
    <CoownerLayout>
      <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">
              Chào mừng trở lại,{" "}
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                {userData?.name}!
              </span>
            </h1>
            <p className="text-xl text-gray-600 mt-4 max-w-2xl">
              Quản lý phương tiện đồng sở hữu của bạn một cách thông minh và
              hiệu quả
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-8 mt-8 pt-8 border-t border-gray-200/50 max-w-2xl">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {userData?.totalSavings?.toLocaleString()}đ
                </div>
                <div className="text-sm text-gray-600">Đã tiết kiệm</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {userData?.usageThisMonth}/{userData?.usageLimit}h
                </div>
                <div className="text-sm text-gray-600">Sử dụng tháng</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">99%</div>
                <div className="text-sm text-gray-600">Hài lòng</div>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statsCards.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Link
                    to={stat.link}
                    className="group block bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          {stat.title}
                        </p>
                        <p className="text-2xl font-bold text-gray-900 mt-2">
                          {stat.value}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {stat.description}
                        </p>
                      </div>
                      <div
                        className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}
                      >
                        <IconComponent className="w-6 h-6" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-xs text-gray-500 group-hover:text-gray-700 transition-colors">
                        Xem chi tiết
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Quick Actions & Recent Activity */}
            <div className="lg:col-span-2 space-y-8">
              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Hành động nhanh
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickActions.map((action, index) => {
                    const IconComponent = action.icon;
                    return (
                      <motion.div
                        key={index}
                        whileHover={{ y: -5, scale: 1.02 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Link
                          to={action.link}
                          className={`group block p-4 rounded-xl border-2 transition-all duration-300 ${action.buttonColor}`}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`p-3 rounded-xl bg-gradient-to-r ${action.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}
                            >
                              <IconComponent className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 group-hover:text-gray-800">
                                {action.title}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">
                                {action.description}
                              </p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Car Status */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Trạng thái xe
                  </h2>
                  <div className="flex gap-2">
                    {carStatus.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveCarIndex(index)}
                        className={`w-3 h-3 rounded-full transition-all ${
                          index === activeCarIndex
                            ? "bg-blue-600 scale-125"
                            : "bg-gray-300 hover:bg-gray-400"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeCarIndex}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.5 }}
                      className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-6 border border-gray-200"
                    >
                      <div className="flex flex-col lg:flex-row gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-4">
                            <h3 className="text-xl font-bold text-gray-900">
                              {activeCar?.name || 'Chưa có xe'}
                            </h3>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                activeCar?.status
                              )}`}
                            >
                              {getStatusText(activeCar?.status)}
                            </span>
                          </div>

                          <p className="text-gray-600 mb-2">
                            {activeCar?.model || ''}
                          </p>

                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <Battery className="w-5 h-5 text-green-600" />
                              <span className="text-gray-700">
                                Pin: {activeCar?.battery ?? '-'}%
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <MapPin className="w-5 h-5 text-blue-600" />
                              <span className="text-gray-700">
                                {activeCar?.location || 'N/A'}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Clock className="w-5 h-5 text-orange-600" />
                              <span className="text-gray-700">
                                Bảo dưỡng:{" "}
                                {activeCar?.nextMaintenance || 'Chưa có lịch'}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <BarChart3 className="w-5 h-5 text-purple-600" />
                              <span className="text-gray-700">
                                Sử dụng:{" "}
                                {activeCar?.usageThisMonth || '0/0 giờ'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="lg:w-48 flex flex-col gap-3">
                          <div className="bg-white rounded-xl p-4 text-center border border-gray-200">
                            <div className="text-2xl font-bold text-gray-900">
                              {activeCar?.efficiency || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-600">
                              Hiệu suất
                            </div>
                          </div>
                          <div className="bg-white rounded-xl p-4 text-center border border-gray-200">
                            <div className="text-2xl font-bold text-gray-900">
                              {activeCar?.range || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-600">
                              Tầm hoạt động
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Recent Activity */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="space-y-8"
            >
              {/* Recent Activity */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Hoạt động gần đây
                </h2>
                <div className="space-y-4">
                  {userData?.recentActivity?.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="flex items-start gap-4 p-4 rounded-xl border border-gray-200 hover:border-blue-200 hover:bg-blue-50/50 transition-all duration-300"
                    >
                      <div
                        className={`p-2 rounded-lg ${
                          activity.status === "completed"
                            ? "bg-green-100 text-green-600"
                            : "bg-orange-100 text-orange-600"
                        }`}
                      >
                        {activity.status === "completed" ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <Clock className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-800 font-medium">
                          {activity.message}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {activity.time}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <Link
                  to="/coowner/history"
                  className="block mt-6 text-center py-3 text-blue-600 font-medium rounded-xl border-2 border-blue-200 hover:bg-blue-50 transition-all duration-300 group"
                >
                  <span className="flex items-center justify-center gap-2">
                    Xem tất cả hoạt động
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              </div>

              {/* AI Recommendations */}
              <AIRecommendations 
                userId={userData?.id || 'user-123'} 
                context="dashboard" 
              />
            </motion.div>
          </div>
        </div>
      </CoownerLayout>
    );
  }
