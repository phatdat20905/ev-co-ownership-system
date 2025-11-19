import { create } from 'zustand';
import { groupAPI } from '../api';

export const useGroupStore = create((set, get) => ({
  // State
  groups: [],
  currentGroup: null,
  members: [],
  fundBalance: 0,
  fundTransactions: [],
  votes: [],
  isLoading: false,
  error: null,

  // Actions - Groups
  fetchUserGroups: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await groupAPI.getUserGroups();
      set({ groups: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Lỗi tải danh sách nhóm',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchGroupById: async (groupId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await groupAPI.getGroupById(groupId);
      set({ currentGroup: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Lỗi tải thông tin nhóm',
        isLoading: false,
      });
      throw error;
    }
  },

  createGroup: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await groupAPI.createGroup(data);
      set((state) => ({
        groups: [...state.groups, response.data],
        isLoading: false,
      }));
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Lỗi tạo nhóm',
        isLoading: false,
      });
      throw error;
    }
  },

  updateGroup: async (groupId, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await groupAPI.updateGroup(groupId, data);
      set((state) => ({
        groups: state.groups.map((g) => (g.id === groupId ? response.data : g)),
        currentGroup: response.data,
        isLoading: false,
      }));
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Lỗi cập nhật nhóm',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteGroup: async (groupId) => {
    set({ isLoading: true, error: null });
    try {
      await groupAPI.deleteGroup(groupId);
      set((state) => ({
        groups: state.groups.filter((g) => g.id !== groupId),
        currentGroup: null,
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Lỗi xóa nhóm',
        isLoading: false,
      });
      throw error;
    }
  },

  // Actions - Members
  fetchGroupMembers: async (groupId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await groupAPI.getGroupMembers(groupId);
      set({ members: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Lỗi tải danh sách thành viên',
        isLoading: false,
      });
      throw error;
    }
  },

  addMember: async (groupId, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await groupAPI.addMember(groupId, data);
      set((state) => ({
        members: [...state.members, response.data],
        isLoading: false,
      }));
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Lỗi thêm thành viên',
        isLoading: false,
      });
      throw error;
    }
  },

  inviteMember: async (groupId, data) => {
    return useGroupStore.getState().addMember(groupId, data);
  },

  removeMember: async (groupId, userId) => {
    set({ isLoading: true, error: null });
    try {
      await groupAPI.removeMember(groupId, userId);
      set((state) => ({
        members: state.members.filter((m) => m.userId !== userId),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Lỗi xóa thành viên',
        isLoading: false,
      });
      throw error;
    }
  },

  updateOwnership: async (groupId, userId, ownershipPercentage) => {
    set({ isLoading: true, error: null });
    try {
      const response = await groupAPI.updateOwnership(groupId, userId, ownershipPercentage);
      set((state) => ({
        members: state.members.map((m) =>
          m.userId === userId ? { ...m, ownershipPercentage } : m
        ),
        isLoading: false,
      }));
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Lỗi cập nhật tỷ lệ sở hữu',
        isLoading: false,
      });
      throw error;
    }
  },

  updateMemberRole: async (groupId, userId, role) => {
    set({ isLoading: true, error: null });
    try {
      const response = await groupAPI.updateMemberRole(groupId, userId, role);
      set((state) => ({
        members: state.members.map((m) =>
          m.userId === userId ? { ...m, role } : m
        ),
        isLoading: false,
      }));
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Lỗi cập nhật vai trò thành viên',
        isLoading: false,
      });
      throw error;
    }
  },

  updateGroupRules: async (groupId, rules) => {
    set({ isLoading: true, error: null });
    try {
      const response = await groupAPI.updateGroupRules(groupId, rules);
      set((state) => ({
        currentGroup: state.currentGroup ? { ...state.currentGroup, groupRules: rules } : null,
        groups: state.groups.map((g) => 
          g.id === groupId ? { ...g, groupRules: rules } : g
        ),
        isLoading: false,
      }));
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Lỗi cập nhật quy định nhóm',
        isLoading: false,
      });
      throw error;
    }
  },

  // Actions - Fund
  fetchFundBalance: async (groupId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await groupAPI.getFundBalance(groupId);
      set({ fundBalance: response.data.balance, isLoading: false });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Lỗi tải số dư quỹ',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchFundTransactions: async (groupId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await groupAPI.getFundTransactions(groupId);
      set({ fundTransactions: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Lỗi tải lịch sử giao dịch',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchFundSummary: async (groupId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await groupAPI.getFundSummary(groupId);
      set({ 
        fundBalance: response.data.balance,
        fundTransactions: response.data.transactions,
        members: response.data.members,
        isLoading: false 
      });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Lỗi tải tổng quan quỹ',
        isLoading: false,
      });
      throw error;
    }
  },

  depositFund: async (groupId, amount, description) => {
    set({ isLoading: true, error: null });
    try {
      const response = await groupAPI.depositFund(groupId, amount, description);
      set((state) => ({
        fundBalance: state.fundBalance + amount,
        isLoading: false,
      }));
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Lỗi nạp tiền',
        isLoading: false,
      });
      throw error;
    }
  },

  withdrawFund: async (groupId, amount, description) => {
    set({ isLoading: true, error: null });
    try {
      const response = await groupAPI.withdrawFund(groupId, amount, description);
      set((state) => ({
        fundBalance: state.fundBalance - amount,
        isLoading: false,
      }));
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Lỗi rút tiền',
        isLoading: false,
      });
      throw error;
    }
  },

  // Actions - Votes
  fetchVotes: async (groupId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await groupAPI.getVotes(groupId);
      set({ votes: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Lỗi tải danh sách bỏ phiếu',
        isLoading: false,
      });
      throw error;
    }
  },

  // Vote actions
  fetchGroupVotes: async (groupId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await groupAPI.getVotes(groupId);
      set({
        votes: response.data || [],
        isLoading: false,
      });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Lỗi lấy danh sách vote',
        isLoading: false,
      });
      throw error;
    }
  },

  createVote: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await groupAPI.createVote(data);
      set((state) => ({
        votes: [response.data, ...state.votes],
        isLoading: false,
      }));
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Lỗi tạo bỏ phiếu',
        isLoading: false,
      });
      throw error;
    }
  },

  castVote: async (voteId, optionId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await groupAPI.castVote(voteId, optionId);
      // Refresh vote details after casting
      const voteResponse = await groupAPI.getVoteById(voteId);
      set((state) => ({
        votes: state.votes.map((v) => (v.id === voteId ? voteResponse.data : v)),
        isLoading: false,
      }));
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Lỗi bỏ phiếu',
        isLoading: false,
      });
      throw error;
    }
  },

  closeVote: async (voteId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await groupAPI.closeVote(voteId);
      set((state) => ({
        votes: state.votes.map((v) => (v.id === voteId ? response.data : v)),
        isLoading: false,
      }));
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Lỗi đóng vote',
        isLoading: false,
      });
      throw error;
    }
  },

  // Utility
  clearError: () => set({ error: null }),
  reset: () =>
    set({
      groups: [],
      currentGroup: null,
      members: [],
      fundBalance: 0,
      fundTransactions: [],
      votes: [],
      isLoading: false,
      error: null,
    }),
}));
