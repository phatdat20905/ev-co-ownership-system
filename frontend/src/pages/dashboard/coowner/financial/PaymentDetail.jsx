import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Loader2, RefreshCw } from 'lucide-react';
import Header from '../../../../components/layout/Header';
import Footer from '../../../../components/layout/Footer';
import { costAPI } from '../../../../api/cost';
import { showToast, getErrorMessage } from '../../../../utils/toast';

export default function PaymentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  // Poll payment status for auto-confirm behavior
  useEffect(() => {
    let interval = null;
    if (payment && (payment.status === 'pending' || payment.payment_status === 'pending')) {
      interval = setInterval(async () => {
        try {
          const fresh = await costAPI.getPaymentById(id);
          if (fresh) {
            setPayment(fresh);
            if (fresh.status === 'completed' || fresh.payment_status === 'completed') {
              showToast.success('Thanh toán đã hoàn tất');
              clearInterval(interval);
            }
          }
        } catch (err) {
          console.error('Polling payment detail failed', err);
        }
      }, 3000);
    }

    return () => { if (interval) clearInterval(interval); };
  }, [payment, id]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const data = await costAPI.getPaymentById(id);
      setPayment(data);
    } catch (err) {
      showToast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async () => {
    const invoiceId = payment?.invoiceId || payment?.invoice;
    if (!invoiceId) return showToast.warning('Không tìm thấy hóa đơn');

    try {
      const blob = await costAPI.downloadInvoice(invoiceId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${invoiceId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showToast.success('Tải hóa đơn thành công');
    } catch (err) {
      showToast.error(getErrorMessage(err));
    }
  };

  const handleRetry = async () => {
    if (!payment) return;
    setProcessing(true);
    try {
      // Attempt to create payment again using same payload pattern
      const payload = {
        costSplitId: payment.costSplitId,
        amount: payment.amount,
        paymentMethod: payment.methodKey || 'e_wallet',
        providerName: payment.provider || 'unknown'
      };
      const res = await costAPI.createPayment(payload);
      showToast.success('Yêu cầu thanh toán đã được tạo lại');
      // If payment returned a URL or QR, open or show
      if (res?.paymentUrl) window.open(res.paymentUrl, '_blank');
      if (res?.qrCodeUrl) {
        // open new window with QR for now
        window.open(res.qrCodeUrl, '_blank');
      }
      await fetchDetail();
    } catch (err) {
      showToast.error(getErrorMessage(err));
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <Header />
      <main className="pt-20 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </main>
      <Footer />
    </div>
  );

  if (!payment) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <Header />
      <main className="pt-20 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Không tìm thấy giao dịch</p>
          <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-sky-600 text-white rounded-2xl">Quay lại</button>
        </div>
      </main>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <Header />
      <main className="pt-20 max-w-4xl mx-auto px-6 py-8">
        <Link to="/dashboard/coowner/financial" className="inline-flex items-center gap-2 text-sky-600 mb-4">
          <ArrowLeft className="w-5 h-5" /> Quay lại
        </Link>

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/50">
          <h1 className="text-2xl font-bold mb-4">Chi tiết thanh toán</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600">Mô tả</p>
              <p className="font-semibold text-lg">{payment.description}</p>

              <p className="text-sm text-gray-600 mt-4">Số tiền</p>
              <p className="font-bold text-2xl">{payment.amount.toLocaleString('vi-VN')} đ</p>

              <p className="text-sm text-gray-600 mt-4">Trạng thái</p>
              <p className="font-medium">{payment.status}</p>

              <div className="mt-6 flex gap-3">
                {payment.invoiceId && (
                  <button onClick={handleDownloadInvoice} className="px-4 py-2 bg-white border rounded-2xl">
                    <Download className="w-4 h-4 inline-block mr-2" /> Tải hóa đơn
                  </button>
                )}
                <button onClick={handleRetry} disabled={processing} className="px-4 py-2 bg-green-600 text-white rounded-2xl">
                  {processing ? 'Đang...' : (<><RefreshCw className="w-4 h-4 inline-block mr-2"/> Thử lại</>)}
                </button>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600">Chi tiết</p>
              <div className="mt-2 text-sm text-gray-700 space-y-2">
                <div><strong>Invoice:</strong> {payment.invoice || '—'}</div>
                <div><strong>Payment method:</strong> {payment.method}</div>
                <div><strong>Provider:</strong> {payment.provider || '—'}</div>
                <div><strong>Ngày:</strong> {payment.date}</div>
              </div>

              {payment.qrCodeUrl && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600">QR Thanh toán</p>
                  <img src={payment.qrCodeUrl} alt="VietQR" className="mt-2 w-48 h-48 object-contain" />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
