import { create } from 'zustand';
import costService from '../services/costService';

export const useCostStore = create((set, get) => ({
  // State
  costs: [],
  currentCost: null,
  costSummary: null,
  splits: [],
  isLoading: false,
  error: null,

  // Actions
  setCosts: (costs) => {
    set({ costs, error: null });
  },

  setCurrentCost: (cost) => {
    set({ currentCost: cost, error: null });
  },

  // Fetch costs by group
  fetchCostsByGroup: async (groupId, params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await costService.getCostsByGroup(groupId, params);
      if (response.success && response.data) {
        set({ costs: response.data, isLoading: false });
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch costs');
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Fetch cost by ID
  fetchCost: async (costId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await costService.getCost(costId);
      if (response.success && response.data) {
        set({ currentCost: response.data, isLoading: false });
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch cost');
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Create cost
  createCost: async (costData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await costService.createCost(costData);
      if (response.success && response.data) {
        set((state) => ({
          costs: [...state.costs, response.data],
          isLoading: false,
        }));
        return response.data;
      }
      throw new Error(response.message || 'Failed to create cost');
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Update cost
  updateCost: async (costId, costData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await costService.updateCost(costId, costData);
      if (response.success && response.data) {
        set((state) => ({
          costs: state.costs.map((c) => (c.id === costId ? response.data : c)),
          currentCost: state.currentCost?.id === costId ? response.data : state.currentCost,
          isLoading: false,
        }));
        return response.data;
      }
      throw new Error(response.message || 'Failed to update cost');
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Delete cost
  deleteCost: async (costId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await costService.deleteCost(costId);
      if (response.success) {
        set((state) => ({
          costs: state.costs.filter((c) => c.id !== costId),
          currentCost: state.currentCost?.id === costId ? null : state.currentCost,
          isLoading: false,
        }));
        return response;
      }
      throw new Error(response.message || 'Failed to delete cost');
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Calculate cost splits
  fetchCostSplits: async (costId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await costService.calculateSplits(costId);
      if (response.success && response.data) {
        set({ splits: response.data, isLoading: false });
        return response.data;
      }
      throw new Error(response.message || 'Failed to calculate splits');
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Fetch cost summary
  fetchCostSummary: async (groupId, params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await costService.getCostSummary(groupId, params);
      if (response.success && response.data) {
        set({ costSummary: response.data, isLoading: false });
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch cost summary');
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },
}));
