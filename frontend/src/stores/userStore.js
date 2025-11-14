import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import userService from '../services/userService';

export const useUserStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      profile: null,
      isLoading: false,
      error: null,

      // Actions
      setUser: (user) => {
        set({ user, error: null });
      },

      clearUser: () => {
        set({ user: null, profile: null, error: null });
      },

      // Fetch current user profile
      fetchProfile: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await userService.getProfile();
          if (response.success && response.data) {
            set({ profile: response.data, user: response.data, isLoading: false });
            return response.data;
          }
          throw new Error(response.message || 'Failed to fetch profile');
        } catch (error) {
          set({ isLoading: false, error: error.message });
          throw error;
        }
      },

      // Update profile
      updateProfile: async (profileData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await userService.updateProfile(profileData);
          if (response.success && response.data) {
            set({ profile: response.data, user: response.data, isLoading: false });
            return response.data;
          }
          throw new Error(response.message || 'Failed to update profile');
        } catch (error) {
          set({ isLoading: false, error: error.message });
          throw error;
        }
      },

      // Upload avatar
      uploadAvatar: async (file) => {
        set({ isLoading: true, error: null });
        try {
          const formData = new FormData();
          formData.append('avatar', file);
          
          const response = await userService.uploadAvatar(formData);
          if (response.success && response.data) {
            set((state) => ({
              profile: { ...state.profile, avatar: response.data.avatarUrl },
              user: { ...state.user, avatar: response.data.avatarUrl },
              isLoading: false,
            }));
            return response.data;
          }
          throw new Error(response.message || 'Failed to upload avatar');
        } catch (error) {
          set({ isLoading: false, error: error.message });
          throw error;
        }
      },
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
      }),
    }
  )
);
