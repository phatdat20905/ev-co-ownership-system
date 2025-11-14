import apiClient from '../lib/api/client.js';

/**
 * Group Service
 */
class GroupService {
  /**
   * Create new group
   */
  async createGroup(groupData) {
    return await apiClient.post('/user', groupData);
  }

  /**
   * Get all groups for current user
   */
  async getUserGroups() {
    return await apiClient.get('/user');
  }

  /**
   * Get group by ID
   */
  async getGroupById(groupId) {
    return await apiClient.get(`/user/${groupId}`);
  }

  /**
   * Update group
   */
  async updateGroup(groupId, groupData) {
    return await apiClient.put(`/user/${groupId}`, groupData);
  }

  /**
   * Delete group
   */
  async deleteGroup(groupId) {
    return await apiClient.delete(`/user/${groupId}`);
  }

  /**
   * Get group members
   */
  async getGroupMembers(groupId) {
    return await apiClient.get(`/user/${groupId}/members`);
  }

  /**
   * Add member to group
   */
  async addMember(groupId, memberData) {
    return await apiClient.post(`/user/${groupId}/members`, memberData);
  }

  /**
   * Remove member from group
   */
  async removeMember(groupId, userId) {
    return await apiClient.delete(`/user/${groupId}/members/${userId}`);
  }

  /**
   * Update member ownership percentage
   */
  async updateOwnership(groupId, userId, ownershipData) {
    return await apiClient.put(`/user/${groupId}/members/${userId}/ownership`, ownershipData);
  }
}

export default new GroupService();
