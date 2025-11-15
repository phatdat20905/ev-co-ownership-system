import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, BarChart3, TrendingUp, Calendar, Download, PieChart, Users, Clock, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import CoownerLayout from "../../../components/layout/CoownerLayout";
import bookingService from "../../../services/bookingService";
import { showErrorToast } from "../../../utils/toast";

export default function UsageAnalytics() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("month");

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getUserBookings();
      const bookings = response.bookings || [];
      
      // Filter completed bookings
      const completedBookings = bookings.filter(b => b.status === 'completed');
      
      // Calculate usage by day
      const dayNames = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
      const usageByDayMap = {};
      dayNames.forEach(day => usageByDayMap[day] = 0);
      
      completedBookings.forEach(booking => {
        const dayIndex = new Date(booking.startTime).getDay();
        const dayName = dayNames[dayIndex];
        const hours = (new Date(booking.endTime) - new Date(booking.startTime)) / (1000 * 60 * 60);
        usageByDayMap[dayName] += hours;
      });
      
      const maxHours = Math.max(...Object.values(usageByDayMap));
      const usageByDay = dayNames.map(day => ({
        day,
        hours: parseFloat(usageByDayMap[day].toFixed(1)),
        percentage: maxHours > 0 ? Math.round((usageByDayMap[day] / maxHours) * 100) : 0
      }));
      
      // Calculate usage by car
      const carUsageMap = {};
      completedBookings.forEach(booking => {
        const carName = booking.vehicleName || booking.vehicleModel || 'Chưa rõ xe';
        if (!carUsageMap[carName]) {
          carUsageMap[carName] = 0;
        }
        const hours = (new Date(booking.endTime) - new Date(booking.startTime)) / (1000 * 60 * 60);
        carUsageMap[carName] += hours;
      });
      
      const totalCarHours = Object.values(carUsageMap).reduce((sum, h) => sum + h, 0);
      const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500"];
      const usageByCar = Object.entries(carUsageMap).map(([car, hours], index) => ({
        car,
        hours: parseFloat(hours.toFixed(1)),
        percentage: totalCarHours > 0 ? Math.round((hours / totalCarHours) * 100) : 0,
        color: colors[index % colors.length]
      }));
      
      // Calculate peak hours
      const hourUsageMap = {};
      for (let i = 0; i < 24; i += 2) {
        hourUsageMap[`${i}-${i+2}`] = 0;
      }
      
      completedBookings.forEach(booking => {
        const startHour = new Date(booking.startTime).getHours();
        const bucket = Math.floor(startHour / 2) * 2;
        const key = `${bucket}-${bucket+2}`;
        if (hourUsageMap[key] !== undefined) {
          hourUsageMap[key]++;
        }
      });
      
      const colorGradients = [
        "from-blue-100 to-blue-200", "from-blue-200 to-blue-300",
        "from-blue-300 to-blue-400", "from-blue-400 to-blue-500",
        "from-blue-500 to-blue-600", "from-blue-600 to-blue-700",
        "from-blue-700 to-blue-800", "from-blue-800 to-blue-900",
        "from-blue-900 to-blue-950", "from-indigo-800 to-indigo-900",
        "from-purple-800 to-purple-900", "from-violet-800 to-violet-900"
      ];
      
      const peakHours = Object.entries(hourUsageMap).map(([hour, usage], index) => ({
        hour,
        usage,
        color: colorGradients[index % colorGradients.length]
      }));
      
      // Calculate monthly trend (last 6 months)
      const monthlyMap = {};
      completedBookings.forEach(booking => {
        const month = new Date(booking.startTime).getMonth() + 1;
        if (!monthlyMap[month]) {
          monthlyMap[month] = { hours: 0, cost: 0 };
        }
        const hours = (new Date(booking.endTime) - new Date(booking.startTime)) / (1000 * 60 * 60);
        monthlyMap[month].hours += hours;
        monthlyMap[month].cost += booking.totalCost || 0;
      });
      
      const monthNames = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"];
      const currentMonth = new Date().getMonth() + 1;
      const monthlyTrend = [];
      for (let i = 5; i >= 0; i--) {
        let month = currentMonth - i;
        if (month <= 0) month += 12;
        monthlyTrend.push({
          month: monthNames[month - 1],
          hours: monthlyMap[month] ? parseFloat(monthlyMap[month].hours.toFixed(1)) : 0,
          cost: monthlyMap[month] ? monthlyMap[month].cost : 0
        });
      }
      
      // Calculate overall stats
      const totalHours = completedBookings.reduce((sum, b) => {
        const hours = (new Date(b.endTime) - new Date(b.startTime)) / (1000 * 60 * 60);
        return sum + hours;
      }, 0);
      
      const totalCost = completedBookings.reduce((sum, b) => sum + (b.totalCost || 0), 0);
      const costPerHour = totalHours > 0 ? Math.round(totalCost / totalHours) : 0;
      const averagePerMonth = totalHours / 6;
      
      setAnalyticsData({
        usageByDay,
        usageByCar,
        peakHours,
        monthlyTrend,
        usageStats: {
          totalHours: parseFloat(totalHours.toFixed(1)),
          averagePerMonth: parseFloat(averagePerMonth.toFixed(1)),
          costPerHour,
          efficiency: "6.1 km/kWh" // This would come from vehicle data in real implementation
        }
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      showErrorToast(error.response?.data?.message || 'Không thể tải dữ liệu phân tích');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <CoownerLayout>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </CoownerLayout>
    );
  }

  return (
    <CoownerLayout>
      <main className="pt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link
                to="/coowner/history"
                className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Phân tích sử dụng</h1>
                <p className="text-gray-600 mt-1">Thống kê và xu hướng sử dụng xe</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <option value="week">Tuần</option>
                <option value="month">Tháng</option>
                <option value="quarter">Quý</option>
                <option value="year">Năm</option>
              </select>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="w-4 h-4" />
                <span>Xuất báo cáo</span>
              </button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tổng giờ sử dụng</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {analyticsData?.usageStats?.totalHours ?? 0}h
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <p className="text-sm text-green-600 mt-2">+12% so với kỳ trước</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Trung bình tháng</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {analyticsData?.usageStats?.averagePerMonth ?? 0}h
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">Giờ sử dụng</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Chi phí/giờ</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {(analyticsData?.usageStats?.costPerHour ?? 0).toLocaleString()}đ
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <p className="text-sm text-green-600 mt-2">-8% so với kỳ trước</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Hiệu suất</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {analyticsData?.usageStats?.efficiency ?? '-'}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">km/kWh</p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Usage by Day */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Sử dụng theo ngày</h2>
                <BarChart3 className="w-5 h-5 text-gray-600" />
              </div>
              
              <div className="space-y-4">
                {(analyticsData?.usageByDay || []).map((day, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 w-20">{day.day}</span>
                    <div className="flex-1 mx-4">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-500" 
                          style={{ width: `${day.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-gray-900 w-16 text-right">
                      {day.hours}h
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Usage by Car */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Phân bổ theo xe</h2>
                <PieChart className="w-5 h-5 text-gray-600" />
              </div>
              
              <div className="space-y-4">
                {(analyticsData?.usageByCar || []).map((car, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-3 h-3 rounded-full ${car.color}`}></div>
                      <span className="text-sm font-medium text-gray-700">{car.car}</span>
                    </div>
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex-1">
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full" 
                            style={{ width: `${car.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-gray-900 w-20 text-right">
                        {car.percentage}% ({car.hours}h)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Peak Hours */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Giờ cao điểm</h2>
                <Users className="w-5 h-5 text-gray-600" />
              </div>
              
              <div className="grid grid-cols-4 gap-3">
                {(analyticsData?.peakHours || []).map((hour, index) => (
                  <div key={index} className="text-center">
                    <div className={`bg-gradient-to-br ${hour.color} rounded-xl p-3 text-white shadow-sm`}>
                      <div className="text-sm font-medium">{hour.hour}</div>
                      <div className="text-lg font-bold mt-1">{hour.usage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Monthly Trend */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Xu hướng hàng tháng</h2>
                <TrendingUp className="w-5 h-5 text-gray-600" />
              </div>
              
              <div className="space-y-4">
                {(analyticsData?.monthlyTrend || []).map((month, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 w-8">{month.month}</span>
                    <div className="flex-1 mx-4">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full" 
                          style={{ width: `${(month.hours / 80) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">{month.hours}h</p>
                      <p className="text-xs text-gray-600">{month.cost.toLocaleString()}đ</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Insights */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-6 text-white mt-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6" />
              <h3 className="text-xl font-bold">Nhận định thông minh</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-blue-100 mb-2">
                  • Bạn sử dụng xe nhiều nhất vào cuối tuần (Thứ 7 & Chủ nhật)
                </p>
                <p className="text-blue-100 mb-2">
                  • Giờ cao điểm sử dụng: 16:00 - 18:00 (40% lượt sử dụng)
                </p>
                <p className="text-blue-100">
                  • Tesla Model 3 được ưa chuộng hơn với 60% thời gian sử dụng
                </p>
              </div>
              <div>
                <p className="text-blue-100 mb-2">
                  • Chi phí/giờ đã giảm 8% so với kỳ trước
                </p>
                <p className="text-blue-100 mb-2">
                  • Xu hướng sử dụng tăng 12% mỗi tháng
                </p>
                <p className="text-blue-100">
                  • Đề xuất: Đặt lịch trước cho các chuyến đi cuối tuần
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </CoownerLayout>
  );
}