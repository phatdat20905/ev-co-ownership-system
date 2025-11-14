import React, { useState, useEffect } from 'react';
import CoownerLayout from '../../../components/layout/CoownerLayout';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, DollarSign, Calendar, CheckCircle, Clock, AlertCircle, Download, Filter, Search, Receipt } from "lucide-react";
import { costService } from '../../../services';
import { showSuccessToast, showErrorToast } from '../../../utils/toast';

export default function PaymentHistory() {
  const [filter, setFilter] = useState('all');
  const [timeRange, setTimeRange] = useState('3months'); 
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, [timeRange]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      // Calculate date range based on timeRange
      const endDate = new Date();
      const startDate = new Date();
      
      switch(timeRange) {
        case '1month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case '3months':
          startDate.setMonth(startDate.getMonth() - 3);
          break;
        case '6months':
          startDate.setMonth(startDate.getMonth() - 6);
          break;
        case '1year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        default:
          startDate.setMonth(startDate.getMonth() - 3);
      }

      const response = await costService.getUserPayments({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      if (response.success) {
        setPaymentHistory(response.data);
      }
    } catch (error) {
      showErrorToast('Không thể tải lịch sử thanh toán');
      console.error('Failed to fetch payment history:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    totalPaid: paymentHistory.filter(p => p.status === 'completed').reduce((sum, p) => sum + (p.amount || 0), 0),
    pendingAmount: paymentHistory.filter(p => p.status === 'pending').reduce((sum, p) => sum + (p.amount || 0), 0),
    transactionCount: paymentHistory.length,
    completedPayments: paymentHistory.filter(p => p.status === 'completed').length,
    failedPayments: paymentHistory.filter(p => p.status === 'failed').length
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'failed': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'failed': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'charging': return 'bg-blue-100 text-blue-700';
      case 'maintenance': return 'bg-green-100 text-green-700';
      case 'insurance': return 'bg-purple-100 text-purple-700';
      case 'registration': return 'bg-orange-100 text-orange-700';
      case 'cleaning': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredPayments = filter === 'all' 
    ? paymentHistory 
    : paymentHistory.filter(payment => payment.status === filter);

  return (
    <CoownerLayout>
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Link
              to="/coowner/financial"
              className="inline-flex items-center gap-2 text-sky-600 hover:text-sky-700 mb-6 group transition-colors"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span>Quay lại Quản lý tài chính</span>
            </Link>
            
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                  Lịch sử Thanh toán
                </h1>
                <p className="text-xl text-gray-600">
                  Theo dõi tất cả giao dịch thanh toán của bạn
                </p>
              </div>
              
              <div className="flex gap-3">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-2xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                >
                  <option value="month">1 tháng</option>
                  <option value="3months">3 tháng</option>
                  <option value="year">1 năm</option>
                </select>
                
                <button className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-2xl hover:bg-gray-50 transition-colors">
                  <Download className="w-4 h-4" />
                  <span>Xuất báo cáo</span>
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.totalPaid.toLocaleString()} VNĐ
                    </p>
                    <p className="text-sm text-gray-600">Đã thanh toán</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-100 rounded-xl">
                    <Clock className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.pendingAmount.toLocaleString()} VNĐ
                    </p>
                    <p className="text-sm text-gray-600">Chờ xử lý</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <CheckCircle className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.completedPayments}</p>
                    <p className="text-sm text-gray-600">Giao dịch thành công</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gray-100 rounded-xl">
                    <Calendar className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.failedPayments}</p>
                    <p className="text-sm text-gray-600">Giao dịch thất bại</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Payment List */}
            <div className="lg:col-span-3">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8"
              >
                {/* Filters */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div className="flex gap-2">
                    {['all', 'completed', 'pending', 'failed'].map(status => (
                      <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-4 py-2 rounded-2xl font-medium transition-all ${
                          filter === status
                            ? 'bg-sky-500 text-white shadow-lg'
                            : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                        }`}
                      >
                        {status === 'all' && 'Tất cả'}
                        {status === 'completed' && 'Đã hoàn thành'}
                        {status === 'pending' && 'Đang chờ'}
                        {status === 'failed' && 'Thất bại'}
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Tìm kiếm..."
                        className="pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-2xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                      />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-2xl hover:bg-gray-50 transition-colors">
                      <Filter className="w-4 h-4" />
                      <span>Lọc</span>
                    </button>
                  </div>
                </div>

                {/* Payment List */}
                <div className="space-y-4">
                  {filteredPayments.map((payment, index) => (
                    <motion.div
                      key={payment.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200/50 shadow-lg"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-3">
                            <div className="p-3 bg-sky-100 rounded-xl">
                              <Receipt className="w-6 h-6 text-sky-600" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-900">
                                {payment.description}
                              </h3>
                              <div className="flex items-center gap-4 mt-2">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(payment.type)}`}>
                                  {payment.type === 'charging' && 'Sạc điện'}
                                  {payment.type === 'maintenance' && 'Bảo dưỡng'}
                                  {payment.type === 'insurance' && 'Bảo hiểm'}
                                  {payment.type === 'registration' && 'Đăng kiểm'}
                                  {payment.type === 'cleaning' && 'Vệ sinh'}
                                </span>
                                <span className="text-gray-600">{payment.invoice}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">Ngày:</span>
                              <span className="font-medium">{payment.date}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">Phương thức:</span>
                              <span className="font-medium">{payment.method}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-600">Số tiền:</span>
                              <span className="text-xl font-bold text-gray-900">
                                {payment.amount.toLocaleString()} VNĐ
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-3">
                          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(payment.status)}`}>
                            {getStatusIcon(payment.status)}
                            {payment.status === 'completed' && 'Đã thanh toán'}
                            {payment.status === 'pending' && 'Đang chờ'}
                            {payment.status === 'failed' && 'Thất bại'}
                          </span>
                          
                          {payment.status === 'completed' && (
                            <button className="flex items-center gap-2 px-4 py-2 text-sky-600 hover:bg-sky-50 rounded-2xl transition-colors">
                              <Download className="w-4 h-4" />
                              <span className="text-sm">Tải hóa đơn</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Payment Summary */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4">Tóm tắt thanh toán</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-2xl">
                    <span className="text-gray-700">Thành công:</span>
                    <span className="font-bold text-green-600">{stats.completedPayments}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-amber-50 rounded-2xl">
                    <span className="text-gray-700">Đang chờ:</span>
                    <span className="font-bold text-amber-600">1</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-2xl">
                    <span className="text-gray-700">Thất bại:</span>
                    <span className="font-bold text-gray-600">{stats.failedPayments}</span>
                  </div>
                </div>
              </motion.div>

              {/* Payment Methods */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4">Phương thức thanh toán</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-2xl">
                    <span className="font-medium">VNPay</span>
                    <span className="text-blue-600 font-bold">2</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-pink-50 rounded-2xl">
                    <span className="font-medium">Momo</span>
                    <span className="text-pink-600 font-bold">2</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-2xl">
                    <span className="font-medium">Banking</span>
                    <span className="text-green-600 font-bold">1</span>
                  </div>
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-sky-500 to-cyan-500 rounded-3xl p-6 text-white"
              >
                <h3 className="text-xl font-bold mb-4">Hành động nhanh</h3>
                <div className="space-y-3">
                  <button className="w-full py-3 bg-white text-sky-600 font-semibold rounded-2xl hover:bg-blue-50 transition-colors">
                    Thanh toán ngay
                  </button>
                  <button className="w-full py-3 bg-white/20 text-white font-semibold rounded-2xl hover:bg-white/30 transition-colors border border-white/30">
                    Lịch thanh toán
                  </button>
                  <button className="w-full py-3 bg-white/20 text-white font-semibold rounded-2xl hover:bg-white/30 transition-colors border border-white/30">
                    Cài đặt tự động
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </CoownerLayout>
  );
}