import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCostStore } from '../../stores/useCostStore';
import { useGroupStore } from '../../stores/useGroupStore';
import { DollarSign, TrendingUp, TrendingDown, PieChart, BarChart3, Calendar } from 'lucide-react';
import CoownerLayout from '../../components/layout/CoownerLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';

export default function CostSummary() {
  const navigate = useNavigate();
  const costs = useCostStore((state) => state.costs);
  const fetchCosts = useCostStore((state) => state.fetchCosts);
  const groups = useGroupStore((state) => state.groups);
  const fetchGroups = useGroupStore((state) => state.fetchGroups);
  
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchCosts(),
          fetchGroups()
        ]);
      } catch (error) {
        console.error('Failed to load cost summary:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [fetchCosts, fetchGroups]);

  // Filter costs
  const filteredCosts = costs.filter(cost => {
    if (selectedGroup !== 'all' && cost.groupId !== parseInt(selectedGroup)) return false;
    
    // Filter by period (month/quarter/year)
    const costDate = new Date(cost.costDate || cost.createdAt);
    const now = new Date();
    
    if (selectedPeriod === 'month') {
      return costDate.getMonth() === now.getMonth() && 
             costDate.getFullYear() === now.getFullYear();
    } else if (selectedPeriod === 'quarter') {
      const currentQuarter = Math.floor(now.getMonth() / 3);
      const costQuarter = Math.floor(costDate.getMonth() / 3);
      return costQuarter === currentQuarter && 
             costDate.getFullYear() === now.getFullYear();
    } else if (selectedPeriod === 'year') {
      return costDate.getFullYear() === now.getFullYear();
    }
    
    return true;
  });

  // Calculate statistics
  const totalCosts = filteredCosts.reduce((sum, cost) => sum + cost.amount, 0);
  const paidCosts = filteredCosts
    .filter(c => c.status === 'paid')
    .reduce((sum, cost) => sum + cost.amount, 0);
  const unpaidCosts = totalCosts - paidCosts;

  // Costs by category
  const categoryStats = filteredCosts.reduce((acc, cost) => {
    const category = cost.category || 'other';
    acc[category] = (acc[category] || 0) + cost.amount;
    return acc;
  }, {});

  const categoryLabels = {
    electricity: 'Tiền điện',
    maintenance: 'Bảo trì',
    insurance: 'Bảo hiểm',
    inspection: 'Đăng kiểm',
    repair: 'Sửa chữa',
    other: 'Khác'
  };

  // Costs by month (for current year)
  const monthlyCosts = Array.from({ length: 12 }, (_, i) => {
    const monthCosts = filteredCosts.filter(cost => {
      const date = new Date(cost.costDate || cost.createdAt);
      return date.getMonth() === i && date.getFullYear() === new Date().getFullYear();
    });
    return monthCosts.reduce((sum, cost) => sum + cost.amount, 0);
  });

  const monthNames = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
  const maxMonthly = Math.max(...monthlyCosts, 1);

  // Group options
  const groupOptions = [
    { value: 'all', label: 'Tất cả nhóm' },
    ...groups.map(g => ({ value: g.id.toString(), label: g.name }))
  ];

  const periodOptions = [
    { value: 'month', label: 'Tháng này' },
    { value: 'quarter', label: 'Quý này' },
    { value: 'year', label: 'Năm nay' }
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
        <h1 className="text-3xl font-bold text-gray-900">Báo cáo chi phí</h1>
        <p className="mt-2 text-gray-600">
          Thống kê và phân tích chi phí
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex items-center gap-4">
          <Select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            options={groupOptions}
            className="w-48"
          />
          <Select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            options={periodOptions}
            className="w-48"
          />
          <div className="flex-1"></div>
          <Button
            variant="outline"
            onClick={() => navigate('/costs')}
          >
            Danh sách chi phí
          </Button>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng chi phí</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(totalCosts)}
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
                }).format(paidCosts)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {totalCosts > 0 ? Math.round((paidCosts / totalCosts) * 100) : 0}% tổng chi phí
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
                }).format(unpaidCosts)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {totalCosts > 0 ? Math.round((unpaidCosts / totalCosts) * 100) : 0}% tổng chi phí
              </p>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Costs by Category */}
        <Card title="Chi phí theo danh mục">
          <div className="space-y-4">
            {Object.entries(categoryStats).map(([category, amount]) => {
              const percentage = totalCosts > 0 ? (amount / totalCosts) * 100 : 0;
              return (
                <div key={category}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {categoryLabels[category] || category}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                      }).format(amount)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-sky-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {percentage.toFixed(1)}% tổng chi phí
                  </p>
                </div>
              );
            })}
            {Object.keys(categoryStats).length === 0 && (
              <div className="text-center py-8">
                <PieChart className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">Chưa có dữ liệu</p>
              </div>
            )}
          </div>
        </Card>

        {/* Monthly Trend */}
        <Card title="Biểu đồ chi phí theo tháng">
          <div className="space-y-2">
            {monthlyCosts.map((amount, index) => {
              const height = maxMonthly > 0 ? (amount / maxMonthly) * 100 : 0;
              return (
                <div key={index} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-8">{monthNames[index]}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-sky-500 to-sky-600 h-6 rounded-full transition-all duration-300 flex items-center justify-end pr-2"
                      style={{ width: `${height}%` }}
                    >
                      {amount > 0 && (
                        <span className="text-xs font-semibold text-white">
                          {(amount / 1000000).toFixed(1)}M
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {monthlyCosts.every(m => m === 0) && (
              <div className="text-center py-8">
                <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">Chưa có dữ liệu</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Recent Costs */}
      <Card title="Chi phí gần đây" className="mt-6">
        <div className="space-y-3">
          {filteredCosts.slice(0, 5).map((cost) => (
            <div
              key={cost.id}
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
              onClick={() => navigate(`/costs/${cost.id}`)}
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-sky-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-sky-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{cost.description}</p>
                  <p className="text-sm text-gray-500">
                    {categoryLabels[cost.category] || cost.category} • {' '}
                    {new Date(cost.costDate || cost.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(cost.amount)}
                </p>
                <p className="text-sm text-gray-500">
                  {cost.status === 'paid' ? 'Đã TT' :
                   cost.status === 'allocated' ? 'Đã phân bổ' : 'Chờ'}
                </p>
              </div>
            </div>
          ))}
          {filteredCosts.length === 0 && (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">Chưa có chi phí nào</p>
            </div>
          )}
        </div>
      </Card>
    </CoownerLayout>
  );
}
