import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useSearchParams, useParams, useLocation, useNavigate } from 'react-router-dom';
import { FileText, Download, Printer, Share2, CheckCircle, Clock, AlertCircle, ArrowLeft, Eye } from 'lucide-react';
import Header from '../../../../components/layout/Header';
import Footer from '../../../../components/layout/Footer';
import { contractAPI } from '../../../../api/contract';
import { showToast } from '../../../../utils/toast';

export default function ContractViewer() {
  const [searchParams] = useSearchParams();
  const params = useParams();
  const location = useLocation();

  // Resolve contractId from multiple possible sources to be robust against different navigation patterns
  const resolveContractId = () => {
    // 1. URL param (e.g. /contract/:id)
    if (params && params.id) return params.id;

    // 2. Query string (?id=...)
    const q = searchParams.get('id');
    if (q) return q;

    // 3. Path segment after "contract" (e.g. /contract/{id}/documents)
    try {
      const parts = location.pathname.split('/').filter(Boolean);
      const idx = parts.findIndex(p => p === 'contract');
      if (idx >= 0 && parts.length > idx + 1) return parts[idx + 1];
    } catch (e) {
      // ignore
    }

    // 4. Location state
    if (location && location.state && location.state.contractId) return location.state.contractId;

    return null;
  };

  const initialContractId = resolveContractId();
  const [resolvedId, setResolvedId] = useState(initialContractId);
  const navigate = useNavigate();

  // If no id in URL, try to auto-select user's first contract and navigate to include id
  useEffect(() => {
    const ensureContractId = async () => {
      if (resolvedId) return;

      try {
        const resp = await contractAPI.getUserContracts();
        if (resp && resp.success && Array.isArray(resp.data) && resp.data.length > 0) {
          const firstId = resp.data[0].id;
          setResolvedId(firstId);
          // update URL to include query param so copy/paste and reload keep id
          navigate(`${location.pathname}?id=${firstId}`, { replace: true });
          return;
        }
      } catch (e) {
        console.error('Error fetching user contracts for fallback id:', e);
      }

      // If no contracts, redirect back to ownership listing
      showToast.error('Không tìm thấy hợp đồng nào. Vui lòng tạo hợp đồng hoặc chọn hợp đồng khác.');
      navigate('/dashboard/coowner/ownership', { replace: true });
    };

    ensureContractId();
  }, [resolvedId, navigate, location.pathname]);
  
  const [contract, setContract] = useState(null);
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'expired': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Đang hiệu lực';
      case 'pending': return 'Chờ ký kết';
      case 'expired': return 'Đã hết hạn';
      case 'signed': return 'Đã ký';
      case 'draft': return 'Nháp';
      case 'terminated': return 'Đã hủy';
      default: return 'Không xác định';
    }
  };

  // Fetch contract data
  useEffect(() => {
    const fetchContractData = async () => {
      if (!resolvedId) return; // wait until resolvedId is available

      try {
        setLoading(true);

        // Fetch contract details
        const contractResponse = await contractAPI.getContractById(resolvedId);
        if (contractResponse.success) {
          setContract(contractResponse.data);
        } else {
          showToast.error(contractResponse.message || 'Không thể tải thông tin hợp đồng');
        }

        // Fetch parties
        const partiesResponse = await contractAPI.getParties(resolvedId);
        if (partiesResponse.success) {
          setParties(partiesResponse.data || []);
        }
      } catch (error) {
        console.error('Error fetching contract:', error);
        showToast.error('Có lỗi xảy ra khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    fetchContractData();
  }, [resolvedId]);

  // Download contract PDF
  const handleDownloadContract = async () => {
    if (!resolvedId) return;

    try {
      setDownloading(true);
      const blob = await contractAPI.downloadContract(resolvedId);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
  link.setAttribute('download', `contract_${resolvedId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      showToast.success('Tải xuống hợp đồng thành công');
    } catch (error) {
      console.error('Download error:', error);
      showToast.error('Không thể tải xuống hợp đồng');
    } finally {
      setDownloading(false);
    }
  };

  // Print contract
  const handlePrintContract = () => {
    window.print();
  };

  // Share contract
  const handleShareContract = () => {
    if (navigator.share) {
      navigator.share({
        title: contract?.title || 'Hợp đồng',
        text: 'Xem hợp đồng đồng sở hữu',
        url: window.location.href,
      }).catch(err => console.log('Share error:', err));
    } else {
      // Fallback: copy link to clipboard
      navigator.clipboard.writeText(window.location.href);
      showToast.success('Đã sao chép link vào clipboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="pt-20">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="pt-20">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy hợp đồng</h3>
              <p className="text-gray-600 mb-6">Hợp đồng không tồn tại hoặc bạn không có quyền truy cập.</p>
              <Link
                to="/dashboard/coowner/ownership"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
              >
                <ArrowLeft className="w-5 h-5" />
                Quay lại
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-20">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <Link
              to="/dashboard/coowner/ownership"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              Quay lại Quản lý quyền sở hữu
            </Link>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900">
                  Hợp đồng Đồng sở hữu
                </h1>
                <p className="text-xl text-gray-600 mt-2">
                  {contract.title}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(contract.status)}`}>
                  {getStatusText(contract.status)}
                </span>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                {/* Contract Header */}
                <div className="border-b border-gray-200 pb-6 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{contract.title}</h2>
                      <p className="text-gray-600">Mã hợp đồng: {contract.contract_number || contract.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Ngày hiệu lực</p>
                      <p className="font-semibold text-gray-900">
                        {contract.effective_date ? new Date(contract.effective_date).toLocaleDateString('vi-VN') : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contract Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin các bên</h3>
                    <div className="space-y-3">
                      {parties.length > 0 ? (
                        parties.map((party, index) => (
                          <div key={party.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">
                                {party.user_id ? `User ID: ${party.user_id.substring(0, 8)}...` : 'Unknown User'}
                              </p>
                              <p className="text-sm text-gray-600">
                                {party.party_role === 'owner' ? 'Chủ sở hữu' : 
                                 party.party_role === 'co_owner' ? 'Đồng sở hữu' : party.party_role}
                              </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              party.has_signed ? 'bg-green-100 text-green-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {parseFloat(party.ownership_percentage || 0).toFixed(0)}%
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-center py-4">Chưa có thông tin bên tham gia</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin xe</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Nhóm:</span>
                        <span className="font-medium text-gray-900">{contract.group_id ? `Group ${contract.group_id.substring(0, 8)}` : 'N/A'}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Loại hợp đồng:</span>
                        <span className="font-medium text-gray-900">
                          {contract.contract_type === 'co_ownership' ? 'Đồng sở hữu' : contract.contract_type || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Số hợp đồng:</span>
                        <span className="font-medium text-gray-900">{contract.contract_number || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Tự động gia hạn:</span>
                        <span className="font-medium text-gray-900">{contract.auto_renew ? 'Có' : 'Không'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contract Terms */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Điều khoản hợp đồng</h3>
                  <div className="space-y-4">
                    {contract.terms && Array.isArray(contract.terms) ? (
                      contract.terms.map((term, index) => (
                        <div key={index} className="p-4 border border-gray-200 rounded-xl">
                          <h4 className="font-semibold text-gray-900 mb-2">{term.title}</h4>
                          <p className="text-gray-700">{term.content}</p>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="p-4 border border-gray-200 rounded-xl">
                          <h4 className="font-semibold text-gray-900 mb-2">1. Quyền sở hữu và sử dụng</h4>
                          <p className="text-gray-700">
                            {contract.content || 'Các bên đồng ý chia sẻ quyền sở hữu và sử dụng xe theo tỷ lệ đã thỏa thuận. Việc sử dụng xe sẽ được quản lý thông qua hệ thống đặt lịch của EV Co-ownership.'}
                          </p>
                        </div>
                        <div className="p-4 border border-gray-200 rounded-xl">
                          <h4 className="font-semibold text-gray-900 mb-2">2. Phân chia chi phí</h4>
                          <p className="text-gray-700">
                            Chi phí bảo dưỡng, bảo hiểm, sạc điện và các chi phí phát sinh khác sẽ được chia theo tỷ lệ sở hữu của từng bên.
                          </p>
                        </div>
                        <div className="p-4 border border-gray-200 rounded-xl">
                          <h4 className="font-semibold text-gray-900 mb-2">3. Thời hạn hợp đồng</h4>
                          <p className="text-gray-700">
                            Hợp đồng có hiệu lực từ ngày {contract.effective_date ? new Date(contract.effective_date).toLocaleDateString('vi-VN') : 'N/A'} và sẽ hết hạn vào ngày {contract.expiry_date ? new Date(contract.expiry_date).toLocaleDateString('vi-VN') : 'N/A'}. 
                            {contract.auto_renew && ' Hợp đồng sẽ tự động gia hạn khi đến hạn.'}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Signature Section */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Chữ ký số</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {parties.length > 0 ? (
                      parties.map((party, index) => (
                        <div key={party.id || index} className="text-center p-4 border border-gray-200 rounded-xl">
                          {party.has_signed ? (
                            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                          ) : (
                            <Clock className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                          )}
                          <p className="font-semibold text-gray-900">
                            {party.user_id ? `User ${party.user_id.substring(0, 8)}` : 'Unknown'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {party.has_signed ? `Đã ký ${party.signed_at ? new Date(party.signed_at).toLocaleDateString('vi-VN') : ''}` : 'Chưa ký'}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-3 text-center py-4 text-gray-500">Chưa có thông tin chữ ký</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Actions */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tác vụ</h3>
                <div className="space-y-3">
                  <button 
                    onClick={handleDownloadContract}
                    disabled={downloading}
                    className="w-full flex items-center gap-3 p-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download className="w-5 h-5" />
                    <span>{downloading ? 'Đang tải...' : 'Tải PDF'}</span>
                  </button>
                  <button 
                    onClick={handlePrintContract}
                    className="w-full flex items-center gap-3 p-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors"
                  >
                    <Printer className="w-5 h-5" />
                    <span>In hợp đồng</span>
                  </button>
                  <button 
                    onClick={handleShareContract}
                    className="w-full flex items-center gap-3 p-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                    <span>Chia sẻ</span>
                  </button>
                      <Link
                        to={`/dashboard/coowner/ownership/documents?id=${resolvedId}`}
                        className="w-full flex items-center gap-3 p-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors"
                      >
                        <Eye className="w-5 h-5" />
                        <span>Xem tài liệu</span>
                      </Link>
                </div>
              </div>

              {/* Contract Status */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Trạng thái</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">
                        {contract.status === 'active' ? 'Đang hiệu lực' : getStatusText(contract.status)}
                      </p>
                      <p className="text-sm text-green-600">
                        Từ {contract.effective_date ? new Date(contract.effective_date).toLocaleDateString('vi-VN') : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900">Còn hiệu lực</p>
                      <p className="text-sm text-blue-600">
                        Đến {contract.expiry_date ? new Date(contract.expiry_date).toLocaleDateString('vi-VN') : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}