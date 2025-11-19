import axios from './axios';

export const userAPI = {
  // Lấy thông tin profile
  getProfile: async () => {
    const response = await axios.get('/user/profile');
    return response.data;
  },

  // Cập nhật profile
  updateProfile: async (data) => {
    const response = await axios.put('/user/profile', data);
    return response.data;
  },

  // Tạo profile (lần đầu sau khi đăng ký)
  createProfile: async (data) => {
    const response = await axios.post('/user/profile/create', data);
    return response.data;
  },

  // Upload avatar
  uploadAvatar: async (formData) => {
    const response = await axios.post('/user/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Lấy active group của user
  getActiveGroup: async () => {
    const response = await axios.get('/user/groups/active');
    return response.data;
  },

  // Lấy tất cả groups của user
  getUserGroups: async () => {
    const response = await axios.get('/user/groups');
    return response.data;
  },
};
