// src/models/MaintenanceSchedule.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const MaintenanceSchedule = sequelize.define('MaintenanceSchedule', {
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
    maintenanceType: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'maintenance_type'
    },
    scheduledDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'scheduled_date'
    },
    odometerAtSchedule: {
      type: DataTypes.INTEGER,
      field: 'odometer_at_schedule'
    },
    status: {
      type: DataTypes.ENUM('scheduled', 'in_progress', 'completed', 'cancelled'),
      defaultValue: 'scheduled'
    },
    estimatedCost: {
      type: DataTypes.DECIMAL(15, 2),
      field: 'estimated_cost'
    },
    actualCost: {
      type: DataTypes.DECIMAL(15, 2),
      field: 'actual_cost'
    },
    notes: {
      type: DataTypes.TEXT
    }
  }, {
    tableName: 'maintenance_schedules',
    timestamps: true,
    underscored: true,
    hooks: {
      beforeValidate: (schedule) => {
        if (schedule.scheduledDate && new Date(schedule.scheduledDate) < new Date()) {
          throw new Error('Scheduled date cannot be in the past');
        }
      }
    }
  });

  MaintenanceSchedule.associate = (models) => {
    MaintenanceSchedule.belongsTo(models.Vehicle, {
      foreignKey: 'vehicleId',
      as: 'vehicle'
    });
    MaintenanceSchedule.hasMany(models.MaintenanceHistory, {
      foreignKey: 'maintenanceScheduleId',
      as: 'historyRecords'
    });
  };

  return MaintenanceSchedule;
};