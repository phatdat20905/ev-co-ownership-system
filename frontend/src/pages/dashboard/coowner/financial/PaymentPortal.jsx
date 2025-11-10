// src/pages/dashboard/coowner/financial/PaymentPortal.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, DollarSign, Clock, CheckCircle, XCircle, FileText } from 'lucide-react';
import Header from '../../../../components/layout/Header';
import Footer from '../../../../components/layout/Footer';
import PaymentGateway from '../../../../components/payment/PaymentGateway';

export default function PaymentPortal() {
  const [selectedBill, setSelectedBill] = useState(null);
  const [pendingBills, setPendingBills] = useState([]);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    // Mock data - trong thực tế sẽ fetch từ API
    setPendingBills([
      {
        id: 1,
        description: 'Chi phí sử dụng xe tháng 1/2024',
        amount: 1540000,
        dueDate: '2024-01-31',
        status: 'pending',
        breakdown: [
          { name: 'Sạc điện', amount: 500000 },
          { name: 'Bảo dưỡng', amount: 340000 },
          { name: 'Bảo hiểm', amount: 300000 },
          { name: 'Khác', amount: 400000 }
        ]
      },
      {
        id: 2,
        description: 'Chi phí bảo hiểm quý 1/2024',
        amount: 2250000,
        dueDate: '2024-01-15',
        status: 'overdue',
        breakdown: [
          { name: 'Bảo hiểm trách nhiệm', amount: 1500000 },
          { name: 'Bảo hiểm vật chất', amount: 750000 }
        ]
      }
    ]);
  }, []);

  const handlePaymentSuccess = (paymentResult) => {
    console.log('Payment successful:', paymentResult);
    alert('Thanh toán thành công! Mã giao dịch: ' + (paymentResult.transactionId || 'N/A'));
    setShowPayment(false);
    setSelectedBill(null);
    // Reload bills
    // fetchPendingBills();
  };

  const handlePaymentCancel = () => {
    console.log('Payment cancelled');
    alert('Thanh toán đã bị hủy');
    setShowPayment(false);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: {
        label: 'Chờ thanh toán',
        color: 'bg-yellow-100 text-yellow-700',
        icon: <Clock className="w-4 h-4" />
      },
      overdue: {
        label: 'Quá hạn',
        color: 'bg-red-100 text-red-700',
        icon: <XCircle className="w-4 h-4" />
      },
      paid: {
        label: 'Đã thanh toán',
        color: 'bg-green-100 text-green-700',
        icon: <CheckCircle className="w-4 h-4" />
      }
    };

    return badges[status] || badges.pending;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-cyan-50 flex flex-col">
      <Header />
      
      <main className="flex-grow pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link
              to="/dashboard/coowner/financial"
              className="p-2 rounded-lg hover:bg-white/80 transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Cổng thanh toán</h1>
              <p className="text-gray-600 mt-1">Thanh toán các khoản chi phí của bạn</p>
            </div>
          </div>

          {!showPayment ? (
            <>
              {/* Pending Bills */}
              <div className="space-y-4 mb-8">
                <h2 className="text-xl font-semibold text-gray-900">Hóa đơn chờ thanh toán</h2>
                
                {pendingBills.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">Bạn không có hóa đơn nào chờ thanh toán</p>
                  </div>
                ) : (
                  pendingBills.map((bill) => {
                    const status = getStatusBadge(bill.status);
                    
                    return (
                      <motion.div
                        key={bill.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl shadow-lg p-6"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <FileText className="w-5 h-5 text-sky-600" />
                              <h3 className="text-lg font-semibold text-gray-900">
                                {bill.description}
                              </h3>
                            </div>
                            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full ${status.color} text-sm font-medium`}>
                              {status.icon}
                              {status.label}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900">
                              {bill.amount.toLocaleString('vi-VN')}đ
                            </div>
                            <div className="text-sm text-gray-500">
                              Hạn: {new Date(bill.dueDate).toLocaleDateString('vi-VN')}
                            </div>
                          </div>
                        </div>

                        {/* Breakdown */}
                        <div className="bg-gray-50 rounded-xl p-4 mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-3">Chi tiết</h4>
                          <div className="space-y-2">
                            {bill.breakdown.map((item, index) => (
                              <div key={index} className="flex justify-between text-sm">
                                <span className="text-gray-600">{item.name}</span>
                                <span className="font-medium text-gray-900">
                                  {item.amount.toLocaleString('vi-VN')}đ
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Pay Button */}
                        <button
                          onClick={() => {
                            setSelectedBill(bill);
                            setShowPayment(true);
                          }}
                          className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-semibold hover:from-sky-600 hover:to-cyan-600 transition-all flex items-center justify-center gap-2"
                        >
                          <DollarSign className="w-5 h-5" />
                          Thanh toán ngay
                        </button>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </>
          ) : (
            <>
              {/* Payment Gateway */}
              <div className="mb-4">
                <button
                  onClick={() => {
                    setShowPayment(false);
                    setSelectedBill(null);
                  }}
                  className="flex items-center gap-2 text-sky-600 hover:text-sky-700 font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Quay lại danh sách hóa đơn
                </button>
              </div>

              {selectedBill && (
                <div className="mb-6 bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {selectedBill.description}
                  </h3>
                  <div className="text-3xl font-bold text-sky-600">
                    {selectedBill.amount.toLocaleString('vi-VN')}đ
                  </div>
                </div>
              )}

              <PaymentGateway
                amount={selectedBill?.amount || 0}
                orderId={`BILL-${selectedBill?.id}`}
                orderInfo={selectedBill?.description}
                onSuccess={handlePaymentSuccess}
                onCancel={handlePaymentCancel}
              />
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
