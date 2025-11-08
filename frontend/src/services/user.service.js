// src/services/user.service.js
import apiClient from './api/interceptors.js';

/**
 * User Service
 * Handles user profile and group management API calls
 */
class UserService {
  /**
   * Get current user profile
   * GET /user/profile
   */
  async getProfile() {
    const response = await apiClient.get('/user/profile');
    
    // Update localStorage with latest profile data
    if (response.success && response.data) {
      const currentUser = JSON.parse(localStorage.getItem('userData') || '{}');
      const updatedUser = { ...currentUser, ...response.data };
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('storage'));
    }
    
    return response;
  }

  /**
   * Update user profile
   * PUT /user/profile
   */
  async updateProfile(profileData) {
    const response = await apiClient.put('/user/profile', profileData);
    
    // Update localStorage
    if (response.success && response.data) {
      localStorage.setItem('userData', JSON.stringify(response.data));
      window.dispatchEvent(new Event('storage'));
    }
    
    return response;
  }

  /**
   * Get user by ID
   * GET /user/:userId
   */
  async getUserById(userId) {
    const response = await apiClient.get(`/user/${userId}`);
    return response;
  }

  // ==================== GROUP MANAGEMENT ====================

  /**
   * Get all groups for current user
   * GET /user/groups
   */
  async getUserGroups() {
    const response = await apiClient.get('/user/groups');
    return response;
  }

  /**
   * Create new group
   * POST /user/groups
   */
  async createGroup(groupData) {
    const response = await apiClient.post('/user/groups', groupData);
    return response;
  }

  /**
   * Get group by ID
   * GET /user/groups/:groupId
   */
  async getGroupById(groupId) {
    const response = await apiClient.get(`/user/groups/${groupId}`);
    return response;
  }

  /**
   * Update group
   * PUT /user/groups/:groupId
   */
  async updateGroup(groupId, groupData) {
    const response = await apiClient.put(`/user/groups/${groupId}`, groupData);
    return response;
  }

  /**
   * Delete group
   * DELETE /user/groups/:groupId
   */
  async deleteGroup(groupId) {
    const response = await apiClient.delete(`/user/groups/${groupId}`);
    return response;
  }

  // ==================== GROUP MEMBERS ====================

  /**
   * Get group members
   * GET /user/groups/:groupId/members
   */
  async getGroupMembers(groupId) {
    const response = await apiClient.get(`/user/groups/${groupId}/members`);
    return response;
  }

  /**
   * Add member to group
   * POST /user/groups/:groupId/members
   */
  async addGroupMember(groupId, memberData) {
    const response = await apiClient.post(`/user/groups/${groupId}/members`, memberData);
    return response;
  }

  /**
   * Remove member from group
   * DELETE /user/groups/:groupId/members/:userId
   */
  async removeGroupMember(groupId, userId) {
    const response = await apiClient.delete(`/user/groups/${groupId}/members/${userId}`);
    return response;
  }

  /**
   * Update member ownership percentage
   * PUT /user/groups/:groupId/members/:userId/ownership
   */
  async updateMemberOwnership(groupId, userId, ownershipData) {
    const response = await apiClient.put(
      `/user/groups/${groupId}/members/${userId}/ownership`,
      ownershipData
    );
    return response;
  }

  // ==================== VOTING ====================

  /**
   * Get votes for a group
   * GET /user/votes?groupId=:groupId
   */
  async getGroupVotes(groupId, status = null) {
    const params = { groupId };
    if (status) params.status = status;
    
    const response = await apiClient.get('/user/votes', { params });
    return response;
  }

  /**
   * Create new vote
   * POST /user/votes
   */
  async createVote(voteData) {
    const response = await apiClient.post('/user/votes', voteData);
    return response;
  }

  /**
   * Get vote by ID
   * GET /user/votes/:voteId
   */
  async getVoteById(voteId) {
    const response = await apiClient.get(`/user/votes/${voteId}`);
    return response;
  }

  /**
   * Cast a vote
   * POST /user/votes/:voteId/cast
   */
  async castVote(voteId, voteChoice) {
    const response = await apiClient.post(`/user/votes/${voteId}/cast`, { choice: voteChoice });
    return response;
  }

  /**
   * Close a vote
   * POST /user/votes/:voteId/close
   */
  async closeVote(voteId) {
    const response = await apiClient.post(`/user/votes/${voteId}/close`);
    return response;
  }

  // ==================== COMMON FUND ====================

  /**
   * Get group fund details
   * GET /user/fund/:groupId
   */
  async getGroupFund(groupId) {
    const response = await apiClient.get(`/user/fund/${groupId}`);
    return response;
  }

  /**
   * Get fund transactions
   * GET /user/fund/:groupId/transactions
   */
  async getFundTransactions(groupId, params = {}) {
    const response = await apiClient.get(`/user/fund/${groupId}/transactions`, { params });
    return response;
  }

  /**
   * Add fund contribution
   * POST /user/fund/:groupId/contribute
   */
  async contributeFund(groupId, amount, description) {
    const response = await apiClient.post(`/user/fund/${groupId}/contribute`, {
      amount,
      description,
    });
    return response;
  }

  /**
   * Request fund withdrawal
   * POST /user/fund/:groupId/withdraw
   */
  async requestWithdrawal(groupId, amount, reason) {
    const response = await apiClient.post(`/user/fund/${groupId}/withdraw`, {
      amount,
      reason,
    });
    return response;
  }
}

export default new UserService();
