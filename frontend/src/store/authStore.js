import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI, userAPI } from '../api';
import { socketClient } from '../services/socketClient';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      refreshToken: null,
      activeGroup: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.login(credentials);
          const { user, accessToken, refreshToken } = response.data;

          // Persist tokens immediately
          localStorage.setItem('authToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);

          // Try to fetch user profile from user-service and merge
          let mergedUser = user;
          let activeGroup = null;
          try {
            const [profileResp, groupResp] = await Promise.allSettled([
              userAPI.getProfile(),
              userAPI.getActiveGroup()
            ]);
            
            if (profileResp.status === 'fulfilled') {
              const profile = profileResp.value.data || profileResp.value;
              mergedUser = { ...user, profile, name: profile.fullName || user.name };
            }
            
            if (groupResp.status === 'fulfilled') {
              activeGroup = groupResp.value.data;
              localStorage.setItem('activeGroup', JSON.stringify(activeGroup));
            }
          } catch (err) {
            // If profile/group fetch fails, still continue with auth user
            console.warn('Failed to fetch user profile/group after login', err?.message || err);
            mergedUser = { ...user };
          }

          // Lưu user merged vào localStorage
          localStorage.setItem('userData', JSON.stringify(mergedUser));

          // Connect to Socket.io for real-time updates
          try {
            socketClient.connect(accessToken);
          } catch (err) {
            console.warn('Failed to connect socket', err);
          }

          set({
            user: mergedUser,
            token: accessToken,
            refreshToken,
            activeGroup,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return response;
        } catch (error) {
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Đăng nhập thất bại',
          });
          throw error;
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.register(data);
          set({ isLoading: false, error: null });
          return response;
        } catch (error) {
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Đăng ký thất bại',
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await authAPI.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          // Disconnect socket
          socketClient.disconnect();

          // Clear storage
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('userData');
          localStorage.removeItem('activeGroup');

          // Reset state
          set({
            user: null,
            token: null,
            refreshToken: null,
            activeGroup: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      refreshToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return false;

        try {
          const response = await authAPI.refreshToken(refreshToken);
          const { accessToken, refreshToken: newRefreshToken } = response.data;

          localStorage.setItem('authToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          set({
            token: accessToken,
            refreshToken: newRefreshToken,
          });

          return true;
        } catch (error) {
          get().logout();
          return false;
        }
      },

      updateUser: (userData) => {
        set({ user: userData });
        localStorage.setItem('userData', JSON.stringify(userData));
      },

      setError: (error) => set({ error }),

      clearError: () => set({ error: null }),

      // Initialize từ localStorage
      initialize: () => {
        const token = localStorage.getItem('authToken');
        const refreshToken = localStorage.getItem('refreshToken');
        const userData = localStorage.getItem('userData');
        const activeGroupData = localStorage.getItem('activeGroup');

        if (token && userData) {
          set({
            token,
            refreshToken,
            user: JSON.parse(userData),
            activeGroup: activeGroupData ? JSON.parse(activeGroupData) : null,
            isAuthenticated: true,
          });
        }
      },

      // Fetch and update active group
      fetchActiveGroup: async () => {
        try {
          const response = await userAPI.getActiveGroup();
          const activeGroup = response.data;
          
          localStorage.setItem('activeGroup', JSON.stringify(activeGroup));
          set({ activeGroup });
          
          return activeGroup;
        } catch (error) {
          console.error('Failed to fetch active group:', error);
          return null;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        activeGroup: state.activeGroup,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
