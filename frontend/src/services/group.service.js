// src/services/group.service.js
import apiClient from './api/interceptors.js';
import { useGroupStore } from '../stores/useGroupStore';

class GroupService {
  /**
   * Get all groups for current user
   */
  async getMyGroups() {
    const response = await apiClient.get('/user/groups');
    if (response.success) {
      useGroupStore.getState().setGroups(response.data);
    }
    return response;
  }

  /**
   * Get group by ID
   */
  async getGroup(groupId) {
    const response = await apiClient.get(`/user/groups/${groupId}`);
    if (response.success) {
      useGroupStore.getState().setCurrentGroup(response.data);
    }
    return response;
  }

  /**
   * Create new group
   */
  async createGroup(groupData) {
    const response = await apiClient.post('/user/groups', groupData);
    if (response.success) {
      useGroupStore.getState().addGroup(response.data);
    }
    return response;
  }

  /**
   * Update group
   */
  async updateGroup(groupId, updates) {
    const response = await apiClient.put(`/user/groups/${groupId}`, updates);
    if (response.success) {
      useGroupStore.getState().updateGroup(groupId, response.data);
    }
    return response;
  }

  /**
   * Delete group
   */
  async deleteGroup(groupId) {
    const response = await apiClient.delete(`/user/groups/${groupId}`);
    if (response.success) {
      useGroupStore.getState().removeGroup(groupId);
    }
    return response;
  }

  /**
   * Get group members
   */
  async getMembers(groupId) {
    const response = await apiClient.get(`/user/groups/${groupId}/members`);
    if (response.success) {
      useGroupStore.getState().setGroupMembers(response.data);
    }
    return response;
  }

  /**
   * Add member to group
   */
  async addMember(groupId, memberData) {
    const response = await apiClient.post(`/user/groups/${groupId}/members`, memberData);
    if (response.success) {
      useGroupStore.getState().addMember(response.data);
    }
    return response;
  }

  /**
   * Update member ownership
   */
  async updateMemberOwnership(groupId, userId, ownershipPercentage) {
    const response = await apiClient.put(`/user/groups/${groupId}/members/${userId}/ownership`, {
      ownershipPercentage
    });
    if (response.success) {
      useGroupStore.getState().updateMember(userId, { ownershipPercentage });
    }
    return response;
  }

  /**
   * Update member role
   */
  async updateMemberRole(groupId, userId, role) {
    const response = await apiClient.put(`/user/groups/${groupId}/members/${userId}/role`, { role });
    if (response.success) {
      useGroupStore.getState().updateMember(userId, { role });
    }
    return response;
  }

  /**
   * Remove member from group
   */
  async removeMember(groupId, userId) {
    const response = await apiClient.delete(`/user/groups/${groupId}/members/${userId}`);
    if (response.success) {
      useGroupStore.getState().removeMember(userId);
    }
    return response;
  }

  /**
   * Leave group
   */
  async leaveGroup(groupId) {
    const response = await apiClient.post(`/user/groups/${groupId}/leave`);
    if (response.success) {
      useGroupStore.getState().removeGroup(groupId);
    }
    return response;
  }

  /**
   * Get group statistics
   */
  async getGroupStats(groupId) {
    const response = await apiClient.get(`/user/groups/${groupId}/stats`);
    return response;
  }

  /**
   * Get group fund transactions
   */
  async getFundTransactions(groupId, params = {}) {
    const response = await apiClient.get(`/user/fund/${groupId}/transactions`, { params });
    return response;
  }

  /**
   * Deposit to group fund
   */
  async depositToFund(groupId, amount, description) {
    const response = await apiClient.post(`/user/fund/${groupId}/deposit`, {
      amount,
      description
    });
    return response;
  }

  /**
   * Withdraw from group fund
   */
  async withdrawFromFund(groupId, amount, description, purpose) {
    const response = await apiClient.post(`/user/fund/${groupId}/withdraw`, {
      amount,
      description,
      purpose
    });
    return response;
  }

  /**
   * Get fund balance
   */
  async getFundBalance(groupId) {
    const response = await apiClient.get(`/user/fund/${groupId}/balance`);
    return response;
  }
}

export default new GroupService();
