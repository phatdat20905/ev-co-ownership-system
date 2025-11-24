import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Car, Users, Plus, Filter, Search, ChevronLeft, ChevronRight, Battery, Zap, Loader2 } from 'lucide-react';
import Header from '../../../../components/layout/Header';
import Footer from '../../../../components/layout/Footer';
import { useBookingStore, useVehicleStore, useAuthStore } from '../../../../store';
import { socketClient } from '../../../../services/socketClient';

export default function BookingCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState('month');
  const [calendarData, setCalendarData] = useState(null);
  const [stats, setStats] = useState({
    totalBookings: 0,
    availableVehicles: 0,
    weeklyHours: 0,
    groupMembers: 0
  });
  
  const { bookings, loading, error, fetchUserBookings, fetchPersonalCalendar, fetchBookingStats } = useBookingStore();
  const { vehicles, fetchVehicles } = useVehicleStore();
  const { activeGroup } = useAuthStore();

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get start/end of current month for calendar
        const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        
        // Fetch calendar and stats first, then fetch vehicles into the store.
        const [personalCalendar, bookingStats] = await Promise.all([
          fetchPersonalCalendar({
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
          }),
          fetchBookingStats()
        ]);

        // fetchVehicles updates the vehicle store but does not return the list.
        // Read the fresh list from the store after fetch completes to avoid stale closure values.
        await fetchVehicles();
        const vehiclesList = useVehicleStore.getState().vehicles || [];

        // Set calendar data and stats. We update availableVehicles regardless of whether
        // personalCalendar.stats exists so the sidebar count reflects the latest vehicles.
        if (personalCalendar) {
          setCalendarData(personalCalendar);
        }

        const availableCount = Array.isArray(vehiclesList) ? vehiclesList.filter(v => v.status === 'available').length : 0;

        setStats({
          totalBookings: personalCalendar?.stats?.totalBookings || 0,
          availableVehicles: availableCount,
          weeklyHours: bookingStats?.weeklyUsage || 0,
          groupMembers: bookingStats?.groupMembers || 0
        });
      } catch (err) {
        console.error('Error fetching booking data:', err);
      }
    };

    fetchData();
  }, [currentDate, fetchUserBookings, fetchPersonalCalendar, fetchBookingStats, fetchVehicles]);

  // Real-time calendar updates via Socket.io
  useEffect(() => {
    if (!activeGroup?.id) return;

    const handleCalendarUpdate = (eventType, data) => {
      console.log('📅 Calendar update received:', eventType, data);
      
      // Refresh calendar data when updates occur
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      fetchPersonalCalendar({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }).then(personalCalendar => {
        if (personalCalendar) {
          setCalendarData(personalCalendar);
        }
      });
    };

    // Subscribe to calendar updates for active group
    socketClient.subscribeToCalendar(activeGroup.id, handleCalendarUpdate);

    // Cleanup on unmount
    return () => {
      socketClient.unsubscribeFromCalendar(activeGroup.id);
    };
  }, [activeGroup, currentDate, fetchPersonalCalendar]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'business': return 'bg-blue-500';
      case 'personal': return 'bg-purple-500';
      case 'family': return 'bg-pink-500';
      default: return 'bg-gray-500';
    }
  };

  // Hàm để lấy các ngày trong tháng
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // Thêm các ngày trống đầu tháng
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // Thêm các ngày trong tháng
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  const navigateMonth = (direction) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const getBookingsForDate = (date) => {
    // Use calendarData if available, otherwise fallback to bookings store
    const bookingsSource = calendarData?.bookings || bookings || [];
    
    return bookingsSource.filter(booking => {
      const bookingDate = new Date(booking.startTime);
      return bookingDate.getFullYear() === date.getFullYear()
        && bookingDate.getMonth() === date.getMonth()
        && bookingDate.getDate() === date.getDate();
    }).map(booking => ({
      ...booking,
      // Map fields for display
      car: booking.vehicle?.vehicleName || booking.vehicleName || 'N/A',
      start: new Date(booking.startTime),
      end: new Date(booking.endTime),
      type: booking.purpose || 'personal',
      user: booking.userName || 'Bạn'
    }));
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 text-sky-500 animate-spin" />
            <p className="text-gray-600 text-lg">Đang tải lịch đặt xe...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <Header />
      
      <main className="pt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                  Lịch Đặt Xe
                </h1>
                <p className="text-xl text-gray-600">
                  Quản lý và đặt lịch sử dụng xe đồng sở hữu
                </p>
              </div>
              
              <Link
                to="/dashboard/coowner/booking/new"
                className="inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                <span>Đặt lịch mới</span>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <Calendar className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
                    <p className="text-sm text-gray-600">Lịch đặt tháng</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Car className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.availableVehicles}</p>
                    <p className="text-sm text-gray-600">Xe có sẵn</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <Clock className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.weeklyHours}h</p>
                    <p className="text-sm text-gray-600">Sử dụng tuần này</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-100 rounded-xl">
                    <Users className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.groupMembers}</p>
                    <p className="text-sm text-gray-600">Thành viên</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Calendar */}
            <div className="lg:col-span-3">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8"
              >
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h2>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigateMonth(-1)}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => navigateMonth(1)}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
                      <Filter className="w-4 h-4" />
                      <span>Lọc</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
                      <Search className="w-4 h-4" />
                      <span>Tìm</span>
                    </button>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {dayNames.map(day => (
                    <div key={day} className="text-center font-semibold text-gray-600 py-2">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {daysInMonth.map((date, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: date ? 1.05 : 1 }}
                      onClick={() => date && setSelectedDate(date)}
                      className={`min-h-[100px] p-2 rounded-2xl border-2 transition-all ${
                        date
                          ? selectedDate.toDateString() === date.toDateString()
                            ? 'border-sky-500 bg-sky-50'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                          : 'border-transparent'
                      }`}
                    >
                      {date && (
                        <>
                          <div className="text-right mb-1">
                            <span className={`inline-block w-8 h-8 rounded-full text-center leading-8 ${
                              date.toDateString() === new Date().toDateString()
                                ? 'bg-sky-500 text-white'
                                : 'text-gray-700'
                            }`}>
                              {date.getDate()}
                            </span>
                          </div>
                          
                          {/* Bookings for this date */}
                          <div className="space-y-1">
                            {getBookingsForDate(date).map(booking => (
                              <div
                                key={booking.id}
                                className={`text-xs p-1 rounded-lg border ${getStatusColor(booking.status)}`}
                              >
                                <div className="flex items-center gap-1">
                                  <div className={`w-2 h-2 rounded-full ${getTypeColor(booking.type)}`}></div>
                                  <span className="font-medium truncate">
                                    {booking.car}
                                  </span>
                                </div>
                                <div className="text-gray-600">
                                  {booking.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Selected Date Bookings */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8 mt-8"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Lịch đặt ngày {selectedDate.toLocaleDateString('vi-VN')}
                </h3>
                
                <div className="space-y-4">
                  {getBookingsForDate(selectedDate).map(booking => (
                    <motion.div
                      key={booking.id}
                      whileHover={{ scale: 1.02 }}
                      className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200/50 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-4 h-4 rounded-full ${getTypeColor(booking.type)}`}></div>
                          <div>
                            <h4 className="font-bold text-gray-900">{booking.car}</h4>
                            <p className="text-gray-600">{booking.user}</p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {booking.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                            {booking.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                            {booking.status === 'confirmed' ? 'Đã xác nhận' : 'Chờ xác nhận'}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {getBookingsForDate(selectedDate).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Không có lịch đặt nào cho ngày này</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Sidebar - Car Availability */}
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4">Xe có sẵn</h3>
                <div className="space-y-4">
                  {vehicles && vehicles.length > 0 ? (
                    vehicles
                      .filter(vehicle => vehicle.status === 'available')
                      .map(vehicle => (
                        <motion.div
                          key={vehicle.id}
                          whileHover={{ scale: 1.02 }}
                          className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-4 border border-gray-200/50 shadow-sm"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-sky-100 rounded-xl">
                              <Car className="w-5 h-5 text-sky-600" />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900">{vehicle.vehicleName || vehicle.name}</h4>
                              <p className="text-sm text-gray-600">{vehicle.model || vehicle.brand}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Pin:</span>
                              <div className="flex items-center gap-1">
                                <Battery className="w-4 h-4 text-green-600" />
                                <span className="font-medium">{(vehicle.specifications?.current_battery_percent ?? vehicle.battery ?? 0)}%</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Tầm hoạt động:</span>
                              <span className="font-medium">{vehicle.specifications?.range_km ? `${vehicle.specifications.range_km} km` : (vehicle.range ? `${vehicle.range} km` : '—')}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Vị trí:</span>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4 text-red-500" />
                                <span className="font-medium">{vehicle.specifications?.location || vehicle.currentLocation || vehicle.location || 'TP.HCM'}</span>
                              </div>
                            </div>
                          </div>
                          
                          <Link
                            to={`/dashboard/coowner/booking/new?vehicleId=${vehicle.id}`}
                            className="block w-full mt-3 py-2 bg-gradient-to-r from-sky-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all text-center"
                          >
                            Đặt ngay
                          </Link>
                        </motion.div>
                      ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Car className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Không có xe khả dụng</p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Quick Stats */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-sky-500 to-cyan-500 rounded-3xl p-6 text-white"
              >
                <h3 className="text-xl font-bold mb-4">Thống kê nhanh</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Đã sử dụng tháng:</span>
                    <span className="font-bold">12 giờ</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Lịch đặt chờ:</span>
                    <span className="font-bold">2</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Xe ưa thích:</span>
                    <span className="font-bold">Tesla Model 3</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}