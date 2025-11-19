import { create } from 'zustand';
import { contractAPI } from '../api';

export const useContractStore = create((set, get) => ({
  contracts: [],
  currentContract: null,
  loading: false,
  error: null,

  // Fetch all contracts for user
  fetchContracts: async () => {
    set({ loading: true, error: null });
    try {
      const result = await contractAPI.getUserContracts();
      if (result.success) {
        // Handle both array and object with contracts property
        const contractsData = Array.isArray(result.data) 
          ? result.data 
          : (result.data?.contracts || []);
        set({ contracts: contractsData, loading: false });
        return { success: true, message: result.message, data: contractsData };
      } else {
        set({ error: result.message, loading: false });
        return { success: false, message: result.message };
      }
    } catch (error) {
      const errorMsg = error.message || 'Lỗi tải hợp đồng';
      set({ error: errorMsg, loading: false });
      return { success: false, message: errorMsg };
    }
  },

  // Alias for compatibility
  fetchUserContracts: async () => {
    return get().fetchContracts();
  },

  // Fetch contract by ID
  fetchContractById: async (id) => {
    set({ loading: true, error: null });
    try {
      const result = await contractAPI.getContractById(id);
      if (result.success) {
        set({ currentContract: result.data, loading: false });
        return { success: true, message: result.message };
      } else {
        set({ error: result.message, loading: false });
        return { success: false, message: result.message };
      }
    } catch (error) {
      const errorMsg = error.message || 'Lỗi tải chi tiết hợp đồng';
      set({ error: errorMsg, loading: false });
      return { success: false, message: errorMsg };
    }
  },

  // Create new contract
  createContract: async (contractData) => {
    set({ loading: true, error: null });
    try {
      const result = await contractAPI.createContract(contractData);
      if (result.success) {
        set((state) => ({
          contracts: [...state.contracts, result.data],
          loading: false
        }));
        return { success: true, message: result.message };
      } else {
        set({ error: result.message, loading: false });
        return { success: false, message: result.message };
      }
    } catch (error) {
      const errorMsg = error.message || 'Lỗi tạo hợp đồng';
      set({ error: errorMsg, loading: false });
      return { success: false, message: errorMsg };
    }
  },

  // Update contract
  updateContract: async (contractId, contractData) => {
    set({ loading: true, error: null });
    try {
      const result = await contractAPI.updateContract(contractId, contractData);
      if (result.success) {
        set((state) => ({
          contracts: state.contracts.map(c =>
            c.id === contractId ? { ...c, ...result.data } : c
          ),
          currentContract: state.currentContract?.id === contractId
            ? { ...state.currentContract, ...result.data }
            : state.currentContract,
          loading: false
        }));
        return { success: true, message: result.message };
      } else {
        set({ error: result.message, loading: false });
        return { success: false, message: result.message };
      }
    } catch (error) {
      const errorMsg = error.message || 'Lỗi cập nhật hợp đồng';
      set({ error: errorMsg, loading: false });
      return { success: false, message: errorMsg };
    }
  },

  // Delete contract
  deleteContract: async (contractId) => {
    set({ loading: true, error: null });
    try {
      const result = await contractAPI.deleteContract(contractId);
      if (result.success) {
        set((state) => ({
          contracts: state.contracts.filter(c => c.id !== contractId),
          currentContract: state.currentContract?.id === contractId ? null : state.currentContract,
          loading: false
        }));
        return { success: true, message: result.message };
      } else {
        set({ error: result.message, loading: false });
        return { success: false, message: result.message };
      }
    } catch (error) {
      const errorMsg = error.message || 'Lỗi xóa hợp đồng';
      set({ error: errorMsg, loading: false });
      return { success: false, message: errorMsg };
    }
  },

  // Sign contract
  signContract: async (contractId, signatureData) => {
    set({ loading: true, error: null });
    try {
      const result = await contractAPI.signContract(contractId, signatureData);
      if (result.success) {
        set((state) => ({
          contracts: state.contracts.map(c =>
            c.id === contractId ? { ...c, status: 'signed' } : c
          ),
          currentContract: state.currentContract?.id === contractId
            ? { ...state.currentContract, status: 'signed' }
            : state.currentContract,
          loading: false
        }));
        return { success: true, message: result.message };
      } else {
        set({ error: result.message, loading: false });
        return { success: false, message: result.message };
      }
    } catch (error) {
      const errorMsg = error.message || 'Lỗi ký hợp đồng';
      set({ error: errorMsg, loading: false });
      return { success: false, message: errorMsg };
    }
  },

  // Terminate contract
  terminateContract: async (contractId) => {
    set({ loading: true, error: null });
    try {
      const result = await contractAPI.deleteContract(contractId); // Using delete for terminate
      if (result.success) {
        set((state) => ({
          contracts: state.contracts.map(c =>
            c.id === contractId ? { ...c, status: 'terminated' } : c
          ),
          currentContract: state.currentContract?.id === contractId
            ? { ...state.currentContract, status: 'terminated' }
            : state.currentContract,
          loading: false
        }));
        return { success: true, message: result.message };
      } else {
        set({ error: result.message, loading: false });
        return { success: false, message: result.message };
      }
    } catch (error) {
      const errorMsg = error.message || 'Lỗi chấm dứt hợp đồng';
      set({ error: errorMsg, loading: false });
      return { success: false, message: errorMsg };
    }
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Reset store
  reset: () => set({
    contracts: [],
    currentContract: null,
    loading: false,
    error: null,
  }),
}));

