// src/pages/contracts/ContractList.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FileText as DocumentTextIcon,
  Plus as PlusIcon,
  Filter as FunnelIcon,
  Search as MagnifyingGlassIcon,
  FileCheck as DocumentCheckIcon,
  Clock as ClockIcon,
  XCircle as XCircleIcon,
  Download as ArrowDownTrayIcon,
  Eye as EyeIcon,
  Pencil as PencilIcon,
  Trash2 as TrashIcon,
} from 'lucide-react';
import contractService from '../../services/contract.service';
import LoadingSkeleton from '../../components/LoadingSkeleton';

const ContractList = () => {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [filteredContracts, setFilteredContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    expired: 0,
    signed: 0,
  });

  useEffect(() => {
    fetchContracts();
  }, []);

  useEffect(() => {
    filterContracts();
  }, [contracts, searchTerm, statusFilter]);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      // Get user's groups first (simplified - in real app get from user context)
      const response = await contractService.getUserContracts();
      
      const contractsData = response.data || [];
      setContracts(contractsData);
      
      // Calculate stats
      const statsData = {
        total: contractsData.length,
        active: contractsData.filter(c => c.status === 'active').length,
        pending: contractsData.filter(c => c.status === 'pending_signature').length,
        expired: contractsData.filter(c => c.status === 'expired').length,
        signed: contractsData.filter(c => c.signed_by_user).length,
      };
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching contracts:', error);
      toast.error('Không thể tải danh sách hợp đồng');
    } finally {
      setLoading(false);
    }
  };

  const filterContracts = () => {
    let filtered = [...contracts];

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(contract => contract.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(contract =>
        contract.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.contract_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.parties?.some(p => 
          p.name?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    setFilteredContracts(filtered);
  };

  const handleDownload = async (contractId, contractNumber) => {
    try {
      const response = await contractService.downloadContractPDF(contractId);
      
      // Create blob link to download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `contract-${contractNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      
      toast.success('Đã tải xuống hợp đồng');
    } catch (error) {
      console.error('Error downloading contract:', error);
      toast.error('Không thể tải xuống hợp đồng');
    }
  };

  const handleDelete = async (contractId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa hợp đồng này?')) {
      return;
    }

    try {
      await contractService.deleteContract(contractId);
      toast.success('Đã xóa hợp đồng');
      fetchContracts(); // Refresh list
    } catch (error) {
      console.error('Error deleting contract:', error);
      toast.error('Không thể xóa hợp đồng');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: {
        color: 'bg-green-100 text-green-800',
        icon: DocumentCheckIcon,
        label: 'Đang hiệu lực',
      },
      pending_signature: {
        color: 'bg-yellow-100 text-yellow-800',
        icon: ClockIcon,
        label: 'Chờ ký',
      },
      expired: {
        color: 'bg-red-100 text-red-800',
        icon: XCircleIcon,
        label: 'Hết hạn',
      },
      draft: {
        color: 'bg-gray-100 text-gray-800',
        icon: DocumentTextIcon,
        label: 'Bản nháp',
      },
      terminated: {
        color: 'bg-red-100 text-red-800',
        icon: XCircleIcon,
        label: 'Đã hủy',
      },
    };

    const config = statusConfig[status] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon className="w-4 h-4" />
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getDaysUntilExpiry = (expiryDate) => {
    if (!expiryDate) return null;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return <LoadingSkeleton.ListSkeleton items={4} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hợp đồng</h1>
          <p className="text-gray-600 mt-1">Quản lý hợp đồng đồng sở hữu xe điện</p>
        </div>
        <button
          onClick={() => navigate('/dashboard/coowner/contracts/new')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Tạo hợp đồng mới
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Tổng hợp đồng</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <DocumentTextIcon className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Đang hiệu lực</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.active}</p>
            </div>
            <DocumentCheckIcon className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Chờ ký</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
            </div>
            <ClockIcon className="w-8 h-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Đã ký</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{stats.signed}</p>
            </div>
            <DocumentCheckIcon className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Hết hạn</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{stats.expired}</p>
            </div>
            <XCircleIcon className="w-8 h-8 text-red-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, số hợp đồng, bên tham gia..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hiệu lực</option>
              <option value="pending_signature">Chờ ký</option>
              <option value="draft">Bản nháp</option>
              <option value="expired">Hết hạn</option>
              <option value="terminated">Đã hủy</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contracts List */}
      {filteredContracts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-200">
          <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || statusFilter !== 'all' 
              ? 'Không tìm thấy hợp đồng' 
              : 'Chưa có hợp đồng nào'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || statusFilter !== 'all'
              ? 'Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác'
              : 'Tạo hợp đồng mới để bắt đầu'}
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <button
              onClick={() => navigate('/dashboard/coowner/contracts/new')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              Tạo hợp đồng đầu tiên
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hợp đồng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bên tham gia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày bắt đầu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày hết hạn
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredContracts.map((contract) => {
                  const daysUntilExpiry = getDaysUntilExpiry(contract.end_date);
                  const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 30 && daysUntilExpiry > 0;

                  return (
                    <tr key={contract.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <DocumentTextIcon className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {contract.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              #{contract.contract_number}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {contract.parties?.length || 0} bên
                        </div>
                        {contract.parties?.slice(0, 2).map((party, idx) => (
                          <div key={idx} className="text-xs text-gray-500">
                            {party.name}
                          </div>
                        ))}
                        {contract.parties?.length > 2 && (
                          <div className="text-xs text-blue-600">
                            +{contract.parties.length - 2} khác
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatDate(contract.start_date)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {formatDate(contract.end_date)}
                        </div>
                        {isExpiringSoon && (
                          <div className="text-xs text-orange-600 font-medium">
                            Còn {daysUntilExpiry} ngày
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(contract.status)}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/dashboard/coowner/contracts/${contract.id}`)}
                            className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Xem chi tiết"
                          >
                            <EyeIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDownload(contract.id, contract.contract_number)}
                            className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded-lg transition-colors"
                            title="Tải xuống"
                          >
                            <ArrowDownTrayIcon className="w-5 h-5" />
                          </button>
                          {contract.status === 'draft' && (
                            <>
                              <button
                                onClick={() => navigate(`/dashboard/coowner/contracts/${contract.id}/edit`)}
                                className="text-yellow-600 hover:text-yellow-900 p-2 hover:bg-yellow-50 rounded-lg transition-colors"
                                title="Chỉnh sửa"
                              >
                                <PencilIcon className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDelete(contract.id)}
                                className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                title="Xóa"
                              >
                                <TrashIcon className="w-5 h-5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractList;
