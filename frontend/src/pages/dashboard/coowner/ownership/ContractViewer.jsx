import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import { FileText, Download, Printer, Share2, CheckCircle, Clock, AlertCircle, ArrowLeft, Eye } from 'lucide-react';
import Header from '../../../../components/layout/Header';
import Footer from '../../../../components/layout/Footer';
import { contractAPI } from '../../../../api/contract';

export default function ContractViewer() {
  const { contractId } = useParams();
  const [contract, setContract] = useState(null);
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (contractId) {
      fetchContractData();
    }
  }, [contractId]);

  const fetchContractData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch contract details
      const contractResponse = await contractAPI.getContractById(contractId);
      
      // Fetch parties
      const partiesResponse = await contractAPI.getParties(contractId);

      // Normalize different response shapes:
      const normalize = (res) => {
        if (!res) return null;
        // If axios response was returned (response.data)
        if (res.data !== undefined && res.data !== null) {
          // Case: { success: true, data: ... }
          if (res.data.success === true || res.success === true) {
            return res.data.data !== undefined ? res.data.data : res.data;
          }
          // Case: response.data is the payload already
          if (res.data.data !== undefined) return res.data.data;
          return res.data;
        }
        // Fallback if API returned payload directly
        if (res.success === true && res.data !== undefined) return res.data;
        return res;
      };

      const contractData = normalize(contractResponse);
      const partiesData = normalize(partiesResponse);

      if (contractData) setContract(contractData);
      else setError('Hợp đồng không tồn tại hoặc không thể tải dữ liệu.');

      if (partiesData) setParties(partiesData);

      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch contract data:', err);
      setError('Không thể tải thông tin hợp đồng. Vui lòng thử lại.');
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const res = await contractAPI.downloadContract(contractId);

      // If backend returned a blob (direct file)
      if (res instanceof Blob) {
        const url = window.URL.createObjectURL(res);
        const a = document.createElement('a');
        a.href = url;
        a.download = `contract-${contractId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        return;
      }

      // If backend returned JSON with downloadUrl or document.file_url
      const downloadUrl = res?.downloadUrl || res?.data?.downloadUrl || res?.document?.file_url || res?.data?.document?.file_url;
      if (downloadUrl) {
        window.open(downloadUrl, '_blank');
        return;
      }

      // Fallback: try to extract blob from nested data
      const maybeBlob = res?.data;
      if (maybeBlob instanceof Blob) {
        const url = window.URL.createObjectURL(maybeBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `contract-${contractId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        return;
      }

      alert('Không tìm thấy tệp để tải xuống.');
    } catch (err) {
      console.error('Failed to download contract:', err);
      alert('Không thể tải hợp đồng. Vui lòng thử lại.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
      case 'signed': return 'text-green-600 bg-green-100';
      case 'pending':
      case 'draft': return 'text-yellow-600 bg-yellow-100';
      case 'expired':
      case 'terminated': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
      case 'signed': return 'Đang hiệu lực';
      case 'pending': return 'Chờ ký kết';
      case 'draft': return 'Bản nháp';
      case 'expired': return 'Đã hết hạn';
      case 'terminated': return 'Đã chấm dứt';
      default: return 'Không xác định';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
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
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 mb-1">Lỗi tải dữ liệu</h3>
                <p className="text-red-700 mb-4">{error}</p>
                <button
                  onClick={() => fetchContractData()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Thử lại
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Hợp đồng không tìm thấy</h3>
              <p className="text-gray-600 mb-4">Không thể tìm thấy hợp đồng này hoặc bạn không có quyền truy cập.</p>
              <Link to="/dashboard/coowner/ownership" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700">
                <ArrowLeft className="w-4 h-4" /> Quay lại
              </Link>
            </div>
          </div>
        </div>
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
                      <p className="text-gray-600">Mã hợp đồng: {contract.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Ngày ký</p>
                      <p className="font-semibold text-gray-900">{contract.signedDate}</p>
                    </div>
                  </div>
                </div>

                {/* Contract Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin các bên</h3>
                    <div className="space-y-3">
                      {parties && parties.length > 0 ? (
                        parties.map((party, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">{party.partyName || party.name || 'N/A'}</p>
                              <p className="text-sm text-gray-600">{party.role || 'Đồng sở hữu'}</p>
                            </div>
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                              {party.ownershipPercentage || party.percentage || 0}%
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">Chưa có thông tin các bên tham gia</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin hợp đồng</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Mã hợp đồng:</span>
                        <span className="font-medium text-gray-900">{contract.contractNumber || contract.id}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Ngày ký:</span>
                        <span className="font-medium text-gray-900">
                          {contract.signedDate || contract.effectiveDate || 'Chưa ký'}
                        </span>
                      </div>
                      <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Ngày hết hạn:</span>
                        <span className="font-medium text-gray-900">
                          {contract.expirationDate || contract.endDate || 'Không giới hạn'}
                        </span>
                      </div>
                      <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Nhóm:</span>
                        <span className="font-medium text-gray-900">{contract.groupId || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contract Terms */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Nội dung hợp đồng</h3>
                  <div className="p-6 border border-gray-200 rounded-xl bg-gray-50">
                    <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
                      {contract.terms || contract.content || 'Nội dung hợp đồng đang được cập nhật...'}
                    </div>
                  </div>
                </div>

                {/* Signature Section */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Chữ ký số</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {parties && parties.length > 0 ? (
                      parties.map((party, index) => (
                        <div key={index} className="text-center p-4 border border-gray-200 rounded-xl">
                          {party.signatureStatus === 'signed' || party.hasSigned ? (
                            <>
                              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                              <p className="font-semibold text-gray-900">{party.partyName || party.name}</p>
                              <p className="text-sm text-gray-600">
                                Đã ký {party.signedAt ? new Date(party.signedAt).toLocaleDateString('vi-VN') : ''}
                              </p>
                            </>
                          ) : (
                            <>
                              <Clock className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                              <p className="font-semibold text-gray-900">{party.partyName || party.name}</p>
                              <p className="text-sm text-gray-600">Chưa ký</p>
                            </>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm col-span-3 text-center">Chưa có thông tin chữ ký</p>
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
                    onClick={handleDownload}
                    className="w-full flex items-center gap-3 p-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors"
                  >
                    <Download className="w-5 h-5" />
                    <span>Tải PDF</span>
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors">
                    <Printer className="w-5 h-5" />
                    <span>In hợp đồng</span>
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors">
                    <Share2 className="w-5 h-5" />
                    <span>Chia sẻ</span>
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors">
                    <Eye className="w-5 h-5" />
                    <span>Xem lịch sử sửa đổi</span>
                  </button>
                </div>
              </div>

              {/* Contract Status */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Trạng thái</h3>
                <div className="space-y-3">
                  {(contract.status === 'signed' || contract.status === 'active') && (
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-900">Đã ký kết</p>
                        <p className="text-sm text-green-600">
                          Ngày {contract.signedDate || contract.effectiveDate || 'N/A'}
                        </p>
                      </div>
                    </div>
                  )}
                  {contract.expirationDate && (
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-900">Còn hiệu lực</p>
                        <p className="text-sm text-blue-600">Đến {contract.expirationDate}</p>
                      </div>
                    </div>
                  )}
                  {contract.status === 'pending' && (
                    <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-xl">
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                      <div>
                        <p className="font-medium text-yellow-900">Chờ ký kết</p>
                        <p className="text-sm text-yellow-600">Đang chờ các bên ký</p>
                      </div>
                    </div>
                  )}
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