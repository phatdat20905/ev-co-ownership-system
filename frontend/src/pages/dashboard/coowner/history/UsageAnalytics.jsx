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

  // Process booking history to analytics (client-side)
  const processBookingHistoryToAnalytics = (bookings) => {
    if (!bookings || bookings.length === 0) {
      return getEmptyAnalytics();
    }

    // Usage by day
    const dayMap = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const usageByDay = {};
    dayMap.forEach(day => usageByDay[day] = 0);

    // Usage by car
    const usageByCar = {};

    // Peak hours
    const peakHours = {};
    for (let i = 0; i < 24; i += 2) {
      peakHours[`${i}-${i + 2}`] = 0;
    }

    // Monthly trend
    const monthlyTrend = {};

    // Process each booking
    let totalHours = 0;
    let totalCost = 0;
    const monthSet = new Set();

    bookings.forEach(booking => {
      const startTime = new Date(booking.startTime);
      const endTime = new Date(booking.endTime);
      const duration = (endTime - startTime) / (1000 * 60 * 60); // hours

      // Usage by day
      const dayName = dayMap[startTime.getDay()];
      usageByDay[dayName] = (usageByDay[dayName] || 0) + duration;

      // Usage by car
      const carName = booking.vehicle?.vehicleName || booking.vehicle?.brand || 'Xe không xác định';
      if (!usageByCar[carName]) {
        usageByCar[carName] = { hours: 0, vehicleId: booking.vehicleId };
      }
      usageByCar[carName].hours += duration;

      // Peak hours
      const hour = startTime.getHours();
      const hourRange = `${Math.floor(hour / 2) * 2}-${Math.floor(hour / 2) * 2 + 2}`;
      if (peakHours[hourRange] !== undefined) {
        peakHours[hourRange]++;
      }

      // Monthly trend
      const monthKey = `T${startTime.getMonth() + 1}`;
      if (!monthlyTrend[monthKey]) {
        monthlyTrend[monthKey] = { hours: 0, cost: 0 };
      }
      monthlyTrend[monthKey].hours += duration;
      monthlyTrend[monthKey].cost += booking.cost || 0;
      monthSet.add(monthKey);

      // Totals
      totalHours += duration;
      totalCost += booking.cost || 0;
    });

    // Format usage by day
    const maxDayHours = Math.max(...Object.values(usageByDay), 1);
    const usageByDayArray = Object.entries(usageByDay).map(([day, hours]) => ({
      day,
      hours: Math.round(hours * 10) / 10,
      percentage: Math.round((hours / maxDayHours) * 100)
    }));

    // Format usage by car
    const totalCarHours = Object.values(usageByCar).reduce((sum, v) => sum + v.hours, 0);
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'];
    const usageByCarArray = Object.entries(usageByCar).map(([car, data], idx) => ({
      car,
      vehicleId: data.vehicleId,
      hours: Math.round(data.hours * 10) / 10,
      percentage: totalCarHours > 0 ? Math.round((data.hours / totalCarHours) * 100) : 0,
      color: colors[idx % colors.length]
    }));

    // Format peak hours
    const maxPeakUsage = Math.max(...Object.values(peakHours), 1);
    const peakColorsArr = [
      'from-blue-100 to-blue-200', 'from-blue-200 to-blue-300',
      'from-blue-300 to-blue-400', 'from-blue-400 to-blue-500',
      'from-blue-500 to-blue-600', 'from-blue-600 to-blue-700',
      'from-blue-700 to-blue-800', 'from-blue-800 to-blue-900',
      'from-blue-900 to-blue-950', 'from-indigo-500 to-indigo-600',
      'from-indigo-600 to-indigo-700', 'from-indigo-700 to-indigo-800'
    ];
    const peakHoursArray = Object.entries(peakHours).map(([hour, usage], idx) => ({
      hour,
      usage: Math.round((usage / maxPeakUsage) * 100),
      count: usage,
      color: peakColorsArr[idx % peakColorsArr.length]
    }));

    // Format monthly trend
    const monthlyTrendArray = Object.entries(monthlyTrend).map(([month, data]) => ({
      month,
      hours: Math.round(data.hours * 10) / 10,
      cost: Math.round(data.cost)
    }));

    // Usage stats
    const averagePerMonth = monthSet.size > 0 ? Math.round((totalHours / monthSet.size) * 10) / 10 : 0;
    const costPerHour = totalHours > 0 ? Math.round(totalCost / totalHours) : 0;

    return {
      usageByDay: usageByDayArray,
      usageByCar: usageByCarArray,
      peakHours: peakHoursArray,
      monthlyTrend: monthlyTrendArray,
      usageStats: {
        totalHours: Math.round(totalHours * 10) / 10,
        averagePerMonth,
        costPerHour,
        totalCost: Math.round(totalCost),
        totalBookings: bookings.length,
        efficiency: 'N/A'
      }
    };
  };

  const getEmptyAnalytics = () => {
    const dayMap = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const peakColorsArr = [
      'from-blue-100 to-blue-200', 'from-blue-200 to-blue-300',
      'from-blue-300 to-blue-400', 'from-blue-400 to-blue-500',
      'from-blue-500 to-blue-600', 'from-blue-600 to-blue-700',
      'from-blue-700 to-blue-800', 'from-blue-800 to-blue-900',
      'from-blue-900 to-blue-950', 'from-indigo-500 to-indigo-600',
      'from-indigo-600 to-indigo-700', 'from-indigo-700 to-indigo-800'
    ];

    return {
      usageByDay: dayMap.map(day => ({ day, hours: 0, percentage: 0 })),
      usageByCar: [],
      peakHours: Array.from({ length: 12 }, (_, i) => ({
        hour: `${i * 2}-${i * 2 + 2}`,
        usage: 0,
        count: 0,
        color: peakColorsArr[i]
      })),
      monthlyTrend: [],
      usageStats: {
        totalHours: 0,
        averagePerMonth: 0,
        costPerHour: 0,
        totalCost: 0,
        totalBookings: 0,
        efficiency: 'N/A'
      }
    };
  };

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

      // Try to fetch history first (all bookings), then fallback to analytics if needed
      // Note: API has limit max of 50, so we'll get the most recent 50 bookings
      const historyResponse = await bookingAPI.getBookingHistory({
        period,
        limit: 50 // API maximum allowed limit
      });

      let data = null;

      if (historyResponse.success && historyResponse.data?.bookings?.length > 0) {
        // Process history data client-side to generate analytics
        data = processBookingHistoryToAnalytics(historyResponse.data.bookings);
      } else {
        // Fallback to server-side analytics (for completed bookings only)
        const analyticsResponse = await bookingAPI.getBookingAnalytics({
          period
        });
        if (analyticsResponse.success) {
          data = analyticsResponse.data;
        }
      }

      if (data) {

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

  // Determine whether analytics is effectively empty (no hours)
  const totalHours = analyticsData?.usageStats?.totalHours || 0;
  const isEmptyAnalytics = totalHours === 0;

  // Export analytics to CSV
  const exportAnalyticsToCSV = () => {
    if (!analyticsData || isEmptyAnalytics) {
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

  // If analytics has no meaningful data, show an empty-state with actions
  if (isEmptyAnalytics) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="pt-20">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
              <PieChart className="mx-auto w-12 h-12 text-gray-400" />
              <h3 className="mt-4 text-xl font-semibold">Chưa có dữ liệu phân tích</h3>
              <p className="text-gray-600 mt-2">Hiện chưa có hoạt động để tạo báo cáo. Hãy tạo đặt lịch hoặc thử thay đổi khoảng thời gian.</p>
              <div className="mt-4 flex justify-center gap-3">
                <Link to="/dashboard/coowner/booking/new" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Tạo đặt lịch</Link>
                <button onClick={fetchAnalyticsData} className="px-4 py-2 bg-gray-100 rounded-lg">Làm mới</button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
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