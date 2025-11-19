// src/routes/profileRoutes.js
import express from 'express';
import profileController from '../controllers/profileController.js';
import { adminAuth, requirePermission } from '../middleware/adminAuth.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/admin/avatars');
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

router.use(adminAuth);

// Get admin profile
router.get('/', profileController.getProfile);

// Update admin profile
router.put('/', profileController.updateProfile);

// Upload avatar
router.post('/avatar', upload.single('avatar'), profileController.uploadAvatar);

// Update security settings
router.put('/security', profileController.updateSecuritySettings);

// Update notification preferences
router.put('/notifications', profileController.updateNotificationPreferences);

// Change password
router.post('/change-password', profileController.changePassword);

export default router;
