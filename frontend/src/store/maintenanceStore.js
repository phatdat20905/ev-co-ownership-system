import { create } from 'zustand';
import { maintenanceAPI } from '../api';

export const useMaintenanceStore = create((set, get) => ({
  schedules: [],
  currentSchedule: null,
  history: [],
  loading: false,
  error: null,

  // Fetch all schedules (for admin/staff)
  fetchAllSchedules: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const result = await maintenanceAPI.getAllSchedules(params);
      if (result.success) {
        set({ 
          schedules: result.data.schedules || result.data || [], 
          loading: false 
        });
        return result.data;
      } else {
        set({ error: result.message, loading: false });
        return null;
      }
    } catch (error) {
      set({ 
        error: error.message || 'Lỗi tải danh sách bảo trì', 
        loading: false 
      });
      return null;
    }
  },

  // Fetch schedules by vehicle
  fetchSchedulesByVehicle: async (vehicleId, params = {}) => {
    set({ loading: true, error: null });
    try {
      const result = await maintenanceAPI.getSchedules(vehicleId, params);
      if (result.success) {
        set({ 
          schedules: result.data.schedules || result.data || [], 
          loading: false 
        });
        return result.data;
      } else {
        set({ error: result.message, loading: false });
        return null;
      }
    } catch (error) {
      set({ 
        error: error.message || 'Lỗi tải danh sách bảo trì', 
        loading: false 
      });
      return null;
    }
  },

  // Fetch schedule by ID
  fetchScheduleById: async (scheduleId) => {
    set({ loading: true, error: null });
    try {
      const result = await maintenanceAPI.getScheduleById(scheduleId);
      if (result.success) {
        set({ currentSchedule: result.data, loading: false });
        return result.data;
      } else {
        set({ error: result.message, loading: false });
        return null;
      }
    } catch (error) {
      set({ 
        error: error.message || 'Lỗi tải chi tiết bảo trì', 
        loading: false 
      });
      return null;
    }
  },

  // Create schedule
  createSchedule: async (vehicleId, data) => {
    set({ loading: true, error: null });
    try {
      const result = await maintenanceAPI.createSchedule(vehicleId, data);
      if (result.success) {
        set((state) => ({
          schedules: [...state.schedules, result.data],
          loading: false,
        }));
        return { success: true, data: result.data, message: result.message };
      } else {
        set({ error: result.message, loading: false });
        return { success: false, message: result.message };
      }
    } catch (error) {
      const errorMsg = error.message || 'Lỗi tạo lịch bảo trì';
      set({ error: errorMsg, loading: false });
      return { success: false, message: errorMsg };
    }
  },

  // Update schedule
  updateSchedule: async (scheduleId, data) => {
    set({ loading: true, error: null });
    try {
      const result = await maintenanceAPI.updateSchedule(scheduleId, data);
      if (result.success) {
        set((state) => ({
          schedules: state.schedules.map((s) =>
            s.id === scheduleId ? result.data : s
          ),
          currentSchedule:
            state.currentSchedule?.id === scheduleId
              ? result.data
              : state.currentSchedule,
          loading: false,
        }));
        return { success: true, data: result.data, message: result.message };
      } else {
        set({ error: result.message, loading: false });
        return { success: false, message: result.message };
      }
    } catch (error) {
      const errorMsg = error.message || 'Lỗi cập nhật lịch bảo trì';
      set({ error: errorMsg, loading: false });
      return { success: false, message: errorMsg };
    }
  },

  // Delete schedule
  deleteSchedule: async (scheduleId) => {
    set({ loading: true, error: null });
    try {
      const result = await maintenanceAPI.deleteSchedule(scheduleId);
      if (result.success) {
        set((state) => ({
          schedules: state.schedules.filter((s) => s.id !== scheduleId),
          currentSchedule:
            state.currentSchedule?.id === scheduleId
              ? null
              : state.currentSchedule,
          loading: false,
        }));
        return { success: true, message: result.message };
      } else {
        set({ error: result.message, loading: false });
        return { success: false, message: result.message };
      }
    } catch (error) {
      const errorMsg = error.message || 'Lỗi xóa lịch bảo trì';
      set({ error: errorMsg, loading: false });
      return { success: false, message: errorMsg };
    }
  },

  // Complete maintenance
  completeMaintenance: async (scheduleId, data) => {
    set({ loading: true, error: null });
    try {
      const result = await maintenanceAPI.completeMaintenance(scheduleId, data);
      if (result.success) {
        set((state) => ({
          schedules: state.schedules.map((s) =>
            s.id === scheduleId ? { ...s, status: 'completed' } : s
          ),
          loading: false,
        }));
        return { success: true, data: result.data, message: result.message };
      } else {
        set({ error: result.message, loading: false });
        return { success: false, message: result.message };
      }
    } catch (error) {
      const errorMsg = error.message || 'Lỗi hoàn thành bảo trì';
      set({ error: errorMsg, loading: false });
      return { success: false, message: errorMsg };
    }
  },

  // Fetch history
  fetchHistory: async (vehicleId, params = {}) => {
    set({ loading: true, error: null });
    try {
      const result = await maintenanceAPI.getHistory(vehicleId, params);
      if (result.success) {
        set({ 
          history: result.data.history || result.data || [], 
          loading: false 
        });
        return result.data;
      } else {
        set({ error: result.message, loading: false });
        return null;
      }
    } catch (error) {
      set({ 
        error: error.message || 'Lỗi tải lịch sử bảo trì', 
        loading: false 
      });
      return null;
    }
  },

  // Create history
  createHistory: async (vehicleId, data) => {
    set({ loading: true, error: null });
    try {
      const result = await maintenanceAPI.createHistory(vehicleId, data);
      if (result.success) {
        set((state) => ({
          history: [...state.history, result.data],
          loading: false,
        }));
        return { success: true, data: result.data, message: result.message };
      } else {
        set({ error: result.message, loading: false });
        return { success: false, message: result.message };
      }
    } catch (error) {
      const errorMsg = error.message || 'Lỗi tạo lịch sử bảo trì';
      set({ error: errorMsg, loading: false });
      return { success: false, message: errorMsg };
    }
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Reset store
  reset: () =>
    set({
      schedules: [],
      currentSchedule: null,
      history: [],
      loading: false,
      error: null,
    }),
}));
