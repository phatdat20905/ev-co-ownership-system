// src/routes/index.js
import express from 'express';
import vehicleRoutes from './vehicleRoutes.js';
import maintenanceRoutes from './maintenanceRoutes.js';
import insuranceRoutes from './insuranceRoutes.js';
import chargingRoutes from './chargingRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';
import adminRoutes from './adminRoutes.js';

const router = express.Router();

router.use('/vehicles', vehicleRoutes);
router.use('/maintenance', maintenanceRoutes);
router.use('/insurance', insuranceRoutes);
router.use('/charging', chargingRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/admin', adminRoutes);

export default router;