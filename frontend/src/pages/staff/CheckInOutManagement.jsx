// src/pages/staff/CheckInOutManagement.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Camera, Upload, FileText, AlertCircle, CheckCircle, Image as ImageIcon, Clipboard } from 'lucide-react';
import { showSuccessToast, showErrorToast } from '../../utils/toast';
import checkInOutService from '../../services/checkinoutService';
import bookingService from '../../services/bookingService';
import Html5QrcodePlugin from '../../components/Html5QrcodePlugin';

export default function CheckInOutManagement() {
  const [activeTab, setActiveTab] = useState('check-in');
  const [bookingId, setBookingId] = useState('');
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showQrScanner, setShowQrScanner] = useState(false);
  
  // Check-in/out form data
  const [formData, setFormData] = useState({
    odometerReading: '',
    fuelLevel: '',
    notes: '',
    images: [],
    damages: []
  });

  const [imagePreviews, setImagePreviews] = useState([]);

  const handleQrScan = async (decodedText) => {
    try {
      setLoading(true);
      setShowQrScanner(false);
      
      // Verify QR code and get booking info
      const response = await checkInOutService.verifyQRCode(decodedText);
      
      if (response.success) {
        setBookingId(response.data.bookingId);
        await loadBookingDetails(response.data.bookingId);
        showSuccessToast('Quét mã QR thành công');
      }
    } catch (error) {
      showErrorToast('Mã QR không hợp lệ');
    } finally {
      setLoading(false);
    }
  };

  const loadBookingDetails = async (id) => {
    try {
      setLoading(true);
      const response = await bookingService.getBooking(id);
      
      if (response.success) {
        setBooking(response.data);
      }
    } catch (error) {
      showErrorToast('Không thể tải thông tin đặt xe');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));

    // Create previews
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const addDamage = () => {
    setFormData(prev => ({
      ...prev,
      damages: [...prev.damages, { description: '', severity: 'minor', location: '' }]
    }));
  };

  const updateDamage = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      damages: prev.damages.map((d, i) => i === index ? { ...d, [field]: value } : d)
    }));
  };

  const removeDamage = (index) => {
    setFormData(prev => ({
      ...prev,
      damages: prev.damages.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!bookingId) {
      showErrorToast('Vui lòng nhập mã đặt xe');
      return;
    }

    try {
      setLoading(true);
      
      let response;
      if (activeTab === 'check-in') {
        response = await checkInOutService.checkIn(bookingId, formData);
      } else {
        response = await checkInOutService.checkOut(bookingId, formData);
      }

      if (response.success) {
        showSuccessToast(`${activeTab === 'check-in' ? 'Nhận' : 'Trả'} xe thành công`);
        // Reset form
        setFormData({
          odometerReading: '',
          fuelLevel: '',
          notes: '',
          images: [],
          damages: []
        });
        setImagePreviews([]);
        setBooking(null);
        setBookingId('');
      }
    } catch (error) {
      showErrorToast(`Không thể ${activeTab === 'check-in' ? 'nhận' : 'trả'} xe`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý nhận/trả xe</h1>
          <p className="text-gray-600">Thực hiện check-in và check-out cho các chuyến đi</p>
        </div>

        {/* Tab Selector */}
        <div className="bg-white rounded-2xl shadow-lg p-2 mb-6 inline-flex">
          <button
            onClick={() => setActiveTab('check-in')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'check-in'
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <CheckCircle className="w-5 h-5 inline mr-2" />
            Nhận xe (Check-in)
          </button>
          <button
            onClick={() => setActiveTab('check-out')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'check-out'
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Clipboard className="w-5 h-5 inline mr-2" />
            Trả xe (Check-out)
          </button>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Booking ID Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Mã đặt xe
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={bookingId}
                  onChange={(e) => setBookingId(e.target.value)}
                  onBlur={() => bookingId && loadBookingDetails(bookingId)}
                  placeholder="Nhập mã đặt xe hoặc quét QR"
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowQrScanner(true)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <QrCode className="w-5 h-5" />
                  Quét QR
                </button>
              </div>
            </div>

            {/* Booking Info Display */}
            {booking && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Khách hàng</p>
                    <p className="font-semibold text-gray-900">{booking.customerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Xe</p>
                    <p className="font-semibold text-gray-900">{booking.vehicleName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Thời gian</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(booking.startTime).toLocaleString('vi-VN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Trạng thái</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      booking.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Vehicle Condition */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Số km hiện tại
                </label>
                <input
                  type="number"
                  value={formData.odometerReading}
                  onChange={(e) => setFormData({ ...formData, odometerReading: e.target.value })}
                  placeholder="Nhập số km..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Mức pin (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.fuelLevel}
                  onChange={(e) => setFormData({ ...formData, fuelLevel: e.target.value })}
                  placeholder="Nhập mức pin..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  required
                />
              </div>
            </div>

            {/* Images Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Hình ảnh xe
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <ImageIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-600 mb-1">Nhấn để tải ảnh lên</p>
                  <p className="text-sm text-gray-500">PNG, JPG tối đa 10MB</p>
                </label>
              </div>

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-4 gap-4 mt-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Damages (Check-out only) */}
            {activeTab === 'check-out' && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Báo cáo hư hỏng (nếu có)
                  </label>
                  <button
                    type="button"
                    onClick={addDamage}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    + Thêm hư hỏng
                  </button>
                </div>

                {formData.damages.map((damage, index) => (
                  <div key={index} className="p-4 border-2 border-gray-200 rounded-xl mb-3">
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <input
                        type="text"
                        value={damage.location}
                        onChange={(e) => updateDamage(index, 'location', e.target.value)}
                        placeholder="Vị trí (VD: Cửa trước bên trái)"
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <select
                        value={damage.severity}
                        onChange={(e) => updateDamage(index, 'severity', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="minor">Nhỏ</option>
                        <option value="moderate">Trung bình</option>
                        <option value="severe">Nghiêm trọng</option>
                      </select>
                    </div>
                    <textarea
                      value={damage.description}
                      onChange={(e) => updateDamage(index, 'description', e.target.value)}
                      placeholder="Mô tả chi tiết..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
                      rows="2"
                    />
                    <button
                      type="button"
                      onClick={() => removeDamage(index)}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Xóa
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Ghi chú
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Nhập ghi chú thêm..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                rows="4"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all ${
                activeTab === 'check-in'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                  : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Đang xử lý...' : activeTab === 'check-in' ? 'Xác nhận nhận xe' : 'Xác nhận trả xe'}
            </button>
          </form>
        </div>
      </div>

      {/* QR Scanner Modal */}
      {showQrScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Quét mã QR</h3>
              <button
                onClick={() => setShowQrScanner(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <Html5QrcodePlugin
              fps={10}
              qrbox={250}
              disableFlip={false}
              qrCodeSuccessCallback={handleQrScan}
            />
          </div>
        </div>
      )}
    </div>
  );
}
