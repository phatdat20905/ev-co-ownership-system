import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Loader2, RefreshCw, X } from 'lucide-react';
import Header from '../../../../components/layout/Header';
import Footer from '../../../../components/layout/Footer';
import { costAPI } from '../../../../api/cost';
import { showToast, getErrorMessage } from '../../../../utils/toast';
import { useAuthStore } from '../../../../store/authStore';

export default function PaymentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { activeGroup } = useAuthStore();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Helper: GUID validation
  const isGuid = (v) => {
    if (!v || typeof v !== 'string') return false;
    return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(v);
  };

  useEffect(() => {
    // Validate id early to avoid backend validation error
    if (!id || !isGuid(id)) {
      showToast.error('ID giao dịch không hợp lệ hoặc không tìm thấy.');
      navigate('/dashboard/coowner/financial');
      return;
    }

    fetchDetail();
  }, [id]);

  // Poll payment status for auto-confirm behavior
  useEffect(() => {
    let interval = null;
    if (payment && (payment.status === 'pending' || payment.payment_status === 'pending')) {
      interval = setInterval(async () => {
        try {
          const response = await costAPI.getPaymentById(id);
          const freshPayload = response?.data ?? response;
          const raw = freshPayload?.payment ?? freshPayload;
          if (raw) {
            const mapped = mapPayment(raw);
            setPayment(mapped);
            if (mapped.status === 'completed' || mapped.payment_status === 'completed') {
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
      const response = await costAPI.getPaymentById(id);
      // Extract payment object from common response shapes:
      // - { success, data: { payment } }
      // - { payment }
      // - payment object directly
      const payload = response?.data ?? response;
      const raw = payload?.payment ?? payload;
      if (raw) {
        const mapped = mapPayment(raw);
        setPayment(mapped);
      } else {
        setPayment(null);
      }
    } catch (err) {
      showToast.error(getErrorMessage(err));
      setPayment(null);
      // Navigate back if not found or invalid id
      navigate('/dashboard/coowner/financial');
    } finally {
      setLoading(false);
    }
  };

  // Map various backend payment shapes to the UI-friendly shape used below
  const mapPayment = (p) => {
    // prefer numeric amount if provided as string
    const amt = (typeof p.amount === 'string' && p.amount !== '') ? parseFloat(p.amount) : p.amount;
    const split = p.costSplit ?? p.cost_split ?? p.split ?? null;
    const cost = split?.cost ?? null;
    const description = p.description || cost?.costName || cost?.description || split?.description || '';
    const dateRaw = p.paymentDate || split?.paidAt || p.paidAt || p.createdAt || p.updatedAt;
    const date = dateRaw ? new Date(dateRaw).toLocaleString('vi-VN') : '';

    return {
      id: p.id,
      costSplitId: p.costSplitId || p.cost_split_id || split?.id,
      amount: Number.isFinite(amt) ? amt : (split?.paidAmount ? parseFloat(split.paidAmount) : 0),
      description,
      status: p.paymentStatus || p.payment_status || p.status || split?.paymentStatus || split?.payment_status,
      method: p.paymentMethod || p.method || p.methodKey,
      methodKey: p.paymentMethod || p.methodKey,
      provider: p.providerName || p.provider || null,
      invoiceId: p.invoiceId || null,
      invoice: p.invoice || null,
      qrCodeUrl: p.qrCodeUrl || p.qrCode || null,
      date,
      paymentUrl: p.paymentUrl || null,
      transactionId: p.transactionId || null,
      raw: p,
    };
  }

  const handleDownloadInvoice = async () => {
    // Resolve invoice id robustly: prefer invoiceId, fallback to invoice if looks like GUID,
    // otherwise attempt to search invoices by invoice number (requires activeGroup)
    if (!payment) return showToast.warning('Không tìm thấy hóa đơn');

    let invoiceId = payment?.invoiceId ?? payment?.invoice;

    if (invoiceId && !isGuid(invoiceId)) {
      // If invoice field is not a GUID, prefer to search by invoice number
      invoiceId = null;
    }

    if (!invoiceId && activeGroup?.id) {
      try {
        // Attempt to look up invoice by invoice number
        const searchKey = payment?.invoice ?? '';
        if (searchKey) {
          const res = await costAPI.getInvoices(activeGroup.id, { search: searchKey });
          const payload = res?.data ?? res;
          // payload might be { invoices: [...] } or an array
          const invoices = payload?.invoices ?? payload;
          if (Array.isArray(invoices) && invoices.length > 0) {
            invoiceId = invoices[0].id ?? invoices[0].invoiceId ?? invoices[0].uuid;
          }
        }
      } catch (err) {
        console.warn('Invoice lookup failed', err);
      }
    }

    if (!invoiceId) return showToast.warning('Không tìm thấy ID hóa đơn để tải về');

    try {
      const blob = await costAPI.downloadInvoice(invoiceId);
      // costAPI.downloadInvoice returns blob
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
      // Improve error messaging for API validation errors
      const msg = getErrorMessage(err);
      showToast.error(msg || 'Tải hóa đơn thất bại. Vui lòng thử lại.');
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
        <div className="flex items-center justify-between mb-4">
          <Link to="/dashboard/coowner/financial" className="inline-flex items-center gap-2 text-sky-600">
            <ArrowLeft className="w-5 h-5" /> Quay lại
          </Link>
        </div>

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
