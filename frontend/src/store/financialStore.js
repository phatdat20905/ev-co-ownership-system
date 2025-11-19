import { create } from 'zustand';
import { adminAPI } from '../api/admin';

export const useFinancialStore = create((set, get) => ({
  financialOverview: null,
  revenueReport: null,
  expenseReport: null,
  carPerformance: [],
  reports: [],
  loading: false,
  error: null,

  // Fetch financial overview
  fetchFinancialOverview: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await adminAPI.getFinancialOverview(params);
      set({ 
        financialOverview: response.data.data || response.data, 
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Lỗi tải tổng quan tài chính', 
        loading: false 
      });
    }
  },

  // Fetch revenue report
  fetchRevenueReport: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await adminAPI.getRevenueReport(params);
      set({ 
        revenueReport: response.data.data || response.data, 
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Lỗi tải báo cáo doanh thu', 
        loading: false 
      });
    }
  },

  // Fetch expense report
  fetchExpenseReport: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await adminAPI.getExpenseReport(params);
      set({ 
        expenseReport: response.data.data || response.data, 
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Lỗi tải báo cáo chi phí', 
        loading: false 
      });
    }
  },

  // Fetch car performance / vehicle analytics
  fetchCarPerformance: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await adminAPI.getVehicleAnalytics(params);
      // Normalize payload: adminAPI wrappers sometimes return axios response or response.data
      const payload = (response && response.data && response.data.data) || (response && response.data) || response || [];
      set({
        carPerformance: payload || [],
        loading: false,
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Lỗi tải hiệu suất xe',
        loading: false,
      });
    }
  },

  // Export financial report
  exportFinancialReport: async (reportType, params = {}) => {
    try {
      // adminAPI.exportFinancialReport now returns the full axios response
      const response = await adminAPI.exportFinancialReport(reportType, params);

      // response.data is a Blob (because responseType: 'blob')
      const blobData = response.data;
      const contentType = response.headers && (response.headers['content-type'] || response.headers['Content-Type']) || '';

      // Try to extract filename from content-disposition header
      let filename = null;
      const cd = response.headers && (response.headers['content-disposition'] || response.headers['Content-Disposition']);
      if (cd) {
        const match = cd.match(/filename\*=UTF-8''(.+)$|filename="?([^";]+)"?/i);
        if (match) {
          filename = decodeURIComponent(match[1] || match[2]);
        }
      }

      // Fallback filename using params.format or content-type
      if (!filename) {
        const dateSuffix = new Date().toISOString().split('T')[0];
        let ext = 'xlsx';
        if (params.format && params.format.toLowerCase() === 'pdf') ext = 'pdf';
        else if (contentType.includes('pdf')) ext = 'pdf';
        filename = `${reportType}_${dateSuffix}.${ext}`;
      }

      const blob = new Blob([blobData], { type: contentType || 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Lỗi export báo cáo' 
      });
      throw error;
    }
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Reset store
  reset: () => set({
    financialOverview: null,
    revenueReport: null,
    expenseReport: null,
    carPerformance: [],
    reports: [],
    loading: false,
    error: null
  })
}));
