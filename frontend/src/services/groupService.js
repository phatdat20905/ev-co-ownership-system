import apiClient from './api/interceptors.js';

/**
 * Group Service
 */
class GroupService {
  /**
   * Create new group
   */
  async createGroup(groupData) {
    return await apiClient.post('/user/groups', groupData);
  }

  /**
   * Get all groups for current user
   */
  async getUserGroups() {
    return await apiClient.get('/user/groups');
  }

  /**
   * Get group by ID
   */
  async getGroupById(groupId) {
    return await apiClient.get(`/user/groups/${groupId}`);
  }

  /**
   * Update group
   */
  async updateGroup(groupId, groupData) {
    return await apiClient.put(`/user/groups/${groupId}`, groupData);
  }

  /**
   * Delete group
   */
  async deleteGroup(groupId) {
    return await apiClient.delete(`/user/groups/${groupId}`);
  }

  /**
   * Get group members
   */
  async getGroupMembers(groupId) {
    return await apiClient.get(`/user/groups/${groupId}/members`);
  }

  /**
   * Add member to group
   */
  async addMember(groupId, memberData) {
    return await apiClient.post(`/user/groups/${groupId}/members`, memberData);
  }

  /**
   * Remove member from group
   */
  async removeMember(groupId, userId) {
    return await apiClient.delete(`/user/groups/${groupId}/members/${userId}`);
  }

  /**
   * Update member ownership percentage
   */
  async updateOwnership(groupId, userId, ownershipData) {
    return await apiClient.put(`/user/groups/${groupId}/members/${userId}/ownership`, ownershipData);
  }
}

export default new GroupService();
