import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Auth store: token, expires, and basic methods
export const useAuthStore = create(persist(
  (set, get) => ({
    token: null,
    expires: null,
    setToken: (token, expires) => set({ token, expires }),
    clearToken: () => set({ token: null, expires: null }),
    isAuthenticated: () => {
      const { token, expires } = get();
      if (!token) return false;
      if (!expires) return true;
      return new Date() < new Date(expires);
    }
  }),
  {
    name: 'auth-storage'
  }
));
