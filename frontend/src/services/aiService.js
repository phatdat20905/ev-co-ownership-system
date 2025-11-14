import apiClient from '../lib/api/client.js';

/**
 * AI Service
 */
class AIService {
  /**
   * Get schedule recommendations
   */
  async getScheduleRecommendations(groupId) {
    return await apiClient.post('/ai/schedule/recommendations', { groupId });
  }

  /**
   * Analyze schedule conflicts
   */
  async analyzeScheduleConflicts(scheduleData) {
    return await apiClient.post('/ai/schedule/analyze-conflicts', scheduleData);
  }

  /**
   * Get cost insights
   */
  async getCostInsights(groupId, params) {
    return await apiClient.get(`/ai/cost/insights/${groupId}`, { params });
  }

  /**
   * Predict costs
   */
  async predictCosts(groupId, predictionData) {
    return await apiClient.post(`/ai/cost/predict/${groupId}`, predictionData);
  }

  /**
   * Analyze dispute
   */
  async analyzeDispute(disputeId) {
    return await apiClient.post('/ai/dispute/analyze', { disputeId });
  }

  /**
   * Get dispute recommendations
   */
  async getDisputeRecommendations(disputeId) {
    return await apiClient.get(`/ai/dispute/recommendations/${disputeId}`);
  }

  /**
   * Get analytics for group
   */
  async getGroupAnalytics(groupId, params) {
    return await apiClient.get(`/ai/analytics/group/${groupId}`, { params });
  }

  /**
   * Get usage patterns
   */
  async getUsagePatterns(groupId, params) {
    return await apiClient.get(`/ai/analytics/usage-patterns/${groupId}`, { params });
  }

  /**
   * Submit feedback
   */
  async submitFeedback(feedbackData) {
    return await apiClient.post('/ai/feedback', feedbackData);
  }
}

export default new AIService();
