import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookingStore } from '../../stores/useBookingStore';
import { useGroupStore } from '../../stores/useGroupStore';
import { useVehicleStore } from '../../stores/useVehicleStore';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import CoownerLayout from '../../components/layout/CoownerLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Select from '../../components/ui/Select';

export default function BookingCalendar() {
  const navigate = useNavigate();
  const bookings = useBookingStore((state) => state.bookings);
  const fetchBookings = useBookingStore((state) => state.fetchBookings);
  const groups = useGroupStore((state) => state.groups);
  const fetchGroups = useGroupStore((state) => state.fetchGroups);
  const vehicles = useVehicleStore((state) => state.vehicles);
  const fetchVehicles = useVehicleStore((state) => state.fetchVehicles);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedVehicle, setSelectedVehicle] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchGroups(),
          fetchVehicles(),
          fetchBookings()
        ]);
      } catch (error) {
        console.error('Failed to load calendar data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [fetchGroups, fetchVehicles, fetchBookings]);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getBookingsForDay = (day) => {
    const { year, month } = getDaysInMonth(currentDate);
    const dayDate = new Date(year, month, day);
    
    return bookings.filter(booking => {
      if (selectedVehicle !== 'all' && booking.vehicleId !== parseInt(selectedVehicle)) {
        return false;
      }
      
      const startDate = new Date(booking.startTime);
      const endDate = new Date(booking.endTime);
      
      return dayDate >= new Date(startDate.toDateString()) && 
             dayDate <= new Date(endDate.toDateString());
    });
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const vehicleOptions = [
    { value: 'all', label: 'Tất cả xe' },
    ...vehicles.map(v => ({
      value: v.id.toString(),
      label: `${v.model} - ${v.licensePlate}`
    }))
  ];

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);
  const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
                      'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

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
        <h1 className="text-3xl font-bold text-gray-900">Lịch đặt xe</h1>
        <p className="mt-2 text-gray-600">
          Xem lịch đặt xe theo tháng
        </p>
      </div>

      <Card>
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              icon={ChevronLeft}
              onClick={() => navigateMonth(-1)}
            />
            <h2 className="text-xl font-bold text-gray-900">
              {monthNames[month]} {year}
            </h2>
            <Button
              variant="outline"
              size="sm"
              icon={ChevronRight}
              onClick={() => navigateMonth(1)}
            />
          </div>
          
          <div className="flex items-center gap-3">
            <Select
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              options={vehicleOptions}
              className="w-48"
            />
            <Button
              variant="outline"
              size="sm"
              icon={CalendarIcon}
              onClick={goToToday}
            >
              Hôm nay
            </Button>
            <Button
              size="sm"
              onClick={() => navigate('/bookings/create')}
            >
              Đặt xe mới
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            {/* Day Names */}
            <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-t-lg overflow-hidden">
              {dayNames.map(day => (
                <div
                  key={day}
                  className="bg-gray-50 py-2 text-center text-sm font-semibold text-gray-700"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-b-lg overflow-hidden">
              {/* Empty cells for days before month starts */}
              {Array.from({ length: startingDayOfWeek }, (_, i) => (
                <div key={`empty-${i}`} className="bg-gray-50 h-24"></div>
              ))}

              {/* Days of the month */}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const dayBookings = getBookingsForDay(day);
                const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
                
                return (
                  <div
                    key={day}
                    className={`bg-white min-h-24 p-2 ${
                      isToday ? 'ring-2 ring-sky-500 ring-inset' : ''
                    }`}
                  >
                    <div className={`text-sm font-semibold mb-1 ${
                      isToday ? 'text-sky-600' : 'text-gray-700'
                    }`}>
                      {day}
                    </div>
                    
                    <div className="space-y-1">
                      {dayBookings.slice(0, 2).map(booking => (
                        <div
                          key={booking.id}
                          onClick={() => navigate(`/bookings/${booking.id}`)}
                          className="cursor-pointer text-xs p-1 rounded bg-sky-100 hover:bg-sky-200 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sky-900 truncate">
                              {booking.vehicleName || `Xe #${booking.vehicleId}`}
                            </span>
                            <Badge
                              variant={
                                booking.status === 'confirmed' ? 'success' :
                                booking.status === 'pending' ? 'warning' : 'default'
                              }
                              className="text-xs py-0 px-1"
                            >
                              {booking.status === 'confirmed' ? 'OK' :
                               booking.status === 'pending' ? 'Chờ' : booking.status.slice(0, 2)}
                            </Badge>
                          </div>
                          <div className="text-gray-600 text-xs mt-0.5">
                            {new Date(booking.startTime).toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      ))}
                      
                      {dayBookings.length > 2 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{dayBookings.length - 2} khác
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center gap-4 text-sm">
          <span className="font-semibold text-gray-700">Chú thích:</span>
          <div className="flex items-center gap-2">
            <Badge variant="success" size="sm">OK</Badge>
            <span className="text-gray-600">Đã xác nhận</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="warning" size="sm">Chờ</Badge>
            <span className="text-gray-600">Chờ duyệt</span>
          </div>
        </div>
      </Card>
    </CoownerLayout>
  );
}
