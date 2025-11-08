import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, DollarSign, TrendingUp, TrendingDown, Download, Filter, Plus, Users, Calendar, CreditCard, PiggyBank, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "../../../../components/layout/Header";
import Footer from "../../../../components/layout/Footer";

export default function CommonFund() {
  const [fundData, setFundData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchFundData = async () => {
      setTimeout(() => {
        setFundData({
          balance: 25800000,
          monthlyContribution: 2500000,
          totalContributions: 12500000,
          totalExpenses: 9920000,
          monthlyBudget: 3000000,
          transactions: [
            {
              id: 1,
              date: "2024-02-01",
              type: "contribution",
              description: "Đóng góp tháng 2/2024",
              amount: 2500000,
              category: "contribution",
              status: "completed",
              member: "Nguyễn Văn A"
            },
            {
              id: 2,
              date: "2024-01-28",
              type: "expense",
              description: "Bảo dưỡng định kỳ",
              amount: -3200000,
              category: "maintenance",
              status: "completed",
              member: "Trần Thị B"
            },
            {
              id: 3,
              date: "2024-01-25",
              type: "expense",
              description: "Phí bảo hiểm tháng 1",
              amount: -1250000,
              category: "insurance",
              status: "completed",
              member: "Lê Văn C"
            },
            {
              id: 4,
              date: "2024-01-20",
              type: "expense",
              description: "Sạc điện trạm VinFast",
              amount: -450000,
              category: "charging",
              status: "completed",
              member: "Phạm Thị D"
            },
            {
              id: 5,
              date: "2024-01-15",
              type: "contribution",
              description: "Đóng góp tháng 1/2024",
              amount: 2500000,
              category: "contribution",
              status: "completed",
              member: "Nguyễn Văn A"
            }
          ],
          budgetAllocation: [
            { category: "Bảo dưỡng", allocated: 1500000, used: 1320000, percentage: 88, color: "bg-blue-500" },
            { category: "Bảo hiểm", allocated: 800000, used: 800000, percentage: 100, color: "bg-green-500" },
            { category: "Sạc điện", allocated: 400000, used: 320000, percentage: 80, color: "bg-yellow-500" },
            { category: "Khác", allocated: 300000, used: 120000, percentage: 40, color: "bg-purple-500" }
          ],
          members: [
            { name: "Nguyễn Văn A", contribution: 5000000, percentage: 40, status: "paid" },
            { name: "Trần Thị B", contribution: 3750000, percentage: 30, status: "paid" },
            { name: "Lê Văn C", contribution: 2500000, percentage: 20, status: "paid" },
            { name: "Phạm Thị D", contribution: 1250000, percentage: 10, status: "pending" }
          ]
        });
        setLoading(false);
      }, 1500);
    };

    fetchFundData();
  }, []);

  if (loading) {
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
      case 'contribution': return 'text-green-600 bg-green-100';
      case 'maintenance': return 'text-blue-600 bg-blue-100';
      case 'insurance': return 'text-purple-600 bg-purple-100';
      case 'charging': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryText = (category) => {
    switch (category) {
      case 'contribution': return 'Đóng góp';
      case 'maintenance': return 'Bảo dưỡng';
      case 'insurance': return 'Bảo hiểm';
      case 'charging': return 'Sạc điện';
      default: return 'Khác';
    }
  };

  const getStatusColor = (status) => {
    return status === 'completed' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-yellow-100 text-yellow-800';
  };

  const getStatusText = (status) => {
    return status === 'completed' ? 'Hoàn thành' : 'Đang chờ';
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
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Download className="w-4 h-4" />
                <span>Xuất báo cáo</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
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
                    {fundData.balance.toLocaleString()}đ
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <PiggyBank className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-600">+15.8M tháng này</span>
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
                    {fundData.totalContributions.toLocaleString()}đ
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-4">Từ 4 thành viên</p>
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
                    {fundData.totalExpenses.toLocaleString()}đ
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
                  <p className="text-sm font-medium text-gray-600">Đóng góp/tháng</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {fundData.monthlyContribution.toLocaleString()}đ
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <CreditCard className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-4">Mỗi thành viên</p>
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
                  {fundData.transactions.map((transaction) => (
                    <div key={transaction.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl ${getCategoryColor(transaction.category)}`}>
                            <DollarSign className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{transaction.description}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>{transaction.date}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                <span>{transaction.member}</span>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(transaction.category)}`}>
                                {getCategoryText(transaction.category)}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className={`text-lg font-bold ${
                            transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()}đ
                          </p>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                            {getStatusText(transaction.status)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Budget Allocation */}
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
                  {fundData.members.map((member, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{member.name}</p>
                          <p className="text-xs text-gray-600">{member.percentage}% sở hữu</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">
                          {member.contribution.toLocaleString()}đ
                        </p>
                        <span className={`text-xs ${
                          member.status === 'paid' ? 'text-green-600' : 'text-yellow-600'
                        }`}>
                          {member.status === 'paid' ? 'Đã đóng' : 'Chờ đóng'}
                        </span>
                      </div>
                    </div>
                  ))}
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
                  <button className="w-full flex items-center gap-3 p-3 text-left border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors">
                    <Plus className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="font-medium text-gray-900">Thêm giao dịch</div>
                      <div className="text-sm text-gray-600">Chi phí mới</div>
                    </div>
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 text-left border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-200 transition-colors">
                    <CreditCard className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="font-medium text-gray-900">Yêu cầu thanh toán</div>
                      <div className="text-sm text-gray-600">Từ thành viên</div>
                    </div>
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 text-left border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-200 transition-colors">
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

      <Footer />
    </div>
  );
}