import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCostStore } from '../../stores/useCostStore';
import { useGroupStore } from '../../stores/useGroupStore';
import CoownerLayout from '../../components/layout/CoownerLayout';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Select from '../../components/ui/Select';
import { DollarSign, FileText, TrendingUp } from 'lucide-react';

export default function CostList() {
  const navigate = useNavigate();
  const costs = useCostStore((state) => state.costs);
  const fetchCosts = useCostStore((state) => state.fetchCosts);
  const groups = useGroupStore((state) => state.groups);
  const fetchGroups = useGroupStore((state) => state.fetchGroups);
  
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchCosts(),
          fetchGroups()
        ]);
      } catch (error) {
        console.error('Failed to load costs:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [fetchCosts, fetchGroups]);

  const filteredCosts = costs.filter(cost => {
    if (categoryFilter !== 'all' && cost.category !== categoryFilter) return false;
    if (statusFilter !== 'all' && cost.status !== statusFilter) return false;
    return true;
  });

  const categoryOptions = [
    { value: 'all', label: 'Tất cả danh mục' },
    { value: 'electricity', label: 'Tiền điện' },
    { value: 'maintenance', label: 'Bảo trì' },
    { value: 'insurance', label: 'Bảo hiểm' },
    { value: 'inspection', label: 'Đăng kiểm' },
    { value: 'repair', label: 'Sửa chữa' },
    { value: 'other', label: 'Khác' }
  ];

  const statusOptions = [
    { value: 'all', label: 'Tất cả trạng thái' },
    { value: 'pending', label: 'Chờ phân bổ' },
    { value: 'allocated', label: 'Đã phân bổ' },
    { value: 'paid', label: 'Đã thanh toán' },
    { value: 'partial_paid', label: 'Thanh toán một phần' }
  ];

  const columns = [
    {
      key: 'description',
      label: 'Mô tả',
      render: (cost) => (
        <div>
          <p className="font-medium text-gray-900">{cost.description}</p>
          <p className="text-sm text-gray-500">
            {groups.find(g => g.id === cost.groupId)?.name || `Nhóm #${cost.groupId}`}
          </p>
        </div>
      )
    },
    {
      key: 'category',
      label: 'Danh mục',
      render: (cost) => (
        <Badge variant="default">
          {categoryOptions.find(c => c.value === cost.category)?.label || cost.category}
        </Badge>
      )
    },
    {
      key: 'amount',
      label: 'Số tiền',
      render: (cost) => (
        <span className="font-semibold text-gray-900">
          {new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
          }).format(cost.amount)}
        </span>
      )
    },
    {
      key: 'splitMethod',
      label: 'Phương thức chia',
      render: (cost) => (
        <span className="text-sm text-gray-600">
          {cost.splitMethod === 'ownership' ? 'Theo % sở hữu' :
           cost.splitMethod === 'usage' ? 'Theo % sử dụng' :
           cost.splitMethod === 'equal' ? 'Chia đều' : cost.splitMethod}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (cost) => (
        <Badge
          variant={
            cost.status === 'paid' ? 'success' :
            cost.status === 'allocated' ? 'info' :
            cost.status === 'partial_paid' ? 'warning' : 'default'
          }
        >
          {cost.status === 'paid' ? 'Đã thanh toán' :
           cost.status === 'allocated' ? 'Đã phân bổ' :
           cost.status === 'partial_paid' ? 'TT một phần' :
           cost.status === 'pending' ? 'Chờ phân bổ' : cost.status}
        </Badge>
      )
    },
    {
      key: 'date',
      label: 'Ngày tạo',
      render: (cost) => (
        <span className="text-sm text-gray-600">
          {new Date(cost.costDate || cost.createdAt).toLocaleDateString('vi-VN')}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Thao tác',
      render: (cost) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate(`/costs/${cost.id}`)}
        >
          Chi tiết
        </Button>
      )
    }
  ];

  // Calculate statistics
  const totalAmount = filteredCosts.reduce((sum, cost) => sum + cost.amount, 0);
  const paidAmount = filteredCosts
    .filter(c => c.status === 'paid')
    .reduce((sum, cost) => sum + cost.amount, 0);
  const pendingAmount = filteredCosts
    .filter(c => c.status === 'pending' || c.status === 'allocated')
    .reduce((sum, cost) => sum + cost.amount, 0);

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
        <h1 className="text-3xl font-bold text-gray-900">Quản lý chi phí</h1>
        <p className="mt-2 text-gray-600">
          Xem và quản lý chi phí chia sẻ của nhóm
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng chi phí</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(totalAmount)}
              </p>
            </div>
            <div className="h-12 w-12 bg-sky-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-sky-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Đã thanh toán</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(paidAmount)}
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Chưa thanh toán</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(pendingAmount)}
              </p>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      <Card>
        {/* Filters */}
        <div className="mb-6 flex items-center gap-4">
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            options={categoryOptions}
            className="w-48"
          />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={statusOptions}
            className="w-48"
          />
          <div className="flex-1"></div>
          <Button onClick={() => navigate('/costs/summary')}>
            Xem báo cáo
          </Button>
        </div>

        {/* Table */}
        {filteredCosts.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">Chưa có chi phí</h3>
            <p className="mt-1 text-sm text-gray-500">
              Chi phí sẽ được tự động tạo khi có phát sinh
            </p>
          </div>
        ) : (
          <Table
            columns={columns}
            data={filteredCosts}
          />
        )}
      </Card>
    </CoownerLayout>
  );
}
