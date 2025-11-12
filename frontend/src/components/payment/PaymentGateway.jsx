// src/components/payment/PaymentGateway.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Wallet, QrCode, ArrowRight, Check, X, Loader2 } from 'lucide-react';
import costService from '../../services/cost.service';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import { showSuccessToast, showErrorToast } from '../../utils/toast';

export default function PaymentGateway({ amount, description, onSuccess, onCancel, orderId, orderInfo }) {
  const [selectedMethod, setSelectedMethod] = useState('momo');
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [paymentUrl, setPaymentUrl] = useState(null);

  const paymentMethods = [
    {
      id: 'momo',
      name: 'MoMo',
      description: 'Ví điện tử MoMo',
      icon: '📱',
      color: 'from-pink-500 to-purple-500'
    },
    {
      id: 'vnpay',
      name: 'VNPay',
      description: 'Thẻ ATM / Visa / MasterCard',
      icon: '💳',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'vietqr',
      name: 'VietQR',
      description: 'Quét mã QR ngân hàng',
      icon: '📲',
      color: 'from-green-500 to-emerald-500'
    }
  ];

  const handlePayment = async () => {
    setLoading(true);
    try {
      let response;
      
      switch (selectedMethod) {
        case 'momo':
          response = await costService.createMomoPayment({
            amount,
            description,
            orderId,
            orderInfo: orderInfo || description,
            returnUrl: `${window.location.origin}/payment/callback`,
            notifyUrl: `${import.meta.env.VITE_API_BASE_URL}/cost/payments/webhook/momo`
          });

          if (response?.success && response?.data?.payUrl) {
            // Redirect to MoMo payment page
            window.location.href = response.data.payUrl;
          }
          break;

        case 'vnpay':
          response = await costService.createVnpayPayment({
            amount,
            description,
            orderId,
            orderInfo: orderInfo || description,
            returnUrl: `${window.location.origin}/payment/callback`
          });

          if (response?.success && response?.data?.paymentUrl) {
            // Redirect to VNPay payment page
            window.location.href = response.data.paymentUrl;
          }
          break;

        case 'vietqr':
          response = await costService.generateVietQr({
            amount,
            description,
            orderId,
            orderInfo: orderInfo || description
          });

          if (response?.success && response?.data?.qrCode) {
            setQrCode(response.data.qrCode);
            showSuccessToast('Vui lòng quét mã QR để thanh toán');
          }
          break;

        default:
          showErrorToast('Phương thức thanh toán không hợp lệ');
      }
    } catch (error) {
      showErrorToast(error.response?.data?.message || 'Không thể khởi tạo thanh toán');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-sky-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Wallet className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Thanh toán</h2>
        <p className="text-gray-600">{description}</p>
        <div className="mt-4 text-4xl font-bold text-sky-600">
          {amount.toLocaleString('vi-VN')} ₫
        </div>
      </div>

      {/* Payment Methods */}
      {!qrCode && (
        <>
          <div className="space-y-3 mb-6">
            {paymentMethods.map((method) => (
              <motion.button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full p-4 rounded-xl border-2 transition-all ${
                  selectedMethod === method.id
                    ? 'border-sky-500 bg-sky-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-lg bg-gradient-to-r ${method.color} flex items-center justify-center text-2xl`}>
                    {method.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-gray-900">{method.name}</h3>
                    <p className="text-sm text-gray-600">{method.description}</p>
                  </div>
                  {selectedMethod === method.id && (
                    <div className="w-6 h-6 rounded-full bg-sky-500 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </motion.button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handlePayment}
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-semibold hover:from-sky-600 hover:to-cyan-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <LoadingSkeleton.Skeleton variant="circular" className="w-5 h-5" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  Thanh toán
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </>
      )}

      {/* QR Code Display */}
      {qrCode && (
        <div className="text-center">
          <div className="bg-white p-6 rounded-2xl shadow-inner mb-4">
            <img 
              src={qrCode} 
              alt="QR Code" 
              className="w-64 h-64 mx-auto"
            />
          </div>
          <p className="text-gray-600 mb-4">
            Vui lòng quét mã QR bằng ứng dụng ngân hàng của bạn
          </p>
          <button
            onClick={() => {
              setQrCode(null);
              onSuccess?.();
            }}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:from-green-600 hover:to-emerald-600 transition-all"
          >
            Đã thanh toán
          </button>
        </div>
      )}

      {/* Security Notice */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <p className="text-xs text-gray-600 text-center">
          🔒 Giao dịch được bảo mật bởi các cổng thanh toán đã được cấp phép
        </p>
      </div>
    </div>
  );
}
