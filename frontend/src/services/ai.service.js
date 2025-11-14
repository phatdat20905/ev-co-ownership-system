// src/services/ai.service.js
import apiClient from './api/interceptors.js';

/**
 * AI Service
 * Handles AI-powered features including schedule optimization, cost prediction, 
 * dispute resolution, and analytics
 */
class AIService {
  // ==================== SCHEDULE OPTIMIZATION ====================

  /**
   * Optimize booking schedule for a group
   * POST /ai/schedule/optimize
   */
  async optimizeSchedule(scheduleData) {
    const response = await apiClient.post('/ai/schedule/optimize', scheduleData);
    return response;
  }

  /**
   * Get schedule recommendations for a group
   * GET /ai/schedule/group/:groupId/recommendations
   */
  async getScheduleRecommendations(groupId, startDate = null, endDate = null) {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await apiClient.get(`/ai/schedule/group/${groupId}/recommendations`, { params });
    return response;
  }

  /**
   * Get active schedule recommendation
   * GET /ai/schedule/group/:groupId/active
   */
  async getActiveScheduleRecommendation(groupId) {
    const response = await apiClient.get(`/ai/schedule/group/${groupId}/active`);
    return response;
  }

  // ==================== COST PREDICTION ====================

  /**
   * Predict future costs for a vehicle
   * POST /ai/cost/predict
   */
  async predictCosts(costPredictionData) {
    const response = await apiClient.post('/ai/cost/predict', costPredictionData);
    return response;
  }

  /**
   * Get cost optimization suggestions
   * GET /ai/cost/optimize/:groupId
   */
  async getCostOptimization(groupId) {
    const response = await apiClient.get(`/ai/cost/optimize/${groupId}`);
    return response;
  }

  /**
   * Get cost anomaly detection
   * GET /ai/cost/anomalies/:groupId
   */
  async detectCostAnomalies(groupId, startDate = null, endDate = null) {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await apiClient.get(`/ai/cost/anomalies/${groupId}`, { params });
    return response;
  }

  // ==================== DISPUTE RESOLUTION ====================

  /**
   * Analyze dispute and get AI suggestions
   * POST /ai/dispute/analyze
   */
  async analyzeDispute(disputeData) {
    const response = await apiClient.post('/ai/dispute/analyze', disputeData);
    return response;
  }

  /**
   * Get dispute resolution recommendations
   * GET /ai/dispute/:disputeId/recommendations
   */
  async getDisputeRecommendations(disputeId) {
    const response = await apiClient.get(`/ai/dispute/${disputeId}/recommendations`);
    return response;
  }

  /**
   * Predict dispute outcome
   * POST /ai/dispute/predict-outcome
   */
  async predictDisputeOutcome(disputeData) {
    const response = await apiClient.post('/ai/dispute/predict-outcome', disputeData);
    return response;
  }

  // ==================== ANALYTICS ====================

  /**
   * Get usage pattern analytics
   * GET /ai/analytics/usage-patterns/:groupId
   */
  async getUsagePatterns(groupId, startDate = null, endDate = null) {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await apiClient.get(`/ai/analytics/usage-patterns/${groupId}`, { params });
    return response;
  }

  /**
   * Get behavior insights
   * GET /ai/analytics/behavior-insights/:userId
   */
  async getBehaviorInsights(userId) {
    const response = await apiClient.get(`/ai/analytics/behavior-insights/${userId}`);
    return response;
  }

  /**
   * Get predictive maintenance recommendations
   * GET /ai/analytics/maintenance/:vehicleId
   */
  async getMaintenanceRecommendations(vehicleId) {
    const response = await apiClient.get(`/ai/analytics/maintenance/${vehicleId}`);
    return response;
  }

  /**
   * Get efficiency recommendations
   * GET /ai/analytics/efficiency/:groupId
   */
  async getEfficiencyRecommendations(groupId) {
    const response = await apiClient.get(`/ai/analytics/efficiency/${groupId}`);
    return response;
  }

  /**
   * Generic recommendations endpoint used by UI components.
   * GET /ai/recommendations
   * Returns response.data (object with recommendations[])
   */
  async getRecommendations(params = {}) {
    try {
      // apiClient returns response.data via interceptor
      const data = await apiClient.get('/ai/recommendations', { params });
      return data;
    } catch (err) {
      // If backend AI endpoint is not available or times out, don't crash the UI — return empty recommendations
      const status = err?.response?.status;
      if (status === 404) {
        console.warn('AI recommendations endpoint not found (404), returning empty list');
        return { recommendations: [] };
      }

      // For gateway/timeouts or other server errors, log and return empty list so UI can continue
      console.warn('AI recommendations request failed (status:', status, '), returning empty list');
      return { recommendations: [] };
    }
  }

  // ==================== FEEDBACK ====================

  /**
   * Submit feedback on AI recommendation
   * POST /ai/feedback
   */
  async submitFeedback(feedbackData) {
    const response = await apiClient.post('/ai/feedback', feedbackData);
    return response;
  }

  /**
   * Get feedback history
   * GET /ai/feedback/history
   */
  async getFeedbackHistory(params = {}) {
    const response = await apiClient.get('/ai/feedback/history', { params });
    return response;
  }

  /**
   * Rate AI recommendation
   * POST /ai/feedback/:recommendationId/rate
   */
  async rateRecommendation(recommendationId, rating, comment = null) {
    const response = await apiClient.post(`/ai/feedback/${recommendationId}/rate`, {
      rating,
      comment,
    });
    return response;
  }
}

export default new AIService();
