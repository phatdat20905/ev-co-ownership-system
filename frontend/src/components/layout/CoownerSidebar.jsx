import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  DollarSign, 
  History, 
  Vote, 
  FileText, 
  Car,
  User,
  Home
} from 'lucide-react';

export default function CoownerSidebar() {
  const location = useLocation();

  const menuItems = [
    {
      title: 'Tổng quan',
      items: [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/coowner', exact: true },
      ]
    },
    {
      title: 'Quản lý',
      items: [
        { name: 'Quyền sở hữu', icon: Users, path: '/coowner/ownership' },
        { name: 'Xe của tôi', icon: Car, path: '/coowner/vehicles' },
      ]
    },
    {
      title: 'Hoạt động',
      items: [
        { name: 'Đặt lịch', icon: Calendar, path: '/coowner/booking' },
        { name: 'Lịch sử sử dụng', icon: History, path: '/coowner/history' },
      ]
    },
    {
      title: 'Tài chính',
      items: [
        { name: 'Chi phí', icon: DollarSign, path: '/coowner/financial' },
        { name: 'Hợp đồng', icon: FileText, path: '/coowner/contracts' },
      ]
    },
    {
      title: 'Nhóm',
      items: [
        { name: 'Thành viên', icon: Users, path: '/coowner/group' },
        { name: 'Bỏ phiếu', icon: Vote, path: '/coowner/group/voting' },
      ]
    },
    {
      title: 'Cá nhân',
      items: [
        { name: 'Tài khoản', icon: User, path: '/coowner/account' },
      ]
    }
  ];

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="w-64 bg-white shadow-lg min-h-screen sticky top-20 overflow-y-auto">
      <div className="p-6">
        <Link 
          to="/"
          className="flex items-center gap-2 mb-8 text-blue-600 hover:text-blue-700 transition-colors"
        >
          <Home className="w-5 h-5" />
          <span className="font-semibold">Trang chủ</span>
        </Link>

        <nav className="space-y-6">
          {menuItems.map((section, idx) => (
            <div key={idx}>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {section.title}
              </h3>
              <ul className="space-y-1">
                {section.items.map((item, itemIdx) => {
                  const Icon = item.icon;
                  const active = isActive(item.path, item.exact);
                  
                  return (
                    <li key={itemIdx}>
                      <Link
                        to={item.path}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                          active
                            ? 'bg-blue-50 text-blue-600 font-semibold shadow-sm'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${active ? 'text-blue-600' : 'text-gray-500'}`} />
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}
