// src/components/admin/KYCReview.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, CheckCircle, XCircle, Clock, Eye, FileText, User, Calendar, AlertTriangle, Download } from 'lucide-react';
import adminService from '../../services/admin.service';

export default function KYCReview() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const [filter, setFilter] = useState('pending'); // pending, approved, rejected, all
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadApplications();
  }, [filter]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await adminService.getKYCApplications({
        status: filter === 'all' ? undefined : filter,
        limit: 50
      });
      
      setApplications(data.applications || []);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách KYC');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (applicationId, notes = '') => {
    try {
      setProcessing(true);
      await adminService.approveKYC(applicationId, { notes });
      await loadApplications();
      setSelectedApp(null);
    } catch (err) {
      alert(err.message || 'Không thể duyệt KYC');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (applicationId, reason) => {
    if (!reason || reason.trim() === '') {
      alert('Vui lòng nhập lý do từ chối');
      return;
    }

    try {
      setProcessing(true);
      await adminService.rejectKYC(applicationId, { reason });
      await loadApplications();
      setSelectedApp(null);
    } catch (err) {
      alert(err.message || 'Không thể từ chối KYC');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: {
        label: 'Chờ duyệt',
        color: 'bg-yellow-100 text-yellow-700',
        icon: <Clock className="w-4 h-4" />
      },
      approved: {
        label: 'Đã duyệt',
        color: 'bg-green-100 text-green-700',
        icon: <CheckCircle className="w-4 h-4" />
      },
      rejected: {
        label: 'Từ chối',
        color: 'bg-red-100 text-red-700',
        icon: <XCircle className="w-4 h-4" />
      },
      reviewing: {
        label: 'Đang xem xét',
        color: 'bg-blue-100 text-blue-700',
        icon: <Eye className="w-4 h-4" />
      }
    };

    return badges[status] || badges.pending;
  };

  const getRiskLevel = (score) => {
    if (score >= 80) return { label: 'Thấp', color: 'text-green-600' };
    if (score >= 50) return { label: 'Trung bình', color: 'text-yellow-600' };
    return { label: 'Cao', color: 'text-red-600' };
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-100 rounded-xl">
              <Shield className="w-6 h-6 text-sky-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Xét duyệt KYC</h2>
              <p className="text-sm text-gray-500">
                {applications.length} hồ sơ {filter === 'pending' ? 'chờ duyệt' : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { value: 'pending', label: 'Chờ duyệt', count: applications.filter(a => a.status === 'pending').length },
            { value: 'approved', label: 'Đã duyệt', count: applications.filter(a => a.status === 'approved').length },
            { value: 'rejected', label: 'Từ chối', count: applications.filter(a => a.status === 'rejected').length },
            { value: 'all', label: 'Tất cả', count: applications.length }
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                filter === tab.value
                  ? 'bg-sky-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  filter === tab.value ? 'bg-white text-sky-600' : 'bg-gray-200'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Applications List */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {applications.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Không có hồ sơ nào</p>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => {
              const status = getStatusBadge(app.status);
              const risk = getRiskLevel(app.riskScore || 70);
              
              return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="group bg-gray-50 hover:bg-sky-50 rounded-xl p-4 cursor-pointer transition-all border-2 border-transparent hover:border-sky-200"
                  onClick={() => setSelectedApp(app)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* User Info */}
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-sky-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {app.userName || app.userEmail}
                          </h3>
                          <p className="text-sm text-gray-500 truncate">{app.userEmail}</p>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">
                            {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString('vi-VN') : 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">
                            {app.documents?.length || 0} tài liệu
                          </span>
                        </div>
                      </div>

                      {/* Risk Score */}
                      {app.riskScore && (
                        <div className="flex items-center gap-2 text-sm">
                          <AlertTriangle className={`w-4 h-4 ${risk.color}`} />
                          <span className={`font-medium ${risk.color}`}>
                            Rủi ro: {risk.label} ({app.riskScore}/100)
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Status Badge */}
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full ${status.color} text-sm font-medium flex-shrink-0`}>
                      {status.icon}
                      {status.label}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedApp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedApp(null)}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-6 pb-4 border-b-2">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Chi tiết hồ sơ KYC
                    </h3>
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${getStatusBadge(selectedApp.status).color} text-sm font-medium`}>
                      {getStatusBadge(selectedApp.status).icon}
                      {getStatusBadge(selectedApp.status).label}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedApp(null)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <XCircle className="w-6 h-6 text-gray-500" />
                  </button>
                </div>

                {/* User Info */}
                <div className="mb-6 bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <User className="w-5 h-5 text-sky-600" />
                    Thông tin người dùng
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">Họ tên</label>
                      <div className="font-medium text-gray-900">{selectedApp.userName || 'N/A'}</div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Email</label>
                      <div className="font-medium text-gray-900">{selectedApp.userEmail}</div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Số điện thoại</label>
                      <div className="font-medium text-gray-900">{selectedApp.phone || 'N/A'}</div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Ngày gửi</label>
                      <div className="font-medium text-gray-900">
                        {selectedApp.submittedAt ? new Date(selectedApp.submittedAt).toLocaleString('vi-VN') : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                {selectedApp.documents && selectedApp.documents.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-sky-600" />
                      Tài liệu đính kèm
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedApp.documents.map((doc, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
                            <span className="text-sm text-gray-700 truncate">{doc.name}</span>
                          </div>
                          <button
                            onClick={() => window.open(doc.url, '_blank')}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                          >
                            <Download className="w-4 h-4 text-sky-600" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Risk Assessment */}
                {selectedApp.riskScore && (
                  <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      Đánh giá rủi ro
                    </h4>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="text-3xl font-bold text-yellow-700">
                          {selectedApp.riskScore}/100
                        </div>
                        <div className="text-sm text-yellow-600">
                          Mức độ: {getRiskLevel(selectedApp.riskScore).label}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="h-3 rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
                            style={{ width: `${selectedApp.riskScore}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                {selectedApp.status === 'pending' && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        if (window.confirm('Xác nhận duyệt hồ sơ này?')) {
                          handleApprove(selectedApp.id);
                        }
                      }}
                      disabled={processing}
                      className="flex-1 py-3 px-6 rounded-xl bg-green-500 text-white font-semibold hover:bg-green-600 disabled:bg-gray-300 transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Duyệt hồ sơ
                    </button>
                    <button
                      onClick={() => {
                        const reason = window.prompt('Nhập lý do từ chối:');
                        if (reason) {
                          handleReject(selectedApp.id, reason);
                        }
                      }}
                      disabled={processing}
                      className="flex-1 py-3 px-6 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 disabled:bg-gray-300 transition-colors flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-5 h-5" />
                      Từ chối
                    </button>
                  </div>
                )}

                {/* Rejection Reason */}
                {selectedApp.status === 'rejected' && selectedApp.rejectionReason && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <h4 className="font-semibold text-red-900 mb-2">Lý do từ chối</h4>
                    <p className="text-sm text-red-700">{selectedApp.rejectionReason}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
