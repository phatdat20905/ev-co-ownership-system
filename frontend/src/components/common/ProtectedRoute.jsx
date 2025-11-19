import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store';
import { Loader2 } from 'lucide-react';

/**
 * ProtectedRoute Component
 * Protects routes based on authentication and user roles
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render if authorized
 * @param {string[]} props.allowedRoles - Array of roles allowed to access this route (optional)
 * @param {boolean} props.requireAuth - Whether authentication is required (default: true)
 */
export default function ProtectedRoute({ children, allowedRoles = [], requireAuth = true }) {
  const { isAuthenticated, user, isInitializing } = useAuthStore();
  const location = useLocation();

  // Show loading spinner while checking auth state
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-white to-sky-100">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 text-sky-500 animate-spin" />
          <p className="text-gray-600 text-lg">Đang xác thực...</p>
        </div>
      </div>
    );
  }

  // Check if authentication is required
  if (requireAuth && !isAuthenticated) {
    // Redirect to login page, save the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has the required role (normalize roles to handle 'co_owner' vs 'co-owner')
  if (allowedRoles.length > 0 && user) {
    const normalize = (r) => (r || '').toString().replace(/_/g, '-').toLowerCase();
    const normalizedUserRole = normalize(user.role);
    const normalizedAllowed = allowedRoles.map(normalize);

    const hasRequiredRole = normalizedAllowed.includes(normalizedUserRole);

    if (!hasRequiredRole) {
      // Redirect based on user's actual role (use app's real paths)
      const redirectMap = {
        admin: '/admin',
        staff: '/staff',
        'co-owner': '/dashboard/coowner'
      };

      const redirectPath = redirectMap[normalizedUserRole] || '/';
      return <Navigate to={redirectPath} replace />;
    }
  }

  // User is authenticated and authorized
  return children;
}
