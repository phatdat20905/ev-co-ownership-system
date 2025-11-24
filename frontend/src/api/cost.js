import axios from './axios';

export const costAPI = {
  // Tạo chi phí mới
  createCost: async (data) => {
    const response = await axios.post('/costs', data);
    return response.data;
  },

  // Lấy chi phí theo nhóm
  getCostsByGroup: async (groupId, params) => {
    const response = await axios.get(`/costs/group/${groupId}`, { params });
    return response.data;
  },

  // Lấy chi phí theo ID
  getCostById: async (costId) => {
    const response = await axios.get(`/costs/${costId}`);
    return response.data;
  },

  // Cập nhật chi phí
  updateCost: async (costId, data) => {
    const response = await axios.put(`/costs/${costId}`, data);
    return response.data;
  },

  // Xóa chi phí
  deleteCost: async (costId) => {
    const response = await axios.delete(`/costs/${costId}`);
    return response.data;
  },

  // Tính toán chia chi phí
  calculateSplits: async (costId) => {
    const response = await axios.get(`/costs/${costId}/splits`);
    return response.data;
  },

  // Lấy tóm tắt chi phí
  getCostSummary: async (groupId, params) => {
    const response = await axios.get(`/costs/group/${groupId}/summary`, { params });
    return response.data;
  },

  // Lấy phân tích chi phí chi tiết (breakdown)
  getCostBreakdown: async (groupId, params) => {
    const response = await axios.get(`/costs/group/${groupId}/breakdown`, { params });
    return response.data;
  },

  // Lấy báo cáo chi phí theo năm (expense tracking)
  getExpenseTracking: async (groupId, params) => {
    const response = await axios.get(`/costs/group/${groupId}/expense-tracking`, { params });
    return response.data;
  },

  // Lấy lịch sử thanh toán cá nhân
  getPaymentHistory: async (groupId, params) => {
    const response = await axios.get(`/costs/group/${groupId}/payment-history`, { params });
    return response.data;
  },

  // Thanh toán - Tạo thanh toán
  createPayment: async (data) => {
    const response = await axios.post('/costs/payments', data);
    return response.data;
  },

  // Thanh toán - Lấy danh sách
  getPayments: async (params) => {
    const response = await axios.get('/costs/payments', { params });
    return response.data;
  },

  // Thanh toán - Xác nhận
  confirmPayment: async (paymentId) => {
    const response = await axios.put(`/costs/payments/${paymentId}/confirm`);
    return response.data;
  },

  // Ví - Lấy thông tin ví
  getWallet: async () => {
    const response = await axios.get('/costs/wallets/me');
    return response.data;
  },

  // Ví - Nạp tiền
  depositToWallet: async (amount) => {
    const response = await axios.post('/costs/wallets/deposit', { amount });
    return response.data;
  },

  // Ví - Rút tiền
  withdrawFromWallet: async (amount) => {
    const response = await axios.post('/costs/wallets/withdraw', { amount });
    return response.data;
  },

  // Ví - Lịch sử giao dịch
  getWalletTransactions: async (params) => {
    const response = await axios.get('/costs/wallets/transactions', { params });
    return response.data;
  },

  // Ví nhóm - Lấy ví nhóm
  getGroupWallet: async (groupId) => {
    const response = await axios.get(`/costs/group-wallets/${groupId}`);
    return response.data;
  },

  // Ví nhóm - Nạp tiền
  depositToGroupWallet: async (groupId, data) => {
    const response = await axios.post(`/costs/group-wallets/${groupId}/deposit`, data);
    return response.data;
  },

  // Ví nhóm - Rút tiền
  withdrawFromGroupWallet: async (groupId, data) => {
    const response = await axios.post(`/costs/group-wallets/${groupId}/withdraw`, data);
    return response.data;
  },

  // Ví nhóm - Thanh toán chi phí
  payFromGroupWallet: async (groupId, data) => {
    const response = await axios.post(`/costs/group-wallets/${groupId}/pay-cost`, data);
    return response.data;
  },

  // Ví nhóm - Lịch sử giao dịch
  getGroupWalletTransactions: async (groupId, params) => {
    const response = await axios.get(`/costs/group-wallets/${groupId}/transactions`, { params });
    return response.data;
  },

  // Hóa đơn - Tạo hóa đơn
  generateInvoice: async (data) => {
    const response = await axios.post('/costs/invoices/generate', data);
    return response.data;
  },

  // Hóa đơn - Lấy danh sách
  getInvoices: async (groupId, params) => {
    const response = await axios.get(`/costs/invoices/group/${groupId}`, { params });
    return response.data;
  },

  // Hóa đơn - Lấy theo ID
  getInvoiceById: async (invoiceId) => {
    const response = await axios.get(`/costs/invoices/${invoiceId}`);
    return response.data;
  },

  // Hóa đơn - Đánh dấu đã thanh toán
  markInvoicePaid: async (invoiceId) => {
    const response = await axios.put(`/costs/invoices/${invoiceId}/mark-paid`);
    return response.data;
  },

  // Hóa đơn - Download
  // The backend may return either a PDF blob directly or a JSON { pdfUrl } with a link to the file.
  // Handle both cases and always return a Blob.
  downloadInvoice: async (invoiceId) => {
    // First try to call the endpoint and inspect headers
    const resp = await axios.get(`/costs/invoices/${invoiceId}/download`);
    const contentType = (resp.headers && resp.headers['content-type']) || '';

    // If backend returned PDF directly (content-type application/pdf), fetch as blob
    if (contentType.includes('application/pdf')) {
      const blobResp = await axios.get(`/costs/invoices/${invoiceId}/download`, { responseType: 'blob' });
      return blobResp.data;
    }

    // Otherwise expect JSON with { pdfUrl } or { data: { pdfUrl } }
    const payload = resp?.data ?? resp;
    const pdfUrl = payload?.pdfUrl ?? payload?.data?.pdfUrl ?? null;
    if (pdfUrl) {
      const fileResp = await axios.get(pdfUrl, { responseType: 'blob' });
      return fileResp.data;
    }

    // As a fallback, if resp.data looks like a Blob already, return it
    return resp.data;
  },

  // Báo cáo - Lấy báo cáo tháng
  getMonthlyReport: async (groupId, year, month) => {
    const response = await axios.get(`/costs/reports/monthly/${groupId}/${year}/${month}`);
    return response.data;
  },

  // Báo cáo - Lấy báo cáo quý
  getQuarterlyReport: async (groupId, year, quarter) => {
    const response = await axios.get(`/costs/reports/quarterly/${groupId}/${year}/${quarter}`);
    return response.data;
  },

  // Báo cáo - Lấy báo cáo năm
  getYearlyReport: async (groupId, year) => {
    const response = await axios.get(`/costs/reports/yearly/${groupId}/${year}`);
    return response.data;
  },

  // Báo cáo - Export Excel
  exportReport: async (reportType, params) => {
    const response = await axios.get(`/costs/reports/export/${reportType}`, {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  // Export PDF - Cost Breakdown
  exportCostBreakdownPDF: async (groupId, params) => {
    const response = await axios.get(`/costs/group/${groupId}/breakdown/export/pdf`, {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  // Export Excel - Expense Tracking
  exportExpenseTrackingExcel: async (groupId, params) => {
    const response = await axios.get(`/costs/group/${groupId}/expense-tracking/export/excel`, {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  // Export PDF - Payment History
  exportPaymentHistoryPDF: async (groupId, params) => {
    const response = await axios.get(`/costs/group/${groupId}/payment-history/export/pdf`, {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  // Create immediate payment
  createPayment: async (data) => {
    const response = await axios.post('/costs/payments/create', data);
    return response.data;
  },

  // Optional: get payment provider fees from backend. Fallback handled by caller if endpoint missing.
  getPaymentFees: async (groupId) => {
    const response = await axios.get('/costs/payments/fees', { params: { groupId } });
    return response.data;
  },

  // Get user payments
  getUserPayments: async (params) => {
    const response = await axios.get('/costs/payments/user', { params });
    return response.data;
  },

  // Get payment by ID
  getPaymentById: async (paymentId) => {
    const response = await axios.get(`/costs/payments/${paymentId}`);
    return response.data;
  },

  // Schedule a payment (optional endpoint)
  schedulePayment: async (data) => {
    const response = await axios.post('/costs/payments/schedule', data);
    return response.data;
  },

  // Setup auto-payment (optional endpoint)
  setupAutoPayment: async (data) => {
    const response = await axios.post('/costs/payments/auto-setup', data);
    return response.data;
  },

  // Get payment summary for a group
  getPaymentSummary: async (groupId, params) => {
    const response = await axios.get(`/costs/payments/group/${groupId}/summary`, { params });
    return response.data;
  },
};
