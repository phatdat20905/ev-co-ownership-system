import axios from './axios';
import { getErrorMessage } from '../utils/toast';
import { useAuthStore } from '../store';

// Simple in-memory cache với TTL 5 phút
const cache = {
  revenue: new Map(),
  coOwners: new Map(),
  TTL: 5 * 60 * 1000, // 5 minutes
  
  get(type, key) {
    const cached = this[type].get(key);
    if (!cached) return null;
    
    const isExpired = Date.now() - cached.timestamp > this.TTL;
    if (isExpired) {
      this[type].delete(key);
      return null;
    }
    
    return cached.value;
  },
  
  set(type, key, value) {
    this[type].set(key, { value, timestamp: Date.now() });
  }
};

export const vehicleAPI = {
  // Lấy revenue của vehicle từ booking-service (user-scoped)
  // This function DOES NOT call the admin endpoint to avoid 403s for non-admin users.
  getVehicleRevenue: async (vehicleId) => {
    // Check cache first
    const cached = cache.get('revenue', vehicleId);
    if (cached !== null) {
      return { success: true, data: cached, count: 0, cached: true };
    }

    try {
      // Call new aggregate endpoint - safe for all users
      const response = await axios.get(`/bookings/revenue/vehicle/${vehicleId}`);

      if (response.data.success && response.data.data) {
        const totalRevenue = response.data.data.totalRevenue || 0;
        const count = response.data.data.totalBookings || 0;

        cache.set('revenue', vehicleId, totalRevenue);
        return {
          success: true,
          data: totalRevenue,
          count: count
        };
      }

      return { success: true, data: 0, count: 0 };
    } catch (error) {
      console.warn('Cannot fetch vehicle revenue:', error.message);
      return { success: false, data: 0, count: 0 };
    }
  },

  // Lấy số lượng co-owners từ group
  getVehicleCoOwners: async (groupId) => {
    // Check cache first
    const cached = cache.get('coOwners', groupId);
    if (cached !== null) {
      return { success: true, data: cached, members: [], cached: true };
    }
    
    try {
      const response = await axios.get(`/user/groups/${groupId}/members`);

      // The user-service sometimes returns the members array directly in `data`
      // or inside `data.members`. Handle both shapes robustly.
      let members = [];
      if (response.data && response.data.success) {
        const d = response.data.data;
        if (Array.isArray(d)) {
          members = d;
        } else if (d && Array.isArray(d.members)) {
          members = d.members;
        } else if (d && Array.isArray(d.data)) {
          // Defensive: some endpoints nest data.data
          members = d.data;
        }
      }

      const count = members.length;
      cache.set('coOwners', groupId, count);
      return { success: true, data: count, members };
    } catch (error) {
      console.warn('Cannot fetch co-owners:', error.message);
      return { success: false, data: 0, members: [] };
    }
  },

  // Clear cache (gọi khi logout hoặc cần refresh)
  clearStatsCache: () => {
    cache.revenue.clear();
    cache.coOwners.clear();
  },
  // Lấy danh sách xe
  getVehicles: async (params = {}) => {
    try {
      const response = await axios.get('/vehicles', { params });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: getErrorMessage(error),
        data: null
      };
    }
  },

  // Lấy xe theo groupId
  getVehiclesByGroupId: async (groupId) => {
    try {
      const response = await axios.get('/vehicles', { params: { groupId } });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: getErrorMessage(error),
        data: null
      };
    }
  },

  // Lấy xe theo ID
  getVehicleById: async (vehicleId) => {
    try {
      const response = await axios.get(`/vehicles/${vehicleId}`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: getErrorMessage(error),
        data: null
      };
    }
  },

  // Tạo xe mới (admin/staff)
  createVehicle: async (data) => {
    try {
      const response = await axios.post('/vehicles', data);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Tạo xe thành công'
      };
    } catch (error) {
      return {
        success: false,
        message: getErrorMessage(error),
        data: null
      };
    }
  },

  // Cập nhật xe
  updateVehicle: async (vehicleId, data) => {
    try {
      const response = await axios.put(`/vehicles/${vehicleId}`, data);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Cập nhật xe thành công'
      };
    } catch (error) {
      return {
        success: false,
        message: getErrorMessage(error),
        data: null
      };
    }
  },

  // Xóa xe
  deleteVehicle: async (vehicleId) => {
    try {
      const response = await axios.delete(`/vehicles/${vehicleId}`);
      return {
        success: true,
        data: null,
        message: response.data.message || 'Xóa xe thành công'
      };
    } catch (error) {
      return {
        success: false,
        message: getErrorMessage(error),
        data: null
      };
    }
  },

  // Cập nhật trạng thái xe
  updateVehicleStatus: async (vehicleId, status, reason = '') => {
    try {
      const response = await axios.put(`/vehicles/${vehicleId}/status`, { status, reason });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Cập nhật trạng thái thành công'
      };
    } catch (error) {
      return {
        success: false,
        message: getErrorMessage(error),
        data: null
      };
    }
  },

  // Lấy thống kê xe
  getVehicleStats: async (vehicleId) => {
    try {
      const response = await axios.get(`/vehicles/${vehicleId}/stats`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: getErrorMessage(error),
        data: null
      };
    }
  },

  // Tìm kiếm xe
  searchVehicles: async (query, groupId = null) => {
    try {
      const params = { query };
      if (groupId) params.groupId = groupId;
      const response = await axios.get('/vehicles/search', { params });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: getErrorMessage(error),
        data: null
      };
    }
  },

  // Bảo trì - Tạo lịch bảo trì
  createMaintenance: async (vehicleId, data) => {
    const response = await axios.post(`/vehicles/maintenance/${vehicleId}`, data);
    return response.data;
  },

  // Bảo trì - Lấy lịch sử bảo trì
  getMaintenanceHistory: async (vehicleId, params) => {
    const response = await axios.get(`/vehicles/maintenance/${vehicleId}`, { params });
    return response.data;
  },

  // Bảo trì - Cập nhật trạng thái
  updateMaintenanceStatus: async (maintenanceId, status) => {
    const response = await axios.put(`/vehicles/maintenance/${maintenanceId}/status`, { status });
    return response.data;
  },

  // Bảo trì - Hoàn thành bảo trì
  completeMaintenance: async (maintenanceId, data) => {
    const response = await axios.post(`/vehicles/maintenance/${maintenanceId}/complete`, data);
    return response.data;
  },

  // Bảo hiểm - Thêm bảo hiểm
  addInsurance: async (vehicleId, data) => {
    const response = await axios.post(`/vehicles/insurance/${vehicleId}`, data);
    return response.data;
  },

  // Bảo hiểm - Lấy thông tin bảo hiểm
  getInsurance: async (vehicleId) => {
    const response = await axios.get(`/vehicles/insurance/${vehicleId}`);
    return response.data;
  },

  // Bảo hiểm - Cập nhật bảo hiểm
  updateInsurance: async (insuranceId, data) => {
    const response = await axios.put(`/vehicles/insurance/${insuranceId}`, data);
    return response.data;
  },

  // Bảo hiểm - Gia hạn bảo hiểm
  renewInsurance: async (insuranceId, data) => {
    const response = await axios.post(`/vehicles/insurance/${insuranceId}/renew`, data);
    return response.data;
  },

  // Sạc pin - Tạo phiên sạc
  createChargingSession: async (vehicleId, data) => {
    const response = await axios.post(`/vehicles/charging/vehicles/${vehicleId}/sessions`, data);
    return response.data;
  },

  // Sạc pin - Lấy lịch sử sạc
  getChargingSessions: async (vehicleId, params) => {
    const response = await axios.get(`/vehicles/charging/vehicles/${vehicleId}/sessions`, { params });
    return response.data;
  },

  // Sạc pin - Lấy phiên sạc theo ID
  getChargingSession: async (sessionId) => {
    const response = await axios.get(`/vehicles/charging/sessions/${sessionId}`);
    return response.data;
  },

  // Sạc pin - Lấy thống kê
  getChargingStats: async (vehicleId, params) => {
    const response = await axios.get(`/vehicles/charging/vehicles/${vehicleId}/stats`, { params });
    return response.data;
  },

  // Sạc pin - Lấy chi phí sạc
  getChargingCosts: async (vehicleId, params) => {
    const response = await axios.get(`/vehicles/charging/vehicles/${vehicleId}/costs`, { params });
    return response.data;
  },

  // Phân tích - Mức sử dụng xe
  getUtilization: async (vehicleId, params) => {
    const response = await axios.get(`/vehicles/analytics/vehicles/${vehicleId}/utilization`, { params });
    return response.data;
  },

  // Phân tích - Chi phí bảo trì
  getMaintenanceCosts: async (vehicleId, params) => {
    const response = await axios.get(`/vehicles/analytics/vehicles/${vehicleId}/maintenance-costs`, { params });
    return response.data;
  },

  // Phân tích - Sức khỏe pin
  getBatteryHealth: async (vehicleId) => {
    const response = await axios.get(`/vehicles/analytics/vehicles/${vehicleId}/battery-health`);
    return response.data;
  },

  // Phân tích - Chi phí vận hành
  getOperatingCosts: async (vehicleId, params) => {
    const response = await axios.get(`/vehicles/analytics/vehicles/${vehicleId}/operating-costs`, { params });
    return response.data;
  },

  // Phân tích - Tóm tắt nhóm
  getGroupSummary: async (groupId, params) => {
    const response = await axios.get(`/vehicles/analytics/groups/${groupId}/summary`, { params });
    return response.data;
  },
};
