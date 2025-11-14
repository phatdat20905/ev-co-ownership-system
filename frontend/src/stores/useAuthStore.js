import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import authService from '../services/authService';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      token: null,
      refreshToken: null,
      expires: null,
      isLoading: false,
      error: null,

      // Actions
      setToken: (token, refreshToken, expires) => {
        set({ 
          token, 
          refreshToken, 
          expires: expires || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          error: null 
        });
      },

      clearToken: () => {
        set({ 
          token: null, 
          refreshToken: null, 
          expires: null, 
          error: null 
        });
      },

      isAuthenticated: () => {
        const { token, expires } = get();
        if (!token) return false;
        if (!expires) return true;
        return new Date() < new Date(expires);
      },

      // Login action
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login(credentials);
          if (response.success && response.data) {
            const { accessToken, token, refreshToken, user } = response.data;
            const authToken = accessToken || token;
            
            get().setToken(authToken, refreshToken);
            
            // Update user store
            const { setUser } = await import('./useUserStore');
            setUser.getState().setUser(user);
            
            set({ isLoading: false });
            return response;
          }
          throw new Error(response.message || 'Login failed');
        } catch (error) {
          set({ isLoading: false, error: error.message });
          throw error;
        }
      },

      // Logout action
      logout: async () => {
        set({ isLoading: true });
        try {
          await authService.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          get().clearToken();
          
          // Clear user store
          const { clearUser } = await import('./useUserStore');
          clearUser.getState().clearUser();
          
          set({ isLoading: false });
        }
      },

      // Register action
      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.register(userData);
          set({ isLoading: false });
          return response;
        } catch (error) {
          set({ isLoading: false, error: error.message });
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        expires: state.expires,
      }),
    }
  )
);
