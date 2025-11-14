import apiClient from '../lib/api/client.js';

/**
 * Cost Service
 */
class CostService {
  /**
   * Create new cost entry
   */
  async createCost(costData) {
    return await apiClient.post('/costs', costData);
  }

  /**
   * Get costs by group
   */
  async getCostsByGroup(groupId, params) {
    return await apiClient.get(`/costs/group/${groupId}`, { params });
  }

  /**
   * Get cost by ID
   */
  async getCost(costId) {
    return await apiClient.get(`/costs/${costId}`);
  }

  /**
   * Update cost
   */
  async updateCost(costId, costData) {
    return await apiClient.put(`/costs/${costId}`, costData);
  }

  /**
   * Delete cost
   */
  async deleteCost(costId) {
    return await apiClient.delete(`/costs/${costId}`);
  }

  /**
   * Calculate cost splits
   */
  async calculateSplits(costId) {
    return await apiClient.get(`/costs/${costId}/splits`);
  }

  /**
   * Get cost summary for group
   */
  async getCostSummary(groupId, params) {
    return await apiClient.get(`/costs/group/${groupId}/summary`, { params });
  }
}

export default new CostService();
