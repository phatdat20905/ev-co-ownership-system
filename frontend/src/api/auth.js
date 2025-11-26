import axios from './axios';

export const authAPI = {
  // Đăng ký
  register: async (data) => {
    const response = await axios.post('/auth/register', data);
    return response.data;
  },

  // Đăng nhập
  login: async (credentials) => {
    const response = await axios.post('/auth/login', credentials);
    return response.data;
  },

  // Làm mới token
  refreshToken: async (refreshToken) => {
    const response = await axios.post('/auth/refresh-token', { refreshToken });
    return response.data;
  },

  // Đăng xuất
  logout: async () => {
    // Send refreshToken so backend can revoke it. Use localStorage as the source of truth here.
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await axios.post('/auth/logout', { refreshToken });
    return response.data;
  },

  // Quên mật khẩu
  forgotPassword: async (email) => {
    const response = await axios.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Đặt lại mật khẩu
  resetPassword: async (token, newPassword) => {
    const response = await axios.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },

  // Xác thực email
  verifyEmail: async (token) => {
    const response = await axios.post('/auth/verify-email', { token });
    return response.data;
  },

  // Gửi email xác thực
  sendVerificationEmail: async () => {
    const response = await axios.post('/auth/send-verification-email');
    return response.data;
  },

  // Đổi mật khẩu
  changePassword: async (oldPassword, newPassword) => {
    const response = await axios.post('/auth/change-password', { oldPassword, newPassword });
    return response.data;
  },

  // Lấy thông tin profile
  getProfile: async () => {
    const response = await axios.get('/auth/profile');
    return response.data;
  },

  // Cập nhật profile (email, phone)
  updateProfile: async (data) => {
    const response = await axios.put('/auth/profile', data);
    return response.data;
  },

  // KYC - Submit documents (CCCD + GPLX together)
  submitKYC: async (formData) => {
    const response = await axios.post('/auth/kyc/submit', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // KYC - Upload CCCD (deprecated - use submitKYC instead)
  uploadCCCD: async (formData) => {
    const response = await axios.post('/auth/kyc/cccd', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // KYC - Upload GPLX (deprecated - use submitKYC instead)
  uploadGPLX: async (formData) => {
    const response = await axios.post('/auth/kyc/gplx', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // KYC - Xác thực OCR (deprecated)
  verifyKYC: async () => {
    const response = await axios.post('/auth/kyc/verify');
    return response.data;
  },

  // KYC - Lấy trạng thái KYC
  getKYCStatus: async () => {
    const response = await axios.get('/auth/kyc/status');
    return response.data;
  },
};
