import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVehicleStore } from '../../stores/useVehicleStore';
import { useGroupStore } from '../../stores/useGroupStore';
import { Car, Search } from 'lucide-react';
import CoownerLayout from '../../components/layout/CoownerLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';

export default function VehicleList() {
  const navigate = useNavigate();
  const vehicles = useVehicleStore((state) => state.vehicles);
  const fetchVehicles = useVehicleStore((state) => state.fetchVehicles);
  const groups = useGroupStore((state) => state.groups);
  const fetchGroups = useGroupStore((state) => state.fetchGroups);
  
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchVehicles(),
          fetchGroups()
        ]);
      } catch (error) {
        console.error('Failed to load vehicles:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [fetchVehicles, fetchGroups]);

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = searchQuery === '' ||
      vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.licensePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.brand?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const statusOptions = [
    { value: 'all', label: 'Tất cả trạng thái' },
    { value: 'available', label: 'Sẵn sàng' },
    { value: 'in-use', label: 'Đang sử dụng' },
    { value: 'maintenance', label: 'Bảo trì' },
    { value: 'unavailable', label: 'Không khả dụng' }
  ];

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Danh sách xe</h1>
        <p className="mt-2 text-gray-600">
          Quản lý xe điện trong các nhóm
        </p>
      </div>

      <Card className="mb-6">
        <div className="flex items-center gap-4">
          <Input
            icon={Search}
            placeholder="Tìm kiếm theo tên, biển số..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={statusOptions}
            className="w-48"
          />
        </div>
      </Card>

      {filteredVehicles.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Car className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">Không tìm thấy xe</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery || statusFilter !== 'all' 
                ? 'Thử thay đổi bộ lọc hoặc tìm kiếm'
                : 'Chưa có xe nào trong hệ thống'
              }
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map((vehicle) => {
            const group = groups.find(g => g.id === vehicle.groupId);
            
            return (
              <Card
                key={vehicle.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/vehicles/${vehicle.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-sky-100 rounded-lg flex items-center justify-center">
                      <Car className="h-6 w-6 text-sky-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{vehicle.model}</h3>
                      <p className="text-sm text-gray-500">{vehicle.brand}</p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      vehicle.status === 'available' ? 'success' :
                      vehicle.status === 'in-use' ? 'info' :
                      vehicle.status === 'maintenance' ? 'warning' : 'danger'
                    }
                  >
                    {vehicle.status === 'available' ? 'Sẵn sàng' :
                     vehicle.status === 'in-use' ? 'Đang dùng' :
                     vehicle.status === 'maintenance' ? 'Bảo trì' : 'Không KD'}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Biển số</span>
                    <span className="font-medium text-gray-900">{vehicle.licensePlate}</span>
                  </div>

                  {vehicle.year && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Năm sản xuất</span>
                      <span className="font-medium text-gray-900">{vehicle.year}</span>
                    </div>
                  )}

                  {vehicle.batteryCapacity && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Dung lượng pin</span>
                      <span className="font-medium text-gray-900">{vehicle.batteryCapacity} kWh</span>
                    </div>
                  )}

                  {vehicle.range && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Quãng đường</span>
                      <span className="font-medium text-gray-900">{vehicle.range} km</span>
                    </div>
                  )}

                  {group && (
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Nhóm</span>
                        <span className="text-sm font-medium text-sky-600">{group.name}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/vehicles/${vehicle.id}`);
                    }}
                  >
                    Xem chi tiết
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </CoownerLayout>
  );
}
