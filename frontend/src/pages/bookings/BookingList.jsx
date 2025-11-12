// src/pages/bookings/BookingList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Car, 
  MapPin, 
  ChevronRight, 
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  PlayCircle,
  Search
} from 'lucide-react';
import bookingService from '../../services/booking.service';
import LoadingSkeleton from '../../components/LoadingSkeleton';

export default function BookingList({ status = 'all', limit = null }) {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState(status);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (filter !== 'all') {
        params.status = filter;
      }

      const response = await bookingService.getUserBookings(params);
      let data = response.data || [];

      // Apply limit if specified
      if (limit) {
        data = data.slice(0, limit);
      }

      setBookings(data);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
      setError(err.message || 'Không thể tải danh sách đặt xe');
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      pending: {
        label: 'Chờ xác nhận',
        icon: <Clock className="w-5 h-5" />,
        color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        iconColor: 'text-yellow-600'
      },
      confirmed: {
        label: 'Đã xác nhận',
        icon: <CheckCircle className="w-5 h-5" />,
        color: 'bg-blue-100 text-blue-700 border-blue-200',
        iconColor: 'text-blue-600'
      },
      in_progress: {
        label: 'Đang sử dụng',
        icon: <PlayCircle className="w-5 h-5" />,
        color: 'bg-green-100 text-green-700 border-green-200',
        iconColor: 'text-green-600'
      },
      completed: {
        label: 'Hoàn thành',
        icon: <CheckCircle className="w-5 h-5" />,
        color: 'bg-gray-100 text-gray-700 border-gray-200',
        iconColor: 'text-gray-600'
      },
      cancelled: {
        label: 'Đã hủy',
        icon: <XCircle className="w-5 h-5" />,
        color: 'bg-red-100 text-red-700 border-red-200',
        iconColor: 'text-red-600'
      }
    };

    return statusMap[status] || statusMap.pending;
  };

  const filteredBookings = bookings.filter(booking => {
    if (!searchTerm) return true;
    
    const search = searchTerm.toLowerCase();
    return (
      booking.vehicleName?.toLowerCase().includes(search) ||
      booking.vehiclePlate?.toLowerCase().includes(search) ||
      booking.pickupLocation?.toLowerCase().includes(search)
    );
  });

  if (loading) {
    return <LoadingSkeleton.ListSkeleton items={3} />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-3">
        <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-red-900 mb-1">Lỗi</h3>
          <p className="text-red-700">{error}</p>
          <button
            onClick={fetchBookings}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        {/* Status Filter */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              filter === 'all'
                ? 'bg-sky-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              filter === 'pending'
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Chờ xác nhận
          </button>
          <button
            onClick={() => setFilter('confirmed')}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              filter === 'confirmed'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Đã xác nhận
          </button>
          <button
            onClick={() => setFilter('in_progress')}
            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
              filter === 'in_progress'
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Đang sử dụng
          </button>
        </div>

        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm theo xe, biển số, địa điểm..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Bookings List */}
      <AnimatePresence mode="popLayout">
        {filteredBookings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-12"
          >
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 text-lg">
              {searchTerm ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có đặt xe nào'}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking, index) => {
              const statusInfo = getStatusInfo(booking.status);
              
              return (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => navigate(`/dashboard/coowner/booking/${booking.id}`)}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-sky-300 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Left Section */}
                    <div className="flex items-start gap-4 flex-1">
                      {/* Icon */}
                      <div className="p-3 bg-sky-100 rounded-xl group-hover:bg-sky-200 transition-colors">
                        <Car className="w-6 h-6 text-sky-600" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-sky-600 transition-colors">
                              {booking.vehicleName || 'N/A'}
                            </h3>
                            {booking.vehiclePlate && (
                              <p className="text-sm text-gray-500">
                                Biển số: {booking.vehiclePlate}
                              </p>
                            )}
                          </div>
                          
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${statusInfo.color}`}>
                            {statusInfo.icon}
                            {statusInfo.label}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                          {/* Start Time */}
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm">
                              {booking.startTime ? new Date(booking.startTime).toLocaleDateString('vi-VN') : 'N/A'}
                            </span>
                          </div>

                          {/* Time */}
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm">
                              {booking.startTime && booking.endTime
                                ? `${new Date(booking.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - ${new Date(booking.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`
                                : 'N/A'}
                            </span>
                          </div>

                          {/* Location */}
                          {booking.pickupLocation && (
                            <div className="flex items-center gap-2 text-gray-600 sm:col-span-2">
                              <MapPin className="w-4 h-4" />
                              <span className="text-sm truncate">{booking.pickupLocation}</span>
                            </div>
                          )}
                        </div>

                        {/* Check-in/out info */}
                        {(booking.checkInTime || booking.checkOutTime) && (
                          <div className="mt-3 pt-3 border-t border-gray-200 flex gap-4 text-sm">
                            {booking.checkInTime && (
                              <div>
                                <span className="text-gray-500">Check-in: </span>
                                <span className="font-medium text-green-600">
                                  {new Date(booking.checkInTime).toLocaleTimeString('vi-VN')}
                                </span>
                              </div>
                            )}
                            {booking.checkOutTime && (
                              <div>
                                <span className="text-gray-500">Check-out: </span>
                                <span className="font-medium text-red-600">
                                  {new Date(booking.checkOutTime).toLocaleTimeString('vi-VN')}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-sky-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
