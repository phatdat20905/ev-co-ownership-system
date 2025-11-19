// src/controllers/profileController.js
import profileService from '../services/profileService.js';
import { successResponse, logger } from '@ev-coownership/shared';
import bcrypt from 'bcryptjs';

export class ProfileController {
  async getProfile(req, res, next) {
    try {
      const staffId = req.staff.id;
      
      const profile = await profileService.getAdminProfile(staffId);

      logger.info('Admin profile retrieved', { staffId });

      return successResponse(res, 'Profile retrieved successfully', profile);
    } catch (error) {
      logger.error('Failed to get admin profile', {
        error: error.message,
        staffId: req.staff?.id
      });
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const staffId = req.staff.id;
      const updateData = req.body;

      // Remove sensitive fields that shouldn't be updated via this endpoint
      delete updateData.password;
      delete updateData.role;
      delete updateData.permissions;
      delete updateData.securitySettings;
      delete updateData.notificationPreferences;

      const updatedProfile = await profileService.updateAdminProfile(staffId, updateData);

      logger.info('Admin profile updated', { 
        staffId,
        updatedFields: Object.keys(updateData)
      });

      return successResponse(res, 'Profile updated successfully', updatedProfile);
    } catch (error) {
      logger.error('Failed to update admin profile', {
        error: error.message,
        staffId: req.staff?.id
      });
      next(error);
    }
  }

  async uploadAvatar(req, res, next) {
    try {
      const staffId = req.staff.id;
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const avatarUrl = `/uploads/admin/avatars/${req.file.filename}`;
      
      const updatedProfile = await profileService.updateAdminProfile(staffId, {
        avatar: avatarUrl
      });

      logger.info('Admin avatar updated', { 
        staffId,
        avatarUrl
      });

      return successResponse(res, 'Avatar uploaded successfully', {
        avatar: avatarUrl,
        profile: updatedProfile
      });
    } catch (error) {
      logger.error('Failed to upload avatar', {
        error: error.message,
        staffId: req.staff?.id
      });
      next(error);
    }
  }

  async updateSecuritySettings(req, res, next) {
    try {
      const staffId = req.staff.id;
      const { twoFactor, sessionTimeout, loginAlerts, passwordExpiry } = req.body;

      const securitySettings = {
        twoFactor: twoFactor !== undefined ? twoFactor : undefined,
        sessionTimeout: sessionTimeout !== undefined ? parseInt(sessionTimeout) : undefined,
        loginAlerts: loginAlerts !== undefined ? loginAlerts : undefined,
        passwordExpiry: passwordExpiry !== undefined ? parseInt(passwordExpiry) : undefined
      };

      // Remove undefined values
      Object.keys(securitySettings).forEach(key => 
        securitySettings[key] === undefined && delete securitySettings[key]
      );

      const updatedProfile = await profileService.updateSecuritySettings(staffId, securitySettings);

      logger.info('Security settings updated', { 
        staffId,
        settings: Object.keys(securitySettings)
      });

      return successResponse(res, 'Security settings updated successfully', updatedProfile);
    } catch (error) {
      logger.error('Failed to update security settings', {
        error: error.message,
        staffId: req.staff?.id
      });
      next(error);
    }
  }

  async updateNotificationPreferences(req, res, next) {
    try {
      const staffId = req.staff.id;
      const preferences = req.body;

      const updatedProfile = await profileService.updateNotificationPreferences(staffId, preferences);

      logger.info('Notification preferences updated', { 
        staffId,
        preferences: Object.keys(preferences)
      });

      return successResponse(res, 'Notification preferences updated successfully', updatedProfile);
    } catch (error) {
      logger.error('Failed to update notification preferences', {
        error: error.message,
        staffId: req.staff?.id
      });
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const staffId = req.staff.id;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password and new password are required'
        });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 8 characters'
        });
      }

      await profileService.changePassword(staffId, currentPassword, newPassword);

      logger.info('Admin password changed', { staffId });

      return successResponse(res, 'Password changed successfully');
    } catch (error) {
      logger.error('Failed to change password', {
        error: error.message,
        staffId: req.staff?.id
      });
      
      if (error.message === 'Current password is incorrect') {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      next(error);
    }
  }
}

export default new ProfileController();
