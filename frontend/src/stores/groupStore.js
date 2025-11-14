import { create } from 'zustand';
import groupService from '../services/groupService';

export const useGroupStore = create((set, get) => ({
  // State
  groups: [],
  currentGroup: null,
  members: [],
  isLoading: false,
  error: null,

  // Actions
  setGroups: (groups) => {
    set({ groups, error: null });
  },

  setCurrentGroup: (group) => {
    set({ currentGroup: group, error: null });
  },

  // Fetch user groups
  fetchUserGroups: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await groupService.getUserGroups();
      if (response.success && response.data) {
        set({ groups: response.data, isLoading: false });
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch groups');
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Fetch group by ID
  fetchGroupById: async (groupId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await groupService.getGroupById(groupId);
      if (response.success && response.data) {
        set({ currentGroup: response.data, isLoading: false });
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch group');
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Create group
  createGroup: async (groupData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await groupService.createGroup(groupData);
      if (response.success && response.data) {
        set((state) => ({
          groups: [...state.groups, response.data],
          isLoading: false,
        }));
        return response.data;
      }
      throw new Error(response.message || 'Failed to create group');
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Update group
  updateGroup: async (groupId, groupData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await groupService.updateGroup(groupId, groupData);
      if (response.success && response.data) {
        set((state) => ({
          groups: state.groups.map((g) => (g.id === groupId ? response.data : g)),
          currentGroup: state.currentGroup?.id === groupId ? response.data : state.currentGroup,
          isLoading: false,
        }));
        return response.data;
      }
      throw new Error(response.message || 'Failed to update group');
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Delete group
  deleteGroup: async (groupId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await groupService.deleteGroup(groupId);
      if (response.success) {
        set((state) => ({
          groups: state.groups.filter((g) => g.id !== groupId),
          currentGroup: state.currentGroup?.id === groupId ? null : state.currentGroup,
          isLoading: false,
        }));
        return response;
      }
      throw new Error(response.message || 'Failed to delete group');
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Fetch group members
  fetchGroupMembers: async (groupId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await groupService.getGroupMembers(groupId);
      if (response.success && response.data) {
        set({ members: response.data, isLoading: false });
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch members');
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Add member
  addMember: async (groupId, memberData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await groupService.addMember(groupId, memberData);
      if (response.success && response.data) {
        set((state) => ({
          members: [...state.members, response.data],
          isLoading: false,
        }));
        return response.data;
      }
      throw new Error(response.message || 'Failed to add member');
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Remove member
  removeMember: async (groupId, userId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await groupService.removeMember(groupId, userId);
      if (response.success) {
        set((state) => ({
          members: state.members.filter((m) => m.userId !== userId),
          isLoading: false,
        }));
        return response;
      }
      throw new Error(response.message || 'Failed to remove member');
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Update ownership
  updateOwnership: async (groupId, userId, ownershipData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await groupService.updateOwnership(groupId, userId, ownershipData);
      if (response.success && response.data) {
        set((state) => ({
          members: state.members.map((m) =>
            m.userId === userId ? { ...m, ...response.data } : m
          ),
          isLoading: false,
        }));
        return response.data;
      }
      throw new Error(response.message || 'Failed to update ownership');
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },
}));
