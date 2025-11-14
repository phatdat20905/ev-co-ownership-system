import { create } from 'zustand';
import contractService from '../services/contractService';

export const useContractStore = create((set, get) => ({
  // State
  contracts: [],
  currentContract: null,
  isLoading: false,
  error: null,

  // Actions
  setContracts: (contracts) => {
    set({ contracts, error: null });
  },

  setCurrentContract: (contract) => {
    set({ currentContract: contract, error: null });
  },

  // Fetch user contracts
  fetchUserContracts: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await contractService.getUserContracts();
      if (response.success && response.data) {
        set({ contracts: response.data, isLoading: false });
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch contracts');
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Fetch contracts by group
  fetchContractsByGroup: async (groupId, params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await contractService.getContractsByGroup(groupId, params);
      if (response.success && response.data) {
        set({ contracts: response.data, isLoading: false });
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch contracts');
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Fetch contract by ID
  fetchContract: async (contractId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await contractService.getContract(contractId);
      if (response.success && response.data) {
        set({ currentContract: response.data, isLoading: false });
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch contract');
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Create contract
  createContract: async (contractData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await contractService.createContract(contractData);
      if (response.success && response.data) {
        set((state) => ({
          contracts: [...state.contracts, response.data],
          isLoading: false,
        }));
        return response.data;
      }
      throw new Error(response.message || 'Failed to create contract');
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Update contract
  updateContract: async (contractId, contractData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await contractService.updateContract(contractId, contractData);
      if (response.success && response.data) {
        set((state) => ({
          contracts: state.contracts.map((c) => (c.id === contractId ? response.data : c)),
          currentContract: state.currentContract?.id === contractId ? response.data : state.currentContract,
          isLoading: false,
        }));
        return response.data;
      }
      throw new Error(response.message || 'Failed to update contract');
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Delete contract
  deleteContract: async (contractId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await contractService.deleteContract(contractId);
      if (response.success) {
        set((state) => ({
          contracts: state.contracts.filter((c) => c.id !== contractId),
          currentContract: state.currentContract?.id === contractId ? null : state.currentContract,
          isLoading: false,
        }));
        return response;
      }
      throw new Error(response.message || 'Failed to delete contract');
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Send contract for signature
  sendForSignature: async (contractId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await contractService.sendForSignature(contractId);
      if (response.success) {
        set({ isLoading: false });
        return response;
      }
      throw new Error(response.message || 'Failed to send contract for signature');
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Download contract PDF
  downloadContractPDF: async (contractId) => {
    set({ isLoading: true, error: null });
    try {
      const blob = await contractService.downloadContractPDF(contractId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `contract-${contractId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },
}));
