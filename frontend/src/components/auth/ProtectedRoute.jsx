import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import { useUserStore } from '../../stores/userStore';

export default function ProtectedRoute({ allowedRoles = [] }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const user = useUserStore((state) => state.user);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
