// src/services/cost.service.js
import apiClient from './api/interceptors.js';

/**
 * Cost Service
 * Handles cost sharing, payments, and financial management API calls
 */
class CostService {
  // ==================== COST MANAGEMENT ====================

  /**
   * Create new cost entry
   * POST /costs
   */
  async createCost(costData) {
    const response = await apiClient.post('/costs', costData);
    return response;
  }

  /**
   * Get costs for a group
   * GET /costs/group/:groupId
   */
  async getCostsByGroup(groupId, params = {}) {
    const response = await apiClient.get(`/costs/group/${groupId}`, { params });
    return response;
  }

  /**
   * Get cost by ID
   * GET /costs/:id
   */
  async getCost(costId) {
    const response = await apiClient.get(`/costs/${costId}`);
    return response;
  }

  /**
   * Update cost
   * PUT /costs/:id
   */
  async updateCost(costId, costData) {
    const response = await apiClient.put(`/costs/${costId}`, costData);
    return response;
  }

  /**
   * Delete cost
   * DELETE /costs/:id
   */
  async deleteCost(costId) {
    const response = await apiClient.delete(`/costs/${costId}`);
    return response;
  }

  /**
   * Calculate cost splits
   * GET /costs/:id/splits
   */
  async calculateSplits(costId) {
    const response = await apiClient.get(`/costs/${costId}/splits`);
    return response;
  }

  /**
   * Get cost summary for a group
   * GET /costs/group/:groupId/summary
   */
  async getCostSummary(groupId, startDate = null, endDate = null) {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await apiClient.get(`/costs/group/${groupId}/summary`, { params });
    return response;
  }

  // ==================== PAYMENTS ====================

  /**
   * Get payments for user
   * GET /costs/payments
   */
  async getUserPayments(params = {}) {
    const response = await apiClient.get('/costs/payments', { params });
    return response;
  }

  /**
   * Create payment
   * POST /costs/payments
   */
  async createPayment(paymentData) {
    const response = await apiClient.post('/costs/payments', paymentData);
    return response;
  }

  /**
   * Get payment by ID
   * GET /costs/payments/:paymentId
   */
  async getPayment(paymentId) {
    const response = await apiClient.get(`/costs/payments/${paymentId}`);
    return response;
  }

  /**
   * Confirm payment
   * POST /costs/payments/:paymentId/confirm
   */
  async confirmPayment(paymentId, confirmationData) {
    const response = await apiClient.post(`/costs/payments/${paymentId}/confirm`, confirmationData);
    return response;
  }

  /**
   * Cancel payment
   * DELETE /costs/payments/:paymentId
   */
  async cancelPayment(paymentId) {
    const response = await apiClient.delete(`/costs/payments/${paymentId}`);
    return response;
  }

  // ==================== WALLET ====================

  /**
   * Get user wallet
   * GET /costs/wallets/my-wallet
   */
  async getMyWallet() {
    const response = await apiClient.get('/costs/wallets/my-wallet');
    return response;
  }

  /**
   * Get wallet transactions
   * GET /costs/wallets/:walletId/transactions
   */
  async getWalletTransactions(walletId, params = {}) {
    const response = await apiClient.get(`/costs/wallets/${walletId}/transactions`, { params });
    return response;
  }

  /**
   * Top-up wallet
   * POST /costs/wallets/:walletId/top-up
   */
  async topUpWallet(walletId, amount) {
    const response = await apiClient.post(`/costs/wallets/${walletId}/top-up`, { amount });
    return response;
  }

  /**
   * Withdraw from wallet
   * POST /costs/wallets/:walletId/withdraw
   */
  async withdrawWallet(walletId, amount) {
    const response = await apiClient.post(`/costs/wallets/${walletId}/withdraw`, { amount });
    return response;
  }

  // ==================== GROUP WALLET ====================

  /**
   * Get group wallet
   * GET /costs/group-wallets/group/:groupId
   */
  async getGroupWallet(groupId) {
    const response = await apiClient.get(`/costs/group-wallets/group/${groupId}`);
    return response;
  }

  /**
   * Get group wallet transactions
   * GET /costs/group-wallets/:walletId/transactions
   */
  async getGroupWalletTransactions(walletId, params = {}) {
    const response = await apiClient.get(`/costs/group-wallets/${walletId}/transactions`, { params });
    return response;
  }

  /**
   * Contribute to group wallet
   * POST /costs/group-wallets/:walletId/contribute
   */
  async contributeGroupWallet(walletId, amount, description) {
    const response = await apiClient.post(`/costs/group-wallets/${walletId}/contribute`, {
      amount,
      description,
    });
    return response;
  }

  // ==================== SPLITS ====================

  /**
   * Get user's split obligations
   * GET /costs/splits/my-splits
   */
  async getMySplits(params = {}) {
    const response = await apiClient.get('/costs/splits/my-splits', { params });
    return response;
  }

  /**
   * Pay split
   * POST /costs/splits/:splitId/pay
   */
  async paySplit(splitId) {
    const response = await apiClient.post(`/costs/splits/${splitId}/pay`);
    return response;
  }

  // ==================== INVOICES ====================

  /**
   * Get invoices
   * GET /costs/invoices
   */
  async getInvoices(params = {}) {
    const response = await apiClient.get('/costs/invoices', { params });
    return response;
  }

  /**
   * Get invoice by ID
   * GET /costs/invoices/:invoiceId
   */
  async getInvoice(invoiceId) {
    const response = await apiClient.get(`/costs/invoices/${invoiceId}`);
    return response;
  }

  /**
   * Download invoice PDF
   * GET /costs/invoices/:invoiceId/download
   */
  async downloadInvoice(invoiceId) {
    const response = await apiClient.get(`/costs/invoices/${invoiceId}/download`, {
      responseType: 'blob',
    });
    return response;
  }

  // ==================== REPORTS ====================

  /**
   * Get group financial report
   * GET /costs/reports/group/:groupId
   */
  async getGroupReport(groupId, startDate, endDate) {
    const params = { startDate, endDate };
    const response = await apiClient.get(`/costs/reports/group/${groupId}`, { params });
    return response;
  }

  /**
   * Get user financial report
   * GET /costs/reports/my-report
   */
  async getMyReport(startDate, endDate) {
    const params = { startDate, endDate };
    const response = await apiClient.get('/costs/reports/my-report', { params });
    return response;
  }

  /**
   * Export report as PDF
   * GET /costs/reports/:reportId/export
   */
  async exportReport(reportId) {
    const response = await apiClient.get(`/costs/reports/${reportId}/export`, {
      responseType: 'blob',
    });
    return response;
  }
}

export default new CostService();
