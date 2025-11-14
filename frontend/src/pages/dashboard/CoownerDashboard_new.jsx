import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useGroupStore } from '../../stores/useGroupStore';
import { useBookingStore } from '../../stores/useBookingStore';
import { useUserStore } from '../../stores/userStore';
import { Calendar, Car, DollarSign, Users } from 'lucide-react';
import CoownerLayout from '../../components/layout/CoownerLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

export default function CoownerDashboard() {
  const user = useUserStore((state) => state.user);
  const groups = useGroupStore((state) => state.groups);
  const bookings = useBookingStore((state) => state.bookings);
  const fetchUserGroups = useGroupStore((state) => state.fetchUserGroups);
  const fetchUserBookings = useBookingStore((state) => state.fetchUserBookings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchUserGroups(),
          fetchUserBookings({ limit: 5 }),
        ]);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [fetchUserGroups, fetchUserBookings]);

  if (loading) {
    return (
      <CoownerLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
        </div>
      </CoownerLayout>
    );
  }

  return (
    <CoownerLayout>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Xin chào, {user?.fullName || 'Co-owner'}!
        </h1>
        <p className="mt-2 text-gray-600">
          Quản lý xe điện đồng sở hữu của bạn
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Nhóm của tôi"
          value={groups.length}
          icon={Users}
          color="sky"
          to="/groups"
        />
        <StatCard
          title="Lịch đặt xe"
          value={bookings.length}
          icon={Calendar}
          color="indigo"
          to="/bookings"
        />
        <StatCard
          title="Xe sở hữu"
          value={groups.reduce((acc, g) => acc + (g.vehicles?.length || 0), 0)}
          icon={Car}
          color="green"
          to="/vehicles"
        />
        <StatCard
          title="Chi phí tháng"
          value="0 đ"
          icon={DollarSign}
          color="amber"
          to="/costs"
        />
      </div>

      {/* Groups List */}
      <Card 
        title="Nhóm đồng sở hữu"
        actions={
          <Link to="/groups/create">
            <Button size="sm">Tạo nhóm mới</Button>
          </Link>
        }
        className="mb-8"
      >
        {groups.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              Bạn chưa có nhóm nào. Tạo nhóm để bắt đầu!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groups.map((group) => (
              <Link
                key={group.id}
                to={`/groups/${group.id}`}
                className="border border-gray-200 rounded-lg p-4 hover:border-sky-500 hover:shadow-md transition"
              >
                <h3 className="font-semibold text-gray-900">{group.name}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {group.members?.length || 0} thành viên
                </p>
              </Link>
            ))}
          </div>
        )}
      </Card>

      {/* Recent Bookings */}
      <Card 
        title="Lịch đặt gần đây"
        actions={
          <Link to="/bookings" className="text-sky-500 hover:text-sky-600 text-sm font-medium">
            Xem tất cả
          </Link>
        }
      >
        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              Chưa có lịch đặt xe nào
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.slice(0, 5).map((booking) => (
              <Link
                key={booking.id}
                to={`/bookings/${booking.id}`}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-sky-500 hover:shadow transition"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {booking.vehicleName || 'Xe'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(booking.startTime).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <Badge 
                  variant={
                    booking.status === 'confirmed' ? 'success' :
                    booking.status === 'pending' ? 'warning' : 'default'
                  }
                >
                  {booking.status}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </CoownerLayout>
  );
}

function StatCard({ title, value, icon: Icon, color, to }) {
  const colorClasses = {
    sky: 'bg-sky-500',
    indigo: 'bg-indigo-500',
    green: 'bg-green-500',
    amber: 'bg-amber-500',
  };

  return (
    <Link
      to={to}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`${colorClasses[color]} p-3 rounded-lg`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </Link>
  );
}
