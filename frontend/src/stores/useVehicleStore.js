// src/stores/useVehicleStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useVehicleStore = create(
  persist(
    (set, get) => ({
      // State
      vehicles: [],
      currentVehicle: null,
      maintenanceHistory: [],
      chargingSessions: [],
      insurance: null,
      loading: false,
      error: null,

      // Actions
      setVehicles: (vehicles) => set({ vehicles }),
      
      setCurrentVehicle: (vehicle) => set({ currentVehicle: vehicle }),
      
      setMaintenanceHistory: (history) => set({ maintenanceHistory: history }),
      
      setChargingSessions: (sessions) => set({ chargingSessions: sessions }),
      
      setInsurance: (insurance) => set({ insurance }),
      
      addVehicle: (vehicle) => set((state) => ({
        vehicles: [...state.vehicles, vehicle]
      })),
      
      updateVehicle: (vehicleId, updates) => set((state) => ({
        vehicles: state.vehicles.map(v => 
          v.id === vehicleId ? { ...v, ...updates } : v
        ),
        currentVehicle: state.currentVehicle?.id === vehicleId
          ? { ...state.currentVehicle, ...updates }
          : state.currentVehicle
      })),
      
      addMaintenance: (record) => set((state) => ({
        maintenanceHistory: [record, ...state.maintenanceHistory]
      })),
      
      addChargingSession: (session) => set((state) => ({
        chargingSessions: [session, ...state.chargingSessions]
      })),
      
      setLoading: (loading) => set({ loading }),
      
      setError: (error) => set({ error }),
      
      clearError: () => set({ error: null }),
      
      reset: () => set({
        vehicles: [],
        currentVehicle: null,
        maintenanceHistory: [],
        chargingSessions: [],
        insurance: null,
        loading: false,
        error: null
      })
    }),
    {
      name: 'vehicle-storage',
      partialize: (state) => ({
        vehicles: state.vehicles,
        currentVehicle: state.currentVehicle
      })
    }
  )
);
