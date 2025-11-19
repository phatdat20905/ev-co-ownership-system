import axios from './axios';
import { getErrorMessage } from '../utils/toast';

export const maintenanceAPI = {
  // Tạo lịch bảo trì
  createSchedule: async (vehicleId, data) => {
    try {
      const response = await axios.post(`/vehicles/maintenance/vehicles/${vehicleId}/schedules`, data);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Tạo lịch bảo trì thành công'
      };
    } catch (error) {
      return {
        success: false,
        message: getErrorMessage(error),
        data: null
      };
    }
  },

  // Lấy danh sách lịch bảo trì của xe
  getSchedules: async (vehicleId, params = {}) => {
    try {
      const response = await axios.get(`/vehicles/maintenance/vehicles/${vehicleId}/schedules`, { params });
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

  // Lấy chi tiết lịch bảo trì
  getScheduleById: async (scheduleId) => {
    try {
      const response = await axios.get(`/vehicles/maintenance/schedules/${scheduleId}`);
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

  // Cập nhật lịch bảo trì
  updateSchedule: async (scheduleId, data) => {
    try {
      const response = await axios.put(`/vehicles/maintenance/schedules/${scheduleId}`, data);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Cập nhật lịch bảo trì thành công'
      };
    } catch (error) {
      return {
        success: false,
        message: getErrorMessage(error),
        data: null
      };
    }
  },

  // Xóa lịch bảo trì
  deleteSchedule: async (scheduleId) => {
    try {
      const response = await axios.delete(`/vehicles/maintenance/schedules/${scheduleId}`);
      return {
        success: true,
        data: null,
        message: response.data.message || 'Xóa lịch bảo trì thành công'
      };
    } catch (error) {
      return {
        success: false,
        message: getErrorMessage(error),
        data: null
      };
    }
  },

  // Hoàn thành bảo trì
  completeMaintenance: async (scheduleId, data) => {
    try {
      const response = await axios.put(`/vehicles/maintenance/schedules/${scheduleId}/complete`, data);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Hoàn thành bảo trì thành công'
      };
    } catch (error) {
      return {
        success: false,
        message: getErrorMessage(error),
        data: null
      };
    }
  },

  // Tạo lịch sử bảo trì
  createHistory: async (vehicleId, data) => {
    try {
      const response = await axios.post(`/vehicles/maintenance/vehicles/${vehicleId}/history`, data);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Tạo lịch sử bảo trì thành công'
      };
    } catch (error) {
      return {
        success: false,
        message: getErrorMessage(error),
        data: null
      };
    }
  },

  // Lấy lịch sử bảo trì
  getHistory: async (vehicleId, params = {}) => {
    try {
      const response = await axios.get(`/vehicles/maintenance/vehicles/${vehicleId}/history`, { params });
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

  // Lấy tất cả lịch bảo trì (cho admin/staff)
  getAllSchedules: async (params = {}) => {
    try {
      const response = await axios.get('/vehicles/maintenance/schedules', { params });
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
};
