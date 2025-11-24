import { create } from 'zustand';
import { adminAPI } from '../api/admin';

export const useStaffStore = create((set, get) => ({
  staff: [],
  selectedStaff: null,
  loading: false,
  error: null,

  // Fetch all staff
  fetchStaff: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      // Request enriched staff list by default to avoid per-item user lookups
      const requestParams = { enriched: true, ...params };
      const response = await adminAPI.getStaffList(requestParams);

      // Normalize a few possible response shapes we see in different environments:
      // - axios returned .data already: { success, message, data: { data: [ ... ], pagination } }
      // - or older shape: { data: [ ... ] }
      // - or raw array
      let raw = response;
      // If axios wrapper returned an object with .data (common), unwrap once
      if (response && response.data && typeof response.data === 'object') {
        raw = response.data;
      }

      let staffList = [];
      if (Array.isArray(raw)) {
        staffList = raw;
      } else if (raw && Array.isArray(raw.data)) {
        staffList = raw.data;
      } else if (raw && raw.data && raw.data.data && Array.isArray(raw.data.data)) {
        staffList = raw.data.data;
      }

      // Some backends return Sequelize instances wrapped with dataValues; unwrap those
      staffList = staffList.map(s => s && s.dataValues ? { ...s.dataValues } : s);

      set({ staff: staffList, loading: false });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Lỗi tải danh sách nhân viên', 
        loading: false 
      });
    }
  },

  // Get staff by ID
  getStaffById: async (staffId) => {
    set({ loading: true, error: null });
    try {
      const response = await adminAPI.getStaffById(staffId);
      set({ 
        selectedStaff: response.data.data || response.data, 
        loading: false 
      });
      return response.data.data || response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Lỗi tải thông tin nhân viên', 
        loading: false 
      });
      throw error;
    }
  },

  // Create new staff
  createStaff: async (staffData) => {
    set({ loading: true, error: null });
    try {
      const response = await adminAPI.createStaff(staffData);

      // Normalize unwrap: adminAPI returns response.data (server payload),
      // but different environments sometimes double-wrap. Handle robustly.
      let newStaff = null;
      if (!response) newStaff = null;
      else if (response.data && response.data.data) newStaff = response.data.data;
      else if (response.data) newStaff = response.data;
      else newStaff = response;

      // If we couldn't derive a new staff object, fallback to refetching list
      if (!newStaff) {
        await get().fetchStaff();
        set({ loading: false });
        return null;
      }

      set((state) => ({
        staff: [newStaff, ...state.staff],
        loading: false
      }));

      return newStaff;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Lỗi tạo nhân viên', 
        loading: false 
      });
      throw error;
    }
  },

  // Update staff
  updateStaff: async (staffId, staffData) => {
    set({ loading: true, error: null });
    try {
      const response = await adminAPI.updateStaff(staffId, staffData);
      const updatedStaff = response.data.data || response.data;
      
      set((state) => ({
        staff: state.staff.map(s => s.id === staffId ? updatedStaff : s),
        selectedStaff: updatedStaff,
        loading: false
      }));
      
      return updatedStaff;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Lỗi cập nhật nhân viên', 
        loading: false 
      });
      throw error;
    }
  },

  // Delete staff
  deleteStaff: async (staffId) => {
    set({ loading: true, error: null });
    try {
      await adminAPI.deleteStaff(staffId);
      
      set((state) => ({
        staff: state.staff.filter(s => s.id !== staffId),
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Lỗi xóa nhân viên', 
        loading: false 
      });
      throw error;
    }
  },

  // Update staff status
  updateStaffStatus: async (staffId, status) => {
    set({ loading: true, error: null });
    try {
      const response = await adminAPI.updateStaffStatus(staffId, status);
      const updatedStaff = response.data.data || response.data;
      
      set((state) => ({
        staff: state.staff.map(s => s.id === staffId ? { ...s, status } : s),
        loading: false
      }));
      
      return updatedStaff;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Lỗi cập nhật trạng thái', 
        loading: false 
      });
      throw error;
    }
  },

  // Set selected staff
  setSelectedStaff: (staff) => set({ selectedStaff: staff }),

  // Clear error
  clearError: () => set({ error: null }),

  // Reset store
  reset: () => set({
    staff: [],
    selectedStaff: null,
    loading: false,
    error: null
  })
}));
