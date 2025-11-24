import axios from './axios';

export const aiAPI = {
  // Fairness Score - Tính điểm công bằng
  calculateFairnessScore: async (groupId) => {
    const response = await axios.post(`/ai/fairness/${groupId}/calculate`);
    return response.data;
  },

  // Fairness Score - Lấy điểm
  getFairnessScore: async (groupId) => {
    const response = await axios.get(`/ai/fairness/${groupId}`);
    return response.data;
  },

  // Fairness Score - Lấy lịch sử
  getFairnessHistory: async (groupId, params) => {
    const response = await axios.get(`/ai/fairness/${groupId}/history`, { params });
    return response.data;
  },

  // Recommendation - Gợi ý lịch đặt xe
  getBookingRecommendations: async (groupId, params) => {
    const response = await axios.get(`/ai/recommendations/${groupId}/bookings`, { params });
    return response.data;
  },

  // Recommendation - Gợi ý tối ưu chi phí
  getCostOptimization: async (groupId) => {
    const response = await axios.get(`/ai/recommendations/${groupId}/cost-optimization`);
    return response.data;
  },

  // Recommendation - Gợi ý bảo trì
  getMaintenanceRecommendations: async (vehicleId) => {
    const response = await axios.get(`/ai/recommendations/vehicles/${vehicleId}/maintenance`);
    return response.data;
  },

  // Fairness Analysis - Phân tích công bằng (POST /ai/fairness/analyze)
  analyzeFairness: async ({ groupId, timeRange = 'month', startDate, endDate }) => {
    const response = await axios.post('/ai/fairness/analyze', {
      groupId,
      timeRange,
      startDate,
      endDate
    });
    return response.data;
  },

  // Fairness - Get latest record
  getLatestFairness: async (groupId) => {
    const response = await axios.get(`/ai/fairness/latest/${groupId}`);
    return response.data;
  },

  // Analytics - Dự đoán sử dụng
  predictUsage: async (groupId, params) => {
    const response = await axios.post(`/ai/analytics/${groupId}/predict-usage`, params);
    return response.data;
  },

  // Analytics - Phân tích xu hướng
  analyzeTrends: async (groupId, params) => {
    const response = await axios.get(`/ai/analytics/${groupId}/trends`, { params });
    return response.data;
  },

  // Analytics - Insights
  getInsights: async (groupId) => {
    const response = await axios.get(`/ai/analytics/${groupId}/insights`);
    return response.data;
  },
};
