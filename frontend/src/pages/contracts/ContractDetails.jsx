// src/pages/contracts/ContractDetails.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  ArrowLeft as ArrowLeftIcon,
  FileText as DocumentTextIcon,
  Users as UserGroupIcon,
  Calendar as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Clock as ClockIcon,
  XCircle as XCircleIcon,
  Download as ArrowDownTrayIcon,
  Pencil as PencilIcon,
  FileCheck as DocumentCheckIcon,
  AlertTriangle as ExclamationTriangleIcon,
} from 'lucide-react';
import contractService from '../../services/contract.service';
import ContractSignature from '../../components/contract/ContractSignature';

const ContractDetails = () => {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatureStatus, setSignatureStatus] = useState(null);

  useEffect(() => {
    fetchContractDetails();
    fetchSignatureStatus();
  }, [contractId]);

  const fetchContractDetails = async () => {
    try {
      setLoading(true);
      const response = await contractService.getContract(contractId);
      setContract(response.data);
    } catch (error) {
      console.error('Error fetching contract:', error);
      toast.error('Không thể tải thông tin hợp đồng');
    } finally {
      setLoading(false);
    }
  };

  const fetchSignatureStatus = async () => {
    try {
      const response = await contractService.getSignatureStatus(contractId);
      setSignatureStatus(response.data);
    } catch (error) {
      console.error('Error fetching signature status:', error);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await contractService.downloadContractPDF(contractId);
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `contract-${contract?.contract_number}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      
      toast.success('Đã tải xuống hợp đồng');
    } catch (error) {
      console.error('Error downloading contract:', error);
      toast.error('Không thể tải xuống hợp đồng');
    }
  };

  const handleSignSuccess = () => {
    setShowSignatureModal(false);
    fetchContractDetails();
    fetchSignatureStatus();
    toast.success('Đã ký hợp đồng thành công');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircleIcon,
        label: 'Đang hiệu lực',
      },
      pending_signature: {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: ClockIcon,
        label: 'Chờ ký',
      },
      expired: {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: XCircleIcon,
        label: 'Hết hạn',
      },
      draft: {
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: DocumentTextIcon,
        label: 'Bản nháp',
      },
      terminated: {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: XCircleIcon,
        label: 'Đã hủy',
      },
    };

    const config = statusConfig[status] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${config.color}`}>
        <Icon className="w-5 h-5" />
        <span className="font-medium">{config.label}</span>
      </div>
    );
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
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <XCircleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy hợp đồng</h3>
        <button
          onClick={() => navigate('/dashboard/coowner/contracts')}
          className="text-blue-600 hover:text-blue-700"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const daysUntilExpiry = getDaysUntilExpiry(contract.end_date);
  const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  const needsSignature = contract.status === 'pending_signature' && !signatureStatus?.signed_by_current_user;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard/coowner/contracts')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{contract.title}</h1>
            <p className="text-gray-600 mt-1">Số hợp đồng: #{contract.contract_number}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {contract.status === 'draft' && (
            <button
              onClick={() => navigate(`/dashboard/coowner/contracts/${contractId}/edit`)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              <PencilIcon className="w-5 h-5" />
              Chỉnh sửa
            </button>
          )}
          {needsSignature && (
            <button
              onClick={() => setShowSignatureModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors animate-pulse"
            >
              <DocumentCheckIcon className="w-5 h-5" />
              Ký hợp đồng
            </button>
          )}
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            Tải xuống PDF
          </button>
        </div>
      </div>

      {/* Alert for expiring soon */}
      {isExpiringSoon && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-orange-600" />
            <div>
              <p className="font-medium text-orange-900">Hợp đồng sắp hết hạn</p>
              <p className="text-sm text-orange-700">
                Hợp đồng này sẽ hết hạn sau {daysUntilExpiry} ngày ({formatDate(contract.end_date)})
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Alert for needs signature */}
      {needsSignature && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <ClockIcon className="w-6 h-6 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-900">Cần ký hợp đồng</p>
              <p className="text-sm text-yellow-700">
                Hợp đồng này đang chờ chữ ký của bạn. Vui lòng xem xét và ký để hợp đồng có hiệu lực.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Status and Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <DocumentTextIcon className="w-6 h-6 text-gray-400" />
            <span className="text-sm text-gray-600">Trạng thái</span>
          </div>
          {getStatusBadge(contract.status)}
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <CalendarIcon className="w-6 h-6 text-gray-400" />
            <span className="text-sm text-gray-600">Ngày bắt đầu</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {formatDate(contract.start_date)}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <CalendarIcon className="w-6 h-6 text-gray-400" />
            <span className="text-sm text-gray-600">Ngày hết hạn</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {formatDate(contract.end_date)}
          </p>
          {isExpiringSoon && (
            <p className="text-sm text-orange-600 mt-1">
              Còn {daysUntilExpiry} ngày
            </p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <UserGroupIcon className="w-6 h-6 text-gray-400" />
            <span className="text-sm text-gray-600">Bên tham gia</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {contract.parties?.length || 0} bên
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex gap-8 px-6" aria-label="Tabs">
            {[
              { id: 'overview', label: 'Tổng quan' },
              { id: 'parties', label: 'Bên tham gia' },
              { id: 'terms', label: 'Điều khoản' },
              { id: 'signatures', label: 'Chữ ký' },
              { id: 'documents', label: 'Tài liệu' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Mô tả</h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {contract.description || 'Không có mô tả'}
                </p>
              </div>

              {contract.vehicle_id && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Thông tin xe</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700">Mã xe: {contract.vehicle_id}</p>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Giá trị hợp đồng</h3>
                <p className="text-2xl font-bold text-blue-600">
                  {contract.total_value?.toLocaleString('vi-VN')} VNĐ
                </p>
              </div>
            </div>
          )}

          {/* Parties Tab */}
          {activeTab === 'parties' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Danh sách bên tham gia ({contract.parties?.length || 0})
              </h3>
              <div className="grid gap-4">
                {contract.parties?.map((party, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">{party.name?.charAt(0)}</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{party.name}</h4>
                          <p className="text-sm text-gray-600">{party.role || 'Thành viên'}</p>
                          {party.email && (
                            <p className="text-sm text-gray-500 mt-1">{party.email}</p>
                          )}
                          {party.phone && (
                            <p className="text-sm text-gray-500">{party.phone}</p>
                          )}
                        </div>
                      </div>
                      <div>
                        {party.signed ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                            <CheckCircleIcon className="w-4 h-4" />
                            Đã ký
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                            <ClockIcon className="w-4 h-4" />
                            Chờ ký
                          </span>
                        )}
                      </div>
                    </div>
                    {party.ownership_percentage && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-sm text-gray-600">
                          Tỷ lệ sở hữu: <span className="font-semibold">{party.ownership_percentage}%</span>
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Terms Tab */}
          {activeTab === 'terms' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Điều khoản hợp đồng</h3>
              <div className="prose max-w-none">
                {contract.terms ? (
                  <div className="whitespace-pre-wrap text-gray-700">{contract.terms}</div>
                ) : (
                  <p className="text-gray-500">Không có điều khoản cụ thể</p>
                )}
              </div>
            </div>
          )}

          {/* Signatures Tab */}
          {activeTab === 'signatures' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Trạng thái chữ ký</h3>
              {signatureStatus ? (
                <div className="space-y-3">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-900">Tổng số chữ ký cần thiết</span>
                      <span className="font-semibold text-blue-900">
                        {signatureStatus.signed_count}/{signatureStatus.total_required}
                      </span>
                    </div>
                    <div className="mt-2 bg-blue-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${(signatureStatus.signed_count / signatureStatus.total_required) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {signatureStatus.signatures?.map((sig, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{sig.signer_name}</p>
                          <p className="text-sm text-gray-600">{sig.signer_email}</p>
                          {sig.signed_at && (
                            <p className="text-xs text-gray-500 mt-1">
                              Đã ký lúc: {formatDate(sig.signed_at)}
                            </p>
                          )}
                        </div>
                        {sig.signed ? (
                          <CheckCircleIcon className="w-6 h-6 text-green-600" />
                        ) : (
                          <ClockIcon className="w-6 h-6 text-yellow-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Đang tải thông tin chữ ký...</p>
              )}
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Tài liệu đính kèm</h3>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Tải lên tài liệu
                </button>
              </div>
              {contract.documents?.length > 0 ? (
                <div className="grid gap-3">
                  {contract.documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center gap-3">
                        <DocumentTextIcon className="w-6 h-6 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">{doc.name}</p>
                          <p className="text-sm text-gray-500">{doc.size}</p>
                        </div>
                      </div>
                      <button className="text-blue-600 hover:text-blue-700">
                        <ArrowDownTrayIcon className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">Chưa có tài liệu đính kèm</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Signature Modal */}
      {showSignatureModal && (
        <ContractSignature
          contractId={contractId}
          contract={contract}
          onSuccess={handleSignSuccess}
          onClose={() => setShowSignatureModal(false)}
        />
      )}
    </div>
  );
};

export default ContractDetails;
