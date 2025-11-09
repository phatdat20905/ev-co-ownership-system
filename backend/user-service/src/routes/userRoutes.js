// src/routes/userRoutes.js
import express from 'express';
import userController from '../controllers/userController.js';
import { 
  authenticate, 
  validate 
} from '@ev-coownership/shared';
import { userValidators } from '../validators/userValidators.js';
import { uploadAvatar, handleUploadError } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/profile', userController.getProfile);
router.put('/profile', validate(userValidators.updateProfile), userController.updateProfile);
router.post('/avatar', uploadAvatar, handleUploadError, userController.uploadAvatar);
router.get('/search', userController.searchUsers);
router.get('/:userId', userController.getUserById);

export default router;