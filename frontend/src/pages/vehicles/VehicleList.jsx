// src/pages/vehicles/VehicleList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Car, 
  Battery, 
  MapPin, 
  Search, 
  Filter,
  Zap,
  Users,
  Calendar,
  TrendingUp,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import VehicleStatus from '../../components/vehicle/VehicleStatus';
import vehicleService from '../../services/vehicle.service';
import LoadingSkeleton from '../../components/LoadingSkeleton';

export default function VehicleList() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchVehicles();
  }, [filter]);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (filter !== 'all') {
        params.status = filter;
      }

      const response = await vehicleService.getVehicles(params);
      setVehicles(response.data || []);
    } catch (err) {
      console.error('Failed to fetch vehicles:', err);
      setError(err.message || 'Không thể tải danh sách xe');
    } finally {
      setLoading(false);
    }
  };

  const getBatteryColor = (batteryLevel) => {
    if (batteryLevel >= 70) return 'text-green-600';
    if (batteryLevel >= 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBadge = (status) => {
    const badges = {
      available: {
        label: 'Có sẵn',
        color: 'bg-green-100 text-green-700 border-green-200'
      },
      in_use: {
        label: 'Đang sử dụng',
        color: 'bg-blue-100 text-blue-700 border-blue-200'
      },
      charging: {
        label: 'Đang sạc',
        color: 'bg-yellow-100 text-yellow-700 border-yellow-200'
      },
      maintenance: {
        label: 'Bảo trì',
        color: 'bg-orange-100 text-orange-700 border-orange-200'
      },
      unavailable: {
        label: 'Không khả dụng',
        color: 'bg-gray-100 text-gray-700 border-gray-200'
      }
    };
    return badges[status] || badges.available;
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    if (!searchTerm) return true;
    
    const search = searchTerm.toLowerCase();
    return (
      vehicle.name?.toLowerCase().includes(search) ||
      vehicle.model?.toLowerCase().includes(search) ||
      vehicle.licensePlate?.toLowerCase().includes(search)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
        <Header />
        <main className="pt-20 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <LoadingSkeleton.CardSkeleton count={6} />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <Header />
      
      <main className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Xe đồng sở hữu
            </h1>
            <p className="text-xl text-gray-600">
              Quản lý và theo dõi tình trạng các xe trong nhóm
            </p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-sky-100 rounded-xl">
                  <Car className="w-6 h-6 text-sky-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {vehicles.length}
                  </p>
                  <p className="text-sm text-gray-600">Tổng số xe</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-xl">
                  <Battery className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {vehicles.filter(v => v.status === 'available').length}
                  </p>
                  <p className="text-sm text-gray-600">Có sẵn</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {vehicles.filter(v => v.status === 'charging').length}
                  </p>
                  <p className="text-sm text-gray-600">Đang sạc</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-xl">
                  <AlertCircle className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {vehicles.filter(v => v.status === 'maintenance').length}
                  </p>
                  <p className="text-sm text-gray-600">Bảo trì</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 mb-8"
          >
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm theo tên, model, biển số..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>

              {/* Status Filters */}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-3 rounded-xl font-medium transition-colors ${
                    filter === 'all'
                      ? 'bg-sky-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Tất cả
                </button>
                <button
                  onClick={() => setFilter('available')}
                  className={`px-4 py-3 rounded-xl font-medium transition-colors ${
                    filter === 'available'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Có sẵn
                </button>
                <button
                  onClick={() => setFilter('charging')}
                  className={`px-4 py-3 rounded-xl font-medium transition-colors ${
                    filter === 'charging'
                      ? 'bg-yellow-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Đang sạc
                </button>
                <button
                  onClick={() => setFilter('maintenance')}
                  className={`px-4 py-3 rounded-xl font-medium transition-colors ${
                    filter === 'maintenance'
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Bảo trì
                </button>
              </div>
            </div>
          </motion.div>

          {/* Error State */}
          {error && (
            <div className="mb-8 bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 mb-1">Lỗi</h3>
                <p className="text-red-700">{error}</p>
                <button
                  onClick={fetchVehicles}
                  className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Thử lại
                </button>
              </div>
            </div>
          )}

          {/* Vehicles Grid */}
          <AnimatePresence mode="popLayout">
            {filteredVehicles.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-16"
              >
                <Car className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 text-lg">
                  {searchTerm ? 'Không tìm thấy xe phù hợp' : 'Chưa có xe nào'}
                </p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {filteredVehicles.map((vehicle, index) => (
                  <motion.div
                    key={vehicle.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <VehicleStatus 
                      vehicle={vehicle}
                      onRefresh={fetchVehicles}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
}
