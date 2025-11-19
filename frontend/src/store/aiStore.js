import { create } from 'zustand';
import { aiAPI } from '../api';

export const useAIStore = create((set, get) => ({
  recommendations: null,
  prediction: null,
  analysis: null,
  loading: false,
  error: null,

  // Get booking recommendations
  getBookingRecommendations: async (userId) => {
    set({ loading: true, error: null });
    try {
      const response = await aiAPI.getBookingRecommendations(userId);
      set({ recommendations: response.data.data, loading: false });
      return response.data.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Lỗi tải gợi ý đặt lịch', loading: false });
      throw error;
    }
  },

  // Predict vehicle demand
  predictVehicleDemand: async (vehicleId, timeRange) => {
    set({ loading: true, error: null });
    try {
      const response = await aiAPI.predictVehicleDemand(vehicleId, timeRange);
      set({ prediction: response.data.data, loading: false });
      return response.data.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Lỗi dự đoán nhu cầu xe', loading: false });
      throw error;
    }
  },

  // Analyze cost trends
  analyzeCostTrends: async (groupId, period) => {
    set({ loading: true, error: null });
    try {
      const response = await aiAPI.analyzeCostTrends(groupId, period);
      set({ analysis: response.data.data, loading: false });
      return response.data.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Lỗi phân tích chi phí', loading: false });
      throw error;
    }
  },

  // Detect anomalies
  detectAnomalies: async (dataType, dataId) => {
    set({ loading: true, error: null });
    try {
      const response = await aiAPI.detectAnomalies(dataType, dataId);
      return response.data.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Lỗi phát hiện bất thường', loading: false });
      throw error;
    }
  },

  // Get AI insights
  getAIInsights: async (type, id) => {
    set({ loading: true, error: null });
    try {
      const response = await aiAPI.getAIInsights(type, id);
      return response.data.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Lỗi tải thông tin AI', loading: false });
      throw error;
    }
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Reset store
  reset: () => set({
    recommendations: null,
    prediction: null,
    analysis: null,
    loading: false,
    error: null
  })
}));
