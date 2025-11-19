import axios from './axios';
import { getErrorMessage } from '../utils/toast';

export const contractAPI = {
  // Tạo hợp đồng mới
  createContract: async (data) => {
    try {
      const response = await axios.post('/contracts', data);
      return { success: true, data: response.data.data, message: response.data.message || 'Tạo hợp đồng thành công' };
    } catch (error) {
      return { success: false, message: getErrorMessage(error), data: null };
    }
  },

  // Lấy hợp đồng của user
  getUserContracts: async () => {
    try {
      const response = await axios.get('/contracts/user/me');
      return { success: true, data: response.data.data, message: response.data.message };
    } catch (error) {
      return { success: false, message: getErrorMessage(error), data: null };
    }
  },

  // Lấy hợp đồng theo nhóm
  getGroupContracts: async (groupId) => {
    try {
      const response = await axios.get(`/contracts/group/${groupId}`);
      return { success: true, data: response.data.data, message: response.data.message };
    } catch (error) {
      return { success: false, message: getErrorMessage(error), data: null };
    }
  },

  // Lấy hợp đồng theo ID
  getContractById: async (contractId) => {
    try {
      const response = await axios.get(`/contracts/${contractId}`);
      return { success: true, data: response.data.data, message: response.data.message };
    } catch (error) {
      return { success: false, message: getErrorMessage(error), data: null };
    }
  },

  // Cập nhật hợp đồng
  updateContract: async (contractId, data) => {
    try {
      const response = await axios.put(`/contracts/${contractId}`, data);
      return { success: true, data: response.data.data, message: response.data.message || 'Cập nhật hợp đồng thành công' };
    } catch (error) {
      return { success: false, message: getErrorMessage(error), data: null };
    }
  },

  // Xóa hợp đồng
  deleteContract: async (contractId) => {
    try {
      const response = await axios.delete(`/contracts/${contractId}`);
      return { success: true, data: response.data.data, message: response.data.message || 'Xóa hợp đồng thành công' };
    } catch (error) {
      return { success: false, message: getErrorMessage(error), data: null };
    }
  },

  // Gửi hợp đồng để ký
  sendForSignature: async (contractId) => {
    try {
      const response = await axios.post(`/contracts/${contractId}/send-for-signature`);
      return { success: true, data: response.data.data, message: response.data.message || 'Gửi hợp đồng thành công' };
    } catch (error) {
      return { success: false, message: getErrorMessage(error), data: null };
    }
  },

  // Download hợp đồng
  downloadContract: async (contractId) => {
    try {
      const response = await axios.get(`/contracts/${contractId}/download`, {
        responseType: 'blob',
      });
      return { success: true, data: response.data, message: 'Tải hợp đồng thành công' };
    } catch (error) {
      return { success: false, message: getErrorMessage(error), data: null };
    }
  },

  // Chữ ký - Ký hợp đồng
  signContract: async (contractId, data) => {
    try {
      const response = await axios.post(`/contracts/signatures/${contractId}/sign`, data);
      return { success: true, data: response.data.data, message: response.data.message || 'Ký hợp đồng thành công' };
    } catch (error) {
      return { success: false, message: getErrorMessage(error), data: null };
    }
  },

  // Chữ ký - Lấy danh sách chữ ký
  getSignatures: async (contractId) => {
    try {
      const response = await axios.get(`/contracts/signatures/${contractId}`);
      return { success: true, data: response.data.data, message: response.data.message };
    } catch (error) {
      return { success: false, message: getErrorMessage(error), data: null };
    }
  },

  // Chữ ký - Xác thực chữ ký
  verifySignature: async (contractId, signatureId) => {
    try {
      const response = await axios.post(`/contracts/signatures/${contractId}/${signatureId}/verify`);
      return { success: true, data: response.data.data, message: response.data.message || 'Xác thực thành công' };
    } catch (error) {
      return { success: false, message: getErrorMessage(error), data: null };
    }
  },

  // Bên tham gia - Thêm bên
  addParty: async (contractId, data) => {
    try {
      const response = await axios.post(`/contracts/parties/${contractId}`, data);
      return { success: true, data: response.data.data, message: response.data.message || 'Thêm bên tham gia thành công' };
    } catch (error) {
      return { success: false, message: getErrorMessage(error), data: null };
    }
  },

  // Bên tham gia - Lấy danh sách
  getParties: async (contractId) => {
    try {
      const response = await axios.get(`/contracts/parties/${contractId}`);
      return { success: true, data: response.data.data, message: response.data.message };
    } catch (error) {
      return { success: false, message: getErrorMessage(error), data: null };
    }
  },

  // Bên tham gia - Cập nhật trạng thái
  updatePartyStatus: async (contractId, partyId, status) => {
    try {
      const response = await axios.put(`/contracts/parties/${contractId}/${partyId}`, { status });
      return { success: true, data: response.data.data, message: response.data.message || 'Cập nhật trạng thái thành công' };
    } catch (error) {
      return { success: false, message: getErrorMessage(error), data: null };
    }
  },

  // Bên tham gia - Xóa
  removeParty: async (contractId, partyId) => {
    try {
      const response = await axios.delete(`/contracts/parties/${contractId}/${partyId}`);
      return { success: true, data: response.data.data, message: response.data.message || 'Xóa bên tham gia thành công' };
    } catch (error) {
      return { success: false, message: getErrorMessage(error), data: null };
    }
  },

  // Tài liệu - Upload
  uploadDocument: async (contractId, formData) => {
    try {
      const response = await axios.post(`/contracts/documents/${contractId}/documents`, formData);
      return { success: true, data: response.data.data, message: response.data.message || 'Upload tài liệu thành công' };
    } catch (error) {
      return { success: false, message: getErrorMessage(error), data: null };
    }
  },

  // Tài liệu - Lấy danh sách
  getDocuments: async (contractId) => {
    try {
      const response = await axios.get(`/contracts/documents/${contractId}/documents`);
      return { success: true, data: response.data.data, message: response.data.message };
    } catch (error) {
      return { success: false, message: getErrorMessage(error), data: null };
    }
  },

  // Tài liệu - Download
  downloadDocument: async (contractId, documentId) => {
    try {
      const response = await axios.get(`/contracts/documents/${contractId}/documents/${documentId}/download`, {
        responseType: 'blob',
      });
      return { success: true, data: response.data, message: 'Tải tài liệu thành công' };
    } catch (error) {
      return { success: false, message: getErrorMessage(error), data: null };
    }
  },

  // Tài liệu - Xóa
  deleteDocument: async (contractId, documentId) => {
    try {
      const response = await axios.delete(`/contracts/documents/${contractId}/documents/${documentId}`);
      return { success: true, data: response.data.data, message: response.data.message || 'Xóa tài liệu thành công' };
    } catch (error) {
      return { success: false, message: getErrorMessage(error), data: null };
    }
  },

  // Sửa đổi hợp đồng - Tạo amendment
  createAmendment: async (contractId, data) => {
    try {
      const response = await axios.post(`/contracts/amendments/${contractId}/amendments`, data);
      return { success: true, data: response.data.data, message: response.data.message || 'Tạo sửa đổi thành công' };
    } catch (error) {
      return { success: false, message: getErrorMessage(error), data: null };
    }
  },

  // Sửa đổi hợp đồng - Lấy danh sách
  getAmendments: async (contractId) => {
    try {
      const response = await axios.get(`/contracts/amendments/${contractId}/amendments`);
      return { success: true, data: response.data.data, message: response.data.message };
    } catch (error) {
      return { success: false, message: getErrorMessage(error), data: null };
    }
  },

  // Sửa đổi hợp đồng - Phê duyệt
  approveAmendment: async (contractId, amendmentId) => {
    try {
      const response = await axios.put(`/contracts/amendments/${contractId}/amendments/${amendmentId}/approve`);
      return { success: true, data: response.data.data, message: response.data.message || 'Phê duyệt sửa đổi thành công' };
    } catch (error) {
      return { success: false, message: getErrorMessage(error), data: null };
    }
  },

  // Template - Lấy danh sách
  getTemplates: async () => {
    try {
      const response = await axios.get('/contracts/templates');
      return { success: true, data: response.data.data, message: response.data.message };
    } catch (error) {
      return { success: false, message: getErrorMessage(error), data: null };
    }
  },

  // Template - Lấy theo ID
  getTemplateById: async (templateId) => {
    try {
      const response = await axios.get(`/contracts/templates/${templateId}`);
      return { success: true, data: response.data.data, message: response.data.message };
    } catch (error) {
      return { success: false, message: getErrorMessage(error), data: null };
    }
  },
};
