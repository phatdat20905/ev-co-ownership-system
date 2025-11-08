// src/services/admin.service.js
import apiClient from './api/interceptors.js';

/**
 * Admin Service
 * Handles admin panel, staff management, disputes, and system operations
 */
class AdminService {
  // ==================== DASHBOARD ====================

  /**
   * Get admin dashboard overview
   * GET /admin/dashboard/overview
   */
  async getDashboardOverview() {
    const response = await apiClient.get('/admin/dashboard/overview');
    return response;
  }

  /**
   * Get dashboard statistics
   * GET /admin/dashboard/statistics
   */
  async getDashboardStats(startDate = null, endDate = null) {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await apiClient.get('/admin/dashboard/statistics', { params });
    return response;
  }

  /**
   * Get recent activities
   * GET /admin/dashboard/activities
   */
  async getRecentActivities(limit = 10) {
    const params = { limit };
    const response = await apiClient.get('/admin/dashboard/activities', { params });
    return response;
  }

  // ==================== STAFF MANAGEMENT ====================

  /**
   * Get staff profile
   * GET /admin/staff/profile
   */
  async getStaffProfile() {
    const response = await apiClient.get('/admin/staff/profile');
    return response;
  }

  /**
   * Create new staff member
   * POST /admin/staff
   */
  async createStaff(staffData) {
    const response = await apiClient.post('/admin/staff', staffData);
    return response;
  }

  /**
   * Get all staff members
   * GET /admin/staff
   */
  async listStaff(params = {}) {
    const response = await apiClient.get('/admin/staff', { params });
    return response;
  }

  /**
   * Get staff performance metrics
   * GET /admin/staff/performance
   */
  async getStaffPerformance(startDate = null, endDate = null) {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await apiClient.get('/admin/staff/performance', { params });
    return response;
  }

  /**
   * Get staff member by ID
   * GET /admin/staff/:staffId
   */
  async getStaff(staffId) {
    const response = await apiClient.get(`/admin/staff/${staffId}`);
    return response;
  }

  /**
   * Update staff member
   * PUT /admin/staff/:staffId
   */
  async updateStaff(staffId, staffData) {
    const response = await apiClient.put(`/admin/staff/${staffId}`, staffData);
    return response;
  }

  /**
   * Update staff permissions
   * PUT /admin/staff/:staffId/permissions
   */
  async updateStaffPermissions(staffId, permissions) {
    const response = await apiClient.put(`/admin/staff/${staffId}/permissions`, { permissions });
    return response;
  }

  /**
   * Deactivate staff member
   * DELETE /admin/staff/:staffId
   */
  async deactivateStaff(staffId) {
    const response = await apiClient.delete(`/admin/staff/${staffId}`);
    return response;
  }

  // ==================== DISPUTE MANAGEMENT ====================

  /**
   * Create dispute
   * POST /admin/disputes
   */
  async createDispute(disputeData) {
    const response = await apiClient.post('/admin/disputes', disputeData);
    return response;
  }

  /**
   * Get all disputes
   * GET /admin/disputes
   */
  async listDisputes(params = {}) {
    const response = await apiClient.get('/admin/disputes', { params });
    return response;
  }

  /**
   * Get dispute statistics
   * GET /admin/disputes/stats
   */
  async getDisputeStats() {
    const response = await apiClient.get('/admin/disputes/stats');
    return response;
  }

  /**
   * Get dispute by ID
   * GET /admin/disputes/:disputeId
   */
  async getDispute(disputeId) {
    const response = await apiClient.get(`/admin/disputes/${disputeId}`);
    return response;
  }

  /**
   * Assign dispute to staff
   * PUT /admin/disputes/:disputeId/assign
   */
  async assignDispute(disputeId, staffId) {
    const response = await apiClient.put(`/admin/disputes/${disputeId}/assign`, { staffId });
    return response;
  }

  /**
   * Add message to dispute
   * POST /admin/disputes/:disputeId/messages
   */
  async addDisputeMessage(disputeId, message) {
    const response = await apiClient.post(`/admin/disputes/${disputeId}/messages`, { message });
    return response;
  }

  /**
   * Resolve dispute
   * PUT /admin/disputes/:disputeId/resolve
   */
  async resolveDispute(disputeId, resolution) {
    const response = await apiClient.put(`/admin/disputes/${disputeId}/resolve`, { resolution });
    return response;
  }

