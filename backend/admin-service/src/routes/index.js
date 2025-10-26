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

// API routes
router.use('/dashboard', dashboardRoutes);
router.use('/staff', staffManagementRoutes);
router.use('/disputes', disputeRoutes);
router.use('/kyc', kycRoutes);
router.use('/system', systemRoutes);
router.use('/analytics', analyticsRoutes);

export default router;