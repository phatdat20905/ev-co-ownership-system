import { useEffect } from 'react';
import { useAuthStore } from '../store';

/**
 * Hook để khởi tạo auth store từ localStorage khi app load
 */
export const useAuthInit = () => {
  const { initialize, isAuthenticated } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return { isAuthenticated };
};
