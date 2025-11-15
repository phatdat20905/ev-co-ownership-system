import apiClient from './api/interceptors.js';

/**
 * Contract Service
 */
class ContractService {
  /**
   * Create new contract
   */
  async createContract(contractData) {
    return await apiClient.post('/contracts', contractData);
  }

  /**
   * Get user contracts
   */
  async getUserContracts() {
    return await apiClient.get('/contracts/user/me');
  }

  /**
   * Get contracts by group
   */
  async getContractsByGroup(groupId, params) {
    return await apiClient.get(`/contracts/group/${groupId}`, { params });
  }

  /**
   * Get contract by ID
   */
  async getContract(contractId) {
    return await apiClient.get(`/contracts/${contractId}`);
  }

  /**
   * Update contract
   */
  async updateContract(contractId, contractData) {
    return await apiClient.put(`/contracts/${contractId}`, contractData);
  }

  /**
   * Delete contract
   */
  async deleteContract(contractId) {
    return await apiClient.delete(`/contracts/${contractId}`);
  }

  /**
   * Send contract for signature
   */
  async sendForSignature(contractId) {
    return await apiClient.post(`/contracts/${contractId}/send-for-signature`);
  }

  /**
   * Download contract PDF
   */
  async downloadContractPDF(contractId) {
    return await apiClient.get(`/contracts/${contractId}/download`, {
      responseType: 'blob',
    });
  }
}

export default new ContractService();
