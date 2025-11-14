import { useEffect, useState } from 'react';
import { useAdminService } from '../../stores/useAdminStore';
import { 
  Users, Car, DollarSign, FileText, TrendingUp, 
  AlertTriangle, CheckCircle, Clock 
} from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalGroups: 0,
    totalVehicles: 0,
    totalRevenue: 0,
    activeBookings: 0,
    pendingDisputes: 0,
    pendingKYC: 0,
    systemHealth: 'good'
  });

  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // In real app, fetch from adminService
        // Mock data for now
        setStats({
          totalUsers: 1248,
          totalGroups: 87,
          totalVehicles: 156,
          totalRevenue: 245600000,
          activeBookings: 34,
          pendingDisputes: 3,
          pendingKYC: 12,
          systemHealth: 'good'
        });

        setRecentActivities([
          {
            id: 1,
            type: 'user',
            message: 'Nguyễn Văn A đã đăng ký tài khoản mới',
            time: '5 phút trước'
          },
          {
            id: 2,
            type: 'group',
            message: 'Nhóm "VinFast VF8 Hà Nội" đã được tạo',
            time: '15 phút trước'
          },
          {
            id: 3,
            type: 'dispute',
            message: 'Tranh chấp mới từ nhóm #45',
            time: '1 giờ trước'
          },
          {
            id: 4,
            type: 'kyc',
            message: 'Yêu cầu xác thực KYC từ user #234',
            time: '2 giờ trước'
          },
          {
            id: 5,
            type: 'vehicle',
            message: 'Xe VF9 - 30A-12345 cần bảo trì',
            time: '3 giờ trước'
          }
        ]);
      } catch (error) {
        console.error('Failed to load dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Tổng quan hệ thống EV Co-ownership
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Tổng người dùng"
          value={stats.totalUsers.toLocaleString()}
          icon={Users}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          trend="+12%"
        />
        <StatCard
          title="Tổng nhóm"
          value={stats.totalGroups.toLocaleString()}
          icon={Users}
          iconBg="bg-green-100"
          iconColor="text-green-600"
          trend="+8%"
        />
        <StatCard
          title="Tổng xe"
          value={stats.totalVehicles.toLocaleString()}
          icon={Car}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
          trend="+15%"
        />
        <StatCard
          title="Doanh thu"
          value={`${(stats.totalRevenue / 1000000).toFixed(0)}M`}
          icon={DollarSign}
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
          trend="+20%"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Đặt xe đang hoạt động</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.activeBookings}</p>
            </div>
            <div className="h-12 w-12 bg-sky-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-sky-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tranh chấp chờ xử lý</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{stats.pendingDisputes}</p>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">KYC chờ xác thực</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{stats.pendingKYC}</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <Card title="Hoạt động gần đây">
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                    activity.type === 'user' ? 'bg-blue-100' :
                    activity.type === 'group' ? 'bg-green-100' :
                    activity.type === 'dispute' ? 'bg-orange-100' :
                    activity.type === 'kyc' ? 'bg-purple-100' : 'bg-gray-100'
                  }`}>
                    {activity.type === 'user' && <Users className="h-5 w-5 text-blue-600" />}
                    {activity.type === 'group' && <Users className="h-5 w-5 text-green-600" />}
                    {activity.type === 'dispute' && <AlertTriangle className="h-5 w-5 text-orange-600" />}
                    {activity.type === 'kyc' && <CheckCircle className="h-5 w-5 text-purple-600" />}
                    {activity.type === 'vehicle' && <Car className="h-5 w-5 text-gray-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* System Health */}
        <div className="space-y-6">
          <Card title="Tình trạng hệ thống">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API Server</span>
                <Badge variant="success">Hoạt động</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database</span>
                <Badge variant="success">Hoạt động</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">AI Service</span>
                <Badge variant="success">Hoạt động</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Notification</span>
                <Badge variant="success">Hoạt động</Badge>
              </div>
            </div>
          </Card>

          <Card title="Cảnh báo">
            <div className="space-y-3">
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-orange-900">
                      3 tranh chấp chờ xử lý
                    </p>
                    <p className="text-xs text-orange-700 mt-1">
                      Cần xem xét và giải quyết
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-purple-900">
                      12 KYC cần xác thực
                    </p>
                    <p className="text-xs text-purple-700 mt-1">
                      Yêu cầu xác minh danh tính
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

function StatCard({ title, value, icon: Icon, iconBg, iconColor, trend }) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600 font-medium">{trend}</span>
              <span className="text-xs text-gray-500">so với tháng trước</span>
            </div>
          )}
        </div>
        <div className={`h-12 w-12 ${iconBg} rounded-lg flex items-center justify-center`}>
          <Icon className={`h-6 w-6 ${iconColor}`} />
        </div>
      </div>
    </Card>
  );
}
