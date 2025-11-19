import axios from './axios';

export const contractAPI = {
  // Tạo hợp đồng mới
  createContract: async (data) => {
    const response = await axios.post('/contracts', data);
    return response.data;
  },

  // Lấy hợp đồng của user
  getUserContracts: async () => {
    const response = await axios.get('/contracts/user/me');
    return response.data;
  },

  // Lấy hợp đồng theo nhóm
  getGroupContracts: async (groupId) => {
    const response = await axios.get(`/contracts/group/${groupId}`);
    return response.data;
  },

  // Lấy hợp đồng theo ID
  getContractById: async (contractId) => {
    const response = await axios.get(`/contracts/${contractId}`);
    return response.data;
  },

  // Cập nhật hợp đồng
  updateContract: async (contractId, data) => {
    const response = await axios.put(`/contracts/${contractId}`, data);
    return response.data;
  },

  // Xóa hợp đồng
  deleteContract: async (contractId) => {
    const response = await axios.delete(`/contracts/${contractId}`);
    return response.data;
  },

  // Gửi hợp đồng để ký
  sendForSignature: async (contractId) => {
    const response = await axios.post(`/contracts/${contractId}/send-for-signature`);
    return response.data;
  },

  // Download hợp đồng
  downloadContract: async (contractId) => {
    const response = await axios.get(`/contracts/${contractId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Chữ ký - Ký hợp đồng
  signContract: async (contractId, data) => {
    const response = await axios.post(`/contracts/signatures/${contractId}/sign`, data);
    return response.data;
  },

  // Chữ ký - Lấy danh sách chữ ký
  getSignatures: async (contractId) => {
    const response = await axios.get(`/contracts/signatures/${contractId}`);
    return response.data;
  },

  // Chữ ký - Xác thực chữ ký
  verifySignature: async (contractId, signatureId) => {
    const response = await axios.post(`/contracts/signatures/${contractId}/${signatureId}/verify`);
    return response.data;
  },

  // Bên tham gia - Thêm bên
  addParty: async (contractId, data) => {
    const response = await axios.post(`/contracts/parties/${contractId}`, data);
    return response.data;
  },

  // Bên tham gia - Lấy danh sách
  getParties: async (contractId) => {
    const response = await axios.get(`/contracts/parties/${contractId}`);
    return response.data;
  },

  // Bên tham gia - Cập nhật trạng thái
  updatePartyStatus: async (contractId, partyId, status) => {
    const response = await axios.put(`/contracts/parties/${contractId}/${partyId}`, { status });
    return response.data;
  },

  // Bên tham gia - Xóa
  removeParty: async (contractId, partyId) => {
    const response = await axios.delete(`/contracts/parties/${contractId}/${partyId}`);
    return response.data;
  },

  // Tài liệu - Upload
  uploadDocument: async (contractId, formData) => {
    // Let axios/browser set the correct Content-Type (including boundary) for FormData
    const response = await axios.post(`/contracts/documents/${contractId}/documents`, formData);
    return response.data;
  },

  // Tài liệu - Lấy danh sách
  getDocuments: async (contractId) => {
    const response = await axios.get(`/contracts/documents/${contractId}/documents`);
    return response.data;
  },

  // Tài liệu - Download
  downloadDocument: async (contractId, documentId) => {
    const response = await axios.get(`/contracts/documents/${contractId}/documents/${documentId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Tài liệu - Xóa
  deleteDocument: async (contractId, documentId) => {
    const response = await axios.delete(`/contracts/documents/${contractId}/documents/${documentId}`);
    return response.data;
  },

  // Sửa đổi hợp đồng - Tạo amendment
  createAmendment: async (contractId, data) => {
    const response = await axios.post(`/contracts/amendments/${contractId}/amendments`, data);
    return response.data;
  },

  // Sửa đổi hợp đồng - Lấy danh sách
  getAmendments: async (contractId) => {
    const response = await axios.get(`/contracts/amendments/${contractId}/amendments`);
    return response.data;
  },

  // Sửa đổi hợp đồng - Phê duyệt
  approveAmendment: async (contractId, amendmentId) => {
    const response = await axios.put(`/contracts/amendments/${contractId}/amendments/${amendmentId}/approve`);
    return response.data;
  },

  // Template - Lấy danh sách
  getTemplates: async () => {
    const response = await axios.get('/contracts/templates');
    return response.data;
  },

  // Template - Lấy theo ID
  getTemplateById: async (templateId) => {
    const response = await axios.get(`/contracts/templates/${templateId}`);
    return response.data;
  },
};
