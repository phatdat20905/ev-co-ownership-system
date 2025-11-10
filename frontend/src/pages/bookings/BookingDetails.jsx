// src/pages/bookings/BookingDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Car, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Phone,
  Mail,
  CreditCard,
  AlertCircle
} from 'lucide-react';
import BookingQRCode from '../../components/booking/BookingQRCode';
import bookingService from '../../services/booking.service';

export default function BookingDetails() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await bookingService.getBooking(bookingId);
      setBooking(response.data);
    } catch (err) {
      console.error('Failed to fetch booking details:', err);
      setError(err.message || 'Không thể tải thông tin đặt xe');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (booking) => {
    // Refresh booking data after check-in
    await fetchBookingDetails();
  };

  const handleCheckOut = async (booking) => {
    // Refresh booking data after check-out
    await fetchBookingDetails();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-sky-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-red-900 mb-1">Lỗi</h3>
              <p className="text-red-700">{error}</p>
              <button
                onClick={() => navigate('/bookings')}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Quay lại danh sách đặt xe
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Không tìm thấy đặt xe</p>
          <button
            onClick={() => navigate('/bookings')}
            className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
          >
            Quay lại danh sách đặt xe
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/bookings')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Chi tiết đặt xe
                </h1>
                <p className="text-sm text-gray-500">
                  Booking ID: #{booking.id}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - QR Code */}
          <div>
            <BookingQRCode 
              booking={booking}
              onCheckIn={handleCheckIn}
              onCheckOut={handleCheckOut}
            />
          </div>

          {/* Right Column - Booking Details */}
          <div className="space-y-6">
            {/* Vehicle Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Car className="w-6 h-6 text-sky-600" />
                Thông tin xe
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tên xe</span>
                  <span className="font-semibold text-gray-900">
                    {booking.vehicleName || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Biển số</span>
                  <span className="font-semibold text-gray-900">
                    {booking.vehiclePlate || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Loại xe</span>
                  <span className="font-semibold text-gray-900">
                    {booking.vehicleType || 'N/A'}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Schedule Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-purple-600" />
                Lịch trình
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-gray-600">Ngày bắt đầu</span>
                  <span className="font-semibold text-gray-900 text-right">
                    {booking.startTime ? new Date(booking.startTime).toLocaleString('vi-VN') : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-gray-600">Ngày kết thúc</span>
                  <span className="font-semibold text-gray-900 text-right">
                    {booking.endTime ? new Date(booking.endTime).toLocaleString('vi-VN') : 'N/A'}
                  </span>
                </div>
                {booking.duration && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Thời gian thuê</span>
                    <span className="font-semibold text-gray-900">
                      {booking.duration}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Location Info */}
            {(booking.pickupLocation || booking.dropoffLocation) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-green-600" />
                  Địa điểm
                </h2>

                <div className="space-y-3">
                  {booking.pickupLocation && (
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Điểm đón</div>
                      <div className="font-semibold text-gray-900">
                        {booking.pickupLocation}
                      </div>
                    </div>
                  )}
                  {booking.dropoffLocation && (
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Điểm trả</div>
                      <div className="font-semibold text-gray-900">
                        {booking.dropoffLocation}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Contact Info */}
            {(booking.contactName || booking.contactPhone || booking.contactEmail) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-6 h-6 text-orange-600" />
                  Thông tin liên hệ
                </h2>

                <div className="space-y-3">
                  {booking.contactName && (
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">{booking.contactName}</span>
                    </div>
                  )}
                  {booking.contactPhone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">{booking.contactPhone}</span>
                    </div>
                  )}
                  {booking.contactEmail && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">{booking.contactEmail}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Payment Info */}
            {booking.totalCost && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-6 h-6 text-pink-600" />
                  Thanh toán
                </h2>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tổng chi phí</span>
                    <span className="text-2xl font-bold text-sky-600">
                      {booking.totalCost.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                  {booking.paymentStatus && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Trạng thái thanh toán</span>
                      <span className={`font-semibold ${
                        booking.paymentStatus === 'paid' ? 'text-green-600' :
                        booking.paymentStatus === 'pending' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {booking.paymentStatus === 'paid' ? 'Đã thanh toán' :
                         booking.paymentStatus === 'pending' ? 'Chờ thanh toán' :
                         'Chưa thanh toán'}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Notes */}
            {booking.notes && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Ghi chú
                </h2>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {booking.notes}
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
