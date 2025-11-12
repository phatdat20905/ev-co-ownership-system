// src/components/booking/BookingQRCode.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QrCode, CheckCircle, XCircle, Clock, Car, Calendar, MapPin } from 'lucide-react';
import QRCodeLib from 'qrcode';
import bookingService from '../../services/booking.service';
import LoadingSkeleton from '../../components/LoadingSkeleton';

export default function BookingQRCode({ booking, onCheckIn, onCheckOut }) {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    generateQRCode();
  }, [booking]);

  const generateQRCode = async () => {
    try {
      // Generate QR code containing booking ID
      const qrData = JSON.stringify({
        bookingId: booking.id,
        userId: booking.userId,
        vehicleId: booking.vehicleId,
        timestamp: Date.now()
      });

      const url = await QRCodeLib.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#0EA5E9',
          light: '#FFFFFF'
        }
      });

      setQrCodeUrl(url);
    } catch (err) {
      console.error('Failed to generate QR code:', err);
      setError('Không thể tạo mã QR');
    }
  };

  const handleCheckIn = async () => {
    try {
      setLoading(true);
      setError(null);

      await bookingService.checkIn(booking.id);

      if (onCheckIn) {
        onCheckIn(booking);
      }
    } catch (err) {
      setError(err.message || 'Không thể check-in');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setLoading(true);
      setError(null);

      await bookingService.checkOut(booking.id);

      if (onCheckOut) {
        onCheckOut(booking);
      }
    } catch (err) {
      setError(err.message || 'Không thể check-out');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: {
        label: 'Chờ xác nhận',
        color: 'bg-yellow-100 text-yellow-700',
        icon: <Clock className="w-4 h-4" />
      },
      confirmed: {
        label: 'Đã xác nhận',
        color: 'bg-blue-100 text-blue-700',
        icon: <CheckCircle className="w-4 h-4" />
      },
      in_progress: {
        label: 'Đang sử dụng',
        color: 'bg-green-100 text-green-700',
        icon: <Car className="w-4 h-4" />
      },
      completed: {
        label: 'Hoàn thành',
        color: 'bg-gray-100 text-gray-700',
        icon: <CheckCircle className="w-4 h-4" />
      },
      cancelled: {
        label: 'Đã hủy',
        color: 'bg-red-100 text-red-700',
        icon: <XCircle className="w-4 h-4" />
      }
    };

    return badges[booking.status] || badges.pending;
  };

  const status = getStatusBadge(booking.status);
  const canCheckIn = booking.status === 'confirmed' && !booking.checkInTime;
  const canCheckOut = booking.status === 'in_progress' && booking.checkInTime && !booking.checkOutTime;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl shadow-lg p-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Mã QR Check-in
          </h3>
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${status.color} text-sm font-medium`}>
            {status.icon}
            {status.label}
          </div>
        </div>
        <QrCode className="w-8 h-8 text-sky-600" />
      </div>

      {/* Booking Info */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <Car className="w-4 h-4 text-sky-600" />
            <span className="text-sm text-gray-600">Xe</span>
          </div>
          <div className="font-semibold text-gray-900">
            {booking.vehicleName || 'N/A'}
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-purple-600" />
            <span className="text-sm text-gray-600">Ngày</span>
          </div>
          <div className="font-semibold text-gray-900">
            {booking.startTime ? new Date(booking.startTime).toLocaleDateString('vi-VN') : 'N/A'}
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-green-600" />
            <span className="text-sm text-gray-600">Giờ bắt đầu</span>
          </div>
          <div className="font-semibold text-gray-900">
            {booking.startTime ? new Date(booking.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-red-600" />
            <span className="text-sm text-gray-600">Giờ kết thúc</span>
          </div>
          <div className="font-semibold text-gray-900">
            {booking.endTime ? new Date(booking.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
          </div>
        </div>
      </div>

      {/* Location */}
      {booking.pickupLocation && (
        <div className="bg-sky-50 rounded-xl p-3 mb-6 flex items-start gap-3">
          <MapPin className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-medium text-sky-900">Điểm đón</div>
            <div className="text-sm text-sky-700">{booking.pickupLocation}</div>
          </div>
        </div>
      )}

      {/* QR Code */}
      <div className="bg-gradient-to-br from-sky-50 to-cyan-50 rounded-2xl p-6 mb-6">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4">
            Quét mã QR này tại xe để check-in/check-out
          </p>
          {qrCodeUrl ? (
            <img
              src={qrCodeUrl}
              alt="Booking QR Code"
              className="mx-auto rounded-xl shadow-lg"
            />
          ) : (
            <div className="w-[300px] h-[300px] mx-auto bg-gray-200 rounded-xl flex items-center justify-center">
              <span className="text-gray-500">Đang tạo mã QR...</span>
            </div>
          )}
          <p className="text-xs text-gray-500 mt-4">
            Booking ID: {booking.id}
          </p>
        </div>
      </div>

      {/* Check-in/Check-out Times */}
      {(booking.checkInTime || booking.checkOutTime) && (
        <div className="border-t-2 border-gray-200 pt-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            {booking.checkInTime && (
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">Check-in</div>
                <div className="font-semibold text-green-600">
                  {new Date(booking.checkInTime).toLocaleString('vi-VN')}
                </div>
              </div>
            )}
            {booking.checkOutTime && (
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">Check-out</div>
                <div className="font-semibold text-red-600">
                  {new Date(booking.checkOutTime).toLocaleString('vi-VN')}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        {canCheckIn && (
          <button
            onClick={handleCheckIn}
            disabled={loading}
            className="flex-1 py-3 px-6 rounded-xl bg-green-500 text-white font-semibold hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <LoadingSkeleton.Skeleton variant="circular" className="w-5 h-5" />
                Đang xử lý...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Check-in
              </>
            )}
          </button>
        )}

        {canCheckOut && (
          <button
            onClick={handleCheckOut}
            disabled={loading}
            className="flex-1 py-3 px-6 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <LoadingSkeleton.Skeleton variant="circular" className="w-5 h-5" />
                Đang xử lý...
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5" />
                Check-out
              </>
            )}
          </button>
        )}

        {!canCheckIn && !canCheckOut && booking.status !== 'completed' && booking.status !== 'cancelled' && (
          <div className="flex-1 text-center py-3 text-gray-500">
            {booking.status === 'pending' && 'Chờ xác nhận để check-in'}
            {booking.status === 'in_progress' && !booking.checkInTime && 'Vui lòng check-in trước'}
          </div>
        )}
      </div>
    </motion.div>
  );
}
