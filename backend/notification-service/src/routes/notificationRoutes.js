// src/routes/notificationRoutes.js
import express from 'express';
import notificationController from '../controllers/notificationController.js';
import { authenticate, validate } from '@ev-coownership/shared';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Send notifications
router.post('/', notificationController.sendNotification);
router.post('/template', notificationController.sendTemplateNotification);

// Get user notifications
router.get('/user/:userId', notificationController.getUserNotifications);
router.get('/stats/:userId', notificationController.getNotificationStats);

// Notification actions
router.put('/:id/read', notificationController.markAsRead);
router.delete('/:id', notificationController.deleteNotification);

export default router;