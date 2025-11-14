import { create } from 'zustand';
import bookingService from '../services/bookingService';

export const useBookingStore = create((set, get) => ({
  // State
  bookings: [],
  currentBooking: null,
  bookingStats: null,
  isLoading: false,
  error: null,

  // Actions
  setBookings: (bookings) => {
    set({ bookings, error: null });
  },

  setCurrentBooking: (booking) => {
    set({ currentBooking: booking, error: null });
  },

  // Fetch user bookings
  fetchUserBookings: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await bookingService.getUserBookings(params);
      if (response.success && response.data) {
        set({ bookings: response.data, isLoading: false });
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch bookings');
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Fetch booking by ID
  fetchBooking: async (bookingId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await bookingService.getBooking(bookingId);
      if (response.success && response.data) {
        set({ currentBooking: response.data, isLoading: false });
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch booking');
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Create booking
  createBooking: async (bookingData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await bookingService.createBooking(bookingData);
      if (response.success && response.data) {
        set((state) => ({
          bookings: [...state.bookings, response.data],
          isLoading: false,
        }));
        return response.data;
      }
      throw new Error(response.message || 'Failed to create booking');
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Update booking
  updateBooking: async (bookingId, bookingData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await bookingService.updateBooking(bookingId, bookingData);
      if (response.success && response.data) {
        set((state) => ({
          bookings: state.bookings.map((b) => (b.id === bookingId ? response.data : b)),
          currentBooking: state.currentBooking?.id === bookingId ? response.data : state.currentBooking,
          isLoading: false,
        }));
        return response.data;
      }
      throw new Error(response.message || 'Failed to update booking');
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Cancel booking
  cancelBooking: async (bookingId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await bookingService.cancelBooking(bookingId);
      if (response.success) {
        set((state) => ({
          bookings: state.bookings.filter((b) => b.id !== bookingId),
          currentBooking: state.currentBooking?.id === bookingId ? null : state.currentBooking,
          isLoading: false,
        }));
        return response;
      }
      throw new Error(response.message || 'Failed to cancel booking');
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Fetch booking stats
  fetchBookingStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await bookingService.getBookingStats();
      if (response.success && response.data) {
        set({ bookingStats: response.data, isLoading: false });
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch booking stats');
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Fetch booking history
  fetchBookingHistory: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await bookingService.getBookingHistory(params);
      if (response.success && response.data) {
        set({ isLoading: false });
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch booking history');
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },
}));
