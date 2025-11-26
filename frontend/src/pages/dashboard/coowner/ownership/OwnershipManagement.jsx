import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Users, FileText, Upload, BarChart3, Edit3, CheckCircle, ArrowRight, Download, Share2, AlertCircle } from 'lucide-react';
import Header from '../../../../components/layout/Header';
import Footer from '../../../../components/layout/Footer';
import { contractAPI } from '../../../../api/contract';
import { socketClient } from '../../../../services/socketClient';
import { useContractStore } from '../../../../store/contractStore';
import { showToast } from '../../../../utils/toast';

export default function OwnershipManagement() {
  // Use contractStore for better state management (like ContractManagement does)
  const { 
    contracts: storeContracts, 
    loading: storeLoading,
    error: storeError,
    fetchContracts,
    clearError
  } = useContractStore();

  const [selectedContract, setSelectedContract] = useState(null);
  const [parties, setParties] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editPercentage, setEditPercentage] = useState('');
  const [partiesLoading, setPartiesLoading] = useState(false);

  // Extract contracts array from store (handle both array and object with contracts property)
  const contracts = Array.isArray(storeContracts) ? storeContracts : (storeContracts?.contracts || []);

  useEffect(() => {
    // Fetch contracts from store
    fetchContracts();
  }, [fetchContracts]);

  useEffect(() => {
    if (selectedContract) {
      fetchContractParties(selectedContract);
    }
  }, [selectedContract]);

  // Auto-select first contract when contracts load
  useEffect(() => {
    if (contracts.length > 0 && !selectedContract) {
      setSelectedContract(contracts[0].id);
    }
  }, [contracts, selectedContract]);

  // Show error toasts from store
  useEffect(() => {
    if (storeError) {
      showToast.error(storeError);
      clearError();
    }
  }, [storeError, clearError]);

  // Listen for contract/document notifications to refresh parties
  useEffect(() => {
    const handler = (payload) => {
      try {
        const t = payload.type || payload.event || payload.name || null;
        const contractId = payload.contractId || payload.data?.contractId || null;
        if (t && contractId && contractId === selectedContract) {
          fetchContractParties(selectedContract);
        }
      } catch (err) {
        // non-fatal
      }
    };

    try {
      socketClient.onNotification(handler);
    } catch (_err) {}

    return () => {
      try {
        socketClient.offNotification(handler);
      } catch (_err) {}
    };
  }, [selectedContract]);

  const fetchContractParties = async (contractId) => {
    if (!contractId) return;

    try {
      setPartiesLoading(true);
      const response = await contractAPI.getParties(contractId);

      if (response.success) {
        setParties(response.data || []);
      } else {
        showToast.error(response.message || 'Không thể tải danh sách thành viên');
        setParties([]);
      }
    } catch (err) {
      console.error('Failed to fetch contract parties:', err);
      showToast.error('Có lỗi xảy ra khi tải thành viên');
      setParties([]);
    } finally {
      setPartiesLoading(false);
    }
  };

  const handleEdit = (id, currentPercentage) => {
    setEditingId(id);
    setEditPercentage(currentPercentage);
  };

  const handleSave = async (partyId) => {
    if (!selectedContract) return;

    // Validate ownership percentage
    if (editPercentage <= 0 || editPercentage > 100) {
      showToast.error('Tỷ lệ sở hữu phải từ 1-100%');
      return;
    }

    try {
      // Check authentication token exists
      const token = localStorage.getItem('authToken');
      if (!token) {
        showToast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        setTimeout(() => window.location.href = '/login', 1500);
        return;
      }

      // Calculate total ownership of other parties
      const otherPartiesOwnership = parties
        .filter(p => p.id !== partyId)
        .reduce((sum, p) => sum + parseFloat(p.ownership_percentage || 0), 0);
      
      // Check if new total would exceed 100%
      const newTotal = otherPartiesOwnership + parseFloat(editPercentage);
      if (newTotal > 100) {
        showToast.error(`Tổng tỷ lệ sở hữu sẽ vượt quá 100% (hiện tại: ${otherPartiesOwnership.toFixed(1)}% + ${editPercentage}% = ${newTotal.toFixed(1)}%)`);
        return;
      }

      const response = await contractAPI.updatePartyStatus(
        selectedContract, 
        partyId, 
        { ownershipPercentage: parseInt(editPercentage) }
      );

      if (response.success) {
        // Refresh parties list
        await fetchContractParties(selectedContract);
        setEditingId(null);
        setEditPercentage('');
        showToast.success('Đã cập nhật tỷ lệ sở hữu thành công');
        
        // Show warning if total is not 100%
        if (Math.abs(newTotal - 100) > 0.01) {
          showToast.warning(`Lưu ý: Tổng tỷ lệ sở hữu hiện tại là ${newTotal.toFixed(1)}%, không phải 100%`);
        }
      } else {
        showToast.error(response.message || 'Không thể cập nhật tỷ lệ sở hữu');
      }
    } catch (err) {
      console.error('Failed to update party:', err);
      const errorMsg = err.response?.data?.error?.message || err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật';
      
      // Handle specific authentication errors
      if (err.response?.status === 401 || errorMsg.includes('token') || errorMsg.includes('expired')) {
        showToast.error('Phiên đăng nhập đã hết hạn. Đang tải lại trang...');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        showToast.error(errorMsg);
      }
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditPercentage('');
  };

  const handleDownloadReport = () => {
    if (!selectedContract || parties.length === 0) {
      showToast.error('Không có dữ liệu để tải báo cáo');
      return;
    }

    try {
      // Find the contract info
      const contract = contracts.find(c => c.id === selectedContract);
      
      // Prepare CSV data
      const headers = ['STT', 'User ID', 'Vai trò', 'Tỷ lệ sở hữu (%)', 'Trạng thái ký', 'Thứ tự ký'];
      const rows = parties.map((party, index) => [
        index + 1,
        party.user_id,
        party.party_role === 'owner' ? 'Chủ sở hữu' : 'Đồng sở hữu',
        parseFloat(party.ownership_percentage || 0).toFixed(2),
        party.has_signed ? 'Đã ký' : 'Chưa ký',
        party.signing_order
      ]);

      // Create CSV content
      const csvContent = [
        `Báo Cáo Quyền Sở Hữu`,
        `Hợp đồng: ${contract?.title || contract?.contract_number || selectedContract}`,
        `Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`,
        `Tổng số thành viên: ${parties.length}`,
        '',
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      // Create blob and download
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ownership-report-${new Date().getTime()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      showToast.success('Đã tải báo cáo thành công');
    } catch (error) {
      console.error('Download report error:', error);
      showToast.error('Có lỗi xảy ra khi tải báo cáo');
    }
  };

  if (storeLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-20 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (contracts.length === 0 && !storeLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có hợp đồng</h3>
              <p className="text-gray-600 mb-6">
                Bạn chưa tham gia hợp đồng đồng sở hữu nào. Vui lòng liên hệ quản trị viên để được thêm vào nhóm.
              </p>
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
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900">
                  Quản lý Quyền sở hữu
                </h1>
                <p className="text-xl text-gray-600 mt-4">
                  Quản lý tỷ lệ sở hữu và thành viên trong nhóm đồng sở hữu
                </p>
              </div>

              {/* Contract Selector Dropdown */}
              {contracts.length > 1 && (
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">
                    Chọn hợp đồng:
                  </label>
                  <select
                    value={selectedContract || ''}
                    onChange={(e) => setSelectedContract(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    {contracts.map((contract) => (
                      <option key={contract.id} value={contract.id}>
                        {contract.title || contract.contract_number || contract.id.substring(0, 8)}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Ownership Details */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Thành viên đồng sở hữu</h2>
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                    <Share2 className="w-5 h-5" />
                    Mời thành viên
                  </button>
                </div>

                <div className="space-y-4">
                  {parties && parties.length > 0 ? (
                    parties.map((member, index) => (
                      <motion.div
                        key={member.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-blue-200 hover:bg-blue-50/50 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl flex items-center justify-center font-semibold">
                            {member.user_id ? member.user_id.substring(0, 2).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {member.user_id ? `User ${member.user_id.substring(0, 8)}...` : 'Unknown User'}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {member.party_role === 'owner' ? 'Chủ sở hữu' : 
                               member.party_role === 'co_owner' ? 'Đồng sở hữu' : member.party_role}
                            </p>
                            <p className="text-sm text-gray-600">
                              {member.has_signed ? 'Đã ký' : 'Chưa ký'} • 
                              Thứ tự ký: {member.signing_order}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          {editingId === member.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={editPercentage}
                                onChange={(e) => setEditPercentage(e.target.value)}
                                className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center"
                                min="0"
                                max="100"
                              />
                              <span className="font-semibold text-gray-900">%</span>
                              <button
                                onClick={() => handleSave(member.id)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                              <button
                                onClick={handleCancel}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                ×
                              </button>
                            </div>
                          ) : (
                            <>
                              <span className="text-2xl font-bold text-blue-600">
                                {parseFloat(member.ownership_percentage || 0).toFixed(0)}%
                              </span>
                              <button
                                onClick={() => handleEdit(member.id, parseFloat(member.ownership_percentage || 0))}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <Edit3 className="w-5 h-5" />
                              </button>
                            </>
                          )}
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Chưa có thành viên nào trong hợp đồng này</p>
                    </div>
                  )}
                </div>

                {/* Ownership Chart */}
                <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Phân bổ quyền sở hữu</h3>
                  <div className="flex items-center justify-around flex-wrap gap-4">
                    {parties && parties.length > 0 ? (
                      parties.map((member, index) => (
                        <div key={member.id} className="text-center">
                          <div className="w-16 h-16 bg-white rounded-full border-4 border-blue-500 flex items-center justify-center mx-auto mb-2">
                            <span className="text-lg font-bold text-blue-600">
                              {parseFloat(member.ownership_percentage || 0).toFixed(0)}%
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-700">
                            {member.party_role === 'owner' ? 'Chủ' : `Thành viên ${index + 1}`}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">Chưa có dữ liệu phân bổ</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Quick Actions */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tổng quan</h3>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="text-3xl font-bold text-blue-600">100%</div>
                    <div className="text-sm text-blue-600">Tổng quyền sở hữu</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                    <div className="text-3xl font-bold text-green-600">{parties.length}</div>
                    <div className="text-sm text-green-600">Thành viên</div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Hành động nhanh</h3>
                <div className="space-y-3">
                  <Link
                    to={selectedContract ? `/dashboard/coowner/ownership/contract?id=${selectedContract}` : '/dashboard/coowner/ownership/contract'}
                    className="flex items-center gap-3 p-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors group"
                  >
                    <FileText className="w-5 h-5" />
                    <span>Xem hợp đồng</span>
                    <ArrowRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to={selectedContract ? `/dashboard/coowner/ownership/documents?id=${selectedContract}` : '/dashboard/coowner/ownership/documents'}
                    className="flex items-center gap-3 p-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors group"
                  >
                    <Upload className="w-5 h-5" />
                    <span>Tải lên tài liệu</span>
                    <ArrowRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <button 
                    onClick={handleDownloadReport}
                    className="flex items-center gap-3 p-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors group w-full"
                  >
                    <Download className="w-5 h-5" />
                    <span>Tải báo cáo</span>
                    <ArrowRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
                  </button>
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