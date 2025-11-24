import { create } from 'zustand';
import { bookingAPI } from '../api';

export const useBookingStore = create((set, get) => ({
  // State
  bookings: [],
  currentBooking: null,
  bookingStats: null,
  bookingHistory: [],
  calendar: [],
  availableVehicles: [],
  conflicts: [],
  isLoading: false,
  error: null,

  // Actions - Bookings
  fetchBookings: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const result = await bookingAPI.getBookings(params);
      if (result.success) {
        set({ bookings: result.data.bookings || [], isLoading: false });
        return result.data;
      } else {
        set({ error: result.message, isLoading: false });
        return null;
      }
    } catch (error) {
      set({
        error: error.message || 'Lỗi tải danh sách booking',
        isLoading: false,
      });
      return null;
    }
  },

  fetchBookingById: async (bookingId) => {
    set({ isLoading: true, error: null });
    try {
      const result = await bookingAPI.getBookingById(bookingId);
      if (result.success) {
        set({ currentBooking: result.data, isLoading: false });
        return result.data;
      } else {
        set({ error: result.message, isLoading: false });
        return null;
      }
    } catch (error) {
      set({
        error: error.message || 'Lỗi tải thông tin booking',
        isLoading: false,
      });
      return null;
    }
  },

  // Convenience wrapper: fetch bookings for current user (delegates to fetchBookings)
  fetchUserBookings: async (params = {}) => {
    // In our API, calling getBookings without filters returns the current user's bookings
    return await get().fetchBookings(params);
  },

  createBooking: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const result = await bookingAPI.createBooking(data);
      if (result.success) {
        set((state) => ({
          bookings: [...state.bookings, result.data],
          isLoading: false,
        }));
        return { success: true, data: result.data, message: result.message };
      } else {
        // Surface backend errors as rejected promises so callers (and toast.promise) can handle them
        set({ error: result.message, isLoading: false });
        throw new Error(result.message || 'Lỗi tạo booking');
      }
    } catch (error) {
      const errorMsg = error.message || 'Lỗi tạo booking';
      set({ error: errorMsg, isLoading: false });
      // Re-throw so UI code (showToast.promise and try/catch) sees the failure
      throw error;
    }
  },

  updateBooking: async (bookingId, data) => {
    set({ isLoading: true, error: null });
    try {
      const result = await bookingAPI.updateBooking(bookingId, data);
      if (result.success) {
        set((state) => ({
          bookings: state.bookings.map((b) => (b.id === bookingId ? result.data : b)),
          currentBooking: result.data,
          isLoading: false,
        }));
        return { success: true, data: result.data, message: result.message };
      } else {
        set({ error: result.message, isLoading: false });
        return { success: false, message: result.message };
      }
    } catch (error) {
      const errorMsg = error.message || 'Lỗi cập nhật booking';
      set({ error: errorMsg, isLoading: false });
      return { success: false, message: errorMsg };
    }
  },

  cancelBooking: async (bookingId) => {
    set({ isLoading: true, error: null });
    try {
      const result = await bookingAPI.cancelBooking(bookingId);
      if (result.success) {
        set((state) => ({
          bookings: state.bookings.filter((b) => b.id !== bookingId),
          currentBooking: null,
          isLoading: false,
        }));
        return { success: true, message: result.message };
      } else {
        set({ error: result.message, isLoading: false });
        return { success: false, message: result.message };
      }
    } catch (error) {
      const errorMsg = error.message || 'Lỗi hủy booking';
      set({ error: errorMsg, isLoading: false });
      return { success: false, message: errorMsg };
    }
  },

  fetchBookingStats: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const result = await bookingAPI.getBookingStats(params);
      if (result.success) {
        set({ bookingStats: result.data, isLoading: false });
        return result.data;
      } else {
        set({ error: result.message, isLoading: false });
        return null;
      }
    } catch (error) {
      set({
        error: error.message || 'Lỗi tải thống kê',
        isLoading: false,
      });
      return null;
    }
  },

  fetchBookingHistory: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const result = await bookingAPI.getBookingHistory(params);
      if (result.success) {
        set({ bookingHistory: result.data.bookings || [], isLoading: false });
        return result.data;
      } else {
        set({ error: result.message, isLoading: false });
        return null;
      }
    } catch (error) {
      set({
        error: error.message || 'Lỗi tải lịch sử booking',
        isLoading: false,
      });
      return null;
    }
  },

  // Actions - Calendar
  fetchVehicleCalendar: async (vehicleId, params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await bookingAPI.getVehicleCalendar(vehicleId, params);
      set({ calendar: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Lỗi tải lịch xe',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchGroupCalendar: async (groupId, params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await bookingAPI.getGroupCalendar(groupId, params);
      set({ calendar: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Lỗi tải lịch nhóm',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchPersonalCalendar: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await bookingAPI.getPersonalCalendar(params);
      set({ calendar: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Lỗi tải lịch cá nhân',
        isLoading: false,
      });
      throw error;
    }
  },

  checkAvailability: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await bookingAPI.checkAvailability(data);
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Lỗi kiểm tra khả dụng',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchAvailableVehicles: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await bookingAPI.getAvailableVehicles(params);
      set({ availableVehicles: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Lỗi tải danh sách xe khả dụng',
        isLoading: false,
      });
      throw error;
    }
  },

  // Actions - Check-in/out
  checkIn: async (bookingId, data) => {
    set({ isLoading: true, error: null });
    try {
      const result = await bookingAPI.checkIn(bookingId, data);
      if (result.success) {
        set((state) => ({
          bookings: state.bookings.map((b) => 
            b.id === bookingId ? { ...b, status: 'in_progress' } : b
          ),
          isLoading: false,
        }));
        return { success: true, data: result.data, message: result.message };
      } else {
        set({ error: result.message, isLoading: false });
        return { success: false, message: result.message };
      }
    } catch (error) {
      const errorMsg = error.message || 'Lỗi check-in';
      set({ error: errorMsg, isLoading: false });
      return { success: false, message: errorMsg };
    }
  },

  checkOut: async (bookingId, data) => {
    set({ isLoading: true, error: null });
    try {
      const result = await bookingAPI.checkOut(bookingId, data);
      if (result.success) {
        set((state) => ({
          bookings: state.bookings.map((b) => 
            b.id === bookingId ? { ...b, status: 'completed' } : b
          ),
          isLoading: false,
        }));
        return { success: true, data: result.data, message: result.message };
      } else {
        set({ error: result.message, isLoading: false });
        return { success: false, message: result.message };
      }
    } catch (error) {
      const errorMsg = error.message || 'Lỗi check-out';
      set({ error: errorMsg, isLoading: false });
      return { success: false, message: errorMsg };
    }
  },

  getCheckLogs: async (bookingId) => {
    set({ isLoading: true, error: null });
    try {
      const result = await bookingAPI.getCheckLogs(bookingId);
      if (result.success) {
        set({ isLoading: false });
        return result.data;
      } else {
        set({ error: result.message, isLoading: false });
        return null;
      }
    } catch (error) {
      set({
        error: error.message || 'Lỗi tải logs check-in/out',
        isLoading: false,
      });
      return null;
    }
  },

  generateQRCode: async (bookingId) => {
    set({ isLoading: true, error: null });
    try {
      const result = await bookingAPI.generateQRCode(bookingId);
      if (result.success) {
        set({ isLoading: false });
        return result.data;
      } else {
        set({ error: result.message, isLoading: false });
        return null;
      }
    } catch (error) {
      set({
        error: error.message || 'Lỗi tạo QR code',
        isLoading: false,
      });
      return null;
    }
  },

  validateQRCode: async (qrCode, secret) => {
    set({ isLoading: true, error: null });
    try {
      const result = await bookingAPI.validateQRCode(qrCode, secret);
      if (result.success) {
        set({ isLoading: false });
        return result.data;
      } else {
        set({ error: result.message, isLoading: false });
        return null;
      }
    } catch (error) {
      set({
        error: error.message || 'Lỗi xác thực QR code',
        isLoading: false,
      });
      return null;
    }
  },

  // Actions - Conflicts
  fetchConflicts: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await bookingAPI.getConflicts(params);
      set({ conflicts: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Lỗi tải danh sách tranh chấp',
        isLoading: false,
      });
      throw error;
    }
  },

  createConflict: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await bookingAPI.createConflict(data);
      set((state) => ({
        conflicts: [...state.conflicts, response.data],
        isLoading: false,
      }));
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Lỗi tạo tranh chấp',
        isLoading: false,
      });
      throw error;
    }
  },

  resolveConflict: async (conflictId, resolution) => {
    set({ isLoading: true, error: null });
    try {
      const response = await bookingAPI.resolveConflict(conflictId, resolution);
      set((state) => ({
        conflicts: state.conflicts.map((c) => (c.id === conflictId ? response.data : c)),
        isLoading: false,
      }));
      return response.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Lỗi giải quyết tranh chấp',
        isLoading: false,
      });
      throw error;
    }
  },

  // Utility
  clearError: () => set({ error: null }),
  reset: () =>
    set({
      bookings: [],
      currentBooking: null,
      bookingStats: null,
      bookingHistory: [],
      calendar: [],
      availableVehicles: [],
      conflicts: [],
      isLoading: false,
      error: null,
    }),
}));
