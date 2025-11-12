// src/stores/useGroupStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useGroupStore = create(
  persist(
    (set, get) => ({
      // State
      groups: [],
      currentGroup: null,
      groupMembers: [],
      loading: false,
      error: null,

      // Actions
      setGroups: (groups) => set({ groups }),
      
      setCurrentGroup: (group) => set({ currentGroup: group }),
      
      setGroupMembers: (members) => set({ groupMembers: members }),
      
      addGroup: (group) => set((state) => ({
        groups: [...state.groups, group]
      })),
      
      updateGroup: (groupId, updates) => set((state) => ({
        groups: state.groups.map(g => 
          g.id === groupId ? { ...g, ...updates } : g
        ),
        currentGroup: state.currentGroup?.id === groupId 
          ? { ...state.currentGroup, ...updates }
          : state.currentGroup
      })),
      
      removeGroup: (groupId) => set((state) => ({
        groups: state.groups.filter(g => g.id !== groupId),
        currentGroup: state.currentGroup?.id === groupId ? null : state.currentGroup
      })),
      
      addMember: (member) => set((state) => ({
        groupMembers: [...state.groupMembers, member]
      })),
      
      updateMember: (userId, updates) => set((state) => ({
        groupMembers: state.groupMembers.map(m =>
          m.userId === userId ? { ...m, ...updates } : m
        )
      })),
      
      removeMember: (userId) => set((state) => ({
        groupMembers: state.groupMembers.filter(m => m.userId !== userId)
      })),
      
      setLoading: (loading) => set({ loading }),
      
      setError: (error) => set({ error }),
      
      clearError: () => set({ error: null }),
      
      reset: () => set({
        groups: [],
        currentGroup: null,
        groupMembers: [],
        loading: false,
        error: null
      })
    }),
    {
      name: 'group-storage',
      partialize: (state) => ({
        groups: state.groups,
        currentGroup: state.currentGroup
      })
    }
  )
);
