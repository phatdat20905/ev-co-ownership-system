// src/services/systemSettingsService.js
import db from '../models/index.js';
import { logger, AppError } from '@ev-coownership/shared';
import eventService from './eventService.js';

export class SystemSettingsService {
  async getSettings(category = null) {
    try {
      const where = {};
      if (category) {
        where.category = category;
      }

      const settings = await db.SystemSetting.findAll({
        where,
        order: [['category', 'ASC'], ['settingKey', 'ASC']]
      });

      // Parse values according to data type
      const parsedSettings = settings.map(setting => ({
        ...setting.toJSON(),
        parsedValue: setting.getParsedValue()
      }));

      return parsedSettings;
    } catch (error) {
      logger.error('Failed to get system settings', {
        error: error.message,
        category
      });
      throw error;
    }
  }

  async getSetting(key) {
    try {
      const setting = await db.SystemSetting.findOne({ where: { settingKey: key } });
      if (!setting) {
        throw new AppError('Setting not found', 404, 'SETTING_NOT_FOUND');
      }

      return {
        ...setting.toJSON(),
        parsedValue: setting.getParsedValue()
      };
    } catch (error) {
      logger.error('Failed to get system setting', {
        error: error.message,
        key
      });
      throw error;
    }
  }

  async updateSetting(key, newValue, updatedBy) {
    try {
      const setting = await db.SystemSetting.findOne({ where: { settingKey: key } });
      if (!setting) {
        throw new AppError('Setting not found', 404, 'SETTING_NOT_FOUND');
      }

      // Validate value based on data type
      this.validateSettingValue(setting.dataType, newValue);

      const oldValue = setting.settingValue;
      
      await setting.update({
        settingValue: String(newValue),
        updatedBy
      });

      logger.info('System setting updated successfully', {
        key,
        oldValue,
        newValue,
        updatedBy
      });

      await eventService.publishSystemSettingUpdated({
        key,
        oldValue,
        newValue,
        updatedBy,
        dataType: setting.dataType
      });

      return {
        ...setting.toJSON(),
        parsedValue: setting.getParsedValue()
      };
    } catch (error) {
      logger.error('Failed to update system setting', {
        error: error.message,
        key,
        updatedBy
      });
      throw error;
    }
  }

  async updateMultipleSettings(updates, updatedBy) {
    const transaction = await db.sequelize.transaction();

    try {
      const results = [];

      for (const update of updates) {
        const { key, value } = update;

        const setting = await db.SystemSetting.findOne({ 
          where: { settingKey: key },
          transaction 
        });

        if (!setting) {
          throw new AppError(`Setting not found: ${key}`, 404, 'SETTING_NOT_FOUND');
        }

        this.validateSettingValue(setting.dataType, value);

        const oldValue = setting.settingValue;
        
        await setting.update({
          settingValue: String(value),
          updatedBy
        }, { transaction });

        results.push({
          key,
          oldValue,
          newValue: value,
          dataType: setting.dataType
        });
      }

      await transaction.commit();

      logger.info('Multiple system settings updated successfully', {
        count: results.length,
        updatedBy
      });

      await eventService.publishSystemSettingsBatchUpdated({
        updates: results,
        updatedBy
      });

      return results;
    } catch (error) {
      await transaction.rollback();
      logger.error('Failed to update multiple system settings', {
        error: error.message,
        updatedBy
      });
      throw error;
    }
  }

  async createSetting(settingData) {
    try {
      const existingSetting = await db.SystemSetting.findOne({ 
        where: { settingKey: settingData.settingKey } 
      });

      if (existingSetting) {
        throw new AppError('Setting key already exists', 400, 'DUPLICATE_SETTING_KEY');
      }

      this.validateSettingValue(settingData.dataType, settingData.settingValue);

      const setting = await db.SystemSetting.create(settingData);

      logger.info('System setting created successfully', {
        key: setting.settingKey,
        category: setting.category
      });

      await eventService.publishSystemSettingCreated({
        key: setting.settingKey,
        value: setting.settingValue,
        dataType: setting.dataType,
        category: setting.category,
        createdBy: setting.updatedBy
      });

      return {
        ...setting.toJSON(),
        parsedValue: setting.getParsedValue()
      };
    } catch (error) {
      logger.error('Failed to create system setting', {
        error: error.message,
        key: settingData.settingKey
      });
      throw error;
    }
  }

  validateSettingValue(dataType, value) {
    switch (dataType) {
      case 'number':
        if (isNaN(Number(value))) {
          throw new AppError('Value must be a valid number', 400, 'INVALID_NUMBER');
        }
        break;
      case 'boolean':
        if (value !== 'true' && value !== 'false' && value !== true && value !== false) {
          throw new AppError('Value must be a boolean (true/false)', 400, 'INVALID_BOOLEAN');
        }
        break;
      case 'json':
        try {
          JSON.parse(String(value));
        } catch {
          throw new AppError('Value must be valid JSON', 400, 'INVALID_JSON');
        }
        break;
      default:
        // String - no validation needed
        break;
    }
  }

  async getPublicSettings() {
    try {
      const settings = await db.SystemSetting.findAll({
        where: { isPublic: true },
        attributes: ['settingKey', 'settingValue', 'dataType', 'category', 'description']
      });

      return settings.map(setting => ({
        ...setting.toJSON(),
        parsedValue: setting.getParsedValue()
      }));
    } catch (error) {
      logger.error('Failed to get public settings', { error: error.message });
      throw error;
    }
  }
}

export default new SystemSettingsService();