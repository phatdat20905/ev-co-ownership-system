// src/pages/dashboard/coowner/vehicles/VehicleDashboard.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Car, Plus } from 'lucide-react';
import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';
import VehicleStatus from '../../../components/vehicle/VehicleStatus';
import vehicleService from '../../../services/vehicle.service';
import { useVehicleStore } from '../../../stores/useVehicleStore';
import { showErrorToast } from '../../../utils/toast';

export default function VehicleDashboard() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { vehicles: storeVehicles, setVehicles: setStoreVehicles } = useVehicleStore();

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        const response = await vehicleService.getVehicles();
        
        // Transform API data to match component format
        const transformedVehicles = response.vehicles?.map(vehicle => ({
          id: vehicle.id,
          name: vehicle.name || vehicle.model,
          status: vehicle.status || 'available',
          batteryLevel: vehicle.batteryLevel || 0,
          range: vehicle.range || 0,
          odometer: vehicle.odometer || 0,
          currentLocation: vehicle.location || 'TP.HCM',
          imageUrl: vehicle.imageUrl || 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=500',
          lastMaintenance: vehicle.lastMaintenance || new Date().toISOString().split('T')[0],
          nextMaintenance: vehicle.nextMaintenance || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        })) || [];

        setVehicles(transformedVehicles);
        setStoreVehicles(transformedVehicles);
      } catch (error) {
        console.error('Error fetching vehicles:', error);
        showErrorToast(error.response?.data?.message || 'Không thể tải danh sách xe');
        setVehicles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [setStoreVehicles]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-cyan-50 flex flex-col">
        <Header />
        <main className="flex-grow pt-24 pb-12">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="animate-pulse space-y-6">
              <div className="h-12 bg-gray-200 rounded w-1/3"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-96 bg-gray-200 rounded-2xl"></div>
                ))}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-cyan-50 flex flex-col">
      <Header />
      
      <main className="flex-grow pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link
                    to="/coowner"
                className="p-2 rounded-lg hover:bg-white/80 transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Quản lý xe</h1>
                <p className="text-gray-600 mt-1">{vehicles.length} xe trong hệ thống</p>
              </div>
            </div>

            <button className="flex items-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-semibold hover:from-sky-600 hover:to-cyan-600 transition-all">
              <Plus className="w-5 h-5" />
              Thêm xe mới
            </button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Car className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Sẵn sàng</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {vehicles.filter(v => v.status === 'available').length}
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Car className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Đang dùng</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {vehicles.filter(v => v.status === 'in_use').length}
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Car className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Đang sạc</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {vehicles.filter(v => v.status === 'charging').length}
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Car className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Bảo trì</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {vehicles.filter(v => v.status === 'maintenance').length}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Vehicles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle, index) => (
              <motion.div
                key={vehicle.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <VehicleStatus vehicle={vehicle} />
              </motion.div>
            ))}
          </div>

          {/* Empty State */}
          {vehicles.length === 0 && (
            <div className="text-center py-16">
              <Car className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Chưa có xe nào
              </h3>
              <p className="text-gray-600 mb-6">
                Thêm xe đầu tiên để bắt đầu quản lý
              </p>
              <button className="py-3 px-6 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-semibold hover:from-sky-600 hover:to-cyan-600 transition-all">
                Thêm xe mới
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
