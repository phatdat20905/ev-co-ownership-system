import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Car, MapPin, Users, FileText, Zap, Battery, CheckCircle } from 'lucide-react';
import Header from '../../../../components/layout/Header';
import Footer from '../../../../components/layout/Footer';

export default function BookingForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    car: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    purpose: '',
    passengers: 1,
    notes: ''
  });

  const cars = [
    {
      id: 1,
      name: 'Tesla Model 3',
      model: '2023 Long Range',
      battery: 85,
      range: '420 km',
      location: 'Q.1, TP.HCM',
      image: '/api/placeholder/300/200',
      efficiency: '6.2 km/kWh'
    },
    {
      id: 2,
      name: 'VinFast VF e34',
      model: '2023 Premium',
      battery: 90,
      range: '320 km',
      location: 'Q.7, TP.HCM',
      image: '/api/placeholder/300/200',
      efficiency: '5.8 km/kWh'
    }
  ];

  const purposes = [
    { value: 'business', label: 'Công việc', icon: FileText },
    { value: 'personal', label: 'Cá nhân', icon: Users },
    { value: 'family', label: 'Gia đình', icon: Users },
    { value: 'travel', label: 'Du lịch', icon: MapPin }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    // Xử lý đặt lịch
    setTimeout(() => {
      navigate('/dashboard/coowner/booking');
    }, 1500);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const selectedCar = cars.find(car => car.id === parseInt(formData.car));

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
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {cars.map(car => (
                      <motion.div
                        key={car.id}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => handleInputChange('car', car.id)}
                        className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                          formData.car === car.id.toString()
                            ? 'border-sky-500 bg-sky-50'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-4 mb-4">
                          <div className="p-3 bg-sky-100 rounded-xl">
                            <Car className="w-6 h-6 text-sky-600" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">{car.name}</h3>
                            <p className="text-gray-600">{car.model}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Pin:</span>
                            <div className="flex items-center gap-1">
                              <Battery className="w-4 h-4 text-green-600" />
                              <span className="font-medium">{car.battery}%</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Tầm hoạt động:</span>
                            <span className="font-medium">{car.range}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Hiệu suất:</span>
                            <span className="font-medium">{car.efficiency}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Vị trí:</span>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4 text-red-500" />
                              <span className="font-medium">{car.location}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
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
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => handleInputChange('startDate', e.target.value)}
                          className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                          required
                        />
                        <Calendar className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
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
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => handleInputChange('endDate', e.target.value)}
                          className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                          required
                        />
                        <Calendar className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
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
                        Số hành khách
                      </label>
                      <select
                        value={formData.passengers}
                        onChange={(e) => handleInputChange('passengers', e.target.value)}
                        className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                      >
                        {[1, 2, 3, 4, 5].map(num => (
                          <option key={num} value={num}>{num} người</option>
                        ))}
                      </select>
                    </div>
                    
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

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all text-lg"
                >
                  Xác nhận đặt lịch
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
                      <h4 className="font-bold text-gray-900 mb-2">{selectedCar.name}</h4>
                      <p className="text-gray-600 text-sm">{selectedCar.model}</p>
                    </div>
                    
                    {formData.startDate && formData.endDate && (
                      <>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Thời gian:</span>
                            <span className="font-medium">
                              {formData.startDate} {formData.startTime} - {formData.endDate} {formData.endTime}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Mục đích:</span>
                            <span className="font-medium capitalize">
                              {formData.purpose || 'Chưa chọn'}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Hành khách:</span>
                            <span className="font-medium">{formData.passengers} người</span>
                          </div>
                        </div>
                        
                        <div className="border-t border-gray-200 pt-4">
                          <div className="flex justify-between items-center font-bold text-lg">
                            <span>Tổng chi phí ước tính:</span>
                            <span className="text-sky-600">450,000 VNĐ</span>
                          </div>
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