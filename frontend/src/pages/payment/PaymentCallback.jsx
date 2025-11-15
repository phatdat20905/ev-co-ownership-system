import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import costService from '../../services/costService';
import { showSuccessToast, showErrorToast } from '../../utils/toast';

export default function PaymentCallback() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    // Try common param names used by payment gateways
    const paymentId = params.get('paymentId') || params.get('orderId') || params.get('transactionId') || params.get('vnp_TxnRef') || params.get('token');

    const confirm = async () => {
      try {
        if (!paymentId) {
          // Nothing to confirm — show generic success and redirect
          showSuccessToast('Thanh toán hoàn tất.');
          navigate('/dashboard/coowner/financial/payment');
          return;
        }

        // Call confirm endpoint (best-effort). Backend should accept the paymentId or reference
        const payload = {};
        // include all query params to help server validate gateway callback
        params.forEach((value, key) => {
          payload[key] = value;
        });

        const resp = await costService.confirmPayment(paymentId, payload);
        if (resp?.success) {
          showSuccessToast('Thanh toán được xác nhận thành công');
        } else {
          showErrorToast(resp?.message || 'Không thể xác nhận thanh toán');
        }
      } catch (err) {
        console.error('Payment confirm error', err);
        showErrorToast('Xác nhận thanh toán thất bại');
      } finally {
        setLoading(false);
        // Redirect to payment history after a short delay
        setTimeout(() => navigate('/dashboard/coowner/financial/payment'), 800);
      }
    };

    confirm();
  }, [location.search, navigate]);

  if (loading) return <LoadingSkeleton.PageLoading message="Xác nhận thanh toán..." />;

  return <div className="min-h-screen flex items-center justify-center">Đang chuyển hướng...</div>;
}
