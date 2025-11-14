import { create } from 'zustand';
import vehicleService from '../services/vehicleService';

export const useVehicleStore = create((set, get) => ({
  // State
  vehicles: [],
  currentVehicle: null,
  isLoading: false,
  error: null,

  // Actions
  setVehicles: (vehicles) => {
    set({ vehicles, error: null });
  },

  setCurrentVehicle: (vehicle) => {
    set({ currentVehicle: vehicle, error: null });
  },

  // Fetch vehicles
  fetchVehicles: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await vehicleService.getVehicles(params);
      if (response.success && response.data) {
        set({ vehicles: response.data, isLoading: false });
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch vehicles');
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Fetch vehicle by ID
  fetchVehicle: async (vehicleId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await vehicleService.getVehicle(vehicleId);
      if (response.success && response.data) {
        set({ currentVehicle: response.data, isLoading: false });
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch vehicle');
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Create vehicle
  createVehicle: async (vehicleData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await vehicleService.createVehicle(vehicleData);
      if (response.success && response.data) {
        set((state) => ({
          vehicles: [...state.vehicles, response.data],
          isLoading: false,
        }));
        return response.data;
      }
      throw new Error(response.message || 'Failed to create vehicle');
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Update vehicle
  updateVehicle: async (vehicleId, vehicleData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await vehicleService.updateVehicle(vehicleId, vehicleData);
      if (response.success && response.data) {
        set((state) => ({
          vehicles: state.vehicles.map((v) => (v.id === vehicleId ? response.data : v)),
          currentVehicle: state.currentVehicle?.id === vehicleId ? response.data : state.currentVehicle,
          isLoading: false,
        }));
        return response.data;
      }
      throw new Error(response.message || 'Failed to update vehicle');
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Delete vehicle
  deleteVehicle: async (vehicleId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await vehicleService.deleteVehicle(vehicleId);
      if (response.success) {
        set((state) => ({
          vehicles: state.vehicles.filter((v) => v.id !== vehicleId),
          currentVehicle: state.currentVehicle?.id === vehicleId ? null : state.currentVehicle,
          isLoading: false,
        }));
        return response;
      }
      throw new Error(response.message || 'Failed to delete vehicle');
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Update vehicle status
  updateVehicleStatus: async (vehicleId, status) => {
    set({ isLoading: true, error: null });
    try {
      const response = await vehicleService.updateVehicleStatus(vehicleId, status);
      if (response.success && response.data) {
        set((state) => ({
          vehicles: state.vehicles.map((v) => (v.id === vehicleId ? { ...v, status } : v)),
          currentVehicle: state.currentVehicle?.id === vehicleId ? { ...state.currentVehicle, status } : state.currentVehicle,
          isLoading: false,
        }));
        return response.data;
      }
      throw new Error(response.message || 'Failed to update vehicle status');
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Get vehicle stats
  fetchVehicleStats: async (vehicleId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await vehicleService.getVehicleStats(vehicleId);
      if (response.success && response.data) {
        set({ isLoading: false });
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch vehicle stats');
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },
}));
