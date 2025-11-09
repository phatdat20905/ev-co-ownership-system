// src/routes/index.js
import express from 'express';
import vehicleRoutes from './vehicleRoutes.js';
import maintenanceRoutes from './maintenanceRoutes.js';
import insuranceRoutes from './insuranceRoutes.js';
import chargingRoutes from './chargingRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';
import adminRoutes from './adminRoutes.js';

const router = express.Router();

// Mount routes with /vehicles prefix
router.use('/vehicles', vehicleRoutes);
router.use('/vehicles/maintenance', maintenanceRoutes);
router.use('/vehicles/insurance', insuranceRoutes);
router.use('/vehicles/charging', chargingRoutes);
router.use('/vehicles/analytics', analyticsRoutes);
router.use('/vehicles/admin', adminRoutes);

export default router;