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
  ArrowUpRight,
  Zap,
  CheckCircle,
  Play,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";
import { useAuthStore, useGroupStore, useVehicleStore, useBookingStore, useCostStore } from "../../../store";

export default function CoownerDashboard() {
  const [loading, setLoading] = useState(true);
  const [activeCarIndex, setActiveCarIndex] = useState(0);
  const { user } = useAuthStore();
  const { groups, fetchUserGroups } = useGroupStore();
  const { vehicles, fetchVehicles } = useVehicleStore();
  const { fetchUserBookings } = useBookingStore();
  const { costs, fetchUserCosts } = useCostStore();

  // Fetch real data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch groups first to get vehicle IDs
        await fetchUserGroups();

        // Fetch vehicles
        await fetchVehicles();
        const vehiclesData = useVehicleStore.getState().vehicles;

        // Get first vehicle ID for bookings if available
        const vehicleId = vehiclesData && vehiclesData.length > 0 ? vehiclesData[0].id : null;

        // Fetch bookings with vehicleId if available
        if (vehicleId) {
          await fetchUserBookings({ vehicleId });
        }

        // Fetch costs
        await fetchUserCosts();
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    // Prevent duplicate fetches in development (React StrictMode double-mount)
    // We only apply this guard in development so production behavior unaffected.
    if (user) {
      if (process.env.NODE_ENV === "development") {
        // global flag prevents the same dashboard fetch from running twice during dev double-mount
        if (window.__coownerDashboardFetched) {
          // already fetched once during this session - skip
          setLoading(false);
          return;
        }
        window.__coownerDashboardFetched = true;
      }

      fetchDashboardData();
    }
  }, [user, fetchUserGroups, fetchVehicles, fetchUserBookings, fetchUserCosts]);

  // Car images rotation
  useEffect(() => {
    if (vehicles.length > 0) {
      const interval = setInterval(() => {
        setActiveCarIndex((prev) => (prev + 1) % vehicles.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [vehicles]);

  // Calculate dashboard stats from real data
  const totalCars = vehicles.length;
  const totalMembers = groups.reduce((sum, group) => {
    const memberCount = group.members?.[0] ? 1 : 0; // Data shows single member object
    return sum + memberCount;
  }, 0);
  
  // Calculate total cost from splits for current user
  const monthlyCost = costs.reduce((sum, cost) => {
    // Find splits for current user
    const userSplits = cost.splits?.filter(split => split.userId === user?.id) || [];
    const userAmount = userSplits.reduce((total, split) => {
      return total + parseFloat(split.splitAmount || 0);
    }, 0);
    return sum + userAmount;
  }, 0);
  
  // Calculate average ownership percentage from groups
  const ownershipPercentage = groups.length > 0 
    ? Math.round(groups.reduce((sum, group) => {
        const ownership = group.members?.[0]?.ownershipPercentage || 0;
        return sum + parseFloat(ownership);
      }, 0) / groups.length)
    : 0;

  // Stats cards data
  const statsCards = [
    {
      title: "Tổng số xe",
      value: totalCars,
      icon: Car,
      color: "from-blue-500 to-cyan-500",
      link: "/dashboard/coowner/ownership",
      description: "Xe đang đồng sở hữu",
    },
    {
      title: "Tỷ lệ sở hữu",
      value: `${ownershipPercentage}%`,
      icon: Users,
      color: "from-green-500 to-emerald-500",
      link: "/dashboard/coowner/ownership",
      description: "Quyền sở hữu của bạn",
    },
    {
      title: "Chi phí tháng",
      value: `${monthlyCost.toLocaleString()}đ`,
      icon: DollarSign,
      color: "from-purple-500 to-pink-500",
      link: "/dashboard/coowner/financial",
      description: "Tổng chi phí tháng này",
    },
    {
      title: "Thành viên nhóm",
      value: totalMembers,
      icon: Users,
      color: "from-orange-500 to-amber-500",
      link: "/dashboard/coowner/group",
      description: "Đồng sở hữu với",
    },
  ];

  // Quick actions
  const quickActions = [
    {
      title: "Đặt lịch sử dụng",
      description: "Đặt lịch sử dụng xe của bạn",
      icon: Calendar,
      link: "/dashboard/coowner/booking",
      color: "from-blue-500 to-cyan-500",
      buttonColor: "bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200",
    },
    {
      title: "Xem hợp đồng",
      description: "Hợp đồng đồng sở hữu",
      icon: FileText,
      link: "/dashboard/coowner/ownership",
      color: "from-green-500 to-emerald-500",
      buttonColor:
        "bg-green-50 text-green-600 hover:bg-green-100 border-green-200",
    },
    {
      title: "Quản lý chi phí",
      description: "Theo dõi và thanh toán",
      icon: DollarSign,
      link: "/dashboard/coowner/financial",
      color: "from-purple-500 to-pink-500",
      buttonColor:
        "bg-purple-50 text-purple-600 hover:bg-purple-100 border-purple-200",
    },
    {
      title: "Phân tích sử dụng",
      description: "Thống kê và báo cáo",
      icon: BarChart3,
      link: "/dashboard/coowner/history",
      color: "from-orange-500 to-amber-500",
      buttonColor:
        "bg-orange-50 text-orange-600 hover:bg-orange-100 border-orange-200",
    },
    {
      title: "Công bằng AI",
      description: "Phân tích công bằng sử dụng",
      icon: Zap,
      link: "/dashboard/coowner/fairness",
      color: "from-indigo-500 to-purple-500",
      buttonColor:
        "bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-indigo-200",
    },
  ];

  // Car status - use real vehicle data
  const carStatus = vehicles.map(vehicle => {
    // Parse specifications
    const specs = vehicle.specifications || {};
    const batteryPercent = specs.current_battery_percent || 0;
    const location = specs.location || 'Chưa cập nhật';
    const rangeKm = specs.range_km || 0;
    
    return {
      id: vehicle.id,
      name: vehicle.vehicleName || vehicle.model,
      model: `${vehicle.year} ${vehicle.brand} ${vehicle.model}`,
      status: vehicle.status || 'available',
      battery: batteryPercent,
      location: location,
      nextMaintenance: 'Chưa xác định', // Not provided in API
      usageThisMonth: '0/30 giờ', // Need to calculate from bookings
      image: vehicle.images?.[0] || "/api/placeholder/400/250",
      efficiency: specs.acceleration_0_100 || "N/A",
      range: rangeKm ? `${rangeKm} km` : "N/A",
    };
  });

  // Safe active car reference - avoids reading properties from undefined when there are no vehicles
  const activeCar = carStatus[activeCarIndex] || {
    id: null,
    name: 'Chưa có xe',
    model: '',
    status: 'available',
    battery: 0,
    location: 'Chưa cập nhật',
    nextMaintenance: 'Chưa xác định',
    usageThisMonth: '0/30 giờ',
    image: '/api/placeholder/400/250',
    efficiency: 'N/A',
    range: 'N/A',
  };

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
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20">
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Main Content */}
      <main className="pt-20">
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
                { (user?.profile?.fullName) || user?.name || user?.email }!
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
                  {user?.totalSavings?.toLocaleString?.() || 0}đ
                </div>
                <div className="text-sm text-gray-600">Đã tiết kiệm</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {user?.usageThisMonth || 0}/{user?.usageLimit || 0}h
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
                              {activeCar.name}
                            </h3>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                activeCar.status
                              )}`}
                            >
                              {getStatusText(activeCar.status)}
                            </span>
                          </div>

                          <p className="text-gray-600 mb-2">
                            {activeCar.model}
                          </p>

                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <Battery className="w-5 h-5 text-green-600" />
                              <span className="text-gray-700">
                                Pin: {activeCar.battery}%
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <MapPin className="w-5 h-5 text-blue-600" />
                              <span className="text-gray-700">
                                {activeCar.location}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Clock className="w-5 h-5 text-orange-600" />
                              <span className="text-gray-700">
                                Bảo dưỡng:{" "}
                                {activeCar.nextMaintenance}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <BarChart3 className="w-5 h-5 text-purple-600" />
                              <span className="text-gray-700">
                                Sử dụng:{" "}
                                {activeCar.usageThisMonth}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="lg:w-48 flex flex-col gap-3">
                          <div className="bg-white rounded-xl p-4 text-center border border-gray-200">
                            <div className="text-2xl font-bold text-gray-900">
                              {activeCar.efficiency}
                            </div>
                            <div className="text-sm text-gray-600">
                              Hiệu suất
                            </div>
                          </div>
                          <div className="bg-white rounded-xl p-4 text-center border border-gray-200">
                            <div className="text-2xl font-bold text-gray-900">
                              {activeCar.range}
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
                  {user?.recentActivity?.map((activity, index) => (
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
                  to="/dashboard/coowner/history"
                  className="block mt-6 text-center py-3 text-blue-600 font-medium rounded-xl border-2 border-blue-200 hover:bg-blue-50 transition-all duration-300 group"
                >
                  <span className="flex items-center justify-center gap-2">
                    Xem tất cả hoạt động
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              </div>

              {/* AI Recommendations */}
              <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="w-6 h-6" />
                  <h3 className="text-xl font-bold">Đề xuất thông minh</h3>
                </div>
                <p className="text-blue-100 mb-4">
                  Dựa trên lịch sử sử dụng, chúng tôi đề xuất bạn nên đặt lịch
                  vào cuối tuần này để tối ưu chi phí.
                </p>
                <Link
                  to="/dashboard/coowner/fairness"
                  className="w-full bg-white text-blue-600 font-semibold py-3 rounded-xl hover:bg-blue-50 transition-colors items-center justify-center gap-2 group inline-flex"
                >
                  <Play className="w-4 h-4" />
                  <span>Xem đề xuất chi tiết</span>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
