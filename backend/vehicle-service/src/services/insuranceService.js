// src/services/insuranceService.js
import db from '../models/index.js';
import { 
  logger, 
  AppError 
} from '@ev-coownership/shared';
import eventService from './eventService.js';

export class InsuranceService {
  async createInsurance(insuranceData, userId) {
    const transaction = await db.sequelize.transaction();

    try {
      const vehicle = await db.Vehicle.findByPk(insuranceData.vehicleId);
      if (!vehicle) {
        throw new AppError('Vehicle not found', 404, 'VEHICLE_NOT_FOUND');
      }

      // Check access
      const hasAccess = await this.checkGroupAccess(vehicle.groupId, userId);
      if (!hasAccess) {
        throw new AppError('You do not have access to this vehicle', 403, 'ACCESS_DENIED');
      }

      // Check if policy number already exists
      const existingInsurance = await db.VehicleInsurance.findOne({
        where: { policyNumber: insuranceData.policyNumber }
      });

      if (existingInsurance) {
        throw new AppError('Insurance policy with this number already exists', 409, 'INSURANCE_ALREADY_EXISTS');
      }

      // Validate dates
      if (new Date(insuranceData.startDate) >= new Date(insuranceData.endDate)) {
        throw new AppError('End date must be after start date', 400, 'INVALID_INSURANCE_DATES');
      }

      // Deactivate other active policies for this vehicle
      await db.VehicleInsurance.update(
        { isActive: false },
        { 
          where: { 
            vehicleId: insuranceData.vehicleId, 
            isActive: true 
          },
          transaction 
        }
      );

      const insurance = await db.VehicleInsurance.create(insuranceData, { transaction });

      await transaction.commit();

      // Publish event
      await eventService.publishInsuranceAdded({
        insuranceId: insurance.id,
        vehicleId: insurance.vehicleId,
        groupId: vehicle.groupId,
        insuranceProvider: insurance.insuranceProvider,
        policyNumber: insurance.policyNumber,
        startDate: insurance.startDate,
        endDate: insurance.endDate,
        premiumAmount: insurance.premiumAmount,
        addedBy: userId
      });

      return insurance;
    } catch (error) {
      await transaction.rollback();
      logger.error('Failed to create insurance', { error: error.message, userId, vehicleId: insuranceData.vehicleId });
      throw error;
    }
  }

  async getInsurancePolicies(vehicleId, userId) {
    try {
      const vehicle = await db.Vehicle.findByPk(vehicleId);
      if (!vehicle) {
        throw new AppError('Vehicle not found', 404, 'VEHICLE_NOT_FOUND');
      }

      // Check access
      const hasAccess = await this.checkGroupAccess(vehicle.groupId, userId);
      if (!hasAccess) {
        throw new AppError('You do not have access to this vehicle', 403, 'ACCESS_DENIED');
      }

      const policies = await db.VehicleInsurance.findAll({
        where: { vehicleId },
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: db.Vehicle,
            as: 'vehicle',
            attributes: ['id', 'vehicleName', 'licensePlate']
          }
        ]
      });

