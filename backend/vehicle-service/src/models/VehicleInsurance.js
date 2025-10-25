// src/models/VehicleInsurance.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const VehicleInsurance = sequelize.define('VehicleInsurance', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    vehicleId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'vehicle_id'
    },
    insuranceProvider: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'insurance_provider'
    },
    policyNumber: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      field: 'policy_number'
    },
    coverageType: {
      type: DataTypes.STRING(100),
      field: 'coverage_type'
    },
    premiumAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      field: 'premium_amount',
      validate: {
        min: 0
      }
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'start_date'
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'end_date'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    },
    documentUrl: {
      type: DataTypes.STRING(500),
      field: 'document_url'
    }
  }, {
    tableName: 'vehicle_insurance',
    timestamps: true,
    underscored: true,
    hooks: {
      beforeValidate: (insurance) => {
        if (insurance.startDate && insurance.endDate) {
          if (new Date(insurance.startDate) >= new Date(insurance.endDate)) {
            throw new Error('End date must be after start date');
          }
        }
      }
    }
  });

  VehicleInsurance.associate = (models) => {
    VehicleInsurance.belongsTo(models.Vehicle, {
      foreignKey: 'vehicleId',
      as: 'vehicle'
    });
  };

  return VehicleInsurance;
};