import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Clock, MapPin, Car, Download, Filter, Search, ChevronDown, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "../../../../components/layout/Header";
import Footer from "../../../../components/layout/Footer";
import { bookingAPI } from "../../../../api/booking";
import { socketClient } from "../../../../services/socketClient";

export default function UsageHistory() {
  const [usageData, setUsageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [periodFilter, setPeriodFilter] = useState("30d");

  useEffect(() => {
    fetchUsageData();
  }, [periodFilter, pagination.page]);

  // Subscribe to booking updates to refresh list in real-time
  useEffect(() => {
    const handler = (data) => {
      // If a booking for current user/group changed, refetch
      fetchUsageData();
    };

    try {
      socketClient.on('booking:created', handler);
      socketClient.on('booking:updated', handler);
      socketClient.on('booking:cancelled', handler);
    } catch (_err) {
      // ignore if socket not connected
    }

    return () => {
      try {
        socketClient.off('booking:created', handler);
        socketClient.off('booking:updated', handler);
        socketClient.off('booking:cancelled', handler);
      } catch (_err) {}
    };
  }, []);

  const fetchUsageData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch booking history
      const historyResponse = await bookingAPI.getBookingHistory({
        period: periodFilter,
        page: pagination.page,
        limit: pagination.limit
      });

      // Fetch booking stats
      const statsResponse = await bookingAPI.getBookingStats();

      if (historyResponse.success && statsResponse.success) {
        // Map backend bookings to frontend format
        const mappedBookings = historyResponse.data.bookings.map(booking => {
          const startTime = new Date(booking.startTime);
          const endTime = new Date(booking.endTime);
          const durationHours = booking.duration || ((endTime - startTime) / (1000 * 60 * 60));

          return {
            id: booking.id,
            date: startTime.toISOString().split('T')[0],
            startTime: startTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            endTime: endTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            duration: Math.round(durationHours * 10) / 10,
            car: booking.vehicle?.vehicleName || 'N/A',
            licensePlate: booking.vehicle?.licensePlate || '',
            location: booking.startLocation || 'N/A',
            purpose: booking.purpose || 'Không có ghi chú',
            cost: booking.cost || booking.totalCost || 0,
            status: booking.status,
            type: booking.type || 'personal'
          };
        });

        setUsageData({
          totalUsage: statsResponse.data.totalHours || 0,
          averageDuration: statsResponse.data.totalBookings > 0
            ? Math.round((statsResponse.data.totalHours / statsResponse.data.totalBookings) * 10) / 10
            : 0,
          totalCost: statsResponse.data.totalCost || 0, // Now available from backend
          recentBookings: mappedBookings
        });

        setPagination(prev => ({
          ...prev,
          total: historyResponse.data.pagination?.total || 0
        }));
      }

      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch usage data:', err);
      setError('Không thể tải dữ liệu lịch sử. Vui lòng thử lại.');
      setLoading(false);
    }
  };

  // Filter bookings based on filter and search
  const filteredBookings = usageData?.recentBookings?.filter(booking => {
    const matchesFilter = filter === "all" || booking.type === filter;
    const matchesSearch = booking.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.car.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Export to CSV function
  const exportToCSV = () => {
    if (!usageData?.recentBookings || usageData.recentBookings.length === 0) {
      alert('Không có dữ liệu để xuất');
      return;
    }

    // CSV header
    const headers = ['Ngày', 'Thời gian', 'Xe', 'Thời lượng', 'Mục đích', 'Trạng thái'];
    
    // CSV rows
    const rows = usageData.recentBookings.map(booking => [
      booking.date,
      `${booking.startTime} - ${booking.endTime}`,
      booking.car,
      booking.duration,
      booking.purpose,
      booking.status === 'completed' ? 'Hoàn thành' : booking.status === 'cancelled' ? 'Đã hủy' : 'Đang sử dụng'
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `lich_su_su_dung_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[...Array(3)].map((_, i) => (
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
                  onClick={() => fetchUsageData()}
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      case 'pending': return 'Đang chờ';
      default: return 'Không xác định';
    }
  };

  const getTypeColor = (type) => {
    return type === 'business' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-purple-100 text-purple-800';
  };

  const getTypeText = (type) => {
    return type === 'business' ? 'Công việc' : 'Cá nhân';
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
                <h1 className="text-3xl font-bold text-gray-900">Lịch sử sử dụng</h1>
                <p className="text-gray-600 mt-1">Theo dõi các chuyến đi và hoạt động của bạn</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Xuất báo cáo</span>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tổng giờ sử dụng</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {usageData.totalUsage}h
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-4">Từ tháng 1/2024</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Thời gian trung bình</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {usageData.averageDuration}h
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-4">Mỗi lần sử dụng</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tổng chi phí</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {usageData.totalCost.toLocaleString()}đ
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Car className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-4">Đã thanh toán</p>
            </motion.div>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm theo mục đích hoặc xe..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex gap-3">
              <select 
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value)}
                className="px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7d">7 ngày</option>
                <option value="30d">30 ngày</option>
                <option value="90d">90 ngày</option>
                <option value="all">Tất cả</option>
              </select>

              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tất cả loại</option>
                <option value="business">Công việc</option>
                <option value="personal">Cá nhân</option>
              </select>
              
              <button className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                <Filter className="w-4 h-4" />
                <span>Bộ lọc</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Recent Bookings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Lịch sử đặt xe</h2>
              <p className="text-gray-600 text-sm mt-1">
                {filteredBookings?.length || 0} chuyến đi được tìm thấy
              </p>
            </div>
            
            <div className="divide-y divide-gray-200">
              {filteredBookings?.map((booking) => (
                <div key={booking.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 bg-blue-100 rounded-xl">
                        <Car className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{booking.car}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(booking.type)}`}>
                            {getTypeText(booking.type)}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                            {getStatusText(booking.status)}
                          </span>
                        </div>
                        
                        <p className="text-gray-800 font-medium mb-2">{booking.purpose}</p>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{booking.date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{booking.startTime} - {booking.endTime}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{booking.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        {booking.cost.toLocaleString()}đ
                      </p>
                      <p className="text-sm text-gray-600">
                        {booking.duration}h sử dụng
                      </p>
                      <button className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
                        Xem chi tiết
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {(!filteredBookings || filteredBookings.length === 0) && (
              <div className="text-center py-12">
                <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy chuyến đi nào</h3>
                <p className="text-gray-600">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
              </div>
            )}

            {/* Pagination */}
            {pagination.total > pagination.limit && (
              <div className="flex items-center justify-between border-t border-gray-200 pt-6">
                <div className="text-sm text-gray-600">
                  Hiển thị {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)} - {Math.min(pagination.page * pagination.limit, pagination.total)} trong tổng số {pagination.total} chuyến đi
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Trước
                  </button>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page * pagination.limit >= pagination.total}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}