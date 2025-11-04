// src/routes/preferenceRoutes.js
import express from 'express';
import preferenceController from '../controllers/preferenceController.js';
import { authenticate } from '@ev-coownership/shared';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// User preferences
router.get('/:userId', preferenceController.getPreferences);
router.put('/:userId', preferenceController.updatePreferences);

// Device management
router.post('/devices/register', preferenceController.registerDevice);
router.delete('/devices/unregister', preferenceController.unregisterDevice);
router.get('/devices/:userId', preferenceController.getUserDevices);

// Bulk operations (admin only)
router.post('/bulk/update', preferenceController.bulkUpdatePreferences);

export default router;