      return policies;
    } catch (error) {
      logger.error('Failed to get insurance policies', { error: error.message, vehicleId, userId });
      throw error;
    }
  }

  async getCurrentInsurance(vehicleId, userId) {
    try {
      const vehicle = await db.Vehicle.findByPk(vehicleId);
      if (!vehicle) {
        throw new AppError('Vehicle not found', 404, 'VEHICLE_NOT_FOUND');
      }

      // Check access
      const hasAccess = await this.checkGroupAccess(vehicle.groupId, userId);
      if (!hasAccess) {
        throw new AppError('You do not have access to this vehicle', 403, 'ACCESS_DENIED');
      }

      const currentInsurance = await db.VehicleInsurance.findOne({
        where: { 
          vehicleId, 
          isActive: true,
          endDate: { [db.Sequelize.Op.gte]: new Date() }
        },
        include: [
          {
            model: db.Vehicle,
            as: 'vehicle',
            attributes: ['id', 'vehicleName', 'licensePlate']
          }
        ],
        order: [['endDate', 'DESC']]
      });

      if (!currentInsurance) {
        throw new AppError('No active insurance policy found for this vehicle', 404, 'NO_ACTIVE_INSURANCE');
      }

      return currentInsurance;
    } catch (error) {
      logger.error('Failed to get current insurance', { error: error.message, vehicleId, userId });
      throw error;
    }
  }

  async updateInsurance(insuranceId, updateData, userId) {
    const transaction = await db.sequelize.transaction();

    try {
      const insurance = await db.VehicleInsurance.findByPk(insuranceId, {
        include: [{ model: db.Vehicle, as: 'vehicle' }]
      });

      if (!insurance) {
        throw new AppError('Insurance policy not found', 404, 'INSURANCE_NOT_FOUND');
      }

      // Check access
      const hasAccess = await this.checkGroupAccess(insurance.vehicle.groupId, userId);
      if (!hasAccess) {
        throw new AppError('You do not have access to this insurance policy', 403, 'ACCESS_DENIED');
      }

      // If updating policy number, check for duplicates
      if (updateData.policyNumber && updateData.policyNumber !== insurance.policyNumber) {
        const existingInsurance = await db.VehicleInsurance.findOne({
          where: { policyNumber: updateData.policyNumber }
        });

        if (existingInsurance) {
          throw new AppError('Insurance policy with this number already exists', 409, 'INSURANCE_ALREADY_EXISTS');
        }
      }

      // Validate dates if provided
      if ((updateData.startDate && updateData.endDate) && 
          new Date(updateData.startDate) >= new Date(updateData.endDate)) {
        throw new AppError('End date must be after start date', 400, 'INVALID_INSURANCE_DATES');
      }

      await insurance.update(updateData, { transaction });
      await transaction.commit();

      // Publish event
      await eventService.publishInsuranceUpdated({
        insuranceId: insurance.id,
        vehicleId: insurance.vehicleId,
        groupId: insurance.vehicle.groupId,
        updates: updateData,
        updatedBy: userId
      });

      return insurance;
    } catch (error) {
      await transaction.rollback();
      logger.error('Failed to update insurance', { error: error.message, insuranceId, userId });
      throw error;
    }
  }

  async updateInsuranceStatus(insuranceId, isActive, userId) {
    const transaction = await db.sequelize.transaction();

    try {
      const insurance = await db.VehicleInsurance.findByPk(insuranceId, {
        include: [{ model: db.Vehicle, as: 'vehicle' }]
      });

      if (!insurance) {
        throw new AppError('Insurance policy not found', 404, 'INSURANCE_NOT_FOUND');
      }

      // Check access
      const hasAccess = await this.checkGroupAccess(insurance.vehicle.groupId, userId);
      if (!hasAccess) {
        throw new AppError('You do not have access to this insurance policy', 403, 'ACCESS_DENIED');
      }

      // If activating, deactivate other active policies for this vehicle
      if (isActive) {
        await db.VehicleInsurance.update(
          { isActive: false },
          { 
            where: { 
              vehicleId: insurance.vehicleId, 
              isActive: true,
              id: { [db.Sequelize.Op.ne]: insuranceId }
            },
            transaction 
          }
        );
      }

      await insurance.update({ isActive }, { transaction });
      await transaction.commit();

      // Publish event
      await eventService.publishInsuranceUpdated({
        insuranceId: insurance.id,
        vehicleId: insurance.vehicleId,
        groupId: insurance.vehicle.groupId,
        updates: { isActive },
        updatedBy: userId
      });

      return insurance;
    } catch (error) {
      await transaction.rollback();
      logger.error('Failed to update insurance status', { error: error.message, insuranceId, userId });
      throw error;
    }
  }

  async checkInsuranceExpiry() {
    try {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      const expiringSoon = await db.VehicleInsurance.findAll({
        where: {
          isActive: true,
          endDate: {
            [db.Sequelize.Op.between]: [new Date(), thirtyDaysFromNow]
          }
        },
        include: [
          {
            model: db.Vehicle,
            as: 'vehicle',
            attributes: ['id', 'vehicleName', 'groupId', 'licensePlate']
          }
        ]
      });

      for (const insurance of expiringSoon) {
        const daysUntilExpiry = Math.ceil((new Date(insurance.endDate) - new Date()) / (1000 * 60 * 60 * 24));
        
        // Publish expiry reminder event
        await eventService.publishInsuranceExpiring({
          insuranceId: insurance.id,
          vehicleId: insurance.vehicleId,
          groupId: insurance.vehicle.groupId,
          insuranceProvider: insurance.insuranceProvider,
          policyNumber: insurance.policyNumber,
          endDate: insurance.endDate,
          daysUntilExpiry,
          vehicleName: insurance.vehicle.vehicleName,
          licensePlate: insurance.vehicle.licensePlate
        });
      }

      return expiringSoon.map(insurance => ({
        insuranceId: insurance.id,
        vehicleId: insurance.vehicleId,
        vehicleName: insurance.vehicle.vehicleName,
        insuranceProvider: insurance.insuranceProvider,
        endDate: insurance.endDate,
        daysUntilExpiry: Math.ceil((new Date(insurance.endDate) - new Date()) / (1000 * 60 * 60 * 24))
      }));
    } catch (error) {
      logger.error('Failed to check insurance expiry', { error: error.message });
      throw error;
    }
  }

  // Helper methods
  async checkGroupAccess(groupId, userId) {
    try {
      const response = await fetch(`${process.env.USER_SERVICE_URL}/api/v1/groups/${groupId}/members/${userId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.INTERNAL_SERVICE_TOKEN}`
        }
      });

      return response.ok;
    } catch (error) {
      logger.error('Failed to check group access', { error: error.message, groupId, userId });
      return false;
    }
  }
}

export default new InsuranceService();