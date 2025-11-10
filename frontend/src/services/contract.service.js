// src/services/contract.service.js
import apiClient from './api/interceptors.js';

/**
 * Contract Service
 * Handles contract management, signatures, and documents API calls
 */
class ContractService {
  // ==================== CONTRACT MANAGEMENT ====================

  /**
   * Create new contract
   * POST /contracts
   */
  async createContract(contractData) {
    const response = await apiClient.post('/contracts', contractData);
    return response;
  }

  /**
   * Get contracts by group
   * GET /contracts/group/:groupId
   */
  async getContractsByGroup(groupId, params = {}) {
    const response = await apiClient.get(`/contracts/group/${groupId}`, { params });
    return response;
  }

  /**
   * Get current user's contracts
   * GET /contracts/user/me
   */
  async getUserContracts(params = {}) {
    const response = await apiClient.get('/contracts/user/me', { params });
    return response;
  }

  /**
   * Get contract by ID
   * GET /contracts/:contractId
   */
  async getContract(contractId) {
    const response = await apiClient.get(`/contracts/${contractId}`);
    return response;
  }

  /**
   * Update contract
   * PUT /contracts/:contractId
   */
  async updateContract(contractId, contractData) {
    const response = await apiClient.put(`/contracts/${contractId}`, contractData);
    return response;
  }

  /**
   * Delete contract
   * DELETE /contracts/:contractId
   */
  async deleteContract(contractId) {
    const response = await apiClient.delete(`/contracts/${contractId}`);
    return response;
  }

  /**
   * Send contract for signature
   * POST /contracts/:contractId/send-for-signature
   */
  async sendForSignature(contractId) {
    const response = await apiClient.post(`/contracts/${contractId}/send-for-signature`);
    return response;
  }

  /**
   * Download contract PDF
   * GET /contracts/:contractId/download
   */
  async downloadContractPDF(contractId) {
    const response = await apiClient.get(`/contracts/${contractId}/download`, {
      responseType: 'blob',
    });
    return response;
  }

  // ==================== SIGNATURES ====================

  /**
   * Get pending signatures
   * GET /contracts/signatures/pending
   */
  async getPendingSignatures() {
    const response = await apiClient.get('/contracts/signatures/pending');
    return response;
  }

  /**
   * Sign contract
   * POST /contracts/signatures/:contractId/sign
   */
  async signContract(contractId, signatureData) {
    const response = await apiClient.post(`/contracts/signatures/${contractId}/sign`, signatureData);
    return response;
  }

  /**
   * Get signature status
   * GET /contracts/signatures/:contractId/status
   */
  async getSignatureStatus(contractId) {
    const response = await apiClient.get(`/contracts/signatures/${contractId}/status`);
    return response;
  }

  /**
   * Verify signature
   * POST /contracts/signatures/:signatureId/verify
   */
  async verifySignature(signatureId) {
    const response = await apiClient.post(`/contracts/signatures/${signatureId}/verify`);
    return response;
  }

  // ==================== PARTIES ====================

  /**
   * Add party to contract
   * POST /contracts/parties/:contractId/add
   */
  async addParty(contractId, partyData) {
    const response = await apiClient.post(`/contracts/parties/${contractId}/add`, partyData);
    return response;
  }

  /**
   * Remove party from contract
   * DELETE /contracts/parties/:contractId/:partyId
   */
  async removeParty(contractId, partyId) {
    const response = await apiClient.delete(`/contracts/parties/${contractId}/${partyId}`);
    return response;
  }

  /**
   * Update party information
   * PUT /contracts/parties/:contractId/:partyId
   */
  async updateParty(contractId, partyId, partyData) {
    const response = await apiClient.put(`/contracts/parties/${contractId}/${partyId}`, partyData);
    return response;
  }

  // ==================== DOCUMENTS ====================

  /**
   * Upload contract document
   * POST /contracts/documents/:contractId/upload
   */
  async uploadDocument(contractId, formData) {
    const response = await apiClient.post(`/contracts/documents/${contractId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  }

  /**
   * Get contract documents
   * GET /contracts/documents/:contractId
   */
  async getDocuments(contractId) {
    const response = await apiClient.get(`/contracts/documents/${contractId}`);
    return response;
  }

  /**
   * Download document
   * GET /contracts/documents/:documentId/download
   */
  async downloadDocument(documentId) {
    const response = await apiClient.get(`/contracts/documents/${documentId}/download`, {
      responseType: 'blob',
    });
    return response;
  }

  /**
   * Delete document
   * DELETE /contracts/documents/:documentId
   */
  async deleteDocument(documentId) {
    const response = await apiClient.delete(`/contracts/documents/${documentId}`);
    return response;
  }

  // ==================== AMENDMENTS ====================

  /**
   * Create contract amendment
   * POST /contracts/amendments/:contractId/create
   */
  async createAmendment(contractId, amendmentData) {
    const response = await apiClient.post(
      `/contracts/amendments/${contractId}/create`,
      amendmentData
    );
    return response;
  }

  /**
   * Get contract amendments
   * GET /contracts/amendments/:contractId
   */
  async getAmendments(contractId) {
    const response = await apiClient.get(`/contracts/amendments/${contractId}`);
    return response;
  }

  /**
   * Approve amendment
   * POST /contracts/amendments/:amendmentId/approve
   */
  async approveAmendment(amendmentId) {
    const response = await apiClient.post(`/contracts/amendments/${amendmentId}/approve`);
    return response;
  }

  /**
   * Reject amendment
   * POST /contracts/amendments/:amendmentId/reject
   */
  async rejectAmendment(amendmentId, reason) {
    const response = await apiClient.post(`/contracts/amendments/${amendmentId}/reject`, { reason });
    return response;
  }

  // ==================== TEMPLATES ====================

  /**
   * Get contract templates
   * GET /contracts/templates
   */
  async getTemplates(params = {}) {
    const response = await apiClient.get('/contracts/templates', { params });
    return response;
  }

  /**
   * Get template by ID
   * GET /contracts/templates/:templateId
   */
  async getTemplate(templateId) {
    const response = await apiClient.get(`/contracts/templates/${templateId}`);
    return response;
  }

  /**
   * Create contract from template
   * POST /contracts/templates/:templateId/create-contract
   */
  async createFromTemplate(templateId, contractData) {
    const response = await apiClient.post(
      `/contracts/templates/${templateId}/create-contract`,
      contractData
    );
    return response;
  }
}

export default new ContractService();
