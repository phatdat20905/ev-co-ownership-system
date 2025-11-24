import { create } from 'zustand';
import { costAPI } from '../api';

export const useCostStore = create((set, get) => ({
  // State
  costs: [],
  currentCost: null,
  costSummary: null,
  wallet: null,
  groupWallet: null,
  payments: [],
  invoices: [],
  reports: {},
  isLoading: false,
  error: null,

  // Actions - Costs
  fetchCostsByGroup: async (groupId, params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await costAPI.getCostsByGroup(groupId, params);
      set({ costs: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Lỗi tải danh sách chi phí',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchCostById: async (costId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await costAPI.getCostById(costId);
      set({ currentCost: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Lỗi tải thông tin chi phí',
        isLoading: false,
      });
      throw error;
    }
  },

  createCost: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await costAPI.createCost(data);
      set((state) => ({
        costs: [...state.costs, response.data],
        isLoading: false,
      }));
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Lỗi tạo chi phí',
        isLoading: false,
      });
      throw error;
    }
  },

  updateCost: async (costId, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await costAPI.updateCost(costId, data);
      set((state) => ({
        costs: state.costs.map((c) => (c.id === costId ? response.data : c)),
        currentCost: response.data,
        isLoading: false,
      }));
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Lỗi cập nhật chi phí',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteCost: async (costId) => {
    set({ isLoading: true, error: null });
    try {
      await costAPI.deleteCost(costId);
      set((state) => ({
        costs: state.costs.filter((c) => c.id !== costId),
        currentCost: null,
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Lỗi xóa chi phí',
        isLoading: false,
      });
      throw error;
    }
  },

  calculateSplits: async (costId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await costAPI.calculateSplits(costId);
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Lỗi tính toán chia phí',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchCostSummary: async (groupId, params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await costAPI.getCostSummary(groupId, params);
      set({ costSummary: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Lỗi tải tóm tắt chi phí',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchCostBreakdown: async (groupId, params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await costAPI.getCostBreakdown(groupId, params);
      // Return data directly for components to handle
      set({ isLoading: false });
      return response.data || response;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Lỗi tải phân tích chi phí',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchExpenseTracking: async (groupId, params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await costAPI.getExpenseTracking(groupId, params);
      // Return data directly for components to handle
      set({ isLoading: false });
      return response.data || response;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Lỗi tải báo cáo chi phí',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchPaymentHistory: async (groupId, params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await costAPI.getPaymentHistory(groupId, params);
      // Return data directly for components to handle
      set({ isLoading: false });
      return response.data || response;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Lỗi tải lịch sử thanh toán',
        isLoading: false,
      });
      throw error;
    }
  },

  // Actions - Wallet
  fetchWallet: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await costAPI.getWallet();
      set({ wallet: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Lỗi tải thông tin ví',
        isLoading: false,
      });
      throw error;
    }
  },

  depositToWallet: async (amount) => {
    set({ isLoading: true, error: null });
    try {
      const response = await costAPI.depositToWallet(amount);
      set((state) => ({
        wallet: { ...state.wallet, balance: state.wallet.balance + amount },
        isLoading: false,
      }));
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Lỗi nạp tiền vào ví',
        isLoading: false,
      });
      throw error;
    }
  },

  withdrawFromWallet: async (amount) => {
    set({ isLoading: true, error: null });
    try {
      const response = await costAPI.withdrawFromWallet(amount);
      set((state) => ({
        wallet: { ...state.wallet, balance: state.wallet.balance - amount },
        isLoading: false,
      }));
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Lỗi rút tiền từ ví',
        isLoading: false,
      });
      throw error;
    }
  },

  // Actions - Group Wallet
  fetchGroupWallet: async (groupId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await costAPI.getGroupWallet(groupId);
      set({ groupWallet: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Lỗi tải ví nhóm',
        isLoading: false,
      });
      throw error;
    }
  },

  depositToGroupWallet: async (groupId, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await costAPI.depositToGroupWallet(groupId, data);
      set({ isLoading: false });
      await get().fetchGroupWallet(groupId);
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Lỗi nạp tiền vào ví nhóm',
        isLoading: false,
      });
      throw error;
    }
  },

  withdrawFromGroupWallet: async (groupId, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await costAPI.withdrawFromGroupWallet(groupId, data);
      set({ isLoading: false });
      await get().fetchGroupWallet(groupId);
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Lỗi rút tiền từ ví nhóm',
        isLoading: false,
      });
      throw error;
    }
  },

  payFromGroupWallet: async (groupId, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await costAPI.payFromGroupWallet(groupId, data);
      set({ isLoading: false });
      await get().fetchGroupWallet(groupId);
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Lỗi thanh toán từ ví nhóm',
        isLoading: false,
      });
      throw error;
    }
  },

  // Actions - Payments
  fetchPayments: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await costAPI.getPayments(params);
      set({ payments: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Lỗi tải danh sách thanh toán',
        isLoading: false,
      });
      throw error;
    }
  },

  createPayment: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await costAPI.createPayment(data);
      set((state) => ({
        payments: [...state.payments, response.data],
        isLoading: false,
      }));
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Lỗi tạo thanh toán',
        isLoading: false,
      });
      throw error;
    }
  },

  confirmPayment: async (paymentId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await costAPI.confirmPayment(paymentId);
      set((state) => ({
        payments: state.payments.map((p) => (p.id === paymentId ? response.data : p)),
        isLoading: false,
      }));
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Lỗi xác nhận thanh toán',
        isLoading: false,
      });
      throw error;
    }
  },

  // Actions - Invoices
  fetchInvoices: async (groupId, params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await costAPI.getInvoices(groupId, params);
      set({ invoices: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Lỗi tải danh sách hóa đơn',
        isLoading: false,
      });
      throw error;
    }
  },

  // Convenience wrapper: fetch costs/payments relevant to current user
  fetchUserCosts: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      // Get active group from auth store
      const authStore = (await import('./authStore.js')).useAuthStore;
      const activeGroup = authStore.getState().activeGroup;
      
      if (!activeGroup?.id) {
        throw new Error('No active group found. Please select a group first.');
      }

      const response = await costAPI.getCostsByGroup(activeGroup.id, params);
      set({ 
        costs: response.data?.costs || response.data || [],
        isLoading: false 
      });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || error.message || 'Lỗi tải chi phí người dùng',
        isLoading: false,
      });
      throw error;
    }
  },

  generateInvoice: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await costAPI.generateInvoice(data);
      set((state) => ({
        invoices: [...state.invoices, response.data],
        isLoading: false,
      }));
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Lỗi tạo hóa đơn',
        isLoading: false,
      });
      throw error;
    }
  },

  markInvoicePaid: async (invoiceId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await costAPI.markInvoicePaid(invoiceId);
      set((state) => ({
        invoices: state.invoices.map((i) => (i.id === invoiceId ? response.data : i)),
        isLoading: false,
      }));
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Lỗi cập nhật trạng thái hóa đơn',
        isLoading: false,
      });
      throw error;
    }
  },

  // Actions - Reports
  fetchMonthlyReport: async (groupId, year, month) => {
    set({ isLoading: true, error: null });
    try {
      const response = await costAPI.getMonthlyReport(groupId, year, month);
      set((state) => ({
        reports: { ...state.reports, monthly: response.data },
        isLoading: false,
      }));
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Lỗi tải báo cáo tháng',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchQuarterlyReport: async (groupId, year, quarter) => {
    set({ isLoading: true, error: null });
    try {
      const response = await costAPI.getQuarterlyReport(groupId, year, quarter);
      set((state) => ({
        reports: { ...state.reports, quarterly: response.data },
        isLoading: false,
      }));
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Lỗi tải báo cáo quý',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchYearlyReport: async (groupId, year) => {
    set({ isLoading: true, error: null });
    try {
      const response = await costAPI.getYearlyReport(groupId, year);
      set((state) => ({
        reports: { ...state.reports, yearly: response.data },
        isLoading: false,
      }));
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Lỗi tải báo cáo năm',
        isLoading: false,
      });
      throw error;
    }
  },

  // Utility
  clearError: () => set({ error: null }),
  reset: () =>
    set({
      costs: [],
      currentCost: null,
      costSummary: null,
      wallet: null,
      groupWallet: null,
      payments: [],
      invoices: [],
      reports: {},
      isLoading: false,
      error: null,
    }),
}));
