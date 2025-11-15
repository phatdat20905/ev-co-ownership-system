import React, { useState, useEffect } from 'react';
import CoownerLayout from '../../../components/layout/CoownerLayout';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Car, MapPin, Users, DollarSign, Battery, TrendingUp, Filter, Download, Eye } from 'lucide-react';
import bookingService from '../../../services/bookingService';
import { showErrorToast } from '../../../utils/toast';

export default function ScheduleView() {
  const [timeRange, setTimeRange] = useState('month'); 
  const [filter, setFilter] = useState('all');
  const [scheduleData, setScheduleData] = useState({ upcoming: [], past: [] });
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalHours: 0,
    totalCost: 0,
    favoriteCar: 'N/A',
    efficiency: '0.0 km/kWh'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScheduleData();
  }, [timeRange]);

  const fetchScheduleData = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getUserBookings();
      
      if (response.success && response.data) {
        const bookings = response.data;
        const now = new Date();
        
        // Separate upcoming and past bookings
        const upcoming = [];
        const past = [];
        
        bookings.forEach(booking => {
          const startTime = new Date(booking.startTime);
          const endTime = new Date(booking.endTime);
          const duration = ((endTime - startTime) / (1000 * 60 * 60)).toFixed(1);
          
          const scheduleItem = {
            id: booking.id,
            car: booking.vehicleName || booking.vehicleModel || 'Chưa rõ xe',
            date: startTime.toISOString().split('T')[0],
            startTime: startTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            endTime: endTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            duration: `${duration} giờ`,
            purpose: booking.purpose || booking.note || 'Không rõ',
            location: booking.destination || booking.pickupLocation || 'N/A',
            cost: booking.totalCost || 0,
            status: booking.status,
            efficiency: booking.efficiency || '0.0 km/kWh',
            distance: booking.distance ? `${booking.distance} km` : 'N/A'
          };
          
          if (startTime > now) {
            upcoming.push(scheduleItem);
          } else {
            past.push(scheduleItem);
          }
        });
        
        setScheduleData({ upcoming, past });
        
        // Calculate stats
        const totalBookings = bookings.length;
        const totalHours = bookings.reduce((sum, b) => {
          const hours = (new Date(b.endTime) - new Date(b.startTime)) / (1000 * 60 * 60);
          return sum + hours;
        }, 0);
        const totalCost = bookings.reduce((sum, b) => sum + (b.totalCost || 0), 0);
        
        // Find favorite car (most used)
        const carUsageMap = {};
        bookings.forEach(b => {
          const carName = b.vehicleName || b.vehicleModel || 'N/A';
          carUsageMap[carName] = (carUsageMap[carName] || 0) + 1;
        });
        const favoriteCar = Object.entries(carUsageMap).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
        
        // Calculate average efficiency
        const efficiencies = bookings.map(b => parseFloat(b.efficiency || 0)).filter(e => e > 0);
        const avgEfficiency = efficiencies.length > 0 
          ? (efficiencies.reduce((sum, e) => sum + e, 0) / efficiencies.length).toFixed(1)
          : '0.0';
        
        setStats({
          totalBookings,
          totalHours: Math.round(totalHours),
          totalCost,
          favoriteCar,
          efficiency: `${avgEfficiency} km/kWh`
        });
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      showErrorToast(error.response?.data?.message || 'Không thể tải lịch sử dụng');
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700 border-green-200';
      case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed': return 'Đã xác nhận';
      case 'completed': return 'Đã hoàn thành';
      case 'cancelled': return 'Đã hủy';
      case 'pending': return 'Chờ xác nhận';
      default: return 'Không xác định';
    }
  };

  const displayData = filter === 'all' 
    ? [...scheduleData.upcoming, ...scheduleData.past]
    : scheduleData[filter];

  return (
    <CoownerLayout>
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Link
              to="/coowner/booking"
              className="inline-flex items-center gap-2 text-sky-600 hover:text-sky-700 mb-6 group transition-colors"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span>Quay lại Lịch đặt xe</span>
            </Link>
            
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                  Lịch sử dụng
                </h1>
                <p className="text-xl text-gray-600">
                  Theo dõi lịch sử và thống kê sử dụng xe
                </p>
              </div>
              
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-3 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 hover:shadow-xl transition-all">
                  <Download className="w-4 h-4" />
                  <span>Xuất báo cáo</span>
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-sky-100 rounded-xl">
                    <Calendar className="w-6 h-6 text-sky-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
                    <p className="text-sm text-gray-600">Tổng lịch đặt</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <Clock className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalHours}h</p>
                    <p className="text-sm text-gray-600">Tổng giờ sử dụng</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <DollarSign className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {(stats.totalCost / 1000000).toFixed(1)}M
                    </p>
                    <p className="text-sm text-gray-600">Tổng chi phí</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-100 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.efficiency}</p>
                    <p className="text-sm text-gray-600">Hiệu suất trung bình</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8"
              >
                {/* Filters */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                  <div className="flex gap-2">
                    {['all', 'upcoming', 'past'].map(range => (
                      <button
                        key={range}
                        onClick={() => setFilter(range)}
                        className={`px-4 py-2 rounded-2xl font-medium transition-all ${
                          filter === range
                            ? 'bg-sky-500 text-white shadow-lg'
                            : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                        }`}
                      >
                        {range === 'all' && 'Tất cả'}
                        {range === 'upcoming' && 'Sắp tới'}
                        {range === 'past' && 'Đã qua'}
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors">
                      <Filter className="w-4 h-4" />
                      <span>Lọc</span>
                    </button>
                  </div>
                </div>

                {/* Schedule List */}
                <div className="space-y-6">
                  {displayData.map((booking, index) => (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200/50 shadow-lg"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-3">
                            <div className="p-3 bg-sky-100 rounded-xl">
                              <Car className="w-6 h-6 text-sky-600" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-900">{booking.car}</h3>
                              <p className="text-gray-600">
                                {booking.date} • {booking.startTime} - {booking.endTime}
                              </p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">Thời gian:</span>
                              <span className="font-medium">{booking.duration}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">Tuyến đường:</span>
                              <span className="font-medium">{booking.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">Mục đích:</span>
                              <span className="font-medium capitalize">{booking.purpose}</span>
                            </div>
                          </div>
                          
                          {/* Additional info for completed bookings */}
                          {booking.status === 'completed' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
                              <div className="flex items-center gap-2">
                                <Battery className="w-4 h-4 text-green-600" />
                                <span className="text-gray-600">Hiệu suất:</span>
                                <span className="font-medium">{booking.efficiency}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-blue-600" />
                                <span className="text-gray-600">Quãng đường:</span>
                                <span className="font-medium">{booking.distance}</span>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col items-end gap-3">
                          <div className="text-right">
                            <p className="text-2xl font-bold text-sky-600">
                              {booking.cost.toLocaleString()} VNĐ
                            </p>
                            <p className="text-sm text-gray-600">Chi phí ước tính</p>
                          </div>
                          
                          <div className="flex gap-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                              {getStatusText(booking.status)}
                            </span>
                            
                            {booking.status === 'completed' && (
                              <button className="p-2 text-gray-400 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-colors">
                                <Eye className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {displayData.length === 0 && (
                    <div className="text-center py-12">
                      <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-gray-500 text-lg">Không có lịch đặt nào</p>
                      <Link
                        to="/coowner/booking/new"
                        className="inline-block mt-4 text-sky-600 hover:text-sky-700 font-medium"
                      >
                        Đặt lịch ngay
                      </Link>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Usage Summary */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4">Tóm tắt sử dụng</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
                    <span className="text-gray-700">Xe sử dụng nhiều nhất:</span>
                    <span className="font-bold text-blue-600">{stats.favoriteCar}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl">
                    <span className="text-gray-700">Giờ trung bình/tuần:</span>
                    <span className="font-bold text-green-600">6h</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-xl">
                    <span className="text-gray-700">Chi phí trung bình:</span>
                    <span className="font-bold text-purple-600">240K/buổi</span>
                  </div>
                </div>
              </motion.div>

              {/* Efficiency Tips */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-3xl p-6 text-white"
              >
                <h3 className="text-xl font-bold mb-4">Cải thiện hiệu suất</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span>Sạc xe vào giờ thấp điểm</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span>Duy trì tốc độ ổn định</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span>Hạn chế sử dụng điều hòa</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span>Kiểm tra áp suất lốp thường xuyên</span>
                  </li>
                </ul>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4">Hành động nhanh</h3>
                <div className="space-y-3">
                  <Link
                    to="/dashboard/coowner/booking/new"
                    className="block w-full py-3 bg-gradient-to-r from-sky-500 to-cyan-500 text-white text-center font-semibold rounded-2xl hover:shadow-lg transition-all"
                  >
                    Đặt lịch mới
                  </Link>
                  <button className="block w-full py-3 bg-white border border-gray-300 text-gray-700 text-center font-semibold rounded-2xl hover:bg-gray-50 transition-colors">
                    Xuất báo cáo
                  </button>
                  <button className="block w-full py-3 bg-white border border-gray-300 text-gray-700 text-center font-semibold rounded-2xl hover:bg-gray-50 transition-colors">
                    Xem phân tích
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </CoownerLayout>
  );
}