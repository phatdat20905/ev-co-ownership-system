import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';

/**
 * Hook để bảo vệ các routes yêu cầu đăng nhập
 * @param {Array<string>} allowedRoles - Danh sách roles được phép truy cập
 */
export const useAuth = (allowedRoles = []) => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
      // Redirect về trang phù hợp với role
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'staff') {
        navigate('/staff');
      } else {
        navigate('/dashboard/coowner');
      }
    }
  }, [isAuthenticated, user, allowedRoles, navigate]);

  return { user, isAuthenticated };
};
