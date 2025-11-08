// src/services/vehicle.service.js
import apiClient from './api/interceptors.js';

/**
 * Vehicle Service
 * Handles vehicle management, maintenance, insurance, and charging API calls
 */
class VehicleService {
  // ==================== VEHICLE MANAGEMENT ====================

  /**
   * Create new vehicle
   * POST /vehicles
   */
  async createVehicle(vehicleData) {
    const response = await apiClient.post('/vehicles', vehicleData);
    return response;
  }

  /**
   * Get all vehicles
   * GET /vehicles
   */
  async getVehicles(params = {}) {
    const response = await apiClient.get('/vehicles', { params });
    return response;
  }

  /**
   * Search vehicles
   * GET /vehicles/search
   */
  async searchVehicles(searchParams) {
    const response = await apiClient.get('/vehicles/search', { params: searchParams });
    return response;
  }

  /**
   * Get vehicle by ID
   * GET /vehicles/:vehicleId
   */
  async getVehicle(vehicleId) {
    const response = await apiClient.get(`/vehicles/${vehicleId}`);
    return response;
  }

  /**
   * Update vehicle
   * PUT /vehicles/:vehicleId
   */
  async updateVehicle(vehicleId, vehicleData) {
    const response = await apiClient.put(`/vehicles/${vehicleId}`, vehicleData);
    return response;
  }

  /**
   * Delete vehicle
   * DELETE /vehicles/:vehicleId
   */
  async deleteVehicle(vehicleId) {
    const response = await apiClient.delete(`/vehicles/${vehicleId}`);
    return response;
  }

  /**
   * Update vehicle status
   * PUT /vehicles/:vehicleId/status
   */
  async updateVehicleStatus(vehicleId, status, reason = null) {
    const response = await apiClient.put(`/vehicles/${vehicleId}/status`, {
      status,
      reason,
    });
    return response;
  }

  /**
   * Get vehicle statistics
   * GET /vehicles/:vehicleId/stats
   */
  async getVehicleStats(vehicleId, startDate = null, endDate = null) {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await apiClient.get(`/vehicles/${vehicleId}/stats`, { params });
    return response;
  }

  // ==================== MAINTENANCE ====================

  /**
   * Get maintenance records
   * GET /vehicles/maintenance
   */
  async getMaintenanceRecords(vehicleId = null, params = {}) {
    if (vehicleId) {
      params.vehicleId = vehicleId;
    }
    const response = await apiClient.get('/vehicles/maintenance', { params });
    return response;
  }

  /**
   * Create maintenance record
   * POST /vehicles/maintenance
   */
  async createMaintenanceRecord(maintenanceData) {
    const response = await apiClient.post('/vehicles/maintenance', maintenanceData);
    return response;
  }

  /**
   * Get maintenance record by ID
   * GET /vehicles/maintenance/:maintenanceId
   */
  async getMaintenanceRecord(maintenanceId) {
    const response = await apiClient.get(`/vehicles/maintenance/${maintenanceId}`);
    return response;
  }

  /**
   * Update maintenance record
   * PUT /vehicles/maintenance/:maintenanceId
   */
  async updateMaintenanceRecord(maintenanceId, maintenanceData) {
    const response = await apiClient.put(`/vehicles/maintenance/${maintenanceId}`, maintenanceData);
    return response;
  }

  /**
   * Complete maintenance
   * POST /vehicles/maintenance/:maintenanceId/complete
   */
  async completeMaintenance(maintenanceId, completionData) {
    const response = await apiClient.post(
      `/vehicles/maintenance/${maintenanceId}/complete`,
      completionData
    );
    return response;
  }

  /**
   * Get maintenance schedule
   * GET /vehicles/maintenance/schedule/:vehicleId
   */
  async getMaintenanceSchedule(vehicleId) {
    const response = await apiClient.get(`/vehicles/maintenance/schedule/${vehicleId}`);
    return response;
  }

  // ==================== INSURANCE ====================

  /**
   * Get insurance policies
   * GET /vehicles/insurance
   */
  async getInsurancePolicies(vehicleId = null, params = {}) {
    if (vehicleId) {
      params.vehicleId = vehicleId;
    }
    const response = await apiClient.get('/vehicles/insurance', { params });
    return response;
  }

  /**
   * Create insurance policy
   * POST /vehicles/insurance
   */
  async createInsurancePolicy(insuranceData) {
    const response = await apiClient.post('/vehicles/insurance', insuranceData);
    return response;
  }

