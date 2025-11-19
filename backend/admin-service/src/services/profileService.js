// src/services/profileService.js
import staffRepository from '../repositories/staffRepository.js';
import { logger, AppError } from '@ev-coownership/shared';
import bcrypt from 'bcryptjs';

export class ProfileService {
  async getAdminProfile(staffId) {
    try {
      const staff = await staffRepository.findById(staffId);
      
      if (!staff) {
        throw new AppError('Admin profile not found', 404);
      }

      // Transform to frontend-friendly format
      return {
        id: staff.id,
        name: staff.full_name || staff.name,
        email: staff.email,
        phone: staff.phone_number || staff.phone,
        address: staff.address,
        position: staff.position,
        department: staff.department,
        employeeId: staff.employee_id || staff.employeeId,
        accessLevel: staff.role === 'super_admin' ? 'Super Admin' : 'Admin',
        joinDate: staff.created_at || staff.join_date,
        avatar: staff.avatar_url || staff.avatar,
        verified: staff.is_verified !== false,
        lastLogin: staff.last_login_at || staff.lastLogin,
        notificationPreferences: staff.notification_preferences || {
          email: true,
          sms: false,
          push: true,
          systemAlerts: true,
          securityAlerts: true,
          reportNotifications: true
        },
        securitySettings: staff.security_settings || {
          twoFactor: false,
          sessionTimeout: 30,
          loginAlerts: true,
          passwordExpiry: 90
        },
        permissions: staff.permissions || ['full_access']
      };
    } catch (error) {
      logger.error('Failed to get admin profile', { error: error.message, staffId });
      throw error;
    }
  }

  async updateAdminProfile(staffId, updateData) {
    try {
      // Map frontend fields to database fields
      const dbUpdateData = {
        full_name: updateData.name,
        email: updateData.email,
        phone_number: updateData.phone,
        address: updateData.address,
        position: updateData.position,
        department: updateData.department,
        avatar_url: updateData.avatar
      };

      // Remove undefined values
      Object.keys(dbUpdateData).forEach(key => 
        dbUpdateData[key] === undefined && delete dbUpdateData[key]
      );

      const updatedStaff = await staffRepository.update(staffId, dbUpdateData);

      return await this.getAdminProfile(staffId);
    } catch (error) {
      logger.error('Failed to update admin profile', { error: error.message, staffId });
      throw error;
    }
  }

  async updateSecuritySettings(staffId, securitySettings) {
    try {
      const staff = await staffRepository.findById(staffId);
      
      if (!staff) {
        throw new AppError('Admin profile not found', 404);
      }

      const currentSettings = staff.security_settings || {};
      const newSettings = {
        ...currentSettings,
        ...securitySettings
      };

      await staffRepository.update(staffId, {
        security_settings: newSettings
      });

      return await this.getAdminProfile(staffId);
    } catch (error) {
      logger.error('Failed to update security settings', { error: error.message, staffId });
      throw error;
    }
  }

  async updateNotificationPreferences(staffId, preferences) {
    try {
      const staff = await staffRepository.findById(staffId);
      
      if (!staff) {
        throw new AppError('Admin profile not found', 404);
      }

      const currentPreferences = staff.notification_preferences || {};
      const newPreferences = {
        ...currentPreferences,
        ...preferences
      };

      await staffRepository.update(staffId, {
        notification_preferences: newPreferences
      });

      return await this.getAdminProfile(staffId);
    } catch (error) {
      logger.error('Failed to update notification preferences', { error: error.message, staffId });
      throw error;
    }
  }

  async changePassword(staffId, currentPassword, newPassword) {
    try {
      const staff = await staffRepository.findById(staffId);
      
      if (!staff) {
        throw new AppError('Admin profile not found', 404);
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, staff.password_hash || staff.password);
      
      if (!isValidPassword) {
        throw new AppError('Current password is incorrect', 400);
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await staffRepository.update(staffId, {
        password_hash: hashedPassword,
        password_changed_at: new Date()
      });

      logger.info('Password changed successfully', { staffId });
    } catch (error) {
      logger.error('Failed to change password', { error: error.message, staffId });
      throw error;
    }
  }
}

export default new ProfileService();
