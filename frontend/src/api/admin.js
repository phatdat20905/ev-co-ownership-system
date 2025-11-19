import axios from './axios';

export const adminAPI = {
  // Dashboard - Tổng quan hệ thống
  getDashboardStats: async (params) => {
    const response = await axios.get('/admin/dashboard/stats', { params });
    return response.data;
  },

  // Dashboard - Hoạt động gần đây
  getRecentActivities: async (params) => {
    const response = await axios.get('/admin/dashboard/activities', { params });
    return response.data;
  },

  // Dashboard - Full overview (includes revenue.trend)
  getDashboardOverview: async (params) => {
    const response = await axios.get('/admin/dashboard/overview', { params });
    return response.data;
  },

  // Dashboard - Thông báo
  getNotifications: async (params) => {
    const response = await axios.get('/admin/dashboard/notifications', { params });
    return response.data;
  },

  // Dashboard - Cảnh báo
  getAlerts: async () => {
    const response = await axios.get('/admin/dashboard/alerts');
    return response.data;
  },

  // Admin Profile - Get profile
  getAdminProfile: async () => {
    const response = await axios.get('/admin/profile');
    return response.data;
  },

  // Admin Profile - Update profile
  updateAdminProfile: async (data) => {
    const response = await axios.put('/admin/profile', data);
    return response.data;
  },

  // Admin Profile - Upload avatar
  uploadAvatar: async (formData) => {
    const response = await axios.post('/admin/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Admin Profile - Update security settings
  updateSecuritySettings: async (settings) => {
    const response = await axios.put('/admin/profile/security', settings);
    return response.data;
  },

  // Admin Profile - Update notification preferences
  updateNotificationPreferences: async (preferences) => {
    const response = await axios.put('/admin/profile/notifications', preferences);
    return response.data;
  },

  // Admin Profile - Change password
  changePassword: async (passwordData) => {
    const response = await axios.post('/admin/profile/change-password', passwordData);
    return response.data;
  },

  // Quản lý người dùng - Danh sách
  getUsers: async (params) => {
    const response = await axios.get('/admin/users', { params });
    return response.data;
  },

  // Quản lý người dùng - Chi tiết
  getUserById: async (userId) => {
    const response = await axios.get(`/admin/users/${userId}`);
    return response.data;
  },

  // Quản lý người dùng - Cập nhật
  updateUser: async (userId, data) => {
    const response = await axios.put(`/admin/users/${userId}`, data);
    return response.data;
  },

  // Quản lý người dùng - Cập nhật trạng thái
  updateUserStatus: async (userId, status) => {
    const response = await axios.patch(`/admin/users/${userId}/status`, { status });
    return response.data;
  },

  // Quản lý người dùng - Phê duyệt KYC
  approveKYC: async (userId) => {
    const response = await axios.post(`/admin/users/${userId}/kyc/approve`);
    return response.data;
  },

  // Quản lý người dùng - Từ chối KYC
  rejectKYC: async (userId, reason) => {
    const response = await axios.post(`/admin/users/${userId}/kyc/reject`, { reason });
    return response.data;
  },

  // Quản lý nhóm - Danh sách
  getGroups: async (params) => {
    const response = await axios.get('/admin/groups', { params });
    return response.data;
  },

  // Quản lý nhóm - Chi tiết
  getGroupById: async (groupId) => {
    const response = await axios.get(`/admin/groups/${groupId}`);
    return response.data;
  },

  // Quản lý nhóm - Cập nhật trạng thái
  updateGroupStatus: async (groupId, status) => {
    const response = await axios.patch(`/admin/groups/${groupId}/status`, { status });
    return response.data;
  },

  // Quản lý nhóm - Xóa nhóm
  deleteGroup: async (groupId) => {
    const response = await axios.delete(`/admin/groups/${groupId}`);
    return response.data;
  },

  // Quản lý hợp đồng - Danh sách
  getContracts: async (params) => {
    const response = await axios.get('/admin/contracts', { params });
    return response.data;
  },

  // Quản lý hợp đồng - Chi tiết
  getContractById: async (contractId) => {
    const response = await axios.get(`/admin/contracts/${contractId}`);
    return response.data;
  },

  // Quản lý hợp đồng - Phê duyệt
  approveContract: async (contractId) => {
    const response = await axios.post(`/admin/contracts/${contractId}/approve`);
    return response.data;
  },

  // Quản lý hợp đồng - Từ chối
  rejectContract: async (contractId, reason) => {
    const response = await axios.post(`/admin/contracts/${contractId}/reject`, { reason });
    return response.data;
  },

  // Tranh chấp - Danh sách
  getDisputes: async (params) => {
    const response = await axios.get('/admin/disputes', { params });
    return response.data;
  },

  // Tranh chấp - Chi tiết
  getDisputeById: async (disputeId) => {
    const response = await axios.get(`/admin/disputes/${disputeId}`);
    return response.data;
  },

  // Tranh chấp - Xử lý (PUT)
  resolveDispute: async (disputeId, data) => {
    const response = await axios.put(`/admin/disputes/${disputeId}/resolve`, data);
    return response.data;
  },

  // Tranh chấp - Chuyển cho staff (PUT)
  assignDispute: async (disputeId, staffId) => {
    const response = await axios.put(`/admin/disputes/${disputeId}/assign`, { staffId });
    return response.data;
  },

  // Tranh chấp - Thêm tin nhắn
  addDisputeMessage: async (disputeId, message) => {
    const response = await axios.post(`/admin/disputes/${disputeId}/messages`, message);
    return response.data;
  },

  // Pause dispute
  pauseDispute: async (disputeId) => {
    const response = await axios.put(`/admin/disputes/${disputeId}/pause`);
    return response.data;
  },

  // Export dispute summary PDF
  exportDisputeSummary: async (params = {}) => {
    const response = await axios.get('/admin/disputes/export/summary', { params, responseType: 'blob' });
    return response;
  },

  // Export single dispute PDF (BP)
  exportDisputePDF: async (disputeId, params = {}) => {
    const response = await axios.get(`/admin/disputes/${disputeId}/export`, { params, responseType: 'blob' });
    return response;
  },

  // Quản lý staff - Danh sách
  getStaffList: async (params) => {
    const response = await axios.get('/admin/staff', { params });
    return response.data;
  },

  // Quản lý staff - Tạo mới
  createStaff: async (data) => {
    const response = await axios.post('/admin/staff', data);
    return response.data;
  },

  // Quản lý staff - Cập nhật
  updateStaff: async (staffId, data) => {
    const response = await axios.put(`/admin/staff/${staffId}`, data);
    return response.data;
  },

  // Quản lý staff - Xóa
  deleteStaff: async (staffId) => {
    const response = await axios.delete(`/admin/staff/${staffId}`);
    return response.data;
  },

  // Quản lý staff - Cập nhật trạng thái
  updateStaffStatus: async (staffId, status) => {
    const response = await axios.patch(`/admin/staff/${staffId}/status`, { status });
    return response.data;
  },

  // Báo cáo tài chính - Tổng quan
  getFinancialOverview: async (params) => {
    const response = await axios.get('/admin/reports/financial/overview', { params });
    return response.data;
  },

  // Báo cáo tài chính - Doanh thu
  getRevenueReport: async (params) => {
    const response = await axios.get('/admin/reports/financial/revenue', { params });
    return response.data;
  },

  // Báo cáo tài chính - Chi phí
  getExpenseReport: async (params) => {
    const response = await axios.get('/admin/reports/financial/expenses', { params });
    return response.data;
  },

  // Báo cáo tài chính - Export
  // Return the full axios response so callers can inspect headers (content-type, content-disposition)
  exportFinancialReport: async (reportType, params) => {
    const response = await axios.get(`/admin/reports/financial/export/${reportType}`, {
      params,
      responseType: 'blob',
    });
    return response; // caller will handle response.data (the blob) and headers
  },

  // Phân tích - Tổng quan hệ thống
  getSystemAnalytics: async (params) => {
    const response = await axios.get('/admin/analytics/system', { params });
    return response.data;
  },

  // Phân tích - Người dùng
  getUserAnalytics: async (params) => {
    const response = await axios.get('/admin/analytics/users', { params });
    return response.data;
  },

  // Phân tích - Booking
  getBookingAnalytics: async (params) => {
    const response = await axios.get('/admin/analytics/bookings', { params });
    return response.data;
  },

  // Phân tích - Xe
  getVehicleAnalytics: async (params) => {
    const response = await axios.get('/admin/analytics/vehicles', { params });
    return response.data;
  },

  // Hệ thống - Cấu hình
  getSystemConfig: async () => {
    const response = await axios.get('/admin/system/config');
    return response.data;
  },

  // Hệ thống - Cập nhật cấu hình
  updateSystemConfig: async (data) => {
    const response = await axios.put('/admin/system/config', data);
    return response.data;
  },

  // Hệ thống - Logs
  getSystemLogs: async (params) => {
    const response = await axios.get('/admin/system/logs', { params });
    return response.data;
  },

  // Hệ thống - Backup
  createBackup: async () => {
    const response = await axios.post('/admin/system/backup');
    return response.data;
  },
};