  /**
   * Escalate dispute
   * PUT /admin/disputes/:disputeId/escalate
   */
  async escalateDispute(disputeId, reason) {
    const response = await apiClient.put(`/admin/disputes/${disputeId}/escalate`, { reason });
    return response;
  }

  // ==================== KYC MANAGEMENT ====================

  /**
   * Get pending KYC verifications
   * GET /admin/kyc/pending
   */
  async getPendingKYC(params = {}) {
    const response = await apiClient.get('/admin/kyc/pending', { params });
    return response;
  }

  /**
   * Get KYC submission by ID
   * GET /admin/kyc/:submissionId
   */
  async getKYCSubmission(submissionId) {
    const response = await apiClient.get(`/admin/kyc/${submissionId}`);
    return response;
  }

  /**
   * Approve KYC submission
   * POST /admin/kyc/:submissionId/approve
   */
  async approveKYC(submissionId) {
    const response = await apiClient.post(`/admin/kyc/${submissionId}/approve`);
    return response;
  }

  /**
   * Reject KYC submission
   * POST /admin/kyc/:submissionId/reject
   */
  async rejectKYC(submissionId, reason) {
    const response = await apiClient.post(`/admin/kyc/${submissionId}/reject`, { reason });
    return response;
  }

  /**
   * Request additional documents
   * POST /admin/kyc/:submissionId/request-documents
   */
  async requestAdditionalDocuments(submissionId, documentsNeeded) {
    const response = await apiClient.post(`/admin/kyc/${submissionId}/request-documents`, {
      documentsNeeded,
    });
    return response;
  }

  // ==================== SYSTEM MANAGEMENT ====================

  /**
   * Get system settings
   * GET /admin/system/settings
   */
  async getSystemSettings() {
    const response = await apiClient.get('/admin/system/settings');
    return response;
  }

  /**
   * Update system settings
   * PUT /admin/system/settings
   */
  async updateSystemSettings(settings) {
    const response = await apiClient.put('/admin/system/settings', settings);
    return response;
  }

  /**
   * Get system logs
   * GET /admin/system/logs
   */
  async getSystemLogs(params = {}) {
    const response = await apiClient.get('/admin/system/logs', { params });
    return response;
  }

  /**
   * Get system health status
   * GET /admin/system/health
   */
  async getSystemHealth() {
    const response = await apiClient.get('/admin/system/health');
    return response;
  }

  /**
   * Clear cache
   * POST /admin/system/clear-cache
   */
  async clearCache() {
    const response = await apiClient.post('/admin/system/clear-cache');
    return response;
  }

  // ==================== ANALYTICS ====================

  /**
   * Get user analytics
   * GET /admin/analytics/users
   */
  async getUserAnalytics(startDate, endDate) {
    const params = { startDate, endDate };
    const response = await apiClient.get('/admin/analytics/users', { params });
    return response;
  }

  /**
   * Get booking analytics
   * GET /admin/analytics/bookings
   */
  async getBookingAnalytics(startDate, endDate) {
    const params = { startDate, endDate };
    const response = await apiClient.get('/admin/analytics/bookings', { params });
    return response;
  }

  /**
   * Get financial analytics
   * GET /admin/analytics/financial
   */
  async getFinancialAnalytics(startDate, endDate) {
    const params = { startDate, endDate };
    const response = await apiClient.get('/admin/analytics/financial', { params });
    return response;
  }

  /**
   * Export analytics report
   * GET /admin/analytics/export
   */
  async exportAnalytics(reportType, startDate, endDate) {
    const params = { reportType, startDate, endDate };
    const response = await apiClient.get('/admin/analytics/export', {
      params,
      responseType: 'blob',
    });
    return response;
  }

  // ==================== USER MANAGEMENT ====================

  /**
   * Get all users
   * GET /admin/users (Note: This endpoint might be in user management routes)
   */
  async getAllUsers(params = {}) {
    const response = await apiClient.get('/admin/users', { params });
    return response;
  }

  /**
   * Update user status
   * PUT /admin/users/:userId/status
   */
  async updateUserStatus(userId, status, reason = null) {
    const response = await apiClient.put(`/admin/users/${userId}/status`, {
      status,
      reason,
    });
    return response;
  }

  /**
   * Verify user manually
   * POST /admin/users/:userId/verify
   */
  async verifyUser(userId) {
    const response = await apiClient.post(`/admin/users/${userId}/verify`);
    return response;
  }
}

export default new AdminService();
