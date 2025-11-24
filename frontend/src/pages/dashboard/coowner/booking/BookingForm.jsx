import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Car, MapPin, Users, FileText, Zap, Battery, CheckCircle, Loader2 } from 'lucide-react';
import Header from '../../../../components/layout/Header';
import Footer from '../../../../components/layout/Footer';
import { useBookingStore, useVehicleStore, useAuthStore } from '../../../../store';
import { showToast } from '../../../../utils/toast';

export default function BookingForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    vehicleId: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    purpose: '',
    destination: '',
    estimatedDistance: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { createBooking } = useBookingStore();
  const { vehicles, loading, fetchVehicles } = useVehicleStore();
  const { activeGroup, fetchActiveGroup } = useAuthStore();
  const startDateRef = useRef(null);
  const endDateRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      await Promise.all([
        fetchVehicles(),
        !activeGroup && fetchActiveGroup() // Fetch if not already loaded
      ]);
      
      // Get vehicleId from URL query params if present
      const params = new URLSearchParams(window.location.search);
      const vehicleId = params.get('vehicleId');
      if (vehicleId) {
        setFormData(prev => ({ ...prev, vehicleId }));
      }
    };
    
    init();
  }, [fetchVehicles, activeGroup, fetchActiveGroup]);

  const purposes = [
    { value: 'business', label: 'Công việc', icon: FileText },
    { value: 'personal', label: 'Cá nhân', icon: Users },
    { value: 'family', label: 'Gia đình', icon: Users },
    { value: 'travel', label: 'Du lịch', icon: MapPin }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // Validate activeGroup
      if (!activeGroup || !activeGroup.id) {
        throw new Error('Bạn chưa thuộc nhóm nào. Vui lòng liên hệ quản trị viên để được thêm vào nhóm.');
      }

      // Combine date and time into ISO datetime strings (local timezone)
      const startTimeISO = new Date(`${formData.startDate}T${formData.startTime}`).toISOString();
      const endTimeISO = new Date(`${formData.endDate}T${formData.endTime}`).toISOString();

      const bookingData = {
        vehicleId: formData.vehicleId,
        groupId: activeGroup.id,
        startTime: startTimeISO,
        endTime: endTimeISO,
        purpose: formData.purpose,
        destination: formData.destination || undefined,
        estimatedDistance: formData.estimatedDistance ? parseFloat(formData.estimatedDistance) : undefined,
        notes: formData.notes || undefined
      };

      // Client-side validation to match backend rules and avoid 400 errors
      const clientErrors = validateBookingClientSide(bookingData);
      if (clientErrors.length > 0) {
        const errorMsg = clientErrors.join('; ');
        setError(errorMsg);
        showToast.error(errorMsg);
        setSubmitting(false);
        return;
      }

      // Use toast.promise for better UX
      await showToast.promise(
        createBooking(bookingData),
        {
          pending: 'Đang tạo booking...',
          success: 'Đặt lịch thành công! Đang chuyển trang...',
          error: 'Không thể tạo booking'
        }
      );

      // Only navigate on success
      setTimeout(() => {
        navigate('/dashboard/coowner/booking');
      }, 1000);

    } catch (err) {
      // Surface backend validation errors if present
      const backendErrors = err?.response?.data?.error?.details?.errors;
      let errorMsg = '';
      
      if (Array.isArray(backendErrors) && backendErrors.length > 0) {
        errorMsg = backendErrors.join('; ');
      } else {
        errorMsg = err?.response?.data?.error?.message 
          || err?.response?.data?.message 
          || err.message 
          || 'Không thể tạo booking. Vui lòng thử lại!';
      }
      
      setError(errorMsg);
      showToast.error(errorMsg);
      setSubmitting(false);
    }
  };

  // Client-side validator (keeps same rules as backend)
  function validateBookingClientSide(bookingData) {
    const errors = [];
    const MIN_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours
    const MAX_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
    const SAME_DAY_CUTOFF_HOURS = 2;

    if (!bookingData.vehicleId) errors.push('Vui lòng chọn xe');
    if (!bookingData.groupId) errors.push('Bạn chưa thuộc nhóm nào');
    if (!bookingData.startTime) errors.push('Vui lòng chọn ngày/Giờ bắt đầu');
    if (!bookingData.endTime) errors.push('Vui lòng chọn ngày/Giờ kết thúc');

    if (bookingData.startTime && bookingData.endTime) {
      const start = new Date(bookingData.startTime);
      const end = new Date(bookingData.endTime);
      const now = new Date();

      if (start <= now) errors.push('Thời gian bắt đầu phải nằm trong tương lai');
      if (end <= start) errors.push('Thời gian kết thúc phải sau thời gian bắt đầu');

      const duration = end - start;
      if (duration < MIN_DURATION_MS) errors.push('Thời lượng tối thiểu là 2 giờ');
      if (duration > MAX_DURATION_MS) errors.push('Thời lượng tối đa là 24 giờ');

      // same-day cutoff
      if (start.toDateString() === now.toDateString()) {
        const cutoff = new Date(now.getTime() + SAME_DAY_CUTOFF_HOURS * 60 * 60 * 1000);
        if (start < cutoff) {
          // format cutoff for user's locale so they know the earliest allowed time
          const timeStr = cutoff.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const dateStr = cutoff.toLocaleDateString();
          errors.push(
            `Đặt trong ngày phải trước ít nhất ${SAME_DAY_CUTOFF_HOURS} giờ (thời gian sớm nhất: ${dateStr} ${timeStr})`
          );
        }
      }
    }

    return errors;
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const selectedCar = vehicles?.find(car => car.id === formData.vehicleId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <Header />
      
      <main className="pt-20">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Link
              to="/dashboard/coowner/booking"
              className="inline-flex items-center gap-2 text-sky-600 hover:text-sky-700 mb-6 group transition-colors"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span>Quay lại Lịch đặt xe</span>
            </Link>
            
            <div className="text-center mb-8">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Đặt lịch sử dụng xe
              </h1>
              <p className="text-xl text-gray-600">
                Chọn xe và thời gian phù hợp cho nhu cầu của bạn
              </p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <motion.form
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onSubmit={handleSubmit}
                className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8"
              >
                {/* Car Selection */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <Car className="w-8 h-8 text-sky-600" />
                    Chọn xe
                  </h2>
                  
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
                    </div>
                  ) : vehicles && vehicles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {vehicles
                        .filter(vehicle => vehicle.status === 'available')
                        .map(vehicle => (
                          <motion.div
                            key={vehicle.id}
                            whileHover={{ scale: 1.02 }}
                            onClick={() => handleInputChange('vehicleId', vehicle.id)}
                            className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                              formData.vehicleId === vehicle.id
                                ? 'border-sky-500 bg-sky-50'
                                : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
                          >
                            <div className="flex items-center gap-4 mb-4">
                              <div className="p-3 bg-sky-100 rounded-xl">
                                <Car className="w-6 h-6 text-sky-600" />
                              </div>
                              <div>
                                <h3 className="font-bold text-gray-900 text-lg">{vehicle.vehicleName || vehicle.name}</h3>
                                <p className="text-gray-600">{vehicle.model || vehicle.brand}</p>
                              </div>
                            </div>
                            
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600">Pin:</span>
                                <div className="flex items-center gap-1">
                                  <Battery className="w-4 h-4 text-green-600" />
                                  <span className="font-medium">{vehicle.specifications?.current_battery_percent ?? vehicle.batteryLevel ?? 0}%</span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600">Tầm hoạt động:</span>
                                <span className="font-medium">
                                  {vehicle.specifications?.range_km
                                    ? `${vehicle.specifications.range_km}km`
                                    : vehicle.range || `${(vehicle.specifications?.current_battery_percent ?? vehicle.batteryLevel ?? 0) * 3 || 0}km`}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600">Hiệu suất:</span>
                                <span className="font-medium">{vehicle.specifications?.efficiency ?? 'N/A'}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600">Vị trí:</span>
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4 text-red-500" />
                                  <span className="font-medium">{vehicle.specifications?.location ?? vehicle.currentLocation ?? vehicle.location ?? 'TP.HCM'}</span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      }
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Car className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Không có xe khả dụng</p>
                    </div>
                  )}
                </div>

                {/* Date & Time */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <Calendar className="w-8 h-8 text-sky-600" />
                    Thời gian sử dụng
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ngày bắt đầu
                      </label>
                      <div className="relative">
                        <input
                          ref={startDateRef}
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => handleInputChange('startDate', e.target.value)}
                          className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                          required
                        />
                        <Calendar
                          role="button"
                          tabIndex={0}
                          onClick={() => {
                            if (startDateRef.current) {
                              if (typeof startDateRef.current.showPicker === 'function') startDateRef.current.showPicker();
                              else startDateRef.current.focus();
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              if (startDateRef.current) {
                                if (typeof startDateRef.current.showPicker === 'function') startDateRef.current.showPicker();
                                else startDateRef.current.focus();
                              }
                            }
                          }}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 cursor-pointer"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Giờ bắt đầu
                      </label>
                      <div className="relative">
                        <input
                          type="time"
                          value={formData.startTime}
                          onChange={(e) => handleInputChange('startTime', e.target.value)}
                          className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                          required
                        />
                        <Clock className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ngày kết thúc
                      </label>
                      <div className="relative">
                        <input
                          ref={endDateRef}
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => handleInputChange('endDate', e.target.value)}
                          className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                          required
                        />
                        <Calendar
                          role="button"
                          tabIndex={0}
                          onClick={() => {
                            if (endDateRef.current) {
                              if (typeof endDateRef.current.showPicker === 'function') endDateRef.current.showPicker();
                              else endDateRef.current.focus();
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              if (endDateRef.current) {
                                if (typeof endDateRef.current.showPicker === 'function') endDateRef.current.showPicker();
                                else endDateRef.current.focus();
                              }
                            }
                          }}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 cursor-pointer"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Giờ kết thúc
                      </label>
                      <div className="relative">
                        <input
                          type="time"
                          value={formData.endTime}
                          onChange={(e) => handleInputChange('endTime', e.target.value)}
                          className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                          required
                        />
                        <Clock className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Purpose */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <FileText className="w-8 h-8 text-sky-600" />
                    Mục đích sử dụng
                  </h2>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {purposes.map(purpose => {
                      const IconComponent = purpose.icon;
                      return (
                        <motion.button
                          key={purpose.value}
                          type="button"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleInputChange('purpose', purpose.value)}
                          className={`p-4 rounded-2xl border-2 transition-all ${
                            formData.purpose === purpose.value
                              ? 'border-sky-500 bg-sky-50'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <IconComponent className="w-6 h-6 text-sky-600 mb-2" />
                          <span className="font-medium text-gray-900">{purpose.label}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Additional Info */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Thông tin bổ sung</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ghi chú (tùy chọn)
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        rows={4}
                        className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                        placeholder="Thêm ghi chú cho chuyến đi của bạn..."
                      />
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={submitting || !formData.vehicleId || !formData.startDate || !formData.endDate || !formData.purpose}
                  whileHover={{ scale: submitting ? 1 : 1.02 }}
                  whileTap={{ scale: submitting ? 1 : 0.98 }}
                  className={`w-full py-4 font-bold rounded-2xl shadow-lg transition-all text-lg flex items-center justify-center gap-2 ${
                    submitting || !formData.vehicleId || !formData.startDate || !formData.endDate || !formData.purpose
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white hover:shadow-xl'
                  }`}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Đang xử lý...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Xác nhận đặt lịch</span>
                    </>
                  )}
                </motion.button>
              </motion.form>
            </div>

            {/* Summary */}
            <div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 sticky top-24"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4">Tóm tắt đặt lịch</h3>
                
                {selectedCar ? (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-sky-50 to-cyan-50 rounded-2xl p-4">
                      <h4 className="font-bold text-gray-900 mb-2">{selectedCar.vehicleName || selectedCar.name}</h4>
                      <p className="text-gray-600 text-sm">{selectedCar.model || selectedCar.brand}</p>
                    </div>
                    
                    {formData.startDate && formData.endDate && (
                      <>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Bắt đầu:</span>
                            <span className="font-medium">
                              {formData.startDate} {formData.startTime}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Kết thúc:</span>
                            <span className="font-medium">
                              {formData.endDate} {formData.endTime}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Mục đích:</span>
                            <span className="font-medium capitalize">
                              {purposes.find(p => p.value === formData.purpose)?.label || 'Chưa chọn'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="border-t border-gray-200 pt-4">
                          <p className="text-xs text-gray-500 mb-2">
                            * Chi phí thực tế sẽ được tính dựa trên thời gian sử dụng và quãng đường
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Car className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Chọn xe để xem tóm tắt</p>
                  </div>
                )}
              </motion.div>

              {/* Tips */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-3xl p-6 text-white mt-6"
              >
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Mẹo tiết kiệm
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Đặt lịch trước để có giá tốt</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Chọn giờ không cao điểm</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Sử dụng xe theo nhóm</span>
                  </li>
                </ul>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}