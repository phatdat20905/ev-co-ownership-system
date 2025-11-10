// src/pages/vehicles/VehicleDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Battery,
  MapPin,
  Clock,
  Wrench,
  Zap,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Car,
  Navigation,
  Activity,
  Gauge,
  Thermometer
} from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import vehicleService from '../../services/vehicle.service';
import { showErrorToast, showSuccessToast } from '../../utils/toast';

export default function VehicleDetails() {
  const { vehicleId } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchVehicleDetails();
    
    // Poll for real-time updates every 30 seconds
    const interval = setInterval(fetchVehicleDetails, 30000);
    return () => clearInterval(interval);
  }, [vehicleId]);

  const fetchVehicleDetails = async () => {
    try {
      setError(null);
      const response = await vehicleService.getVehicle(vehicleId);
      setVehicle(response.data);
    } catch (err) {
      console.error('Failed to fetch vehicle:', err);
      setError(err.message || 'Không thể tải thông tin xe');
    } finally {
      setLoading(false);
    }
  };

  const getBatteryColor = (level) => {
    if (level >= 70) return 'text-green-600';
    if (level >= 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBadge = (status) => {
    const badges = {
      available: {
        label: 'Sẵn sàng',
        color: 'bg-green-100 text-green-700 border-green-200',
        icon: <CheckCircle className="w-5 h-5" />
      },
      in_use: {
        label: 'Đang sử dụng',
        color: 'bg-blue-100 text-blue-700 border-blue-200',
        icon: <Car className="w-5 h-5" />
      },
      charging: {
        label: 'Đang sạc',
        color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        icon: <Zap className="w-5 h-5" />
      },
      maintenance: {
        label: 'Bảo trì',
        color: 'bg-orange-100 text-orange-700 border-orange-200',
        icon: <Wrench className="w-5 h-5" />
      },
      unavailable: {
        label: 'Không khả dụng',
        color: 'bg-gray-100 text-gray-700 border-gray-200',
        icon: <AlertCircle className="w-5 h-5" />
      }
    };
    return badges[status] || badges.unavailable;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
        <Header />
        <main className="pt-20 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="h-64 bg-gray-200 rounded-xl"></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
        <Header />
        <main className="pt-20 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-red-50 border border-red-200 rounded-xl p-8 flex items-start gap-4">
              <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold text-red-900 mb-2">Lỗi</h3>
                <p className="text-red-700">{error || 'Không tìm thấy xe'}</p>
                <button
                  onClick={() => navigate('/vehicles')}
                  className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Quay lại danh sách
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const status = getStatusBadge(vehicle.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <Header />
      
      <main className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <Link
            to="/vehicles"
            className="inline-flex items-center gap-2 text-sky-600 hover:text-sky-700 mb-6 group transition-colors"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Quay lại danh sách xe</span>
          </Link>

          {/* Vehicle Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8 mb-8"
          >
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Vehicle Image */}
              <div className="lg:w-1/3">
                <div className="relative">
                  <img
                    src={vehicle.imageUrl || '/placeholder-car.jpg'}
                    alt={vehicle.name}
                    className="w-full h-64 object-cover rounded-2xl"
                  />
                  <div className={`absolute top-4 right-4 px-4 py-2 rounded-full ${status.color} border-2 flex items-center gap-2 font-semibold backdrop-blur-sm`}>
                    {status.icon}
                    {status.label}
                  </div>
                </div>
              </div>

              {/* Vehicle Info */}
              <div className="lg:w-2/3">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                      {vehicle.name}
                    </h1>
                    <p className="text-xl text-gray-600">{vehicle.model}</p>
                    {vehicle.licensePlate && (
                      <p className="text-lg text-gray-500 mt-1">
                        Biển số: <span className="font-semibold">{vehicle.licensePlate}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Battery className={`w-5 h-5 ${getBatteryColor(vehicle.batteryLevel || 0)}`} />
                      <span className="text-sm text-gray-600">Pin</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">
                      {vehicle.batteryLevel || 0}%
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Navigation className="w-5 h-5 text-sky-500" />
                      <span className="text-sm text-gray-600">Tầm xa</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">
                      {vehicle.range || 0}<span className="text-lg">km</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Gauge className="w-5 h-5 text-purple-500" />
                      <span className="text-sm text-gray-600">Tổng KM</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {vehicle.odometer?.toLocaleString() || 0}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Thermometer className="w-5 h-5 text-red-500" />
                      <span className="text-sm text-gray-600">Nhiệt độ</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">
                      {vehicle.temperature || 25}°C
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => navigate(`/dashboard/coowner/booking/new?vehicleId=${vehicle.id}`)}
                    className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-semibold hover:shadow-lg transition-all"
                  >
                    Đặt lịch
                  </button>
                  <button
                    onClick={fetchVehicleDetails}
                    className="py-3 px-6 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Làm mới
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex gap-8 px-8 pt-6">
                {[
                  { id: 'overview', label: 'Tổng quan', icon: <Activity className="w-5 h-5" /> },
                  { id: 'location', label: 'Vị trí', icon: <MapPin className="w-5 h-5" /> },
                  { id: 'maintenance', label: 'Bảo trì', icon: <Wrench className="w-5 h-5" /> },
                  { id: 'history', label: 'Lịch sử', icon: <Clock className="w-5 h-5" /> }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 pb-4 border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-sky-500 text-sky-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.icon}
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-8">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  {/* Battery Details */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Battery className="w-6 h-6 text-green-600" />
                      Pin và Năng lượng
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Mức pin</p>
                        <div className="flex items-end gap-2">
                          <p className="text-3xl font-bold text-gray-900">{vehicle.batteryLevel || 0}%</p>
                          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                            <div
                              className={`h-3 rounded-full transition-all ${
                                vehicle.batteryLevel >= 70 ? 'bg-green-500' :
                                vehicle.batteryLevel >= 30 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${vehicle.batteryLevel || 0}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Quãng đường còn lại</p>
                        <p className="text-3xl font-bold text-gray-900">{vehicle.range || 0} km</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Trạng thái sạc</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {vehicle.status === 'charging' ? 'Đang sạc' : 'Không sạc'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Specifications */}
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Car className="w-6 h-6 text-sky-600" />
                      Thông số kỹ thuật
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Hãng</p>
                        <p className="font-semibold text-gray-900">{vehicle.manufacturer || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Dòng xe</p>
                        <p className="font-semibold text-gray-900">{vehicle.model || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Năm sản xuất</p>
                        <p className="font-semibold text-gray-900">{vehicle.year || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Màu sắc</p>
                        <p className="font-semibold text-gray-900">{vehicle.color || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Dung lượng pin</p>
                        <p className="font-semibold text-gray-900">{vehicle.batteryCapacity || 0} kWh</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Số chỗ ngồi</p>
                        <p className="font-semibold text-gray-900">{vehicle.seats || 5}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Loại động cơ</p>
                        <p className="font-semibold text-gray-900">{vehicle.motorType || 'Electric'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Công suất</p>
                        <p className="font-semibold text-gray-900">{vehicle.power || 0} HP</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Location Tab */}
              {activeTab === 'location' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="bg-sky-50 rounded-2xl p-6 mb-6">
                    <div className="flex items-start gap-4">
                      <MapPin className="w-8 h-8 text-sky-600 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Vị trí hiện tại</h3>
                        <p className="text-gray-700 text-lg">{vehicle.currentLocation || 'Không xác định'}</p>
                        {vehicle.gpsCoordinates && (
                          <p className="text-sm text-gray-500 mt-1">
                            GPS: {vehicle.gpsCoordinates.lat}, {vehicle.gpsCoordinates.lng}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Map Placeholder */}
                  <div className="bg-gray-200 rounded-2xl h-96 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">Bản đồ GPS sẽ hiển thị ở đây</p>
                      <p className="text-gray-400 text-sm mt-2">Tích hợp Google Maps hoặc OpenStreetMap</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Maintenance Tab */}
              {activeTab === 'maintenance' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-orange-50 rounded-2xl p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Wrench className="w-6 h-6 text-orange-600" />
                        Bảo trì lần cuối
                      </h3>
                      <p className="text-2xl font-bold text-gray-900 mb-2">
                        {vehicle.lastMaintenance 
                          ? new Date(vehicle.lastMaintenance).toLocaleDateString('vi-VN')
                          : 'Chưa có dữ liệu'}
                      </p>
                      <p className="text-gray-600">
                        {vehicle.lastMaintenanceType || 'Bảo dưỡng định kỳ'}
                      </p>
                    </div>

                    <div className="bg-blue-50 rounded-2xl p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Calendar className="w-6 h-6 text-blue-600" />
                        Bảo trì tiếp theo
                      </h3>
                      <p className="text-2xl font-bold text-gray-900 mb-2">
                        {vehicle.nextMaintenance
                          ? new Date(vehicle.nextMaintenance).toLocaleDateString('vi-VN')
                          : 'Chưa lên lịch'}
                      </p>
                      <p className="text-gray-600">
                        {vehicle.maintenanceInterval 
                          ? `Sau ${vehicle.maintenanceInterval} km`
                          : 'Theo định kỳ'}
                      </p>
                    </div>
                  </div>

                  {/* Maintenance History */}
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Lịch sử bảo trì</h3>
                    <div className="space-y-4">
                      {vehicle.maintenanceHistory && vehicle.maintenanceHistory.length > 0 ? (
                        vehicle.maintenanceHistory.map((record, index) => (
                          <div key={index} className="bg-white rounded-xl p-4 border border-gray-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold text-gray-900">{record.type}</p>
                                <p className="text-sm text-gray-600">{record.description}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-gray-900">
                                  {new Date(record.date).toLocaleDateString('vi-VN')}
                                </p>
                                <p className="text-sm text-gray-600">{record.cost?.toLocaleString()} VNĐ</p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-gray-500 py-8">Chưa có lịch sử bảo trì</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* History Tab */}
              {activeTab === 'history' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Clock className="w-6 h-6 text-purple-600" />
                      Lịch sử sử dụng
                    </h3>
                    <div className="space-y-4">
                      {vehicle.usageHistory && vehicle.usageHistory.length > 0 ? (
                        vehicle.usageHistory.map((record, index) => (
                          <div key={index} className="bg-white rounded-xl p-4 border border-gray-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold text-gray-900">{record.userName}</p>
                                <p className="text-sm text-gray-600">
                                  {new Date(record.startTime).toLocaleString('vi-VN')} - 
                                  {new Date(record.endTime).toLocaleString('vi-VN')}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                  Quãng đường: {record.distance} km
                                </p>
                              </div>
                              <div className="text-right">
                                <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                                  Hoàn thành
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-gray-500 py-8">Chưa có lịch sử sử dụng</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