  /**
   * Get insurance policy by ID
   * GET /vehicles/insurance/:policyId
   */
  async getInsurancePolicy(policyId) {
    const response = await apiClient.get(`/vehicles/insurance/${policyId}`);
    return response;
  }

  /**
   * Update insurance policy
   * PUT /vehicles/insurance/:policyId
   */
  async updateInsurancePolicy(policyId, insuranceData) {
    const response = await apiClient.put(`/vehicles/insurance/${policyId}`, insuranceData);
    return response;
  }

  /**
   * Renew insurance policy
   * POST /vehicles/insurance/:policyId/renew
   */
  async renewInsurancePolicy(policyId, renewalData) {
    const response = await apiClient.post(`/vehicles/insurance/${policyId}/renew`, renewalData);
    return response;
  }

  /**
   * File insurance claim
   * POST /vehicles/insurance/:policyId/claim
   */
  async fileInsuranceClaim(policyId, claimData) {
    const response = await apiClient.post(`/vehicles/insurance/${policyId}/claim`, claimData);
    return response;
  }

  // ==================== CHARGING ====================

  /**
   * Get charging sessions
   * GET /vehicles/charging
   */
  async getChargingSessions(vehicleId = null, params = {}) {
    if (vehicleId) {
      params.vehicleId = vehicleId;
    }
    const response = await apiClient.get('/vehicles/charging', { params });
    return response;
  }

  /**
   * Create charging session
   * POST /vehicles/charging
   */
  async createChargingSession(chargingData) {
    const response = await apiClient.post('/vehicles/charging', chargingData);
    return response;
  }

  /**
   * Get charging session by ID
   * GET /vehicles/charging/:sessionId
   */
  async getChargingSession(sessionId) {
    const response = await apiClient.get(`/vehicles/charging/${sessionId}`);
    return response;
  }

  /**
   * Complete charging session
   * POST /vehicles/charging/:sessionId/complete
   */
  async completeChargingSession(sessionId, completionData) {
    const response = await apiClient.post(
      `/vehicles/charging/${sessionId}/complete`,
      completionData
    );
    return response;
  }

  /**
   * Get charging statistics
   * GET /vehicles/charging/stats/:vehicleId
   */
  async getChargingStats(vehicleId, startDate = null, endDate = null) {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await apiClient.get(`/vehicles/charging/stats/${vehicleId}`, { params });
    return response;
  }

  // ==================== ANALYTICS ====================

  /**
   * Get vehicle usage analytics
   * GET /vehicles/analytics/usage/:vehicleId
   */
  async getUsageAnalytics(vehicleId, startDate, endDate) {
    const params = { startDate, endDate };
    const response = await apiClient.get(`/vehicles/analytics/usage/${vehicleId}`, { params });
    return response;
  }

  /**
   * Get cost analytics
   * GET /vehicles/analytics/cost/:vehicleId
   */
  async getCostAnalytics(vehicleId, startDate, endDate) {
    const params = { startDate, endDate };
    const response = await apiClient.get(`/vehicles/analytics/cost/${vehicleId}`, { params });
    return response;
  }

  /**
   * Get group analytics
   * GET /vehicles/analytics/group/:groupId
   */
  async getGroupAnalytics(groupId, startDate, endDate) {
    const params = { startDate, endDate };
    const response = await apiClient.get(`/vehicles/analytics/group/${groupId}`, { params });
    return response;
  }

  // ==================== ADMIN ROUTES ====================

  /**
   * Get all vehicles (admin)
   * GET /vehicles/admin
   */
  async getAllVehicles(params = {}) {
    const response = await apiClient.get('/vehicles/admin', { params });
    return response;
  }

  /**
   * Get vehicle statistics (admin)
   * GET /vehicles/admin/statistics
   */
  async getAdminVehicleStats() {
    const response = await apiClient.get('/vehicles/admin/statistics');
    return response;
  }

  /**
   * Approve vehicle registration (admin)
   * POST /vehicles/admin/:vehicleId/approve
   */
  async approveVehicle(vehicleId) {
    const response = await apiClient.post(`/vehicles/admin/${vehicleId}/approve`);
    return response;
  }

  /**
   * Reject vehicle registration (admin)
   * POST /vehicles/admin/:vehicleId/reject
   */
  async rejectVehicle(vehicleId, reason) {
    const response = await apiClient.post(`/vehicles/admin/${vehicleId}/reject`, { reason });
    return response;
  }
}

export default new VehicleService();
