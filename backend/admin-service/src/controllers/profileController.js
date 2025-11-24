// src/controllers/profileController.js
import profileService from '../services/profileService.js';
import { successResponse, logger } from '@ev-coownership/shared';
import bcrypt from 'bcryptjs';

export class ProfileController {
  async getProfile(req, res, next) {
    try {
      const staffId = req.staff.id;

      // If adminAuth created a pseudo-staff (no DB record) allow a synthesized
      // profile to be returned so the admin UI can render. This keeps the
      // UX working for identity-provider-only admins while avoiding DB calls
      // that will inevitably return "not found".
      if (staffId === null && req.staff.department === 'admin') {
        const pseudoProfile = {
          id: null,
          name: req.staff.name || req.staff.email || 'Administrator',
          email: req.staff.email || null,
          phone: req.staff.phone || null,
          address: null,
          position: 'Administrator',
          department: 'admin',
          employeeId: null,
          accessLevel: 'Super Admin',
          joinDate: null,
          avatar: req.staff.avatar || null,
          verified: true,
          lastLogin: null,
          notificationPreferences: {
            email: true,
            sms: false,
            push: true,
            systemAlerts: true,
            securityAlerts: true,
            reportNotifications: true
          },
          securitySettings: {
            twoFactor: false,
            sessionTimeout: 30,
            loginAlerts: true,
            passwordExpiry: 90
          },
          permissions: ['full_access']
        };

        logger.info('Returning synthesized admin profile for pseudo-staff', { userId: req.staff.userId });

        return successResponse(res, 'Profile retrieved successfully', pseudoProfile);
      }

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
      if (staffId === null && req.staff.department === 'admin') {
        return res.status(403).json({ success: false, message: 'Admin staff record not present; profile updates are not allowed for identity-only admins' });
      }
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
      if (staffId === null && req.staff.department === 'admin') {
        return res.status(403).json({ success: false, message: 'Admin staff record not present; avatar upload is not allowed for identity-only admins' });
      }

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
      if (staffId === null && req.staff.department === 'admin') {
        return res.status(403).json({ success: false, message: 'Admin staff record not present; security settings cannot be changed for identity-only admins' });
      }
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
      if (staffId === null && req.staff.department === 'admin') {
        return res.status(403).json({ success: false, message: 'Admin staff record not present; notification preferences cannot be changed for identity-only admins' });
      }
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
      if (staffId === null && req.staff.department === 'admin') {
        return res.status(403).json({ success: false, message: 'Admin staff record not present; password change is not available for identity-only admins' });
      }
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
