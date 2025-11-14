import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookingStore } from '../../stores/useBookingStore';
import { useGroupStore } from '../../stores/useGroupStore';
import { useVehicleStore } from '../../stores/useVehicleStore';
import { Calendar, Clock, Car } from 'lucide-react';
import CoownerLayout from '../../components/layout/CoownerLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { toast } from 'react-toastify';

export default function BookingCreate() {
  const navigate = useNavigate();
  const createBooking = useBookingStore((state) => state.createBooking);
  const groups = useGroupStore((state) => state.groups);
  const vehicles = useVehicleStore((state) => state.vehicles);
  const fetchUserGroups = useGroupStore((state) => state.fetchUserGroups);
  const fetchVehicles = useVehicleStore((state) => state.fetchVehicles);
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    vehicleId: '',
    groupId: '',
    startTime: '',
    endTime: '',
    purpose: '',
    notes: '',
  });

  useEffect(() => {
    fetchUserGroups();
    fetchVehicles();
  }, [fetchUserGroups, fetchVehicles]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createBooking(formData);
      toast.success('Đặt xe thành công!');
      navigate('/bookings');
    } catch (error) {
      toast.error(error.message || 'Đặt xe thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <CoownerLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Đặt xe mới</h1>
        <p className="mt-2 text-gray-600">
          Tạo lịch đặt xe cho nhóm của bạn
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Group Selection */}
          <Select
            label="Nhóm"
            name="groupId"
            value={formData.groupId}
            onChange={handleChange}
            options={[
              { value: '', label: 'Chọn nhóm' },
              ...groups.map(group => ({
                value: group.id,
                label: group.name,
              })),
            ]}
            required
          />

          {/* Vehicle Selection */}
          <Select
            label="Xe"
            name="vehicleId"
            value={formData.vehicleId}
            onChange={handleChange}
            options={[
              { value: '', label: 'Chọn xe' },
              ...vehicles.map(vehicle => ({
                value: vehicle.id,
                label: `${vehicle.brand} ${vehicle.model} - ${vehicle.licensePlate}`,
              })),
            ]}
            icon={Car}
            required
          />

          {/* Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              type="datetime-local"
              label="Thời gian bắt đầu"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              icon={Calendar}
              required
            />
            <Input
              type="datetime-local"
              label="Thời gian kết thúc"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              icon={Clock}
              required
            />
          </div>

          {/* Purpose */}
          <Input
            label="Mục đích sử dụng"
            name="purpose"
            value={formData.purpose}
            onChange={handleChange}
            placeholder="VD: Đi làm, đi chơi, đưa đón..."
            required
          />

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ghi chú (tùy chọn)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              placeholder="Thêm ghi chú nếu cần..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/bookings')}
            >
              Hủy
            </Button>
            <Button type="submit" isLoading={loading}>
              Đặt xe
            </Button>
          </div>
        </form>
      </Card>
    </CoownerLayout>
  );
}
