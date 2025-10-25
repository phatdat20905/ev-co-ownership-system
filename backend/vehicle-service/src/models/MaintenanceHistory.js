// src/models/MaintenanceHistory.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const MaintenanceHistory = sequelize.define('MaintenanceHistory', {
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
    maintenanceScheduleId: {
      type: DataTypes.UUID,
      field: 'maintenance_schedule_id'
    },
    maintenanceType: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'maintenance_type'
    },
    performedDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'performed_date'
    },
    odometerReading: {
      type: DataTypes.INTEGER,
      field: 'odometer_reading',
      validate: {
        min: 0
      }
    },
    cost: {
      type: DataTypes.DECIMAL(15, 2),
      validate: {
        min: 0
      }
    },
    serviceProvider: {
      type: DataTypes.STRING(255),
      field: 'service_provider'
    },
    description: {
      type: DataTypes.TEXT
    },
    receiptUrl: {
      type: DataTypes.STRING(500),
      field: 'receipt_url'
    },
    performedBy: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'performed_by'
    }
  }, {
    tableName: 'maintenance_history',
    timestamps: true,
    underscored: true
  });

  MaintenanceHistory.associate = (models) => {
    MaintenanceHistory.belongsTo(models.Vehicle, {
      foreignKey: 'vehicleId',
      as: 'vehicle'
    });
    MaintenanceHistory.belongsTo(models.MaintenanceSchedule, {
      foreignKey: 'maintenanceScheduleId',
      as: 'maintenanceSchedule'
    });
  };

  return MaintenanceHistory;
};