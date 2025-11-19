import axios from './axios';
import { getErrorMessage } from '../utils/toast';

export const bookingAPI = {
  // Tạo booking mới
  createBooking: async (data) => {
    try {
      const response = await axios.post('/bookings', data);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Tạo lịch đặt thành công'
      };
    } catch (error) {
      return {
        success: false,
        message: getErrorMessage(error),
        data: null
      };
    }
  },

  // Lấy danh sách bookings
  // If params.admin === true then call the admin endpoint mounted at /bookings/admin
  getBookings: async (params = {}) => {
    try {
      const useAdmin = params && params.admin === true;
      // copy params and remove internal flag so it's not sent to the server
      const query = { ...params };
      if (useAdmin) delete query.admin;
      const url = useAdmin ? '/bookings/admin' : '/bookings';
      const response = await axios.get(url, { params: query });
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

  // Lấy thống kê bookings
  getBookingStats: async (params = {}) => {
    try {
      const response = await axios.get('/bookings/stats', { params });
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

  // Lấy analytics bookings (processed server-side)
  getBookingAnalytics: async (params = {}) => {
    try {
      const response = await axios.get('/bookings/analytics', { params });
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

  // Lấy lịch sử bookings
  getBookingHistory: async (params = {}) => {
    try {
      const response = await axios.get('/bookings/history', { params });
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

  // Lấy booking theo ID
  getBookingById: async (bookingId) => {
    try {
      const response = await axios.get(`/bookings/${bookingId}`);
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

  // Cập nhật booking
  updateBooking: async (bookingId, data) => {
    try {
      const response = await axios.put(`/bookings/${bookingId}`, data);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Cập nhật lịch đặt thành công'
      };
    } catch (error) {
      return {
        success: false,
        message: getErrorMessage(error),
        data: null
      };
    }
  },

  // Hủy booking
  cancelBooking: async (bookingId) => {
    try {
      const response = await axios.delete(`/bookings/${bookingId}`);
      return {
        success: true,
        data: null,
        message: response.data.message || 'Hủy lịch đặt thành công'
      };
    } catch (error) {
      return {
        success: false,
        message: getErrorMessage(error),
        data: null
      };
    }
  },

  // Lịch - Lấy lịch theo xe
  getVehicleCalendar: async (vehicleId, params) => {
    const response = await axios.get(`/bookings/calendar/vehicles/${vehicleId}`, { params });
    return response.data;
  },

  // Lịch - Lấy lịch theo nhóm
  getGroupCalendar: async (groupId, params) => {
    const response = await axios.get(`/bookings/calendar/groups/${groupId}`, { params });
    return response.data;
  },

  // Lịch - Kiểm tra xe available
  checkAvailability: async (data) => {
    const response = await axios.post('/bookings/calendar/availability/check', data);
    return response.data;
  },

  // Lịch - Lấy danh sách xe available
  getAvailableVehicles: async (params) => {
    const response = await axios.get('/bookings/calendar/vehicles/available', { params });
    return response.data;
  },

  // Lịch - Lấy lịch cá nhân
  getPersonalCalendar: async (params = {}) => {
    const response = await axios.get('/bookings/calendar/personal', { params });
    return response.data;
  },

  // Check-in
  checkIn: async (bookingId, data) => {
    try {
      const response = await axios.post(`/bookings/check-in-out/${bookingId}/check-in`, data);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Check-in thành công'
      };
    } catch (error) {
      return {
        success: false,
        message: getErrorMessage(error),
        data: null
      };
    }
  },

  // Check-out
  checkOut: async (bookingId, data) => {
    try {
      const response = await axios.post(`/bookings/check-in-out/${bookingId}/check-out`, data);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Check-out thành công'
      };
    } catch (error) {
      return {
        success: false,
        message: getErrorMessage(error),
        data: null
      };
    }
  },

  // Lấy logs check-in/out
  getCheckLogs: async (bookingId) => {
    try {
      const response = await axios.get(`/bookings/check-in-out/${bookingId}/logs`);
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

  // QR - Tạo QR code
  generateQRCode: async (bookingId) => {
    try {
      const response = await axios.get(`/bookings/check-in-out/${bookingId}/qr-code`);
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

  // QR - Validate QR code
  validateQRCode: async (qrCode, secret) => {
    try {
      const response = await axios.post('/bookings/check-in-out/validate-qr', { qrCode, secret });
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
