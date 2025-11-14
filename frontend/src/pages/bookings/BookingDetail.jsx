import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBookingStore } from '../../stores/useBookingStore';
import { Calendar, Clock, Car, MapPin, FileText, Trash2 } from 'lucide-react';
import CoownerLayout from '../../components/layout/CoownerLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { toast } from 'react-toastify';

export default function BookingDetail() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const currentBooking = useBookingStore((state) => state.currentBooking);
  const fetchBooking = useBookingStore((state) => state.fetchBooking);
  const cancelBooking = useBookingStore((state) => state.cancelBooking);
  
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const loadBooking = async () => {
      try {
        await fetchBooking(bookingId);
      } catch (error) {
        console.error('Failed to load booking:', error);
        toast.error('Không thể tải thông tin đặt xe');
      } finally {
        setLoading(false);
      }
    };
    loadBooking();
  }, [bookingId, fetchBooking]);

  const handleCancelBooking = async () => {
    setCancelling(true);
    try {
      await cancelBooking(bookingId);
      toast.success('Đã hủy đặt xe');
      navigate('/bookings');
    } catch (error) {
      toast.error(error.message || 'Không thể hủy đặt xe');
    } finally {
      setCancelling(false);
      setShowCancelModal(false);
    }
  };

  if (loading) {
    return (
      <CoownerLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
        </div>
      </CoownerLayout>
    );
  }

  if (!currentBooking) {
    return (
      <CoownerLayout>
        <Card>
          <p className="text-center text-gray-600 py-12">Không tìm thấy thông tin đặt xe</p>
        </Card>
      </CoownerLayout>
    );
  }

  return (
    <CoownerLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Chi tiết đặt xe</h1>
          <p className="mt-2 text-gray-600">
            Mã đặt xe: #{currentBooking.id}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {(currentBooking.status === 'pending' || currentBooking.status === 'confirmed') && (
            <Button
              variant="danger"
              icon={Trash2}
              onClick={() => setShowCancelModal(true)}
            >
              Hủy đặt xe
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Thông tin đặt xe">
            <div className="space-y-4">
              <InfoRow
                icon={Car}
                label="Xe"
                value={`${currentBooking.vehicleName || currentBooking.vehicleId}`}
                subtitle={currentBooking.vehicleLicensePlate}
              />
              <InfoRow
                icon={Calendar}
                label="Thời gian bắt đầu"
                value={new Date(currentBooking.startTime).toLocaleString('vi-VN')}
              />
              <InfoRow
                icon={Clock}
                label="Thời gian kết thúc"
                value={new Date(currentBooking.endTime).toLocaleString('vi-VN')}
              />
              <InfoRow
                icon={FileText}
                label="Mục đích"
                value={currentBooking.purpose || 'Không có'}
              />
            </div>
          </Card>

          {currentBooking.notes && (
            <Card title="Ghi chú">
              <p className="text-gray-700">{currentBooking.notes}</p>
            </Card>
          )}
        </div>

        {/* Status & Actions */}
        <div className="space-y-6">
          <Card title="Trạng thái">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Trạng thái hiện tại</p>
                <Badge
                  variant={
                    currentBooking.status === 'confirmed' ? 'success' :
                    currentBooking.status === 'pending' ? 'warning' :
                    currentBooking.status === 'cancelled' ? 'danger' : 'default'
                  }
                  className="text-base px-4 py-2"
                >
                  {currentBooking.status === 'confirmed' ? 'Đã xác nhận' :
                   currentBooking.status === 'pending' ? 'Chờ duyệt' :
                   currentBooking.status === 'cancelled' ? 'Đã hủy' :
                   currentBooking.status === 'completed' ? 'Hoàn thành' : currentBooking.status}
                </Badge>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Tạo lúc</p>
                <p className="text-gray-900">
                  {new Date(currentBooking.createdAt).toLocaleString('vi-VN')}
                </p>
              </div>

              {currentBooking.updatedAt && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Cập nhật lúc</p>
                  <p className="text-gray-900">
                    {new Date(currentBooking.updatedAt).toLocaleString('vi-VN')}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Cancel Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Xác nhận hủy đặt xe"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setShowCancelModal(false)}
            >
              Đóng
            </Button>
            <Button
              variant="danger"
              isLoading={cancelling}
              onClick={handleCancelBooking}
            >
              Xác nhận hủy
            </Button>
          </>
        }
      >
        <p className="text-gray-700">
          Bạn có chắc chắn muốn hủy đặt xe này? Hành động này không thể hoàn tác.
        </p>
      </Modal>
    </CoownerLayout>
  );
}

function InfoRow({ icon: Icon, label, value, subtitle }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-gray-900 font-medium">{value}</p>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
    </div>
  );
}
