// src/stores/useContractStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useContractStore = create(
  persist(
    (set, get) => ({
      // State
      contracts: [],
      currentContract: null,
      templates: [],
      signatures: [],
      loading: false,
      error: null,

      // Actions
      setContracts: (contracts) => set({ contracts }),
      
      setCurrentContract: (contract) => set({ currentContract: contract }),
      
      setTemplates: (templates) => set({ templates }),
      
      setSignatures: (signatures) => set({ signatures }),
      
      addContract: (contract) => set((state) => ({
        contracts: [contract, ...state.contracts]
      })),
      
      updateContract: (contractId, updates) => set((state) => ({
        contracts: state.contracts.map(c => 
          c.id === contractId ? { ...c, ...updates } : c
        ),
        currentContract: state.currentContract?.id === contractId
          ? { ...state.currentContract, ...updates }
          : state.currentContract
      })),
      
      addSignature: (signature) => set((state) => ({
        signatures: [...state.signatures, signature]
      })),
      
      setLoading: (loading) => set({ loading }),
      
      setError: (error) => set({ error }),
      
      clearError: () => set({ error: null }),
      
      reset: () => set({
        contracts: [],
        currentContract: null,
        templates: [],
        signatures: [],
        loading: false,
        error: null
      })
    }),
    {
      name: 'contract-storage',
      partialize: (state) => ({
        contracts: state.contracts,
        currentContract: state.currentContract
      })
    }
  )
);
