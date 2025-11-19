import { create } from 'zustand';
import { adminAPI } from '../api';

export const useAdminStore = create((set, get) => ({
  stats: null,
  dashboardStats: null,
  dashboardOverview: null,
  recentActivities: [],
  notifications: [],
  groups: [],
  revenueSummary: null,
  users: [],
  disputes: [],
  logs: [],
  loading: false,
  error: null,

  // Fetch dashboard stats (overview)
  fetchDashboardStats: async () => {
    set({ loading: true, error: null });
    try {
      const response = await adminAPI.getDashboardStats();
      const payload = response?.data || response;
      // API sometimes returns { success,message,data } and sometimes raw object
      set({ 
        dashboardStats: payload?.data || payload,
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Lỗi tải dashboard stats', 
        loading: false 
      });
    }
  },

  // Fetch full dashboard overview (includes revenue.trend)
  fetchDashboardOverview: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await adminAPI.getDashboardOverview(params);
      const payload = response?.data || response;
      set({ dashboardOverview: payload?.data || payload || null, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Lỗi tải dashboard overview', loading: false });
    }
  },

  // Fetch recent activities
  fetchRecentActivities: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await adminAPI.getRecentActivities(params);
      const payload = response?.data || response;
      set({ 
        recentActivities: payload?.data || payload || [], 
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Lỗi tải hoạt động', 
        loading: false,
        recentActivities: []
      });
    }
  },

  // Fetch notifications
  fetchNotifications: async (params = {}) => {
    try {
      const response = await adminAPI.getNotifications(params);
      const payload = response?.data || response;
      set({ 
        notifications: payload?.data || payload || []
      });
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      set({ notifications: [] });
    }
  },

  // Fetch car groups
  fetchGroups: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await adminAPI.getGroups(params);
      const payload = response?.data || response;
      set({ groups: payload?.data || payload || [], loading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Lỗi tải nhóm xe', loading: false });
    }
  },

  // Fetch quick revenue summary (for dashboard)
  fetchRevenueSummary: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await adminAPI.getRevenueReport(params);
      const payload = response?.data || response;
      set({ revenueSummary: payload?.data || payload || null, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Lỗi tải số liệu doanh thu', loading: false });
    }
  },

  // Fetch admin dashboard stats
  fetchAdminStats: async () => {
    set({ loading: true, error: null });
    try {
      const response = await adminAPI.getDashboardStats();
      set({ stats: response.data.data, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Lỗi tải thống kê', loading: false });
    }
  },

  // Fetch all users (admin only)
  fetchAllUsers: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await adminAPI.getAllUsers(filters);
      set({ users: response.data.data, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Lỗi tải người dùng', loading: false });
    }
  },

  // Update user status
  updateUserStatus: async (userId, status) => {
    set({ loading: true, error: null });
    try {
      const response = await adminAPI.updateUserStatus(userId, status);
      set((state) => ({
        users: state.users.map(u => u.id === userId ? { ...u, status } : u),
        loading: false
      }));
      return response.data.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Lỗi cập nhật trạng thái', loading: false });
      throw error;
    }
  },

  // Fetch all disputes
  fetchDisputes: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await adminAPI.getDisputes(filters);
      // adminAPI.getDisputes returns response.data in most wrappers, normalize
      const payload = response?.data || response;
      const list = payload?.data || payload || [];

      // If list is small, fetch detail for each dispute to enrich with messages/vehicle info
      // This keeps UI showing message counts without changing backend. Limit to avoid flooding.
      let enriched = list;
      if (Array.isArray(list) && list.length > 0 && list.length <= 10) {
        try {
          const details = await Promise.all(list.map(async (d) => {
            try {
              const detResp = await adminAPI.getDisputeById(d.id);
              const detPayload = detResp?.data || detResp;
              const canonical = detPayload?.data || detPayload || null;
              return canonical || null;
            } catch (e) {
              return null;
            }
          }));

          enriched = list.map(d => {
            const det = details.find(x => x && x.id === d.id) || null;
            return {
              ...d,
              // prefer canonical messages if available
              messages: det?.messages || d.messages || null,
              // attach vehicle or vehicleName if present in detail
              vehicle: det?.vehicle || d.vehicle || null,
              vehicleName: det?.vehicleName || d.vehicleName || (det && (det.vehicle?.vehicleName || det.vehicle?.name)) || d.vehicleName
            };
          });
        } catch (e) {
          // non-fatal: fallback to raw list
          enriched = list;
        }
      }

      set({ disputes: enriched, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Lỗi tải tranh chấp', loading: false });
    }
  },

  // Resolve dispute
  resolveDispute: async (disputeId, resolution) => {
    set({ loading: true, error: null });
    try {
      const response = await adminAPI.resolveDispute(disputeId, resolution);
      set((state) => ({
        disputes: state.disputes.map(d =>
          d.id === disputeId ? { ...d, status: 'resolved', resolution } : d
        ),
        loading: false
      }));
      return response.data.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Lỗi giải quyết tranh chấp', loading: false });
      throw error;
    }
  },

  // Add dispute message
  addDisputeMessage: async (disputeId, messagePayload) => {
    set({ loading: true, error: null });
    try {
      const response = await adminAPI.addDisputeMessage(disputeId, messagePayload);
      // Refresh disputes list and return message
      await get().fetchDisputes();
      set({ loading: false });
      return response.data || response;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Lỗi gửi tin nhắn', loading: false });
      throw error;
    }
  },

  // Pause dispute
  pauseDispute: async (disputeId) => {
    set({ loading: true, error: null });
    try {
      const response = await adminAPI.pauseDispute(disputeId);
      await get().fetchDisputes();
      set({ loading: false });
      return response.data || response;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Lỗi tạm dừng tranh chấp', loading: false });
      throw error;
    }
  },

  // Assign dispute to a staff member
  assignDispute: async (disputeId, staffId) => {
    set({ loading: true, error: null });
    try {
      const response = await adminAPI.assignDispute(disputeId, staffId);
      const updated = response.data.data || response.data;
      set((state) => ({
        disputes: state.disputes.map(d => d.id === disputeId ? { ...d, assigned_to: updated.assigned_to || updated.assignedTo, assignedStaff: updated.assignedStaff || updated.assigned_staff || null } : d),
        loading: false
      }));
      return updated;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Lỗi chuyển tranh chấp', loading: false });
      throw error;
    }
  },

  // Fetch system logs
  fetchSystemLogs: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await adminAPI.getSystemLogs(filters);
      set({ logs: response.data.data, loading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Lỗi tải logs', loading: false });
    }
  },

  // Export data
  exportData: async (type, filters = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await adminAPI.exportData(type, filters);
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Lỗi export dữ liệu', loading: false });
      throw error;
    }
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Reset store
  reset: () => set({
    stats: null,
    dashboardStats: null,
    recentActivities: [],
    notifications: [],
    users: [],
    disputes: [],
    logs: [],
    loading: false,
    error: null
  })
}));
