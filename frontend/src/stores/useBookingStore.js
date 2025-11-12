// src/stores/useBookingStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useBookingStore = create(
  persist(
    (set, get) => ({
      // State
      bookings: [],
      currentBooking: null,
      calendar: [],
      conflicts: [],
      loading: false,
      error: null,

      // Actions
      setBookings: (bookings) => set({ bookings }),
      
      setCurrentBooking: (booking) => set({ currentBooking: booking }),
      
      setCalendar: (calendar) => set({ calendar }),
      
      setConflicts: (conflicts) => set({ conflicts }),
      
      addBooking: (booking) => set((state) => ({
        bookings: [booking, ...state.bookings]
      })),
      
      updateBooking: (bookingId, updates) => set((state) => ({
        bookings: state.bookings.map(b => 
          b.id === bookingId ? { ...b, ...updates } : b
        ),
        currentBooking: state.currentBooking?.id === bookingId
          ? { ...state.currentBooking, ...updates }
          : state.currentBooking
      })),
      
      removeBooking: (bookingId) => set((state) => ({
        bookings: state.bookings.filter(b => b.id !== bookingId),
        currentBooking: state.currentBooking?.id === bookingId ? null : state.currentBooking
      })),
      
      checkIn: (bookingId, checkInData) => set((state) => ({
        bookings: state.bookings.map(b =>
          b.id === bookingId ? { ...b, status: 'in_progress', checkInData } : b
        )
      })),
      
      checkOut: (bookingId, checkOutData) => set((state) => ({
        bookings: state.bookings.map(b =>
          b.id === bookingId ? { ...b, status: 'completed', checkOutData } : b
        )
      })),
      
      setLoading: (loading) => set({ loading }),
      
      setError: (error) => set({ error }),
      
      clearError: () => set({ error: null }),
      
      reset: () => set({
        bookings: [],
        currentBooking: null,
        calendar: [],
        conflicts: [],
        loading: false,
        error: null
      })
    }),
    {
      name: 'booking-storage',
      partialize: (state) => ({
        bookings: state.bookings,
        currentBooking: state.currentBooking
      })
    }
  )
);
