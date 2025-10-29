import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Users, FileText, Upload, BarChart3, Edit3, CheckCircle, ArrowRight, Download, Share2 } from 'lucide-react';
import Header from '../../../../components/layout/Header';
import Footer from '../../../../components/layout/Footer';

export default function OwnershipManagement() {
  const [ownershipData, setOwnershipData] = useState([
    { id: 1, name: 'Nguyễn Văn A', percentage: 40, email: 'a.nguyen@example.com', phone: '0901234567', status: 'active' },
    { id: 2, name: 'Trần Thị B', percentage: 30, email: 'b.tran@example.com', phone: '0901234568', status: 'active' },
    { id: 3, name: 'Lê Văn C', percentage: 30, email: 'c.le@example.com', phone: '0901234569', status: 'pending' },
  ]);

  const [editingId, setEditingId] = useState(null);
  const [editPercentage, setEditPercentage] = useState('');

  const handleEdit = (id, currentPercentage) => {
    setEditingId(id);
    setEditPercentage(currentPercentage);
  };

  const handleSave = (id) => {
    setOwnershipData(prev => 
      prev.map(item => 
        item.id === id ? { ...item, percentage: parseInt(editPercentage) } : item
      )
    );
    setEditingId(null);
    setEditPercentage('');
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditPercentage('');
  };

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
            <h1 className="text-4xl font-bold text-gray-900">
              Quản lý Quyền sở hữu
            </h1>
            <p className="text-xl text-gray-600 mt-4">
              Quản lý tỷ lệ sở hữu và thành viên trong nhóm đồng sở hữu
            </p>
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
                  {ownershipData.map((member, index) => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-blue-200 hover:bg-blue-50/50 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl flex items-center justify-center font-semibold">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{member.name}</h3>
                          <p className="text-sm text-gray-600">{member.email}</p>
                          <p className="text-sm text-gray-600">{member.phone}</p>
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
                            <span className="text-gray-600">%</span>
                            <button
                              onClick={() => handleSave(member.id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button
                              onClick={handleCancel}
                              className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-gray-900">
                                {member.percentage}%
                              </div>
                              <div className="text-sm text-gray-600">Tỷ lệ sở hữu</div>
                            </div>
                            <button
                              onClick={() => handleEdit(member.id, member.percentage)}
                              className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                              <Edit3 className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Ownership Chart */}
                <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Phân bổ quyền sở hữu</h3>
                  <div className="flex items-center justify-between">
                    {ownershipData.map((member, index) => (
                      <div key={member.id} className="text-center">
                        <div className="w-16 h-16 bg-white rounded-full border-4 border-blue-500 flex items-center justify-center mx-auto mb-2">
                          <span className="text-lg font-bold text-blue-600">{member.percentage}%</span>
                        </div>
                        <p className="text-sm font-medium text-gray-700">{member.name}</p>
                      </div>
                    ))}
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