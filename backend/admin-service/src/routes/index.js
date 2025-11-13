// src/routes/index.js
import express from 'express';
import dashboardRoutes from './dashboardRoutes.js';
import staffManagementRoutes from './staffManagementRoutes.js';
import disputeRoutes from './disputeRoutes.js';
import kycRoutes from './kycRoutes.js';
import systemRoutes from './systemRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';

const router = express.Router();

// Health check route (public)
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Admin Service is healthy',
    timestamp: new Date().toISOString(),
    service: 'admin-service'
  });
});

// Mount routes with /admin prefix
router.use('/admin/dashboard', dashboardRoutes);
router.use('/admin/staff', staffManagementRoutes);
router.use('/admin/disputes', disputeRoutes);
router.use('/admin/kyc', kycRoutes);
router.use('/admin/system', systemRoutes);
router.use('/admin/analytics', analyticsRoutes);

export default router;