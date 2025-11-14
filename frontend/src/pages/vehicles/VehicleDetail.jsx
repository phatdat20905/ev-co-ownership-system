import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useVehicleStore } from '../../stores/useVehicleStore';
import { useGroupStore } from '../../stores/useGroupStore';
import { useBookingStore } from '../../stores/useBookingStore';
import { 
  Car, Calendar, Battery, Gauge, MapPin, FileText, 
  Users, Clock, Wrench, TrendingUp 
} from 'lucide-react';
import CoownerLayout from '../../components/layout/CoownerLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { toast } from 'react-toastify';

export default function VehicleDetail() {
  const { vehicleId } = useParams();
  const navigate = useNavigate();
  const currentVehicle = useVehicleStore((state) => state.currentVehicle);
  const fetchVehicle = useVehicleStore((state) => state.fetchVehicle);
  const groups = useGroupStore((state) => state.groups);
  const fetchGroups = useGroupStore((state) => state.fetchGroups);
  const bookings = useBookingStore((state) => state.bookings);
  const fetchBookings = useBookingStore((state) => state.fetchBookings);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchVehicle(vehicleId),
          fetchGroups(),
          fetchBookings()
        ]);
      } catch (error) {
        console.error('Failed to load vehicle:', error);
        toast.error('Không thể tải thông tin xe');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [vehicleId, fetchVehicle, fetchGroups, fetchBookings]);

  if (loading) {
    return (
      <CoownerLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
        </div>
      </CoownerLayout>
    );
  }

  if (!currentVehicle) {
    return (
      <CoownerLayout>
        <Card>
          <p className="text-center text-gray-600 py-12">Không tìm thấy thông tin xe</p>
        </Card>
      </CoownerLayout>
    );
  }

  const group = groups.find(g => g.id === currentVehicle.groupId);
  const vehicleBookings = bookings.filter(b => b.vehicleId === currentVehicle.id);
  const upcomingBookings = vehicleBookings
    .filter(b => new Date(b.startTime) > new Date() && b.status !== 'cancelled')
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
    .slice(0, 5);

  // Mock maintenance history
  const maintenanceHistory = [
    {
      id: 1,
      type: 'Bảo dưỡng định kỳ',
      date: '2024-01-15',
      cost: 1500000,
      description: 'Thay dầu, kiểm tra phanh, điều chỉnh áp suất lốp'
    },
    {
      id: 2,
      type: 'Sửa chữa',
      date: '2023-12-10',
      cost: 3200000,
      description: 'Thay cảm biến áp suất lốp'
    },
    {
      id: 3,
      type: 'Đăng kiểm',
      date: '2023-11-20',
      cost: 350000,
      description: 'Đăng kiểm định kỳ năm 2023'
    }
  ];

  // Mock usage statistics
  const usageStats = {
    totalBookings: vehicleBookings.length,
    totalKm: 15432,
    avgKmPerMonth: 1286,
    totalChargingSessions: 87,
    avgBatteryHealth: 94
  };

  return (
    <CoownerLayout>
      <div className="mb-8">
        <Button
          variant="outline"
          onClick={() => navigate('/vehicles')}
          className="mb-4"
        >
          ← Quay lại
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{currentVehicle.model}</h1>
            <p className="mt-2 text-gray-600">{currentVehicle.brand}</p>
          </div>
          <Badge
            variant={
              currentVehicle.status === 'available' ? 'success' :
              currentVehicle.status === 'in-use' ? 'info' :
              currentVehicle.status === 'maintenance' ? 'warning' : 'danger'
            }
            className="text-base px-4 py-2"
          >
            {currentVehicle.status === 'available' ? 'Sẵn sàng' :
             currentVehicle.status === 'in-use' ? 'Đang sử dụng' :
             currentVehicle.status === 'maintenance' ? 'Bảo trì' : 'Không khả dụng'}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Thông tin xe">
            <div className="grid grid-cols-2 gap-4">
              <InfoItem icon={Car} label="Biển số" value={currentVehicle.licensePlate} />
              <InfoItem icon={Calendar} label="Năm SX" value={currentVehicle.year} />
              <InfoItem 
                icon={Battery} 
                label="Dung lượng pin" 
                value={`${currentVehicle.batteryCapacity} kWh`} 
              />
              <InfoItem 
                icon={Gauge} 
                label="Quãng đường" 
                value={`${currentVehicle.range} km`} 
              />
              <InfoItem 
                icon={MapPin} 
                label="Vị trí hiện tại" 
                value={currentVehicle.currentLocation || 'Không xác định'} 
              />
              <InfoItem 
                icon={Users} 
                label="Nhóm" 
                value={group?.name || `Nhóm #${currentVehicle.groupId}`} 
              />
            </div>

            {currentVehicle.description && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Mô tả</p>
                <p className="text-gray-700">{currentVehicle.description}</p>
              </div>
            )}
          </Card>

          {/* Usage Statistics */}
          <Card title="Thống kê sử dụng">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <StatCard 
                label="Tổng lượt đặt" 
                value={usageStats.totalBookings}
                icon={Calendar}
              />
              <StatCard 
                label="Tổng km đã đi" 
                value={usageStats.totalKm.toLocaleString()}
                icon={Gauge}
              />
              <StatCard 
                label="TB km/tháng" 
                value={usageStats.avgKmPerMonth.toLocaleString()}
                icon={TrendingUp}
              />
              <StatCard 
                label="Lượt sạc" 
                value={usageStats.totalChargingSessions}
                icon={Battery}
              />
              <StatCard 
                label="Sức khỏe pin" 
                value={`${usageStats.avgBatteryHealth}%`}
                icon={Battery}
              />
              <StatCard 
                label="Trạng thái" 
                value={currentVehicle.status === 'available' ? 'Tốt' : 'Cần kiểm tra'}
                icon={Wrench}
              />
            </div>
          </Card>

          {/* Maintenance History */}
          <Card title="Lịch sử bảo trì">
            <div className="space-y-3">
              {maintenanceHistory.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Wrench className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-gray-900">{item.type}</p>
                      <span className="text-sm font-semibold text-gray-700">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND'
                        }).format(item.cost)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{item.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(item.date).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card title="Thao tác nhanh">
            <div className="space-y-3">
              <Button
                className="w-full"
                onClick={() => navigate('/bookings/create')}
                disabled={currentVehicle.status !== 'available'}
              >
                Đặt xe
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/bookings/calendar')}
              >
                Xem lịch
              </Button>
            </div>
          </Card>

          {/* Upcoming Bookings */}
          <Card title="Lịch đặt sắp tới">
            {upcomingBookings.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                Chưa có lịch đặt
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => navigate(`/bookings/${booking.id}`)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {booking.userName || `User #${booking.userId}`}
                      </span>
                      <Badge variant="info" size="sm">
                        {booking.status === 'confirmed' ? 'Đã xác nhận' : 'Chờ duyệt'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(booking.startTime).toLocaleString('vi-VN')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Vehicle Info Summary */}
          <Card title="Tóm tắt">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Ngày thêm</span>
                <span className="text-gray-900">
                  {new Date(currentVehicle.createdAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
              {currentVehicle.updatedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Cập nhật</span>
                  <span className="text-gray-900">
                    {new Date(currentVehicle.updatedAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              )}
              <div className="pt-3 border-t border-gray-200">
                <span className="text-gray-600">Mã xe: </span>
                <span className="text-gray-900 font-mono">#{currentVehicle.id}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </CoownerLayout>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="h-5 w-5 text-gray-400 mt-0.5" />
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        <p className="font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="h-4 w-4 text-gray-400" />
        <span className="text-xs text-gray-600">{label}</span>
      </div>
      <p className="text-lg font-bold text-gray-900">{value}</p>
    </div>
  );
}
