// src/stores/useCostStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCostStore = create(
  persist(
    (set, get) => ({
      // State
      costs: [],
      myCosts: [],
      splits: [],
      payments: [],
      wallet: null,
      loading: false,
      error: null,

      // Actions
      setCosts: (costs) => set({ costs }),
      
      setMyCosts: (myCosts) => set({ myCosts }),
      
      setSplits: (splits) => set({ splits }),
      
      setPayments: (payments) => set({ payments }),
      
      setWallet: (wallet) => set({ wallet }),
      
      addCost: (cost) => set((state) => ({
        costs: [cost, ...state.costs]
      })),
      
      updateCost: (costId, updates) => set((state) => ({
        costs: state.costs.map(c => 
          c.id === costId ? { ...c, ...updates } : c
        )
      })),
      
      addPayment: (payment) => set((state) => ({
        payments: [payment, ...state.payments]
      })),
      
      updateSplit: (splitId, updates) => set((state) => ({
        splits: state.splits.map(s =>
          s.id === splitId ? { ...s, ...updates } : s
        )
      })),
      
      updateWalletBalance: (amount) => set((state) => ({
        wallet: state.wallet ? {
          ...state.wallet,
          balance: parseFloat(state.wallet.balance) + parseFloat(amount)
        } : null
      })),
      
      setLoading: (loading) => set({ loading }),
      
      setError: (error) => set({ error }),
      
      clearError: () => set({ error: null }),
      
      reset: () => set({
        costs: [],
        myCosts: [],
        splits: [],
        payments: [],
        wallet: null,
        loading: false,
        error: null
      })
    }),
    {
      name: 'cost-storage',
      partialize: (state) => ({
        wallet: state.wallet,
        myCosts: state.myCosts
      })
    }
  )
);
