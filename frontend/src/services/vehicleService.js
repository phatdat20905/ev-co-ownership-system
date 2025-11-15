import apiClient from './api/interceptors.js';

/**
 * Vehicle Service
 */
class VehicleService {
  /**
   * Create new vehicle
   */
  async createVehicle(vehicleData) {
    return await apiClient.post('/vehicles', vehicleData);
  }

  /**
   * Get all vehicles
   */
  async getVehicles(params) {
    return await apiClient.get('/vehicles', { params });
  }

  /**
   * Search vehicles
   */
  async searchVehicles(query) {
    return await apiClient.get('/vehicles/search', { params: { query } });
  }

  /**
   * Get vehicle by ID
   */
  async getVehicle(vehicleId) {
    return await apiClient.get(`/vehicles/${vehicleId}`);
  }

  /**
   * Update vehicle
   */
  async updateVehicle(vehicleId, vehicleData) {
    return await apiClient.put(`/vehicles/${vehicleId}`, vehicleData);
  }

  /**
   * Delete vehicle
   */
  async deleteVehicle(vehicleId) {
    return await apiClient.delete(`/vehicles/${vehicleId}`);
  }

  /**
   * Update vehicle status
   */
  async updateVehicleStatus(vehicleId, status) {
    return await apiClient.put(`/vehicles/${vehicleId}/status`, { status });
  }

  /**
   * Get vehicle statistics
   */
  async getVehicleStats(vehicleId) {
    return await apiClient.get(`/vehicles/${vehicleId}/stats`);
  }
}

export default new VehicleService();
