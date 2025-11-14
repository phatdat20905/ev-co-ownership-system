import { useEffect, useState } from 'react';
import { useBookingStore } from '../../stores/useBookingStore';
import { Link } from 'react-router-dom';
import { Calendar as CalendarIcon, Plus, Filter } from 'lucide-react';
import CoownerLayout from '../../components/layout/CoownerLayout';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Table from '../../components/ui/Table';
import Select from '../../components/ui/Select';

export default function BookingList() {
  const bookings = useBookingStore((state) => state.bookings);
  const fetchUserBookings = useBookingStore((state) => state.fetchUserBookings);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const loadBookings = async () => {
      try {
        await fetchUserBookings();
      } catch (error) {
        console.error('Failed to load bookings:', error);
      } finally {
        setLoading(false);
      }
    };
    loadBookings();
  }, [fetchUserBookings]);

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  const columns = [
    {
      header: 'Xe',
      accessor: 'vehicleName',
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900">{row.vehicleName || row.vehicleId}</p>
          <p className="text-sm text-gray-500">{row.vehicleLicensePlate}</p>
        </div>
      ),
    },
    {
      header: 'Thời gian bắt đầu',
      accessor: 'startTime',
      render: (row) => (
        <div>
          <p className="text-gray-900">{new Date(row.startTime).toLocaleDateString('vi-VN')}</p>
          <p className="text-sm text-gray-500">{new Date(row.startTime).toLocaleTimeString('vi-VN')}</p>
        </div>
      ),
    },
    {
      header: 'Thời gian kết thúc',
      accessor: 'endTime',
      render: (row) => (
        <div>
          <p className="text-gray-900">{new Date(row.endTime).toLocaleDateString('vi-VN')}</p>
          <p className="text-sm text-gray-500">{new Date(row.endTime).toLocaleTimeString('vi-VN')}</p>
        </div>
      ),
    },
    {
      header: 'Trạng thái',
      accessor: 'status',
      render: (row) => (
        <Badge
          variant={
            row.status === 'confirmed' ? 'success' :
            row.status === 'pending' ? 'warning' :
            row.status === 'cancelled' ? 'danger' : 'default'
          }
        >
          {row.status === 'confirmed' ? 'Đã xác nhận' :
           row.status === 'pending' ? 'Chờ duyệt' :
           row.status === 'cancelled' ? 'Đã hủy' :
           row.status === 'completed' ? 'Hoàn thành' : row.status}
        </Badge>
      ),
    },
    {
      header: 'Hành động',
      accessor: 'id',
      render: (row) => (
        <Link to={`/bookings/${row.id}`}>
          <Button size="sm" variant="outline">Chi tiết</Button>
        </Link>
      ),
    },
  ];

  return (
    <CoownerLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lịch đặt xe</h1>
          <p className="mt-2 text-gray-600">
            Quản lý lịch đặt xe của bạn
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/bookings/calendar">
            <Button variant="outline" icon={CalendarIcon}>Xem lịch</Button>
          </Link>
          <Link to="/bookings/create">
            <Button icon={Plus}>Đặt xe mới</Button>
          </Link>
        </div>
      </div>

      <Card>
        {/* Filter */}
        <div className="mb-6 flex items-center gap-4">
          <Filter className="h-5 w-5 text-gray-400" />
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            options={[
              { value: 'all', label: 'Tất cả' },
              { value: 'pending', label: 'Chờ duyệt' },
              { value: 'confirmed', label: 'Đã xác nhận' },
              { value: 'completed', label: 'Hoàn thành' },
              { value: 'cancelled', label: 'Đã hủy' },
            ]}
            className="w-48"
          />
        </div>

        {/* Table */}
        <Table
          columns={columns}
          data={filteredBookings}
          isLoading={loading}
          emptyMessage="Chưa có lịch đặt xe nào"
        />
      </Card>
    </CoownerLayout>
  );
}
