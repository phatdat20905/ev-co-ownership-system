import apiClient from './api/interceptors.js';

/**
 * Booking Service
 */
class BookingService {
  /**
   * Create new booking
   */
  async createBooking(bookingData) {
    return await apiClient.post('/bookings', bookingData);
  }

  /**
   * Get user bookings
   */
  async getUserBookings(params) {
    return await apiClient.get('/bookings', { params });
  }

  /**
   * Get booking statistics
   */
  async getBookingStats() {
    return await apiClient.get('/bookings/stats');
  }

  /**
   * Get booking history
   */
  async getBookingHistory(params) {
    return await apiClient.get('/bookings/history', { params });
  }

  /**
   * Get booking by ID
   */
  async getBooking(bookingId) {
    return await apiClient.get(`/bookings/${bookingId}`);
  }

  /**
   * Update booking
   */
  async updateBooking(bookingId, bookingData) {
    return await apiClient.put(`/bookings/${bookingId}`, bookingData);
  }

  /**
   * Cancel booking
   */
  async cancelBooking(bookingId) {
    return await apiClient.delete(`/bookings/${bookingId}`);
  }
}

export default new BookingService();
