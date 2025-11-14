import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGroupStore } from '../../stores/useGroupStore';
import { useVehicleStore } from '../../stores/useVehicleStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { 
  Users, Car, DollarSign, FileText, UserPlus, 
  Settings, Crown, TrendingUp, Calendar 
} from 'lucide-react';
import CoownerLayout from '../../components/layout/CoownerLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { toast } from 'react-toastify';

export default function GroupDetail() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const currentGroup = useGroupStore((state) => state.currentGroup);
  const fetchGroup = useGroupStore((state) => state.fetchGroup);
  const vehicles = useVehicleStore((state) => state.vehicles);
  const fetchVehicles = useVehicleStore((state) => state.fetchVehicles);
  const currentUser = useAuthStore((state) => state.user);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchGroup(groupId),
          fetchVehicles()
        ]);
      } catch (error) {
        console.error('Failed to load group:', error);
        toast.error('Không thể tải thông tin nhóm');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [groupId, fetchGroup, fetchVehicles]);

  if (loading) {
    return (
      <CoownerLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
        </div>
      </CoownerLayout>
    );
  }

  if (!currentGroup) {
    return (
      <CoownerLayout>
        <Card>
          <p className="text-center text-gray-600 py-12">Không tìm thấy thông tin nhóm</p>
        </Card>
      </CoownerLayout>
    );
  }

  // Mock members data - in real app this comes from API
  const members = currentGroup.members || [
    { 
      id: 1, 
      name: 'Nguyễn Văn A', 
      email: 'nguyenvana@example.com',
      ownershipPercentage: 40, 
      role: 'admin',
      joinedAt: '2023-01-15'
    },
    { 
      id: 2, 
      name: 'Trần Thị B', 
      email: 'tranthib@example.com',
      ownershipPercentage: 35, 
      role: 'member',
      joinedAt: '2023-01-15'
    },
    { 
      id: 3, 
      name: 'Lê Văn C', 
      email: 'levanc@example.com',
      ownershipPercentage: 25, 
      role: 'member',
      joinedAt: '2023-02-01'
    }
  ];

  const groupVehicles = vehicles.filter(v => v.groupId === currentGroup.id);
  const isAdmin = members.find(m => m.id === currentUser?.id)?.role === 'admin';

  // Mock statistics
  const stats = {
    totalBookings: 156,
    totalCosts: 45600000,
    activeVehicles: groupVehicles.filter(v => v.status === 'available').length,
    commonFund: 12500000
  };

  return (
    <CoownerLayout>
      <div className="mb-8">
        <Button
          variant="outline"
          onClick={() => navigate('/groups')}
          className="mb-4"
        >
          ← Quay lại
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{currentGroup.name}</h1>
            <p className="mt-2 text-gray-600">{currentGroup.description}</p>
          </div>
          {isAdmin && (
            <Button
              variant="outline"
              icon={Settings}
              onClick={() => navigate(`/groups/${groupId}/settings`)}
            >
              Cài đặt
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Thành viên</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{members.length}</p>
            </div>
            <div className="h-12 w-12 bg-sky-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-sky-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Xe hoạt động</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.activeVehicles}/{groupVehicles.length}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Car className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Quỹ chung</p>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {(stats.commonFund / 1000000).toFixed(1)}M
              </p>
            </div>
            <div className="h-12 w-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng đặt xe</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalBookings}</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Members */}
          <Card 
            title="Thành viên"
            actions={
              isAdmin && (
                <Button
                  size="sm"
                  icon={UserPlus}
                  onClick={() => navigate(`/groups/${groupId}/invite`)}
                >
                  Mời thành viên
                </Button>
              )
            }
          >
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-sky-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-sky-600">
                        {member.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">{member.name}</p>
                        {member.role === 'admin' && (
                          <Crown className="h-4 w-4 text-amber-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{member.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{member.ownershipPercentage}%</p>
                    <p className="text-xs text-gray-500">sở hữu</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-sky-50 rounded-lg">
              <p className="text-sm text-sky-900">
                <strong>Tổng:</strong> {members.reduce((sum, m) => sum + m.ownershipPercentage, 0)}% sở hữu
              </p>
            </div>
          </Card>

          {/* Vehicles */}
          <Card title="Xe trong nhóm">
            {groupVehicles.length === 0 ? (
              <div className="text-center py-8">
                <Car className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">Chưa có xe nào</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groupVehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-sky-300 cursor-pointer transition-colors"
                    onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{vehicle.model}</h4>
                      <Badge
                        variant={vehicle.status === 'available' ? 'success' : 'warning'}
                        size="sm"
                      >
                        {vehicle.status === 'available' ? 'Sẵn sàng' : 'Bận'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{vehicle.licensePlate}</p>
                    <p className="text-xs text-gray-500 mt-1">{vehicle.brand}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Group Info */}
          <Card title="Thông tin nhóm">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Ngày tạo</p>
                <p className="text-gray-900">
                  {new Date(currentGroup.createdAt).toLocaleDateString('vi-VN')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Trạng thái</p>
                <Badge variant="success">Hoạt động</Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Mã nhóm</p>
                <p className="text-gray-900 font-mono">#{currentGroup.id}</p>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card title="Thao tác nhanh">
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                icon={Car}
                onClick={() => navigate('/vehicles')}
              >
                Xem xe
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                icon={Calendar}
                onClick={() => navigate('/bookings')}
              >
                Lịch đặt xe
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                icon={DollarSign}
                onClick={() => navigate('/costs')}
              >
                Chi phí
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                icon={FileText}
                onClick={() => navigate('/contracts')}
              >
                Hợp đồng
              </Button>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card title="Hoạt động gần đây">
            <div className="space-y-3">
              <ActivityItem
                icon={Calendar}
                text="Nguyễn Văn A đặt xe VinFast VF8"
                time="2 giờ trước"
              />
              <ActivityItem
                icon={DollarSign}
                text="Chi phí điện tháng 1 được phân bổ"
                time="1 ngày trước"
              />
              <ActivityItem
                icon={UserPlus}
                text="Lê Văn C tham gia nhóm"
                time="3 ngày trước"
              />
            </div>
          </Card>
        </div>
      </div>
    </CoownerLayout>
  );
}

function ActivityItem({ icon: Icon, text, time }) {
  return (
    <div className="flex items-start gap-3">
      <div className="h-8 w-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
        <Icon className="h-4 w-4 text-gray-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900">{text}</p>
        <p className="text-xs text-gray-500">{time}</p>
      </div>
    </div>
  );
}
