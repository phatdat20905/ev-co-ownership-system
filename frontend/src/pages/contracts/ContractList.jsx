import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContractStore } from '../../stores/useContractStore';
import { useGroupStore } from '../../stores/useGroupStore';
import { FileText, Download, Search } from 'lucide-react';
import CoownerLayout from '../../components/layout/CoownerLayout';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';

export default function ContractList() {
  const navigate = useNavigate();
  const contracts = useContractStore((state) => state.contracts);
  const fetchContracts = useContractStore((state) => state.fetchContracts);
  const groups = useGroupStore((state) => state.groups);
  const fetchGroups = useGroupStore((state) => state.fetchGroups);
  
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchContracts(),
          fetchGroups()
        ]);
      } catch (error) {
        console.error('Failed to load contracts:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [fetchContracts, fetchGroups]);

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = searchQuery === '' ||
      contract.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contract.contractNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const statusOptions = [
    { value: 'all', label: 'Tất cả trạng thái' },
    { value: 'draft', label: 'Nháp' },
    { value: 'pending', label: 'Chờ ký' },
    { value: 'signed', label: 'Đã ký' },
    { value: 'expired', label: 'Hết hạn' },
    { value: 'cancelled', label: 'Đã hủy' }
  ];

  const columns = [
    {
      key: 'title',
      label: 'Tiêu đề hợp đồng',
      render: (contract) => (
        <div>
          <p className="font-medium text-gray-900">{contract.title || 'Hợp đồng chưa có tiêu đề'}</p>
          <p className="text-sm text-gray-500">
            {contract.contractNumber || `#${contract.id}`}
          </p>
        </div>
      )
    },
    {
      key: 'group',
      label: 'Nhóm',
      render: (contract) => (
        <span className="text-gray-700">
          {groups.find(g => g.id === contract.groupId)?.name || `Nhóm #${contract.groupId}`}
        </span>
      )
    },
    {
      key: 'type',
      label: 'Loại hợp đồng',
      render: (contract) => (
        <Badge variant="default">
          {contract.type === 'co-ownership' ? 'Sở hữu chung' :
           contract.type === 'cost-sharing' ? 'Chia sẻ chi phí' :
           contract.type === 'usage-agreement' ? 'Thỏa thuận sử dụng' : contract.type}
        </Badge>
      )
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (contract) => (
        <Badge
          variant={
            contract.status === 'signed' ? 'success' :
            contract.status === 'pending' ? 'warning' :
            contract.status === 'expired' ? 'danger' :
            contract.status === 'cancelled' ? 'danger' : 'default'
          }
        >
          {contract.status === 'signed' ? 'Đã ký' :
           contract.status === 'pending' ? 'Chờ ký' :
           contract.status === 'expired' ? 'Hết hạn' :
           contract.status === 'cancelled' ? 'Đã hủy' :
           contract.status === 'draft' ? 'Nháp' : contract.status}
        </Badge>
      )
    },
    {
      key: 'dates',
      label: 'Ngày hiệu lực',
      render: (contract) => (
        <div className="text-sm">
          <p className="text-gray-900">
            {contract.startDate ? new Date(contract.startDate).toLocaleDateString('vi-VN') : '-'}
          </p>
          {contract.endDate && (
            <p className="text-gray-500">
              → {new Date(contract.endDate).toLocaleDateString('vi-VN')}
            </p>
          )}
        </div>
      )
    },
    {
      key: 'signatures',
      label: 'Chữ ký',
      render: (contract) => {
        const signed = contract.signatures?.filter(s => s.signed).length || 0;
        const total = contract.signatures?.length || 0;
        return (
          <span className="text-sm text-gray-700">
            {signed}/{total}
          </span>
        );
      }
    },
    {
      key: 'actions',
      label: 'Thao tác',
      render: (contract) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/contracts/${contract.id}`)}
          >
            Chi tiết
          </Button>
          {contract.status === 'signed' && (
            <Button
              size="sm"
              variant="ghost"
              icon={Download}
              onClick={(e) => {
                e.stopPropagation();
                // Handle PDF download
                console.log('Download contract', contract.id);
              }}
            />
          )}
        </div>
      )
    }
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
        <h1 className="text-3xl font-bold text-gray-900">Hợp đồng điện tử</h1>
        <p className="mt-2 text-gray-600">
          Quản lý hợp đồng và chữ ký điện tử
        </p>
      </div>

      <Card>
        {/* Filters */}
        <div className="mb-6 flex items-center gap-4">
          <Input
            icon={Search}
            placeholder="Tìm kiếm hợp đồng..."
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

        {/* Table */}
        {filteredContracts.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">Chưa có hợp đồng</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery || statusFilter !== 'all' 
                ? 'Không tìm thấy hợp đồng phù hợp'
                : 'Hợp đồng sẽ được tạo khi gia nhập nhóm'
              }
            </p>
          </div>
        ) : (
          <Table
            columns={columns}
            data={filteredContracts}
          />
        )}
      </Card>
    </CoownerLayout>
  );
}
