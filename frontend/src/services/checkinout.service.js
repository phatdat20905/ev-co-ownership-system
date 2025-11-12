// src/services/checkinout.service.js
import apiClient from './api/interceptors.js';

class CheckInOutService {
  /**
   * Check in for a booking
   */
  async checkIn(bookingId, checkInData) {
    const formData = new FormData();
    formData.append('odometerReading', checkInData.odometerReading);
    formData.append('fuelLevel', checkInData.fuelLevel);
    formData.append('notes', checkInData.notes || '');
    
    // Add images if provided
    if (checkInData.images && checkInData.images.length > 0) {
      checkInData.images.forEach((image, index) => {
        formData.append('images', image);
      });
    }

    const response = await apiClient.post(`/bookings/${bookingId}/check-in`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    return response;
  }

  /**
   * Check out for a booking
   */
  async checkOut(bookingId, checkOutData) {
    const formData = new FormData();
    formData.append('odometerReading', checkOutData.odometerReading);
    formData.append('fuelLevel', checkOutData.fuelLevel);
    formData.append('notes', checkOutData.notes || '');
    formData.append('damages', JSON.stringify(checkOutData.damages || []));
    
    // Add images if provided
    if (checkOutData.images && checkOutData.images.length > 0) {
      checkOutData.images.forEach((image, index) => {
        formData.append('images', image);
      });
    }

    const response = await apiClient.post(`/bookings/${bookingId}/check-out`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    return response;
  }

  /**
   * Get check-in/check-out logs for a booking
   */
  async getLogs(bookingId) {
    const response = await apiClient.get(`/bookings/${bookingId}/check-in-out-logs`);
    return response;
  }

  /**
   * Get QR code for check-in
   */
  async getQRCode(bookingId) {
    const response = await apiClient.get(`/bookings/${bookingId}/qr-code`);
    return response;
  }

  /**
   * Verify QR code
   */
  async verifyQRCode(qrCode) {
    const response = await apiClient.post('/bookings/verify-qr', { qrCode });
    return response;
  }

  /**
   * Add digital signature
   */
  async addSignature(logId, signatureData) {
    const response = await apiClient.post(`/bookings/check-in-out-logs/${logId}/signature`, {
      signature: signatureData
    });
    return response;
  }

  /**
   * Report damage
   */
  async reportDamage(bookingId, damageData) {
    const formData = new FormData();
    formData.append('description', damageData.description);
    formData.append('severity', damageData.severity);
    formData.append('location', damageData.location);
    
    if (damageData.photos && damageData.photos.length > 0) {
      damageData.photos.forEach((photo) => {
        formData.append('photos', photo);
      });
    }

    const response = await apiClient.post(`/bookings/${bookingId}/damage-report`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    return response;
  }

  /**
   * Get vehicle condition at check-in
   */
  async getCheckInCondition(bookingId) {
    const response = await apiClient.get(`/bookings/${bookingId}/check-in-condition`);
    return response;
  }

  /**
   * Get vehicle condition at check-out
   */
  async getCheckOutCondition(bookingId) {
    const response = await apiClient.get(`/bookings/${bookingId}/check-out-condition`);
    return response;
  }
}

export default new CheckInOutService();
