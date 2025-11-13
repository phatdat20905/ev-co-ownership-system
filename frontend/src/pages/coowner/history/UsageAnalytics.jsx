import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, BarChart3, TrendingUp, Calendar, Download, PieChart, Users, Clock, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "../../../components/layout/Header";
import Footer from "../../../components/layout/Footer";

export default function UsageAnalytics() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("month");

  useEffect(() => {
    // Mock data fetch
    const fetchAnalyticsData = async () => {
      setTimeout(() => {
        setAnalyticsData({
          usageByDay: [
            { day: "Thứ 2", hours: 4.5, percentage: 45 },
            { day: "Thứ 3", hours: 3.2, percentage: 32 },
            { day: "Thứ 4", hours: 5.1, percentage: 51 },
            { day: "Thứ 5", hours: 2.8, percentage: 28 },
            { day: "Thứ 6", hours: 6.3, percentage: 63 },
            { day: "Thứ 7", hours: 8.7, percentage: 87 },
            { day: "Chủ nhật", hours: 7.2, percentage: 72 }
          ],
          usageByCar: [
            { car: "Tesla Model 3", percentage: 60, hours: 27, color: "bg-blue-500" },
            { car: "VinFast VF e34", percentage: 40, hours: 18, color: "bg-green-500" }
          ],
          peakHours: [
            { hour: "6-8", usage: 15, color: "from-blue-100 to-blue-200" },
            { hour: "8-10", usage: 35, color: "from-blue-200 to-blue-300" },
            { hour: "10-12", usage: 20, color: "from-blue-300 to-blue-400" },
            { hour: "12-14", usage: 10, color: "from-blue-400 to-blue-500" },
            { hour: "14-16", usage: 25, color: "from-blue-500 to-blue-600" },
            { hour: "16-18", usage: 40, color: "from-blue-600 to-blue-700" },
            { hour: "18-20", usage: 30, color: "from-blue-700 to-blue-800" },
            { hour: "20-22", usage: 15, color: "from-blue-800 to-blue-900" }
          ],
          monthlyTrend: [
            { month: "T1", hours: 45, cost: 1850000 },
            { month: "T2", hours: 52, cost: 2100000 },
            { month: "T3", hours: 48, cost: 1950000 },
            { month: "T4", hours: 60, cost: 2450000 },
            { month: "T5", hours: 55, cost: 2250000 },
            { month: "T6", hours: 65, cost: 2650000 }
          ],
          usageStats: {
            totalHours: 325,
            averagePerMonth: 54.2,
            costPerHour: 42000,
            efficiency: "6.1 km/kWh"
          }
        });
        setLoading(false);
      }, 1500);
    };

    fetchAnalyticsData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20">
          <div className="max-w-7xl mx-auto px-6 py-8">
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
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
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
                    {analyticsData.usageStats.totalHours}h
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
                    {analyticsData.usageStats.averagePerMonth}h
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
                    {analyticsData.usageStats.costPerHour.toLocaleString()}đ
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
                    {analyticsData.usageStats.efficiency}
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
                {analyticsData.usageByDay.map((day, index) => (
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
                {analyticsData.usageByCar.map((car, index) => (
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
                {analyticsData.peakHours.map((hour, index) => (
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
                {analyticsData.monthlyTrend.map((month, index) => (
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

      <Footer />
    </div>
  );
}