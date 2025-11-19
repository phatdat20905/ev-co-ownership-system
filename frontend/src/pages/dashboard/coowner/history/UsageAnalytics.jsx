import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, BarChart3, TrendingUp, Calendar, Download, PieChart, Users, Clock, DollarSign, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "../../../../components/layout/Header";
import Footer from "../../../../components/layout/Footer";
import { bookingAPI } from "../../../../api/booking";
import { vehicleAPI } from "../../../../api/vehicle";
import { socketClient } from "../../../../services/socketClient";

export default function UsageAnalytics() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState("month");

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  // Subscribe to booking events to refresh analytics when data changes
  useEffect(() => {
    const handler = (data) => {
      fetchAnalyticsData();
    };

    try {
      socketClient.on('booking:created', handler);
      socketClient.on('booking:updated', handler);
      socketClient.on('booking:cancelled', handler);
    } catch (_err) {
      // socket might not be connected yet
    }

    return () => {
      try {
        socketClient.off('booking:created', handler);
        socketClient.off('booking:updated', handler);
        socketClient.off('booking:cancelled', handler);
      } catch (_err) {}
    };
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Determine period based on timeRange
      const periodMap = {
        week: '7d',
        month: '30d',
        quarter: '90d',
        year: '365d'
      };
      const period = periodMap[timeRange] || '30d';

      // Use new analytics endpoint (server-side processing)
      const analyticsResponse = await bookingAPI.getBookingAnalytics({
        period
      });

      if (analyticsResponse.success) {
        const data = analyticsResponse.data;

        // Try to enrich with vehicle efficiency data (weighted average)
        try {
          const cars = data.usageByCar || [];
          let totalWeightedEff = 0;
          let totalHours = 0;

          // Fetch efficiencies in parallel (limit to first 10 to be safe)
          const fetchPromises = cars.slice(0, 10).map(async (c) => {
            if (!c.vehicleId) return null;
            try {
              const resp = await vehicleAPI.getVehicleById(c.vehicleId);
              const vehicle = resp.data || resp;
              return { vehicleId: c.vehicleId, efficiency: vehicle.efficiency };
            } catch (err) {
              return null;
            }
          });

          const results = await Promise.all(fetchPromises);

          const effMap = new Map();
          results.forEach(r => { if (r && r.efficiency) effMap.set(r.vehicleId, r.efficiency); });

          // attach per-car efficiency and compute weighted average
          cars.forEach(c => {
            const eff = effMap.get(c.vehicleId) || null;
            c.efficiency = eff;
            if (eff && c.hours) {
              const num = typeof eff === 'string' ? parseFloat(eff) : eff;
              if (!isNaN(num)) {
                totalWeightedEff += num * c.hours;
                totalHours += c.hours;
              }
            }
          });

          if (totalHours > 0) {
            data.usageStats.efficiency = Math.round((totalWeightedEff / totalHours) * 10) / 10 + ' km/kWh';
          } else {
            data.usageStats.efficiency = data.usageStats.efficiency || 'N/A';
          }
        } catch (err) {
          // non-fatal
          data.usageStats.efficiency = data.usageStats.efficiency || 'N/A';
        }

        setAnalyticsData(data);
      }

      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch analytics data:', err);
      setError('Không thể tải dữ liệu phân tích. Vui lòng thử lại.');
      setLoading(false);
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 mb-1">Lỗi tải dữ liệu</h3>
                <p className="text-red-700 mb-4">{error}</p>
                <button
                  onClick={() => fetchAnalyticsData()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Thử lại
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return null;
  }

  // Export analytics to CSV
  const exportAnalyticsToCSV = () => {
    if (!analyticsData) {
      alert('Không có dữ liệu để xuất');
      return;
    }

    // Prepare CSV content with multiple sections
    const csvSections = [];

    // Section 1: Overview Stats
    csvSections.push('=== THỐNG KÊ TỔNG QUAN ===');
    csvSections.push('Chỉ số,Giá trị');
    csvSections.push(`Tổng thời gian,${analyticsData.usageStats.totalHours} giờ`);
    csvSections.push(`Chi phí trung bình,${analyticsData.usageStats.costPerHour.toLocaleString()}đ/giờ`);
    csvSections.push(`Trung bình mỗi tháng,${analyticsData.usageStats.averagePerMonth} giờ`);
    csvSections.push(`Hiệu suất,${analyticsData.usageStats.efficiency}`);
    csvSections.push('');

    // Section 2: Usage by Day
    csvSections.push('=== SỬ DỤNG THEO NGÀY ===');
    csvSections.push('Ngày,Giờ,Phần trăm');
    analyticsData.usageByDay.forEach(day => {
      csvSections.push(`${day.day},${day.hours},${day.percentage}%`);
    });
    csvSections.push('');

    // Section 3: Usage by Car
    csvSections.push('=== PHÂN BỔ THEO XE ===');
    csvSections.push('Xe,Giờ,Phần trăm');
    analyticsData.usageByCar.forEach(car => {
      csvSections.push(`${car.car},${car.hours},${car.percentage}%`);
    });
    csvSections.push('');

    // Section 4: Monthly Trend
    csvSections.push('=== XU HƯỚNG HÀNG THÁNG ===');
    csvSections.push('Tháng,Giờ,Chi phí');
    analyticsData.monthlyTrend.forEach(month => {
      csvSections.push(`${month.month},${month.hours},${month.cost.toLocaleString()}đ`);
    });

    const csvContent = csvSections.join('\n');

    // Create blob and download
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `phan_tich_su_dung_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link
                to="/dashboard/coowner/history"
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
              <button 
                onClick={exportAnalyticsToCSV}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
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
                  <div 
                    key={index} 
                    className="flex items-center justify-between group relative"
                    title={`${day.day}: ${day.hours} giờ (${day.percentage}%)`}
                  >
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
                    {/* Tooltip on hover */}
                    <div className="absolute left-1/2 -translate-x-1/2 -top-10 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                      {day.percentage}% tổng thời gian
                    </div>
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
                  <div 
                    key={index} 
                    className="flex items-center justify-between group relative"
                    title={`${car.car}: ${car.hours} giờ (${car.percentage}%)`}
                  >
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
                    {/* Tooltip on hover */}
                    <div className="absolute left-1/2 -translate-x-1/2 -top-10 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                      {car.hours} giờ sử dụng
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
                  <div 
                    key={index} 
                    className="text-center group relative"
                    title={`${hour.hour}: ${hour.usage}% sử dụng`}
                  >
                    <div className={`bg-gradient-to-br ${hour.color} rounded-xl p-3 text-white shadow-sm transition-transform group-hover:scale-105`}>
                      <div className="text-sm font-medium">{hour.hour}</div>
                      <div className="text-lg font-bold mt-1">{hour.usage}%</div>
                    </div>
                    {/* Tooltip on hover */}
                    <div className="absolute left-1/2 -translate-x-1/2 -top-12 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                      Khung giờ {hour.hour}
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
                  <div 
                    key={index} 
                    className="flex items-center justify-between group relative"
                    title={`Tháng ${month.month}: ${month.hours} giờ, ${month.cost.toLocaleString()}đ`}
                  >
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
                    {/* Tooltip on hover */}
                    <div className="absolute left-1/2 -translate-x-1/2 -top-14 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                      Chi phí trung bình: {Math.round(month.cost / month.hours).toLocaleString()}đ/giờ
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