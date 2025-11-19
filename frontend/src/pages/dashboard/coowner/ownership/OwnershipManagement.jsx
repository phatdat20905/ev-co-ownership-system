import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Users, FileText, Upload, BarChart3, Edit3, CheckCircle, ArrowRight, Download, Share2, AlertCircle } from 'lucide-react';
import Header from '../../../../components/layout/Header';
import Footer from '../../../../components/layout/Footer';
import { contractAPI } from '../../../../api/contract';
import { socketClient } from '../../../../services/socketClient';

export default function OwnershipManagement() {
  const [contracts, setContracts] = useState([]);
  const [selectedContract, setSelectedContract] = useState(null);
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editPercentage, setEditPercentage] = useState('');

  useEffect(() => {
    fetchUserContracts();
  }, []);

  useEffect(() => {
    if (selectedContract) {
      fetchContractParties(selectedContract);
    }
  }, [selectedContract]);

  // Listen for contract/document notifications to refresh parties
  useEffect(() => {
    const handler = (payload) => {
      try {
        // payload may contain type and contractId or related fields
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

  const fetchUserContracts = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await contractAPI.getUserContracts();

      if (response.success) {
        setContracts(response.data);
        // Auto-select first contract if available
        if (response.data && response.data.length > 0) {
          setSelectedContract(response.data[0].id);
        }
      }

      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch contracts:', err);
      setError('Không thể tải danh sách hợp đồng. Vui lòng thử lại.');
      setLoading(false);
    }
  };

  const fetchContractParties = async (contractId) => {
    try {
      const response = await contractAPI.getParties(contractId);

      if (response.success) {
        setParties(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch contract parties:', err);
      // Keep empty array on error
      setParties([]);
    }
  };

  const handleEdit = (id, currentPercentage) => {
    setEditingId(id);
    setEditPercentage(currentPercentage);
  };

  const handleSave = async (partyId) => {
    try {
      await contractAPI.updatePartyStatus(selectedContract, partyId, {
        ownershipPercentage: parseInt(editPercentage)
      });
      
      // Refresh parties
      await fetchContractParties(selectedContract);
      setEditingId(null);
      setEditPercentage('');
      alert('Đã cập nhật tỷ lệ sở hữu thành công!');
    } catch (err) {
      console.error('Failed to update party:', err);
      alert('Không thể cập nhật tỷ lệ sở hữu. Vui lòng thử lại.');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditPercentage('');
  };

  if (loading) {
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 mb-1">Lỗi tải dữ liệu</h3>
                <p className="text-red-700 mb-4">{error}</p>
                <button
                  onClick={() => fetchUserContracts()}
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
                        {contract.vehicle?.model || 'N/A'} - {contract.contractNumber}
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
                            {(member.partyName || member.name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{member.partyName || member.name || 'N/A'}</h3>
                            <p className="text-sm text-gray-600">{member.email || 'Chưa có email'}</p>
                            <p className="text-sm text-gray-600">{member.phone || 'Chưa có SĐT'}</p>
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
                                {member.ownershipPercentage || member.percentage || 0}%
                              </span>
                              <button
                                onClick={() => handleEdit(member.id, member.ownershipPercentage || member.percentage || 0)}
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
                              {member.ownershipPercentage || member.percentage || 0}%
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-700">
                            {(member.partyName || member.name || 'N/A').split(' ').slice(-1)[0]}
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
                    <div className="text-3xl font-bold text-green-600">3</div>
                    <div className="text-sm text-green-600">Thành viên</div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Hành động nhanh</h3>
                <div className="space-y-3">
                  <Link
                    to="/dashboard/coowner/ownership/contract"
                    className="flex items-center gap-3 p-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors group"
                  >
                    <FileText className="w-5 h-5" />
                    <span>Xem hợp đồng</span>
                    <ArrowRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/dashboard/coowner/ownership/documents"
                    className="flex items-center gap-3 p-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors group"
                  >
                    <Upload className="w-5 h-5" />
                    <span>Tải lên tài liệu</span>
                    <ArrowRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <button className="flex items-center gap-3 p-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors group w-full">
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