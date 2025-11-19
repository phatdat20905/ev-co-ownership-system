import axios from './axios';

export const groupAPI = {
  // Tạo nhóm mới
  createGroup: async (data) => {
    const response = await axios.post('/user/groups', data);
    return response.data;
  },

  // Lấy danh sách nhóm của user
  getUserGroups: async () => {
    const response = await axios.get('/user/groups');
    return response.data;
  },

  // Lấy thông tin nhóm theo ID
  getGroupById: async (groupId) => {
    const response = await axios.get(`/user/groups/${groupId}`);
    return response.data;
  },

  // Cập nhật thông tin nhóm
  updateGroup: async (groupId, data) => {
    const response = await axios.put(`/user/groups/${groupId}`, data);
    return response.data;
  },

  // Xóa nhóm
  deleteGroup: async (groupId) => {
    const response = await axios.delete(`/user/groups/${groupId}`);
    return response.data;
  },

  // Thêm thành viên vào nhóm
  addMember: async (groupId, data) => {
    const response = await axios.post(`/user/groups/${groupId}/members`, data);
    return response.data;
  },

  // Mời thành viên (alias for addMember)
  inviteMember: async (groupId, data) => {
    return groupAPI.addMember(groupId, data);
  },

  // Lấy danh sách thành viên
  getGroupMembers: async (groupId) => {
    const response = await axios.get(`/user/groups/${groupId}/members`);
    return response.data;
  },

  // Xóa thành viên
  removeMember: async (groupId, userId) => {
    const response = await axios.delete(`/user/groups/${groupId}/members/${userId}`);
    return response.data;
  },

  // Cập nhật tỷ lệ sở hữu
  updateOwnership: async (groupId, userId, ownershipPercentage) => {
    const response = await axios.put(`/user/groups/${groupId}/members/${userId}/ownership`, {
      ownershipPercentage,
    });
    return response.data;
  },

  // Cập nhật vai trò thành viên
  updateMemberRole: async (groupId, userId, role) => {
    const response = await axios.put(`/user/groups/${groupId}/members/${userId}/role`, {
      role,
    });
    return response.data;
  },

  // Cập nhật quy định nhóm
  updateGroupRules: async (groupId, rules) => {
    const response = await axios.put(`/user/groups/${groupId}/rules`, {
      rules,
    });
    return response.data;
  },

  // Quỹ chung - Nạp tiền
  depositFund: async (groupId, amount, description) => {
    const response = await axios.post(`/user/fund/${groupId}/deposit`, {
      amount,
      description,
    });
    return response.data;
  },

  // Quỹ chung - Rút tiền
  withdrawFund: async (groupId, amount, description) => {
    const response = await axios.post(`/user/fund/${groupId}/withdraw`, {
      amount,
      description,
    });
    return response.data;
  },

  // Quỹ chung - Lấy số dư
  getFundBalance: async (groupId) => {
    const response = await axios.get(`/user/fund/${groupId}/balance`);
    return response.data;
  },

  // Quỹ chung - Lấy lịch sử giao dịch
  getFundTransactions: async (groupId) => {
    const response = await axios.get(`/user/fund/${groupId}/transactions`);
    return response.data;
  },

  // Quỹ chung - Lấy tổng quan (summary)
  getFundSummary: async (groupId) => {
    const response = await axios.get(`/user/fund/${groupId}/summary`);
    return response.data;
  },

  // Bỏ phiếu - Tạo vote mới
  createVote: async (data) => {
    const response = await axios.post(`/user/votes/`, data);
    return response.data;
  },

  // Bỏ phiếu - Lấy danh sách votes của group
  getVotes: async (groupId) => {
    const response = await axios.get(`/user/votes/group/${groupId}`);
    return response.data;
  },

  // Bỏ phiếu - Lấy chi tiết vote
  getVoteById: async (voteId) => {
    const response = await axios.get(`/user/votes/${voteId}`);
    return response.data;
  },

  // Bỏ phiếu - Cast vote
  castVote: async (voteId, optionId) => {
    const response = await axios.post(`/user/votes/${voteId}/cast`, { optionId });
    return response.data;
  },

  // Bỏ phiếu - Đóng vote
  closeVote: async (voteId) => {
    const response = await axios.put(`/user/votes/${voteId}/close`);
    return response.data;
  },
};
