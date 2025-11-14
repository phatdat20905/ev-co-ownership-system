import { useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';
import { useUserStore } from '../../stores/useUserStore';
import {
  LayoutDashboard,
  Users,
  Car,
  FileText,
  DollarSign,
  AlertTriangle,
  ShieldCheck,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);
  const currentUser = useUserStore((state) => state.currentUser);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard
    },
    {
      name: 'Quản lý nhóm',
      href: '/admin/groups',
      icon: Users
    },
    {
      name: 'Quản lý xe',
      href: '/admin/vehicles',
      icon: Car
    },
    {
      name: 'Báo cáo',
      href: '/admin/reports',
      icon: FileText
    },
    {
      name: 'Quản lý nhân viên',
      href: '/admin/staff',
      icon: ShieldCheck
    },
    {
      name: 'Tranh chấp',
      href: '/admin/disputes',
      icon: AlertTriangle
    },
    {
      name: 'Xác thực KYC',
      href: '/admin/kyc',
      icon: ShieldCheck
    },
    {
      name: 'Cài đặt',
      href: '/admin/settings',
      icon: Settings
    }
  ];

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 bg-gray-800">
            <Link to="/admin/dashboard" className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Admin</h1>
                <p className="text-xs text-gray-400">EV Co-ownership</p>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    active
                      ? 'bg-amber-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-800">
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <div className="h-10 w-10 bg-amber-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-white">
                    {currentUser?.name?.charAt(0) || 'A'}
                  </span>
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-white">
                    {currentUser?.name || 'Admin User'}
                  </p>
                  <p className="text-xs text-gray-400">Quản trị viên</p>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-gray-400 transition-transform ${
                    profileOpen ? 'transform rotate-180' : ''
                  }`}
                />
              </button>

              {/* Profile Dropdown */}
              {profileOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                  <button
                    onClick={() => {
                      navigate('/admin/profile');
                      setProfileOpen(false);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-700 transition-colors text-gray-300"
                  >
                    <Settings className="h-4 w-4" />
                    <span className="text-sm">Cài đặt</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-700 transition-colors text-red-400"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="text-sm">Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-600 hover:text-gray-900"
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex items-center gap-4 ml-auto">
              <Link
                to="/"
                className="text-sm text-gray-600 hover:text-sky-600 transition-colors"
              >
                ← Về trang chủ
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
