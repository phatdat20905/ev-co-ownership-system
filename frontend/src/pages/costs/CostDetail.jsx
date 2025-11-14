import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCostStore } from '../../stores/useCostStore';
import { useGroupStore } from '../../stores/useGroupStore';
import { FileText, DollarSign, Users, Calendar, CheckCircle, XCircle } from 'lucide-react';
import CoownerLayout from '../../components/layout/CoownerLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Table from '../../components/ui/Table';
import { toast } from 'react-toastify';

export default function CostDetail() {
  const { costId } = useParams();
  const navigate = useNavigate();
  const currentCost = useCostStore((state) => state.currentCost);
  const fetchCost = useCostStore((state) => state.fetchCost);
  const groups = useGroupStore((state) => state.groups);
  const fetchGroups = useGroupStore((state) => state.fetchGroups);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchCost(costId),
          fetchGroups()
        ]);
      } catch (error) {
        console.error('Failed to load cost:', error);
        toast.error('Không thể tải thông tin chi phí');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [costId, fetchCost, fetchGroups]);

  if (loading) {
    return (
      <CoownerLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
        </div>
      </CoownerLayout>
    );
  }

  if (!currentCost) {
    return (
      <CoownerLayout>
        <Card>
          <p className="text-center text-gray-600 py-12">Không tìm thấy thông tin chi phí</p>
        </Card>
      </CoownerLayout>
    );
  }

  const group = groups.find(g => g.id === currentCost.groupId);
  
  // Split allocations (mock data - should come from API)
  const allocations = currentCost.allocations || [
    {
      userId: 1,
      userName: 'Nguyễn Văn A',
      percentage: 40,
      amount: currentCost.amount * 0.4,
      paid: true,
      paidAt: new Date().toISOString()
    },
    {
      userId: 2,
      userName: 'Trần Thị B',
      percentage: 35,
      amount: currentCost.amount * 0.35,
      paid: false,
      paidAt: null
    },
    {
      userId: 3,
      userName: 'Lê Văn C',
      percentage: 25,
      amount: currentCost.amount * 0.25,
      paid: true,
      paidAt: new Date().toISOString()
    }
  ];

  const allocationColumns = [
    {
      key: 'user',
      label: 'Thành viên',
      render: (allocation) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-sky-100 flex items-center justify-center">
            <span className="text-sm font-semibold text-sky-600">
              {allocation.userName.charAt(0)}
            </span>
          </div>
          <span className="font-medium text-gray-900">{allocation.userName}</span>
        </div>
      )
    },
    {
      key: 'percentage',
      label: 'Tỷ lệ',
      render: (allocation) => (
        <span className="text-gray-700">{allocation.percentage}%</span>
      )
    },
    {
      key: 'amount',
      label: 'Số tiền',
      render: (allocation) => (
        <span className="font-semibold text-gray-900">
          {new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
          }).format(allocation.amount)}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (allocation) => (
        <Badge variant={allocation.paid ? 'success' : 'warning'}>
          {allocation.paid ? 'Đã thanh toán' : 'Chưa thanh toán'}
        </Badge>
      )
    },
    {
      key: 'paidAt',
      label: 'Ngày thanh toán',
      render: (allocation) => (
        <span className="text-sm text-gray-600">
          {allocation.paidAt ? new Date(allocation.paidAt).toLocaleDateString('vi-VN') : '-'}
        </span>
      )
    }
  ];

  const paidCount = allocations.filter(a => a.paid).length;
  const paidAmount = allocations.filter(a => a.paid).reduce((sum, a) => sum + a.amount, 0);

  return (
    <CoownerLayout>
      <div className="mb-8">
        <Button
          variant="outline"
          onClick={() => navigate('/costs')}
          className="mb-4"
        >
          ← Quay lại
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Chi tiết chi phí</h1>
        <p className="mt-2 text-gray-600">
          Mã chi phí: #{currentCost.id}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Thông tin chi phí">
            <div className="space-y-4">
              <InfoRow
                icon={FileText}
                label="Mô tả"
                value={currentCost.description}
              />
              <InfoRow
                icon={DollarSign}
                label="Số tiền"
                value={new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(currentCost.amount)}
              />
              <InfoRow
                icon={Users}
                label="Nhóm"
                value={group?.name || `Nhóm #${currentCost.groupId}`}
              />
              <InfoRow
                icon={Calendar}
                label="Ngày phát sinh"
                value={new Date(currentCost.costDate || currentCost.createdAt).toLocaleDateString('vi-VN')}
              />
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <FileText className="h-5 w-5 text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Danh mục</p>
                  <Badge variant="default" className="mt-1">
                    {currentCost.category === 'electricity' ? 'Tiền điện' :
                     currentCost.category === 'maintenance' ? 'Bảo trì' :
                     currentCost.category === 'insurance' ? 'Bảo hiểm' :
                     currentCost.category === 'inspection' ? 'Đăng kiểm' :
                     currentCost.category === 'repair' ? 'Sửa chữa' : 'Khác'}
                  </Badge>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <Users className="h-5 w-5 text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Phương thức chia</p>
                  <p className="text-gray-900 font-medium">
                    {currentCost.splitMethod === 'ownership' ? 'Theo % sở hữu' :
                     currentCost.splitMethod === 'usage' ? 'Theo % sử dụng' :
                     currentCost.splitMethod === 'equal' ? 'Chia đều' : currentCost.splitMethod}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Allocations */}
          <Card title="Phân bổ chi phí">
            <Table
              columns={allocationColumns}
              data={allocations}
            />
            
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-gray-700">
                    Đã thanh toán: {paidCount}/{allocations.length} thành viên
                  </span>
                </div>
                <span className="font-semibold text-gray-900">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(paidAmount)}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Status & Actions */}
        <div className="space-y-6">
          <Card title="Trạng thái">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Trạng thái hiện tại</p>
                <Badge
                  variant={
                    currentCost.status === 'paid' ? 'success' :
                    currentCost.status === 'allocated' ? 'info' :
                    currentCost.status === 'partial_paid' ? 'warning' : 'default'
                  }
                  className="text-base px-4 py-2"
                >
                  {currentCost.status === 'paid' ? 'Đã thanh toán' :
                   currentCost.status === 'allocated' ? 'Đã phân bổ' :
                   currentCost.status === 'partial_paid' ? 'TT một phần' :
                   currentCost.status === 'pending' ? 'Chờ phân bổ' : currentCost.status}
                </Badge>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Tạo lúc</p>
                <p className="text-gray-900">
                  {new Date(currentCost.createdAt).toLocaleString('vi-VN')}
                </p>
              </div>

              {currentCost.updatedAt && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Cập nhật lúc</p>
                  <p className="text-gray-900">
                    {new Date(currentCost.updatedAt).toLocaleString('vi-VN')}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Payment Summary */}
          <Card title="Tóm tắt thanh toán">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tổng số tiền</span>
                <span className="font-semibold text-gray-900">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(currentCost.amount)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Đã thu</span>
                <span className="font-semibold text-green-600">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(paidAmount)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                <span className="text-sm text-gray-600">Còn thiếu</span>
                <span className="font-semibold text-orange-600">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(currentCost.amount - paidAmount)}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </CoownerLayout>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-gray-900 font-medium">{value}</p>
      </div>
    </div>
  );
}
