// src/api/staff.js
import axios from './axios';
import { getErrorMessage } from '../utils/toast';

// Helper to safely extract arrays from various response shapes
function extractArray(resp) {
  if (!resp) return [];
  // if it's already an array
  if (Array.isArray(resp)) return resp;
  // axios response bodies often have { data: ... }
  if (Array.isArray(resp.data)) return resp.data;
  // common shapes
  if (Array.isArray(resp.vehicles)) return resp.vehicles;
  if (Array.isArray(resp.bookings)) return resp.bookings;
  if (Array.isArray(resp.notifications)) return resp.notifications;
  if (Array.isArray(resp.schedules)) return resp.schedules;
  // nested data
  if (resp.data && typeof resp.data === 'object') {
    if (Array.isArray(resp.data.data)) return resp.data.data;
    if (Array.isArray(resp.data.vehicles)) return resp.data.vehicles;
    if (Array.isArray(resp.data.bookings)) return resp.data.bookings;
    if (Array.isArray(resp.data.notifications)) return resp.data.notifications;
    if (Array.isArray(resp.data.schedules)) return resp.data.schedules;
  }
  return [];
}
export const staffAPI = {
  // ==================== PROFILE ====================
  
  // Lấy thông tin profile của staff
  getProfile: async () => {
    try {
      const response = await axios.get('/user/profile');
      return {
        success: true,
        data: response.data.data || response.data,
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

  // Cập nhật profile staff
  updateProfile: async (data) => {
    try {
      const response = await axios.put('/user/profile', data);
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Cập nhật thông tin thành công'
      };
    } catch (error) {
      return {
        success: false,
        message: getErrorMessage(error),
        data: null
      };
    }
  },

  // Upload avatar
  uploadAvatar: async (file) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await axios.post('/user/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Tải ảnh đại diện thành công'
      };
    } catch (error) {
      return {
        success: false,
        message: getErrorMessage(error),
        data: null
      };
    }
  },

  // ==================== DASHBOARD STATS ====================
  
  // Lấy thống kê tổng quan cho staff
  getStaffStats: async () => {
    try {
      // Gọi nhiều API để lấy các chỉ số
      const [vehiclesResp, bookingsResp, maintenanceResp] = await Promise.all([
        axios.get('/vehicles/admin/vehicles', { params: { limit: 100 } }),
        axios.get('/bookings/admin', { 
          params: { 
            limit: 100,
            startDate: new Date().toISOString().split('T')[0]
          } 
        }),
        axios.get('/vehicles/maintenance/schedules', { 
          params: { status: 'scheduled' } 
        })
      ]);

  const vehicles = extractArray(vehiclesResp.data) || [];
  const bookings = extractArray(bookingsResp.data) || [];
  const maintenance = extractArray(maintenanceResp.data) || [];

      // Tính toán stats
      const todayBookings = bookings.filter(b => {
        const bookingDate = new Date(b.startTime);
        const today = new Date();
        return bookingDate.toDateString() === today.toDateString();
      });

      const pendingMaintenance = maintenance.filter(m => m.status === 'scheduled');
      const completedServices = maintenance.filter(m => m.status === 'completed');

      // Tính doanh thu (giả sử từ cost-service)
      let monthlyRevenue = 0;
      try {
        const costResp = await axios.get('/costs/admin/overview');
        monthlyRevenue = costResp.data.data?.totalRevenue || 0;
      } catch (e) {
        console.error('Error fetching revenue:', e);
      }

      // Tính tỷ lệ sử dụng
      const inUseVehicles = vehicles.filter(v => v.status === 'in_use').length;
      const utilizationRate = vehicles.length > 0 
        ? Math.round((inUseVehicles / vehicles.length) * 100) 
        : 0;

      return {
        success: true,
        data: {
          assignedCars: vehicles.length,
          todayBookings: todayBookings.length,
          pendingServices: pendingMaintenance.length,
          completedServices: completedServices.length,
          monthlyRevenue: monthlyRevenue,
          utilizationRate: utilizationRate,
          activeUsers: bookings.filter(b => b.status === 'in_progress').length,
          resolvedIssues: completedServices.length
        },
        message: 'Lấy thống kê thành công'
      };
    } catch (error) {
      console.error('Error fetching staff stats:', error);
      return {
        success: false,
        message: getErrorMessage(error),
        data: {
          assignedCars: 0,
          todayBookings: 0,
          pendingServices: 0,
          completedServices: 0,
          monthlyRevenue: 0,
          utilizationRate: 0,
          activeUsers: 0,
          resolvedIssues: 0
        }
      };
    }
  },

  // ==================== ASSIGNED VEHICLES ====================
  
  // Lấy danh sách xe được phân công
  getAssignedVehicles: async (params = {}) => {
    try {
      const response = await axios.get('/vehicles/admin/vehicles', { 
        params: { limit: 50, ...params } 
      });
      
      const vehicles = response.data.data?.vehicles || response.data.data || [];
      
      return {
        success: true,
        data: vehicles.map(v => ({
          id: v.id,
          name: v.name || v.model,
          license: v.licensePlate,
          battery: v.batteryLevel || 85,
          status: v.status,
          location: v.location || 'N/A',
          nextBooking: 'Đang cập nhật',
          lastService: v.lastMaintenanceDate || 'N/A',
          utilization: v.utilizationRate || 0
        })),
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: getErrorMessage(error),
        data: []
      };
    }
  },

  // ==================== TODAY SCHEDULE ====================
  
  // Lấy lịch trình hôm nay
  getTodaySchedule: async () => {
    try {
      // Use a date range where endDate is strictly greater than startDate to satisfy
      // backend Joi validation (endDate.must be greater than startDate).
      const start = new Date();
      const startDate = start.toISOString().split('T')[0];
      const end = new Date(start.getTime() + 24 * 60 * 60 * 1000); // next day
      const endDate = end.toISOString().split('T')[0];

      // Lấy bookings hôm nay (use startDate and endDate=tomorrow so endDate > startDate)
      let bookings = [];
      try {
        const bookingsResp = await axios.get('/bookings/admin', {
          params: {
            startDate: startDate,
            endDate: endDate,
            limit: 50
          }
        });
        bookings = extractArray(bookingsResp.data) || [];
      } catch (e) {
        // If the backend rejects the strict date range for any reason, fallback to
        // calling without date filters so the dashboard still loads.
        console.warn('bookings admin query with date range failed, retrying without dates', e?.message || e);
        try {
          const bookingsResp = await axios.get('/bookings/admin', { params: { limit: 50 } });
          bookings = extractArray(bookingsResp.data) || [];
        } catch (e2) {
          console.error('Error fetching bookings for today schedule:', e2);
          bookings = [];
        }
      }
      
      // Lấy maintenance schedules hôm nay
      let maintenanceSchedules = [];
      try {
        const maintenanceResp = await axios.get('/vehicles/maintenance/schedules', {
          params: {
            date: startDate,
            status: 'scheduled'
          }
        });
  maintenanceSchedules = extractArray(maintenanceResp.data) || [];
      } catch (e) {
        console.error('Error fetching maintenance:', e);
      }

      // Kết hợp và format
      const schedule = [
        ...bookings.map(b => ({
          time: new Date(b.startTime).toLocaleTimeString('vi-VN', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          car: b.vehicle?.model || b.vehicleName || 'N/A',
          user: b.user?.fullName || b.userName || 'N/A',
          type: b.status === 'in_progress' ? 'check-out' : 'check-in'
        })),
        ...maintenanceSchedules.map(m => ({
          time: new Date(m.scheduledDate).toLocaleTimeString('vi-VN', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          car: m.vehicle?.model || m.vehicleName || 'N/A',
          user: m.assignedTo || 'Staff',
          type: 'service'
        }))
      ].sort((a, b) => a.time.localeCompare(b.time));

      return {
        success: true,
        data: schedule,
        message: 'Lấy lịch trình thành công'
      };
    } catch (error) {
      return {
        success: false,
        message: getErrorMessage(error),
        data: []
      };
    }
  },

  // ==================== RECENT ACTIVITIES ====================
  
  // Lấy hoạt động gần đây
  getRecentActivities: async (limit = 10) => {
    try {
      // Lấy bookings gần đây
      const bookingsResp = await axios.get('/bookings/admin', {
        params: {
          limit: limit,
          sort: 'updatedAt',
          order: 'DESC'
        }
      });

      const bookings = bookingsResp.data.data?.bookings || bookingsResp.data.data || [];
      
      const activities = bookings.map(b => {
        let action = 'Hoạt động';
        let type = 'info';

        if (b.status === 'in_progress') {
          action = 'Check-in xe';
          type = 'success';
        } else if (b.status === 'completed') {
          action = 'Check-out thành công';
          type = 'success';
        } else if (b.status === 'confirmed') {
          action = 'Đặt lịch sử dụng';
          type = 'info';
        } else if (b.status === 'cancelled') {
          action = 'Hủy đặt lịch';
          type = 'error';
        }

        const timeAgo = getTimeAgo(new Date(b.updatedAt));

        return {
          id: b.id,
          user: b.user?.fullName || b.userName || 'N/A',
          action: action,
          time: timeAgo,
          type: type
        };
      });

      return {
        success: true,
        data: activities,
        message: 'Lấy hoạt động thành công'
      };
    } catch (error) {
      return {
        success: false,
        message: getErrorMessage(error),
        data: []
      };
    }
  },

  // ==================== NOTIFICATIONS ====================
  
  // Lấy thông báo cho staff
  getNotifications: async (params = {}) => {
    try {
      const response = await axios.get('/notifications', { params });
      const data = extractArray(response.data) || [];
      return {
        success: true,
        data,
        message: response.data?.message
      };
    } catch (error) {
      return {
        success: false,
        message: getErrorMessage(error),
        data: []
      };
    }
  },

  // Đánh dấu thông báo đã đọc
  markNotificationAsRead: async (notificationId) => {
    try {
      const response = await axios.put(`/notifications/${notificationId}/read`);
      return {
        success: true,
        data: response.data.data || response.data,
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

  // Đánh dấu tất cả thông báo đã đọc
  markAllNotificationsAsRead: async () => {
    try {
      const response = await axios.put('/notifications/read-all');
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Đã đánh dấu tất cả thông báo'
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

// ==================== HELPER FUNCTIONS ====================

// Hàm tính thời gian từ now
function getTimeAgo(date) {
  const now = new Date();
  const diff = now - date;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} ngày trước`;
  if (hours > 0) return `${hours} giờ trước`;
  if (minutes > 0) return `${minutes} phút trước`;
  return 'Vừa xong';
}
