import apiClient from '../lib/api/client.js';

/**
 * Admin Service
 */
class AdminService {
  /**
   * Get admin dashboard data
   */
  async getDashboardData() {
    return await apiClient.get('/admin/dashboard');
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(params) {
    return await apiClient.get('/admin/dashboard/stats', { params });
  }

  /**
   * Get all staff members
   */
  async getAllStaff(params) {
    return await apiClient.get('/admin/staff', { params });
  }

  /**
   * Get staff by ID
   */
  async getStaffById(staffId) {
    return await apiClient.get(`/admin/staff/${staffId}`);
  }

  /**
   * Create staff member
   */
  async createStaff(staffData) {
    return await apiClient.post('/admin/staff', staffData);
  }

  /**
   * Update staff member
   */
  async updateStaff(staffId, staffData) {
    return await apiClient.put(`/admin/staff/${staffId}`, staffData);
  }

  /**
   * Delete staff member
   */
  async deleteStaff(staffId) {
    return await apiClient.delete(`/admin/staff/${staffId}`);
  }

  /**
   * Get all disputes
   */
  async getAllDisputes(params) {
    return await apiClient.get('/admin/disputes', { params });
  }

  /**
   * Get dispute by ID
   */
  async getDisputeById(disputeId) {
    return await apiClient.get(`/admin/disputes/${disputeId}`);
  }

  /**
   * Resolve dispute
   */
  async resolveDispute(disputeId, resolution) {
    return await apiClient.put(`/admin/disputes/${disputeId}/resolve`, resolution);
  }

  /**
   * Get KYC verifications
   */
  async getKYCVerifications(params) {
    return await apiClient.get('/admin/kyc', { params });
  }

  /**
   * Approve KYC
   */
  async approveKYC(kycId, data) {
    return await apiClient.put(`/admin/kyc/${kycId}/approve`, data);
  }

  /**
   * Reject KYC
   */
  async rejectKYC(kycId, reason) {
    return await apiClient.put(`/admin/kyc/${kycId}/reject`, { reason });
  }

  /**
   * Get system settings
   */
  async getSystemSettings() {
    return await apiClient.get('/admin/system/settings');
  }

  /**
   * Update system settings
   */
  async updateSystemSettings(settings) {
    return await apiClient.put('/admin/system/settings', settings);
  }

  /**
   * Get analytics data
   */
  async getAnalytics(params) {
    return await apiClient.get('/admin/analytics', { params });
  }

  /**
   * Generate report
   */
  async generateReport(reportType, params) {
    return await apiClient.post('/admin/analytics/reports', { reportType, ...params });
  }
}

export default new AdminService();
