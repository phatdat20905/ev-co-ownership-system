// src/routes/notificationRoutes.js
import express from 'express';
import notificationController from '../controllers/notificationController.js';
import { authenticate, validate } from '@ev-coownership/shared';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// ========== FCM Token Management ==========
router.post('/register-token', notificationController.registerToken);
router.delete('/token/:token', notificationController.removeToken);
router.get('/tokens/:userId', notificationController.getUserTokens);

// ========== Push Notifications ==========
router.post('/send', notificationController.sendPushNotification);
router.post('/topic/send', notificationController.sendTopicNotification);
router.post('/topic/subscribe', notificationController.subscribeToTopic);
router.post('/topic/unsubscribe', notificationController.unsubscribeFromTopic);

// ========== General Notifications ==========
router.post('/', notificationController.sendNotification);
router.post('/bulk', notificationController.sendBulkNotification); // Bulk send for groups
router.post('/template', notificationController.sendTemplateNotification);

// Get user notifications
router.get('/', notificationController.getCurrentUserNotifications); // Get current user's notifications
router.get('/user/:userId', notificationController.getUserNotifications);
router.get('/stats/:userId', notificationController.getNotificationStats);

// Notification actions
router.put('/:id/read', notificationController.markAsRead);
router.put('/read-all', notificationController.markAllAsRead); // Mark all as read
router.delete('/:id', notificationController.deleteNotification);

export default router;