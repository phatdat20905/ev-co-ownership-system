// src/components/vehicle/VehicleStatus.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Battery, Zap, MapPin, Clock, AlertCircle, CheckCircle, Wrench, Car } from 'lucide-react';

export default function VehicleStatus({ vehicle }) {
  const getBatteryColor = (level) => {
    if (level > 60) return 'text-green-500';
    if (level > 30) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getStatusBadge = (status) => {
    const badges = {
      available: {
        label: 'Sẵn sàng',
        color: 'bg-green-100 text-green-700',
        icon: <CheckCircle className="w-4 h-4" />
      },
      in_use: {
        label: 'Đang sử dụng',
        color: 'bg-blue-100 text-blue-700',
        icon: <Car className="w-4 h-4" />
      },
      charging: {
        label: 'Đang sạc',
        color: 'bg-yellow-100 text-yellow-700',
        icon: <Zap className="w-4 h-4" />
      },
      maintenance: {
        label: 'Bảo trì',
        color: 'bg-orange-100 text-orange-700',
        icon: <Wrench className="w-4 h-4" />
      },
      unavailable: {
        label: 'Không khả dụng',
        color: 'bg-gray-100 text-gray-700',
        icon: <AlertCircle className="w-4 h-4" />
      }
    };

    return badges[status] || badges.unavailable;
  };

  const status = getStatusBadge(vehicle.status);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl shadow-lg p-6"
    >
      {/* Vehicle Image */}
      <div className="relative mb-4">
        <img
          src={vehicle.imageUrl || '/placeholder-car.jpg'}
          alt={vehicle.name}
          className="w-full h-48 object-cover rounded-xl"
        />
        <div className={`absolute top-3 right-3 px-3 py-1 rounded-full ${status.color} flex items-center gap-1 text-sm font-medium`}>
          {status.icon}
          {status.label}
        </div>
      </div>

      {/* Vehicle Name */}
      <h3 className="text-2xl font-bold text-gray-900 mb-4">{vehicle.name}</h3>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Battery Level */}
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <Battery className={`w-5 h-5 ${getBatteryColor(vehicle.batteryLevel || 0)}`} />
            <span className="text-sm text-gray-600">Pin</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {vehicle.batteryLevel || 0}%
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className={`h-2 rounded-full transition-all ${
                vehicle.batteryLevel > 60 ? 'bg-green-500' :
                vehicle.batteryLevel > 30 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${vehicle.batteryLevel || 0}%` }}
            />
          </div>
        </div>

        {/* Range */}
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-5 h-5 text-sky-500" />
            <span className="text-sm text-gray-600">Quãng đường</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {vehicle.range || 0}
          </div>
          <div className="text-sm text-gray-500">km</div>
        </div>

        {/* Odometer */}
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-5 h-5 text-purple-500" />
            <span className="text-sm text-gray-600">Tổng KM</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {vehicle.odometer?.toLocaleString() || 0}
          </div>
          <div className="text-sm text-gray-500">km</div>
        </div>

        {/* Last Maintenance */}
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <Wrench className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-gray-600">Bảo trì</span>
          </div>
          <div className="text-sm font-semibold text-gray-900">
            {vehicle.lastMaintenance 
              ? new Date(vehicle.lastMaintenance).toLocaleDateString('vi-VN')
              : 'Chưa có'
            }
          </div>
          <div className="text-xs text-gray-500">
            {vehicle.nextMaintenance
              ? `Tiếp: ${new Date(vehicle.nextMaintenance).toLocaleDateString('vi-VN')}`
              : ''
            }
          </div>
        </div>
      </div>

      {/* Current Location */}
      {vehicle.currentLocation && (
        <div className="bg-sky-50 rounded-xl p-3 flex items-start gap-3">
          <MapPin className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-medium text-sky-900">Vị trí hiện tại</div>
            <div className="text-sm text-sky-700">{vehicle.currentLocation}</div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button className="py-2 px-4 rounded-lg bg-sky-500 text-white font-medium hover:bg-sky-600 transition-colors text-sm">
          Đặt lịch
        </button>
        <button className="py-2 px-4 rounded-lg border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors text-sm">
          Chi tiết
        </button>
      </div>
    </motion.div>
  );
}
