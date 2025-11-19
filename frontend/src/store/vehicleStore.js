import { create } from 'zustand';
import { vehicleAPI } from '../api';

export const useVehicleStore = create((set, get) => ({
  vehicles: [],
  currentVehicle: null,
  loading: false,
  error: null,

  // Fetch all vehicles
  fetchVehicles: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const result = await vehicleAPI.getVehicles(filters);
      if (result.success) {
        // Map backend data to frontend format với dữ liệu thật
        const mappedVehicles = await Promise.all(
          (result.data.vehicles || []).map(async (vehicle) => {
            // Fetch revenue từ booking-service
            const revenueResult = await vehicleAPI.getVehicleRevenue(vehicle.id);
            const totalRevenue = revenueResult.success ? revenueResult.data : 0;
            
            // Fetch co-owners từ user-service
            const coOwnersResult = await vehicleAPI.getVehicleCoOwners(vehicle.groupId);
            const coOwners = coOwnersResult.success ? coOwnersResult.data : 0;
            
            return {
              id: vehicle.id,
              name: vehicle.vehicleName,
              license: vehicle.licensePlate,
              model: vehicle.model,
              year: vehicle.year,
              battery: vehicle.specifications?.current_battery_percent || 80, // From backend
              status: vehicle.status,
              location: vehicle.specifications?.location || 'Chưa xác định', // Prefer specs.location, otherwise unknown
              coOwners: coOwners, // ✅ Dữ liệu thật từ group members
              utilization: Math.floor(Math.random() * 40 + 60), // TODO: Mock: 60-100%
              nextMaintenance: vehicle.insurancePolicies?.[0]?.endDate 
                ? new Date(vehicle.insurancePolicies[0].endDate).toLocaleDateString('vi-VN') 
                : 'Chưa có lịch',
              lastService: 'Chưa có',
              totalRevenue: totalRevenue, // ✅ Dữ liệu thật từ bookings
              image: vehicle.images?.[0] || '/api/placeholder/300/200',
              // Keep original data
              groupId: vehicle.groupId,
              brand: vehicle.brand,
              vin: vehicle.vin,
              color: vehicle.color,
              batteryCapacityKwh: parseFloat(vehicle.batteryCapacityKwh) || 0,
              currentOdometer: vehicle.currentOdometer,
              purchaseDate: vehicle.purchaseDate,
              purchasePrice: parseFloat(vehicle.purchasePrice) || 0,
              images: vehicle.images,
              specifications: vehicle.specifications,
              insurancePolicies: vehicle.insurancePolicies
            };
          })
        );
        
        set({ 
          vehicles: mappedVehicles, 
          loading: false 
        });
      } else {
        set({ error: result.message, loading: false });
      }
    } catch (error) {
      set({ error: error.message || 'Lỗi tải danh sách xe', loading: false });
    }
  },

  // Fetch vehicle by ID
  fetchVehicleById: async (id) => {
    set({ loading: true, error: null });
    try {
      const result = await vehicleAPI.getVehicleById(id);
      if (result.success) {
        const vehicle = result.data;
        
        // Fetch revenue và co-owners
        const revenueResult = await vehicleAPI.getVehicleRevenue(vehicle.id);
        const totalRevenue = revenueResult.success ? revenueResult.data : 0;
        
        const coOwnersResult = await vehicleAPI.getVehicleCoOwners(vehicle.groupId);
        const coOwners = coOwnersResult.success ? coOwnersResult.data : 0;
        
        const mappedVehicle = {
          id: vehicle.id,
          name: vehicle.vehicleName,
          license: vehicle.licensePlate,
          model: vehicle.model,
          year: vehicle.year,
          battery: vehicle.specifications?.current_battery_percent || 80,
          status: vehicle.status,
          location: vehicle.specifications?.location || 'Chưa xác định',
          coOwners: coOwners, // ✅ Dữ liệu thật
          utilization: Math.floor(Math.random() * 40 + 60),
          nextMaintenance: vehicle.insurancePolicies?.[0]?.endDate 
            ? new Date(vehicle.insurancePolicies[0].endDate).toLocaleDateString('vi-VN') 
            : 'Chưa có lịch',
          lastService: 'Chưa có',
          totalRevenue: totalRevenue, // ✅ Dữ liệu thật
          image: vehicle.images?.[0] || '/api/placeholder/300/200',
          groupId: vehicle.groupId,
          brand: vehicle.brand,
          vin: vehicle.vin,
          color: vehicle.color,
          batteryCapacityKwh: parseFloat(vehicle.batteryCapacityKwh) || 0,
          currentOdometer: vehicle.currentOdometer,
          purchaseDate: vehicle.purchaseDate,
          purchasePrice: parseFloat(vehicle.purchasePrice) || 0,
          images: vehicle.images,
          specifications: vehicle.specifications,
          insurancePolicies: vehicle.insurancePolicies
        };
        
        set({ currentVehicle: mappedVehicle, loading: false });
        return mappedVehicle;
      } else {
        set({ error: result.message, loading: false });
        return null;
      }
    } catch (error) {
      set({ error: error.message || 'Lỗi tải chi tiết xe', loading: false });
      return null;
    }
  },

  // Create vehicle (admin only)
  createVehicle: async (vehicleData) => {
    set({ loading: true, error: null });
    try {
      const result = await vehicleAPI.createVehicle(vehicleData);
      if (result.success) {
        const vehicle = result.data;
        
        // Xe mới tạo: revenue = 0, co-owners = 0 (chưa có group/booking)
        const mappedVehicle = {
          id: vehicle.id,
          name: vehicle.vehicleName,
          license: vehicle.licensePlate,
          model: vehicle.model,
          year: vehicle.year,
          battery: vehicle.specifications?.current_battery_percent || 80,
          status: vehicle.status,
          location: vehicle.specifications?.location || 'Chưa xác định',
          coOwners: 0, // Xe mới chưa có group
          utilization: 0, // Xe mới chưa có booking
          nextMaintenance: 'Chưa có lịch',
          lastService: 'Chưa có',
          totalRevenue: 0, // Xe mới chưa có booking
          image: vehicle.images?.[0] || '/api/placeholder/300/200',
          groupId: vehicle.groupId,
          brand: vehicle.brand,
          vin: vehicle.vin,
          color: vehicle.color,
          batteryCapacityKwh: parseFloat(vehicle.batteryCapacityKwh) || 0,
          currentOdometer: vehicle.currentOdometer,
          purchaseDate: vehicle.purchaseDate,
          purchasePrice: parseFloat(vehicle.purchasePrice) || 0,
          images: vehicle.images,
          specifications: vehicle.specifications,
          insurancePolicies: vehicle.insurancePolicies || []
        };
        
        set((state) => ({
          vehicles: [...state.vehicles, mappedVehicle],
          loading: false
        }));
        return { success: true, data: mappedVehicle, message: result.message };
      } else {
        set({ error: result.message, loading: false });
        return { success: false, message: result.message };
      }
    } catch (error) {
      const errorMsg = error.message || 'Lỗi tạo xe';
      set({ error: errorMsg, loading: false });
      return { success: false, message: errorMsg };
    }
  },

  // Update vehicle
  updateVehicle: async (id, vehicleData) => {
    set({ loading: true, error: null });
    try {
      const result = await vehicleAPI.updateVehicle(id, vehicleData);
      if (result.success) {
        const vehicle = result.data;
        
        // Fetch revenue và co-owners sau khi update
        const revenueResult = await vehicleAPI.getVehicleRevenue(vehicle.id);
        const totalRevenue = revenueResult.success ? revenueResult.data : 0;
        
        const coOwnersResult = await vehicleAPI.getVehicleCoOwners(vehicle.groupId);
        const coOwners = coOwnersResult.success ? coOwnersResult.data : 0;
        
        const mappedVehicle = {
          id: vehicle.id,
          name: vehicle.vehicleName,
          license: vehicle.licensePlate,
          model: vehicle.model,
          year: vehicle.year,
          battery: vehicle.specifications?.current_battery_percent || 80,
          status: vehicle.status,
          // Use the location from specifications if present, otherwise fall back to vehicle.location or unknown
          location: vehicle.specifications?.location || vehicle.location || 'Chưa xác định',
          coOwners: coOwners, // ✅ Dữ liệu thật
          utilization: Math.floor(Math.random() * 40 + 60),
          nextMaintenance: vehicle.insurancePolicies?.[0]?.endDate 
            ? new Date(vehicle.insurancePolicies[0].endDate).toLocaleDateString('vi-VN') 
            : 'Chưa có lịch',
          lastService: 'Chưa có',
          totalRevenue: totalRevenue, // ✅ Dữ liệu thật
          image: vehicle.images?.[0] || '/api/placeholder/300/200',
          groupId: vehicle.groupId,
          brand: vehicle.brand,
          vin: vehicle.vin,
          color: vehicle.color,
          batteryCapacityKwh: parseFloat(vehicle.batteryCapacityKwh) || 0,
          currentOdometer: vehicle.currentOdometer,
          purchaseDate: vehicle.purchaseDate,
          purchasePrice: parseFloat(vehicle.purchasePrice) || 0,
          images: vehicle.images,
          specifications: vehicle.specifications,
          insurancePolicies: vehicle.insurancePolicies || []
        };
        
        set((state) => ({
          vehicles: state.vehicles.map(v => v.id === id ? mappedVehicle : v),
          currentVehicle: state.currentVehicle?.id === id ? mappedVehicle : state.currentVehicle,
          loading: false
        }));
        return { success: true, data: mappedVehicle, message: result.message };
      } else {
        set({ error: result.message, loading: false });
        return { success: false, message: result.message };
      }
    } catch (error) {
      const errorMsg = error.message || 'Lỗi cập nhật xe';
      set({ error: errorMsg, loading: false });
      return { success: false, message: errorMsg };
    }
  },

  // Delete vehicle
  deleteVehicle: async (id) => {
    set({ loading: true, error: null });
    try {
      const result = await vehicleAPI.deleteVehicle(id);
      if (result.success) {
        set((state) => ({
          vehicles: state.vehicles.filter(v => v.id !== id),
          currentVehicle: state.currentVehicle?.id === id ? null : state.currentVehicle,
          loading: false
        }));
        return { success: true, message: result.message };
      } else {
        set({ error: result.message, loading: false });
        return { success: false, message: result.message };
      }
    } catch (error) {
      const errorMsg = error.message || 'Lỗi xóa xe';
      set({ error: errorMsg, loading: false });
      return { success: false, message: errorMsg };
    }
  },

  // Update vehicle status
  updateVehicleStatus: async (id, status, reason = '') => {
    set({ loading: true, error: null });
    try {
      const result = await vehicleAPI.updateVehicleStatus(id, status, reason);
      if (result.success) {
        set((state) => ({
          vehicles: state.vehicles.map(v => 
            v.id === id ? { ...v, status: result.data.status } : v
          ),
          currentVehicle: state.currentVehicle?.id === id 
            ? { ...state.currentVehicle, status: result.data.status }
            : state.currentVehicle,
          loading: false
        }));
        return { success: true, message: result.message };
      } else {
        set({ error: result.message, loading: false });
        return { success: false, message: result.message };
      }
    } catch (error) {
      const errorMsg = error.message || 'Lỗi cập nhật trạng thái';
      set({ error: errorMsg, loading: false });
      return { success: false, message: errorMsg };
    }
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Reset store
  reset: () => set({
    vehicles: [],
    currentVehicle: null,
    loading: false,
    error: null
  })
}));
