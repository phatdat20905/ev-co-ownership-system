import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, DollarSign, Calendar, CheckCircle, Clock, AlertCircle, Download, Filter, Search, Receipt, Loader2 } from "lucide-react";
import Header from '../../../../components/layout/Header';
import Footer from '../../../../components/layout/Footer';
import { useCostStore } from '../../../../store/costStore';
import { useAuthStore } from '../../../../store/authStore';
import { costAPI } from '../../../../api/cost';
import { showToast, getErrorMessage } from '../../../../utils/toast';

export default function PaymentHistory() {
  const [filter, setFilter] = useState('all');
  const [timeRange, setTimeRange] = useState('3months');
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showAutoModal, setShowAutoModal] = useState(false);
  const [scheduleAt, setScheduleAt] = useState('');
  const [autoConfig, setAutoConfig] = useState({ frequency: 'monthly', threshold: '' });
  const pollingRef = React.useRef(null);
  const [qrCountdown, setQrCountdown] = useState(null);
  
  const { fetchPaymentHistory } = useCostStore();
  const { activeGroup } = useAuthStore();
  const navigate = useNavigate();

  const providers = {
    momo: { backendMethod: 'e_wallet', label: 'MoMo', feePercent: 1.5, fixed: 1000 },
    vnpay: { backendMethod: 'vnpay', label: 'VNPay', feePercent: 1.2, fixed: 1500 },
    vietqr: { backendMethod: 'bank_transfer', label: 'VietQR', feePercent: 0.5, fixed: 500 },
    internal_wallet: { backendMethod: 'internal_wallet', label: 'Ví nội bộ', feePercent: 0, fixed: 0 }
  };

  useEffect(() => {
    loadPaymentHistory();
  }, [timeRange, filter, activeGroup]);

  const loadPaymentHistory = async () => {
    if (!activeGroup?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetchPaymentHistory(activeGroup.id, {
        timeRange,
        status: filter !== 'all' ? filter : undefined
      });
      // Handle API response structure: { success, data: { payments, stats, pagination } }
      const data = response?.data || response;
      setPaymentData({
        payments: data?.payments || [],
        stats: data?.stats || { totalPaid: 0, pendingAmount: 0, completedPayments: 0, failedPayments: 0 },
        pagination: data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 }
      });
    } catch (error) {
      console.error('Failed to load payment history:', error);
      showToast.error(getErrorMessage(error));
      // Set empty data on error
      setPaymentData({
        payments: [],
        stats: { totalPaid: 0, pendingAmount: 0, completedPayments: 0, failedPayments: 0 },
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!activeGroup?.id) {
      showToast.warning('Vui lòng chọn nhóm để xuất báo cáo');
      return;
    }

    setIsExporting(true);
    try {
      const blob = await costAPI.exportPaymentHistoryPDF(activeGroup.id, {
        timeRange,
        status: filter !== 'all' ? filter : undefined
      });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `payment-history-${activeGroup.id}-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      showToast.success('Xuất báo cáo PDF thành công!');
    } catch (err) {
      console.error('Error exporting PDF:', err);
      showToast.error(getErrorMessage(err));
    } finally {
      setIsExporting(false);
    }
  };

  const handlePayNow = async (payment) => {
    if (payment.status !== 'pending' && payment.status !== 'overdue') {
      showToast.warning('Chỉ có thể thanh toán các khoản chưa hoàn thành');
      return;
    }

    // Try to fetch dynamic fees for providers (fallback to static providers)
    try {
      const fees = await costAPI.getPaymentFees(activeGroup?.id);
      if (fees && typeof fees === 'object') {
        // merge fees into providers (only if returned structure matches)
        Object.keys(fees).forEach(k => {
          if (providers[k]) {
            providers[k] = { ...providers[k], ...fees[k] };
          } else {
            providers[k] = fees[k];
          }
        });
      }
    } catch (err) {
      // ignore - backend may not expose fees endpoint
    }

    // Open modal to choose payment method
    setSelectedPayment(payment);
    setSelectedProvider('internal_wallet');
    setPaymentResult(null);
    setShowPaymentModal(true);
  };

  const submitPayment = async (method) => {
    if (!selectedPayment) return;
    setProcessingPayment(selectedPayment.id);
    setPaymentResult(null);
    let result = null;
    try {
      const chosen = providers[method] || providers.internal_wallet;

      const payload = {
        costSplitId: selectedPayment.costSplitId,
        amount: selectedPayment.amount,
        paymentMethod: chosen.backendMethod,
        providerName: chosen.label
      };

      const response = await costAPI.createPayment(payload);
      
      // Extract data from response structure: { success, data: {...} }
      result = response?.data || response;
      setPaymentResult(result);

      // Check for VietQR - gatewayResponse.qrCodeUrl or paymentUrl with QR
      const qrCodeUrl = result?.gatewayResponse?.qrCodeUrl || 
                       (result?.paymentMethod === 'bank_transfer' && result?.paymentUrl);
      
      // Check for VNPay/MoMo payment URL or deeplink
      const paymentUrl = (result?.paymentMethod === 'vnpay' || result?.paymentMethod === 'e_wallet') 
                         ? result?.paymentUrl 
                         : null;
      const deeplink = result?.gatewayResponse?.deeplink || result?.deeplink;

      if (qrCodeUrl) {
        // VietQR - show QR in modal
        showToast.info('QR VietQR đã sẵn sàng. Vui lòng quét để thanh toán.');
        const paymentId = result?.id || result?.paymentId;
        if (paymentId) {
          pollPaymentStatus(paymentId, 180);
        }
      } else if (paymentUrl) {
        // VNPay - open payment URL in new tab
        window.open(paymentUrl, '_blank');
        showToast.info('Đang chuyển tới cổng thanh toán VNPay...');
        const paymentId = result?.id || result?.paymentId;
        if (paymentId) {
          pollPaymentStatus(paymentId, 180);
        }
      } else if (deeplink) {
        // MoMo - open deeplink
        window.open(deeplink, '_blank');
        showToast.info('Mở ứng dụng thanh toán...');
        const paymentId = result?.id || result?.paymentId;
        if (paymentId) {
          pollPaymentStatus(paymentId, 180);
        }
      } else {
        showToast.success('Thanh toán khởi tạo thành công!');
      }

      // Refresh list after a short delay so backend has time to update
      setTimeout(() => loadPaymentHistory(), 1200);
    } catch (err) {
      console.error('Payment failed:', err);
      showToast.error(getErrorMessage(err));
    } finally {
      setProcessingPayment(null);
      // Keep modal open if we have QR to show; otherwise close
      const hasQR = result?.gatewayResponse?.qrCodeUrl || 
                    (result?.paymentMethod === 'bank_transfer' && result?.paymentUrl);
      if (!hasQR) {
        setShowPaymentModal(false);
        setSelectedPayment(null);
      }
    }
  };

  const handleSchedulePayment = () => {
    // Open schedule modal
    setScheduleAt('');
    setShowScheduleModal(true);
  };

  const handleAutoPaymentSetup = () => {
    setAutoConfig({ frequency: 'monthly', threshold: '' });
    setShowAutoModal(true);
  };

  // Poll a payment status by id until it completes or timeout
  const pollPaymentStatus = async (paymentId, timeoutSec = 120) => {
    if (!paymentId) return;
    const start = Date.now();
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    pollingRef.current = setInterval(async () => {
      try {
        const response = await costAPI.getPaymentById(paymentId);
        const data = response?.data || response;
        
        // Update paymentResult with latest status
        setPaymentResult(prev => ({ ...(prev||{}), ...data }));
        
        // Check for completion statuses
        const status = data.paymentStatus || data.status || data.payment_status;
        if (status === 'completed' || status === 'failed' || status === 'cancelled' || status === 'success') {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
          
          if (status === 'completed' || status === 'success') {
            showToast.success('Thanh toán thành công! 🎉');
          } else if (status === 'failed') {
            showToast.error('Thanh toán thất bại. Vui lòng thử lại.');
          } else {
            showToast.warning(`Thanh toán đã bị hủy.`);
          }
          
          // Refresh payment list
          await loadPaymentHistory();
          
          // Close modal after delay if payment completed
          if (status === 'completed' || status === 'success') {
            setTimeout(() => {
              setShowPaymentModal(false);
              setSelectedPayment(null);
              setPaymentResult(null);
            }, 2000);
          }
        }
      } catch (err) {
        console.error('Polling payment failed', err);
      }

      // Check timeout
      if ((Date.now() - start) / 1000 > timeoutSec) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
        showToast.warning('Hết thời gian chờ thanh toán. Vui lòng kiểm tra lại trạng thái sau.');
      }
    }, 3000);
  };

  // QR countdown effect
  useEffect(() => {
    if (!paymentResult || !paymentResult.expiresAt) {
      setQrCountdown(null);
      return;
    }
    const update = () => {
      const diff = Math.max(0, Math.floor((new Date(paymentResult.expiresAt).getTime() - Date.now()) / 1000));
      setQrCountdown(diff);
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [paymentResult?.expiresAt]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const handleDownloadInvoice = async (payment) => {
    // Resolve invoice id robustly: prefer invoiceId, fallback to invoice if it's a GUID,
    // otherwise attempt to search invoices by invoice number (requires activeGroup)
    const isGuid = (v) => {
      if (!v || typeof v !== 'string') return false;
      return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(v);
    };

    if (!payment) {
      showToast.warning('Không tìm thấy hóa đơn để tải về');
      return;
    }

    let invoiceId = payment.invoiceId || payment.invoice;

    if (invoiceId && !isGuid(invoiceId)) {
      // If invoice field is not a GUID, prefer to search by invoice number
      invoiceId = null;
    }

    if (!invoiceId && activeGroup?.id) {
      try {
        const searchKey = payment.invoice || '';
        if (searchKey) {
          const res = await costAPI.getInvoices(activeGroup.id, { search: searchKey });
          const payload = res?.data ?? res;
          const invoices = payload?.invoices ?? payload;
          if (Array.isArray(invoices) && invoices.length > 0) {
            invoiceId = invoices[0].id ?? invoices[0].invoiceId ?? invoices[0].uuid;
          }
        }
      } catch (err) {
        console.warn('Invoice lookup failed', err);
      }
    }

    if (!invoiceId) {
      showToast.warning('Không tìm thấy ID hóa đơn để tải về');
      return;
    }

    try {
      const blob = await costAPI.downloadInvoice(invoiceId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${invoiceId}-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showToast.success('Tải hóa đơn thành công');
    } catch (err) {
      console.error('Failed to download invoice:', err);
      // Improve error messaging for API validation errors
      const msg = getErrorMessage(err);
      showToast.error(msg || 'Tải hóa đơn thất bại. Vui lòng thử lại.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'failed': 
      case 'overdue': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'failed':
      case 'overdue': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type) => {
    const typeLower = type?.toLowerCase() || '';
    if (typeLower.includes('sạc') || typeLower.includes('điện')) return 'bg-blue-100 text-blue-700';
    if (typeLower.includes('bảo dưỡng')) return 'bg-green-100 text-green-700';
    if (typeLower.includes('bảo hiểm')) return 'bg-purple-100 text-purple-700';
    if (typeLower.includes('đăng kiểm')) return 'bg-orange-100 text-orange-700';
    if (typeLower.includes('vệ sinh')) return 'bg-gray-100 text-gray-700';
    return 'bg-gray-100 text-gray-700';
  };

  const filteredPayments = paymentData?.payments?.filter(payment =>
    searchTerm === '' || 
    payment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.invoice.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
        <Header />
        <main className="pt-20 flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!activeGroup?.id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
        <Header />
        <main className="pt-20 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-gray-600">Vui lòng chọn nhóm để xem lịch sử thanh toán</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const stats = paymentData?.stats || {
    totalPaid: 0,
    pendingAmount: 0,
    completedPayments: 0,
    failedPayments: 0
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <Header />
      
      <main className="pt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Link
              to="/dashboard/coowner/financial"
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
                
                <button 
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-2xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang xuất...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Xuất báo cáo</span>
                    </>
                  )}
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
                      {stats.totalPaid.toLocaleString('vi-VN')} đ
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
                      {stats.pendingAmount.toLocaleString('vi-VN')} đ
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
                    {['all', 'completed', 'pending', 'overdue'].map(status => (
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
                        {status === 'overdue' && 'Quá hạn'}
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Tìm kiếm..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-2xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment List */}
                <div className="space-y-4">
                  {filteredPayments.length > 0 ? (
                    filteredPayments.map((payment, index) => (
                      <motion.div
                        key={payment.paymentId || payment.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.01 }}
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
                                  {payment.paymentId ? (
                                    <Link to={`/dashboard/coowner/financial/payment/${payment.paymentId}`} className="hover:underline">
                                      {payment.description}
                                    </Link>
                                  ) : (
                                    <span>{payment.description}</span>
                                  )}
                                </h3>
                                <div className="flex items-center gap-4 mt-2">
                                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(payment.type)}`}>
                                    {payment.type}
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
                                  {payment.amount.toLocaleString('vi-VN')} đ
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end gap-3">
                            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(payment.status)}`}>
                              {getStatusIcon(payment.status)}
                              {payment.status === 'completed' && 'Đã thanh toán'}
                              {payment.status === 'pending' && 'Đang chờ'}
                              {payment.status === 'overdue' && 'Quá hạn'}
                              {payment.status === 'failed' && 'Thất bại'}
                            </span>
                            
                            {payment.status === 'completed' && (
                              <button onClick={() => handleDownloadInvoice(payment)} className="flex items-center gap-2 px-4 py-2 text-sky-600 hover:bg-sky-50 rounded-2xl transition-colors">
                                <Download className="w-4 h-4" />
                                <span className="text-sm">Tải hóa đơn</span>
                              </button>
                            )}
                            
                            {(payment.status === 'pending' || payment.status === 'overdue') && (
                              <button 
                                onClick={() => handlePayNow(payment)}
                                disabled={processingPayment === payment.id}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-2xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {processingPayment === payment.id ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span className="text-sm">Đang xử lý...</span>
                                  </>
                                ) : (
                                  <>
                                    <DollarSign className="w-4 h-4" />
                                    <span className="text-sm">Thanh toán ngay</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <p>Không có giao dịch nào phù hợp</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
              {/* Schedule Payment Modal */}
              {showScheduleModal && selectedPayment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                  <div className="bg-white rounded-xl p-6 w-full max-w-md">
                    <h3 className="text-lg font-bold mb-2">Lên lịch thanh toán</h3>
                    <p className="text-sm text-gray-600">Giao dịch: {selectedPayment?.description}</p>
                    <label className="block mt-4 text-sm">Chọn ngày & giờ</label>
                    <input type="datetime-local" value={scheduleAt} onChange={(e) => setScheduleAt(e.target.value)} className="w-full p-2 border rounded-2xl" />
                    <div className="mt-4 flex gap-2">
                      <button className="flex-1 py-2 bg-sky-600 text-white rounded-2xl" onClick={async () => {
                        if (!scheduleAt) return showToast.warning('Vui lòng chọn ngày');
                        try {
                          await costAPI.schedulePayment({ costSplitId: selectedPayment.costSplitId, amount: selectedPayment.amount, scheduleAt, providerName: selectedProvider });
                          showToast.success('Lịch thanh toán đã được tạo');
                          setShowScheduleModal(false);
                        } catch (err) {
                          // fallback: store locally and notify user
                          const pending = JSON.parse(localStorage.getItem('scheduledPayments') || '[]');
                          pending.push({ costSplitId: selectedPayment.costSplitId, amount: selectedPayment.amount, scheduleAt, providerName: selectedProvider });
                          localStorage.setItem('scheduledPayments', JSON.stringify(pending));
                          showToast.info('Backend không hỗ trợ lịch; đã lưu cục bộ');
                          setShowScheduleModal(false);
                        }
                      }}>Lưu</button>
                      <button className="flex-1 py-2 bg-gray-200 rounded-2xl" onClick={() => setShowScheduleModal(false)}>Hủy</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Auto Payment Modal */}
              {showAutoModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                  <div className="bg-white rounded-xl p-6 w-full max-w-md">
                    <h3 className="text-lg font-bold mb-2">Cài đặt thanh toán tự động</h3>
                    <label className="block mt-2 text-sm">Tần suất</label>
                    <select value={autoConfig.frequency} onChange={(e)=>setAutoConfig({...autoConfig, frequency: e.target.value})} className="w-full p-2 border rounded-2xl">
                      <option value="monthly">Hàng tháng</option>
                      <option value="quarterly">Hàng quý</option>
                      <option value="yearly">Hàng năm</option>
                    </select>
                    <label className="block mt-2 text-sm">Ngưỡng tự động (ví dụ: {'>='} 0 để luôn trả)</label>
                    <input type="number" value={autoConfig.threshold} onChange={(e)=>setAutoConfig({...autoConfig, threshold: e.target.value})} className="w-full p-2 border rounded-2xl" />
                    <div className="mt-4 flex gap-2">
                      <button className="flex-1 py-2 bg-sky-600 text-white rounded-2xl" onClick={async ()=>{
                        try{
                          await costAPI.setupAutoPayment({ frequency: autoConfig.frequency, threshold: autoConfig.threshold });
                          showToast.success('Cài đặt tự động đã được lưu');
                          setShowAutoModal(false);
                        }catch(err){
                          // fallback local
                          localStorage.setItem('autoPaymentConfig', JSON.stringify(autoConfig));
                          showToast.info('Backend không hỗ trợ auto-pay; lưu cục bộ');
                          setShowAutoModal(false);
                        }
                      }}>Lưu</button>
                      <button className="flex-1 py-2 bg-gray-200 rounded-2xl" onClick={()=>setShowAutoModal(false)}>Hủy</button>
                    </div>
                  </div>
                </div>
              )}

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
                    <span className="font-bold text-amber-600">
                      {paymentData?.payments?.filter(p => p.status === 'pending').length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-2xl">
                    <span className="text-gray-700">Quá hạn:</span>
                    <span className="font-bold text-gray-600">{stats.failedPayments}</span>
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
                  <button 
                    onClick={() => {
                      const pendingPayment = paymentData?.payments?.find(p => p.status === 'pending' || p.status === 'overdue');
                      if (pendingPayment) {
                        handlePayNow(pendingPayment);
                      } else {
                        showToast.info('Không có khoản thanh toán nào đang chờ');
                      }
                    }}
                    className="w-full py-3 bg-white text-sky-600 font-semibold rounded-2xl hover:bg-blue-50 transition-colors"
                  >
                    Thanh toán ngay
                  </button>
                  <button 
                    onClick={handleSchedulePayment}
                    className="w-full py-3 bg-white/20 text-white font-semibold rounded-2xl hover:bg-white/30 transition-colors border border-white/30"
                  >
                    Lịch thanh toán
                  </button>
                  <button 
                    onClick={handleAutoPaymentSetup}
                    className="w-full py-3 bg-white/20 text-white font-semibold rounded-2xl hover:bg-white/30 transition-colors border border-white/30"
                  >
                    Cài đặt tự động
                  </button>
                </div>
              </motion.div>
            </div>
          {/* Payment Method Modal */}
          {showPaymentModal && selectedPayment && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-bold mb-2">Thanh toán khoản</h3>
                    <p className="text-sm text-gray-600">{selectedPayment.description}</p>
                    <p className="text-sm text-gray-600 mt-2">Số tiền:</p>
                    <p className="text-2xl font-bold">{selectedPayment.amount.toLocaleString('vi-VN')} đ</p>

                    <h4 className="mt-4 font-semibold">Chọn phương thức</h4>
                    <div className="mt-2 space-y-2">
                      <label className="flex items-center gap-3 p-3 border rounded-2xl cursor-pointer">
                        <input type="radio" name="provider" checked={selectedProvider === 'internal_wallet'} onChange={() => setSelectedProvider('internal_wallet')} />
                        <div>
                          <div className="font-medium">Ví nội bộ</div>
                          <div className="text-xs text-gray-500">Sử dụng số dư trong ví của bạn (không tốn phí)</div>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-3 border rounded-2xl cursor-pointer">
                        <input type="radio" name="provider" checked={selectedProvider === 'momo'} onChange={() => setSelectedProvider('momo')} />
                        <div>
                          <div className="font-medium">MoMo</div>
                          <div className="text-xs text-gray-500">Phí ~1.5% + 1.000đ</div>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-3 border rounded-2xl cursor-pointer">
                        <input type="radio" name="provider" checked={selectedProvider === 'vnpay'} onChange={() => setSelectedProvider('vnpay')} />
                        <div>
                          <div className="font-medium">VNPay</div>
                          <div className="text-xs text-gray-500">Phí ~1.2% + 1.500đ</div>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-3 border rounded-2xl cursor-pointer">
                        <input type="radio" name="provider" checked={selectedProvider === 'vietqr'} onChange={() => setSelectedProvider('vietqr')} />
                        <div>
                          <div className="font-medium">VietQR</div>
                          <div className="text-xs text-gray-500">Phí ~0.5% + 500đ (quét QR)</div>
                        </div>
                      </label>
                    </div>

                    <div className="mt-4">
                      <button onClick={() => submitPayment(selectedProvider)} disabled={processingPayment} className="w-full py-3 bg-green-600 text-white rounded-2xl">
                        {processingPayment ? 'Đang xử lý...' : 'Thanh toán'}
                      </button>
                    </div>
                    {/* Fee summary */}
                    {selectedProvider && selectedPayment && (
                      <div className="mt-3 text-sm text-gray-600">
                        {(() => {
                          const cfg = providers[selectedProvider] || providers.internal_wallet;
                          const fee = Math.round((selectedPayment.amount * (cfg.feePercent / 100)) + cfg.fixed);
                          const total = selectedPayment.amount + fee;
                          return (
                            <div>
                              <div>Phí dự kiến: <strong>{fee.toLocaleString('vi-VN')} đ</strong></div>
                              <div>Tổng thanh toán: <strong>{total.toLocaleString('vi-VN')} đ</strong></div>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="font-semibold">Kết quả thanh toán</h4>
                    <div className="mt-3 p-3 border rounded-2xl min-h-[200px] flex flex-col items-center justify-center">
                      {!paymentResult && (
                        <div className="text-sm text-gray-500">Chưa có kết quả. Sau khi bắt đầu thanh toán, QR hoặc liên kết sẽ xuất hiện ở đây.</div>
                      )}

                      {/* VietQR - Show QR Code */}
                      {paymentResult && (paymentResult.gatewayResponse?.qrCodeUrl || (paymentResult.paymentMethod === 'bank_transfer' && paymentResult.paymentUrl)) && (
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-2">Quét QR bằng ứng dụng ngân hàng/ví</p>
                          <img 
                            src={paymentResult.gatewayResponse?.qrCodeUrl || paymentResult.paymentUrl} 
                            alt="VietQR" 
                            className="mx-auto w-56 h-56 object-contain border rounded-lg" 
                          />
                          {qrCountdown !== null && (
                            <div className="text-xs text-gray-500 mt-2">QR hết hạn trong: <strong>{qrCountdown}s</strong></div>
                          )}
                          <div className="mt-3 flex gap-2 justify-center">
                            <button 
                              onClick={() => window.open(paymentResult.gatewayResponse?.qrCodeUrl || paymentResult.paymentUrl, '_blank')} 
                              className="px-3 py-2 bg-white border rounded-2xl hover:bg-gray-50"
                            >
                              Mở ảnh
                            </button>
                            <button 
                              onClick={() => { 
                                const qrUrl = paymentResult.gatewayResponse?.qrCodeUrl || paymentResult.paymentUrl;
                                navigator.clipboard?.writeText(qrUrl); 
                                showToast.success('Đã sao chép link QR'); 
                              }} 
                              className="px-3 py-2 bg-sky-600 text-white rounded-2xl hover:bg-sky-700"
                            >
                              Sao chép link
                            </button>
                          </div>
                          <div className="mt-3 text-xs text-gray-500">
                            <p>Trạng thái: <strong className="text-amber-600">{paymentResult.paymentStatus || 'Đang chờ'}</strong></p>
                            <p className="mt-1">Mã giao dịch: {paymentResult.transactionId || 'Đang tạo...'}</p>
                          </div>
                        </div>
                      )}

                      {/* VNPay - Show payment URL button (already opened in new tab) */}
                      {paymentResult && paymentResult.paymentMethod === 'vnpay' && paymentResult.paymentUrl && (
                        <div className="text-center">
                          <div className="mb-3">
                            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">Cổng thanh toán VNPay đã mở trong tab mới</p>
                          </div>
                          <button 
                            onClick={() => window.open(paymentResult.paymentUrl, '_blank')} 
                            className="px-4 py-2 bg-sky-600 text-white rounded-2xl hover:bg-sky-700"
                          >
                            Mở lại cổng thanh toán
                          </button>
                          <div className="mt-3 text-xs text-gray-500">
                            <p>Trạng thái: <strong className="text-amber-600">{paymentResult.paymentStatus || 'Đang chờ'}</strong></p>
                            <p className="mt-1">Mã giao dịch: {paymentResult.transactionId || paymentResult.orderRef}</p>
                          </div>
                        </div>
                      )}

                      {/* MoMo - Show deeplink info */}
                      {paymentResult && paymentResult.paymentMethod === 'e_wallet' && (
                        <div className="text-center">
                          <div className="mb-3">
                            <CheckCircle className="w-12 h-12 text-pink-500 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">Ứng dụng MoMo đang được mở...</p>
                          </div>
                          {paymentResult.gatewayResponse?.deeplink && (
                            <button 
                              onClick={() => window.open(paymentResult.gatewayResponse.deeplink, '_blank')} 
                              className="px-4 py-2 bg-pink-600 text-white rounded-2xl hover:bg-pink-700"
                            >
                              Mở lại MoMo
                            </button>
                          )}
                          <div className="mt-3 text-xs text-gray-500">
                            <p>Trạng thái: <strong className="text-amber-600">{paymentResult.paymentStatus || 'Đang chờ'}</strong></p>
                            <p className="mt-1">Mã giao dịch: {paymentResult.transactionId || 'Đang tạo...'}</p>
                          </div>
                        </div>
                      )}

                      {/* Internal Wallet - Show success */}
                      {paymentResult && paymentResult.paymentMethod === 'internal_wallet' && (
                        <div className="text-center">
                          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                          <p className="text-sm font-medium text-gray-900">Thanh toán thành công!</p>
                          <p className="text-xs text-gray-500 mt-2">Đã trừ tiền từ ví nội bộ</p>
                          <div className="mt-3 text-xs text-gray-500">
                            <p>Trạng thái: <strong className="text-green-600">{paymentResult.paymentStatus || 'Hoàn thành'}</strong></p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-right">
                  <button onClick={() => { setShowPaymentModal(false); setSelectedPayment(null); setPaymentResult(null); }} className="px-4 py-2 text-gray-600">Đóng</button>
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
