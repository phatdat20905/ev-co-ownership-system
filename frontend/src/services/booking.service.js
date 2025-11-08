// src/services/booking.service.js
import apiClient from './api/interceptors.js';

/**
 * Booking Service
 * Handles vehicle booking and scheduling API calls
 */
class BookingService {
  /**
   * Create new booking
   * POST /bookings
   */
  async createBooking(bookingData) {
    const response = await apiClient.post('/bookings', bookingData);
    return response;
  }

  /**
   * Get user's bookings
   * GET /bookings
   */
  async getUserBookings(params = {}) {
    const response = await apiClient.get('/bookings', { params });
    return response;
  }

  /**
   * Get booking statistics
   * GET /bookings/stats
   */
  async getBookingStats() {
    const response = await apiClient.get('/bookings/stats');
    return response;
  }

  /**
   * Get booking history
   * GET /bookings/history
   */
  async getBookingHistory(params = {}) {
    const response = await apiClient.get('/bookings/history', { params });
    return response;
  }

  /**
   * Get booking by ID
   * GET /bookings/:bookingId
   */
  async getBooking(bookingId) {
    const response = await apiClient.get(`/bookings/${bookingId}`);
    return response;
  }

  /**
   * Update booking
   * PUT /bookings/:bookingId
   */
  async updateBooking(bookingId, bookingData) {
    const response = await apiClient.put(`/bookings/${bookingId}`, bookingData);
    return response;
  }

  /**
   * Cancel booking
   * DELETE /bookings/:bookingId
   */
  async cancelBooking(bookingId) {
    const response = await apiClient.delete(`/bookings/${bookingId}`);
    return response;
  }

  // ==================== CALENDAR ====================

  /**
   * Get calendar events for a vehicle
   * GET /bookings/calendar?vehicleId=:vehicleId
   */
  async getCalendarEvents(vehicleId, startDate, endDate) {
    const params = {
      vehicleId,
      startDate,
      endDate,
    };
    const response = await apiClient.get('/bookings/calendar', { params });
    return response;
  }

  /**
   * Get group calendar
   * GET /bookings/calendar/group/:groupId
   */
  async getGroupCalendar(groupId, startDate, endDate) {
    const params = { startDate, endDate };
    const response = await apiClient.get(`/bookings/calendar/group/${groupId}`, { params });
    return response;
  }

  // ==================== CHECK-IN/OUT ====================

  /**
   * Check-in for booking
   * POST /bookings/check-in-out/:bookingId/check-in
   */
  async checkIn(bookingId, checkInData) {
    const response = await apiClient.post(
      `/bookings/check-in-out/${bookingId}/check-in`,
      checkInData
    );
    return response;
  }

  /**
   * Check-out from booking
   * POST /bookings/check-in-out/:bookingId/check-out
   */
  async checkOut(bookingId, checkOutData) {
    const response = await apiClient.post(
      `/bookings/check-in-out/${bookingId}/check-out`,
      checkOutData
    );
    return response;
  }

  /**
   * Get check-in/out details
   * GET /bookings/check-in-out/:bookingId
   */
  async getCheckInOutDetails(bookingId) {
    const response = await apiClient.get(`/bookings/check-in-out/${bookingId}`);
    return response;
  }

  /**
   * Upload check-in/out photos
   * POST /bookings/check-in-out/:bookingId/upload
   */
  async uploadCheckInOutPhotos(bookingId, formData) {
    const response = await apiClient.post(
      `/bookings/check-in-out/${bookingId}/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response;
  }

  // ==================== CONFLICTS ====================

  /**
   * Check for booking conflicts
   * GET /bookings/conflicts/check
   */
  async checkConflicts(vehicleId, startTime, endTime, excludeBookingId = null) {
    const params = {
      vehicleId,
      startTime,
      endTime,
      excludeBookingId,
    };
    const response = await apiClient.get('/bookings/conflicts/check', { params });
    return response;
  }

  /**
   * Get conflicts for a group
   * GET /bookings/conflicts/group/:groupId
   */
  async getGroupConflicts(groupId) {
    const response = await apiClient.get(`/bookings/conflicts/group/${groupId}`);
    return response;
  }

  /**
   * Resolve conflict
   * POST /bookings/conflicts/:conflictId/resolve
   */
  async resolveConflict(conflictId, resolution) {
    const response = await apiClient.post(`/bookings/conflicts/${conflictId}/resolve`, {
      resolution,
    });
    return response;
  }

  // ==================== ADMIN ROUTES ====================

  /**
   * Get all bookings (admin)
   * GET /bookings/admin
   */
  async getAllBookings(params = {}) {
    const response = await apiClient.get('/bookings/admin', { params });
    return response;
  }

  /**
   * Get booking statistics (admin)
   * GET /bookings/admin/statistics
   */
  async getAdminStats(startDate, endDate) {
    const params = { startDate, endDate };
    const response = await apiClient.get('/bookings/admin/statistics', { params });
    return response;
  }

  /**
   * Update booking status (admin)
   * PUT /bookings/admin/:bookingId/status
   */
  async updateBookingStatus(bookingId, status, reason = null) {
    const response = await apiClient.put(`/bookings/admin/${bookingId}/status`, {
      status,
      reason,
    });
    return response;
  }

  /**
   * Force cancel booking (admin)
   * DELETE /bookings/admin/:bookingId/force-cancel
   */
  async forceCancel(bookingId, reason) {
    const response = await apiClient.delete(`/bookings/admin/${bookingId}/force-cancel`, {
      data: { reason },
    });
    return response;
  }
}

export default new BookingService();
