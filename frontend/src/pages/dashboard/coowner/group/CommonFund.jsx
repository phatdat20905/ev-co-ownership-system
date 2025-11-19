import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, DollarSign, TrendingUp, TrendingDown, Download, Filter, Plus, Users, Calendar, CreditCard, PiggyBank, BarChart3 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import Header from "../../../../components/layout/Header";
import Footer from "../../../../components/layout/Footer";
import { useGroupStore } from "../../../../store/groupStore";
import { toast } from "react-toastify";

export default function CommonFund() {
  const { groupId } = useParams();
  const { fetchFundSummary, fetchUserGroups, groups, isLoading } = useGroupStore();
  const [fundData, setFundData] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [transactionType, setTransactionType] = useState('deposit'); // 'deposit' | 'withdrawal'
  const [transactionAmount, setTransactionAmount] = useState('');
  const [transactionDescription, setTransactionDescription] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get groupId from first group if not in URL
        let targetGroupId = groupId;
        if (!targetGroupId) {
          await fetchUserGroups();
          const store = useGroupStore.getState();
          if (store.groups && store.groups.length > 0) {
            targetGroupId = store.groups[0].id;
          }
        }

        if (targetGroupId) {
          const summary = await fetchFundSummary(targetGroupId);
          setFundData(summary);
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Không thể tải dữ liệu quỹ');
      }
    };

    loadData();
  }, [groupId, fetchFundSummary, fetchUserGroups]);

  const handleAddTransaction = () => {
    setTransactionType('deposit');
    setTransactionAmount('');
    setTransactionDescription('');
    setShowTransactionModal(true);
  };

  const handleDeposit = () => {
    setTransactionType('deposit');
    setTransactionAmount('');
    setTransactionDescription('');
    setShowTransactionModal(true);
  };

  const handleWithdrawal = () => {
    setTransactionType('withdrawal');
    setTransactionAmount('');
    setTransactionDescription('');
    setShowTransactionModal(true);
  };

  const handleSubmitTransaction = async () => {
    if (!transactionAmount || parseFloat(transactionAmount) <= 0) {
      toast.error('Vui lòng nhập số tiền hợp lệ');
      return;
    }

    try {
      const targetGroupId = groupId || groups[0]?.id;
      if (!targetGroupId) {
        toast.error('Không tìm thấy nhóm');
        return;
      }

      const amount = parseFloat(transactionAmount);
      const description = transactionDescription || (transactionType === 'deposit' ? 'Nạp tiền vào quỹ' : 'Rút tiền từ quỹ');

      // Call the appropriate API based on transaction type
      if (transactionType === 'deposit') {
        await useGroupStore.getState().depositFund(targetGroupId, amount, description);
        toast.success('Nạp tiền thành công');
      } else {
        await useGroupStore.getState().withdrawFund(targetGroupId, amount, description);
        toast.success('Rút tiền thành công');
      }
      
      setShowTransactionModal(false);
      
      // Refresh fund data after transaction
      const summary = await useGroupStore.getState().fetchFundSummary(targetGroupId);
      setFundData(summary);
    } catch (error) {
      console.error('Error creating transaction:', error);
      toast.error(error.response?.data?.message || 'Không thể tạo giao dịch');
    }
  };

  const handleExportReport = () => {
    try {
      if (!fundData) {
        toast.error('Không có dữ liệu để xuất báo cáo');
        return;
      }

      // Create CSV content
      let csvContent = 'Báo cáo Quỹ Chung\n\n';
      csvContent += `Số dư hiện tại:,${fundData.balance?.toLocaleString() || 0} VNĐ\n`;
      csvContent += `Tổng đóng góp:,${fundData.totalContributions?.toLocaleString() || 0} VNĐ\n`;
      csvContent += `Tổng chi tiêu:,${fundData.totalExpenses?.toLocaleString() || 0} VNĐ\n`;
      csvContent += `Số thành viên:,${fundData.members?.length || 0}\n\n`;
      
      csvContent += 'Lịch sử giao dịch\n';
      csvContent += 'Ngày,Loại,Mô tả,Số tiền\n';
      
      if (fundData.transactions && fundData.transactions.length > 0) {
        fundData.transactions.forEach(transaction => {
          const date = new Date(transaction.createdAt).toLocaleDateString('vi-VN');
          const type = transaction.transactionType === 'deposit' ? 'Nạp tiền' : 'Rút tiền';
          const desc = transaction.description || 'Giao dịch';
          const amount = parseFloat(transaction.amount).toLocaleString();
          csvContent += `${date},${type},"${desc}",${amount} VNĐ\n`;
        });
      }

      // Create blob and download
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `bao-cao-quy-chung-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Đã xuất báo cáo thành công');
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Không thể xuất báo cáo');
    }
  };

  const handleViewReport = () => {
    setShowReportModal(true);
  };

  if (isLoading || !fundData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 shadow-sm">
                    <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case 'deposit': return 'text-green-600 bg-green-100';
      case 'withdrawal': return 'text-red-600 bg-red-100';
      case 'allocation': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryText = (category) => {
    switch (category) {
      case 'deposit': return 'Đóng góp';
      case 'withdrawal': return 'Chi tiêu';
      case 'allocation': return 'Phân bổ';
      default: return 'Khác';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link
                to="/dashboard/coowner/group"
                className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Quỹ chung</h1>
                <p className="text-gray-600 mt-1">Quản lý tài chính nhóm đồng sở hữu</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={handleExportReport}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Xuất báo cáo</span>
              </button>
              <button 
                onClick={handleAddTransaction}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Giao dịch mới</span>
              </button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Số dư hiện tại</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {fundData.balance?.toLocaleString() || 0}đ
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <PiggyBank className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-600">Quỹ hoạt động</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tổng đóng góp</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {fundData.totalContributions?.toLocaleString() || 0}đ
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-4">Từ {fundData.members?.length || 0} thành viên</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tổng chi tiêu</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {fundData.totalExpenses?.toLocaleString() || 0}đ
                  </p>
                </div>
                <div className="p-3 bg-red-100 rounded-xl">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-4">Chi phí vận hành</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Trung bình/giao dịch</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {fundData.monthlyContribution?.toLocaleString() || 0}đ
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <CreditCard className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-4">Mỗi lần đóng góp</p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Transactions */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Giao dịch gần đây</h2>
                    <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                      <Filter className="w-4 h-4" />
                      <span>Lọc</span>
                    </button>
                  </div>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {fundData.transactions && fundData.transactions.length > 0 ? (
                    fundData.transactions.map((transaction) => (
                      <div key={transaction.id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${getCategoryColor(transaction.transactionType)}`}>
                              <DollarSign className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{transaction.description || 'Giao dịch'}</h3>
                              <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>{new Date(transaction.createdAt).toLocaleDateString('vi-VN')}</span>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(transaction.transactionType)}`}>
                                  {getCategoryText(transaction.transactionType)}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className={`text-lg font-bold ${
                              transaction.transactionType === 'deposit' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {transaction.transactionType === 'deposit' ? '+' : '-'}{parseFloat(transaction.amount).toLocaleString()}đ
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-gray-500">
                      Chưa có giao dịch nào
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Budget Allocation - Hidden for now since backend doesn't provide this */}
              {fundData.budgetAllocation && fundData.budgetAllocation.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Phân bổ ngân sách</h2>
                    <BarChart3 className="w-5 h-5 text-gray-600" />
                  </div>
                  
                  <div className="space-y-4">
                    {fundData.budgetAllocation.map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                            <span className="text-sm font-medium text-gray-700">{item.category}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-gray-900">
                              {item.used.toLocaleString()}đ / {item.allocated.toLocaleString()}đ
                            </p>
                            <p className="text-xs text-gray-500">{item.percentage}% sử dụng</p>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 ${
                              item.percentage > 90 ? 'bg-red-500' : 
                              item.percentage > 75 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Members Contribution */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-4">Đóng góp thành viên</h3>
                <div className="space-y-4">
                  {fundData.members && fundData.members.length > 0 ? (
                    fundData.members.map((member, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Thành viên {index + 1}</p>
                            <p className="text-xs text-gray-600">{member.ownershipPercentage}% sở hữu</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900">
                            {member.contribution?.toLocaleString() || 0}đ
                          </p>
                          <span className={`text-xs ${
                            member.status === 'paid' ? 'text-green-600' : 'text-yellow-600'
                          }`}>
                            {member.status === 'paid' ? 'Đã đóng' : 'Chờ đóng'}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center">Chưa có thành viên</p>
                  )}
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-4">Hành động nhanh</h3>
                <div className="space-y-3">
                  <button 
                    onClick={handleDeposit}
                    className="w-full flex items-center gap-3 p-3 text-left border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors"
                  >
                    <Plus className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="font-medium text-gray-900">Nạp tiền</div>
                      <div className="text-sm text-gray-600">Đóng góp vào quỹ</div>
                    </div>
                  </button>
                  <button 
                    onClick={handleWithdrawal}
                    className="w-full flex items-center gap-3 p-3 text-left border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-200 transition-colors"
                  >
                    <CreditCard className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="font-medium text-gray-900">Rút tiền</div>
                      <div className="text-sm text-gray-600">Chi tiêu từ quỹ</div>
                    </div>
                  </button>
                  <button 
                    onClick={handleViewReport}
                    className="w-full flex items-center gap-3 p-3 text-left border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-200 transition-colors"
                  >
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                    <div>
                      <div className="font-medium text-gray-900">Báo cáo chi tiết</div>
                      <div className="text-sm text-gray-600">Phân tích tài chính</div>
                    </div>
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      {/* Transaction Modal */}
      {showTransactionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {transactionType === 'deposit' ? 'Nạp tiền vào quỹ' : 'Rút tiền từ quỹ'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số tiền (VNĐ)
                </label>
                <input
                  type="number"
                  value={transactionAmount}
                  onChange={(e) => setTransactionAmount(e.target.value)}
                  placeholder="Nhập số tiền..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả (tùy chọn)
                </label>
                <textarea
                  value={transactionDescription}
                  onChange={(e) => setTransactionDescription(e.target.value)}
                  placeholder="Nhập mô tả giao dịch..."
                  rows="3"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowTransactionModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSubmitTransaction}
                  disabled={!transactionAmount || parseFloat(transactionAmount) <= 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {transactionType === 'deposit' ? 'Nạp tiền' : 'Rút tiền'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Report Detail Modal */}
      {showReportModal && fundData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Báo cáo chi tiết quỹ chung</h3>
              <button
                onClick={() => setShowReportModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                <p className="text-sm text-green-700 font-medium">Số dư hiện tại</p>
                <p className="text-2xl font-bold text-green-900 mt-2">
                  {fundData.balance?.toLocaleString() || 0}đ
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                <p className="text-sm text-blue-700 font-medium">Tổng đóng góp</p>
                <p className="text-2xl font-bold text-blue-900 mt-2">
                  {fundData.totalContributions?.toLocaleString() || 0}đ
                </p>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4">
                <p className="text-sm text-red-700 font-medium">Tổng chi tiêu</p>
                <p className="text-2xl font-bold text-red-900 mt-2">
                  {fundData.totalExpenses?.toLocaleString() || 0}đ
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                <p className="text-sm text-purple-700 font-medium">Số giao dịch</p>
                <p className="text-2xl font-bold text-purple-900 mt-2">
                  {fundData.transactions?.length || 0}
                </p>
              </div>
            </div>

            {/* Transaction Analysis */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Phân tích giao dịch</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Giao dịch nạp tiền</p>
                      <p className="text-sm text-gray-600">
                        {fundData.transactions?.filter(t => t.transactionType === 'deposit').length || 0} giao dịch
                      </p>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-green-600">
                    +{fundData.transactions?.filter(t => t.transactionType === 'deposit')
                      .reduce((sum, t) => sum + parseFloat(t.amount), 0).toLocaleString() || 0}đ
                  </p>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <TrendingDown className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Giao dịch rút tiền</p>
                      <p className="text-sm text-gray-600">
                        {fundData.transactions?.filter(t => t.transactionType === 'withdrawal').length || 0} giao dịch
                      </p>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-red-600">
                    -{fundData.transactions?.filter(t => t.transactionType === 'withdrawal')
                      .reduce((sum, t) => sum + parseFloat(t.amount), 0).toLocaleString() || 0}đ
                  </p>
                </div>
              </div>
            </div>

            {/* Member Contributions */}
            {fundData.members && fundData.members.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Đóng góp theo thành viên</h4>
                <div className="space-y-2">
                  {fundData.members.map((member, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Thành viên {index + 1}</p>
                          <p className="text-sm text-gray-600">{member.ownershipPercentage}% sở hữu</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          {member.contribution?.toLocaleString() || 0}đ
                        </p>
                        <p className="text-sm text-gray-600">
                          {((member.contribution || 0) / (fundData.totalContributions || 1) * 100).toFixed(1)}% tổng quỹ
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Transactions */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Giao dịch gần đây</h4>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {fundData.transactions && fundData.transactions.length > 0 ? (
                  fundData.transactions.slice(0, 10).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          transaction.transactionType === 'deposit' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          <DollarSign className={`w-4 h-4 ${
                            transaction.transactionType === 'deposit' ? 'text-green-600' : 'text-red-600'
                          }`} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{transaction.description || 'Giao dịch'}</p>
                          <p className="text-xs text-gray-600">
                            {new Date(transaction.createdAt).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>
                      <p className={`font-bold ${
                        transaction.transactionType === 'deposit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.transactionType === 'deposit' ? '+' : '-'}
                        {parseFloat(transaction.amount).toLocaleString()}đ
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-4">Chưa có giao dịch nào</p>
                )}
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6 pt-4 border-t">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Đóng
              </button>
              <button
                onClick={handleExportReport}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Xuất CSV
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  );
}