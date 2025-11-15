// Minimal check-in/out service
import apiClient from './api/interceptors.js';

const CheckInOutService = {
  async verifyQRCode(code) {
    try {
      return await apiClient.post('/checkin/verify', { code });
    } catch (err) {
      console.warn('checkinoutService.verifyQRCode failed', err);
      throw err;
    }
  },
  async checkIn(bookingId, payload) {
    try {
      return await apiClient.post(`/checkin/${bookingId}/in`, payload);
    } catch (err) {
      console.warn('checkinoutService.checkIn failed', err);
      throw err;
    }
  },
  async checkOut(bookingId, payload) {
    try {
      return await apiClient.post(`/checkin/${bookingId}/out`, payload);
    } catch (err) {
      console.warn('checkinoutService.checkOut failed', err);
      throw err;
    }
  }
};

export default CheckInOutService;
