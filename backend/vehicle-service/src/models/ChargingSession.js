// src/models/ChargingSession.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const ChargingSession = sequelize.define('ChargingSession', {
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
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id'
    },
    chargingStationLocation: {
      type: DataTypes.STRING(255),
      field: 'charging_station_location'
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'start_time'
    },
    endTime: {
      type: DataTypes.DATE,
      field: 'end_time'
    },
    startBatteryLevel: {
      type: DataTypes.DECIMAL(5, 2),
      field: 'start_battery_level',
      validate: {
        min: 0,
        max: 100
      }
    },
    endBatteryLevel: {
      type: DataTypes.DECIMAL(5, 2),
      field: 'end_battery_level',
      validate: {
        min: 0,
        max: 100
      }
    },
    energyConsumedKwh: {
      type: DataTypes.DECIMAL(8, 2),
      field: 'energy_consumed_kwh',
      validate: {
        min: 0
      }
    },
    cost: {
      type: DataTypes.DECIMAL(10, 2),
      validate: {
        min: 0
      }
    },
    paymentMethod: {
      type: DataTypes.STRING(50),
      field: 'payment_method'
    }
  }, {
    tableName: 'charging_sessions',
    timestamps: true,
    underscored: true,
    hooks: {
      beforeValidate: (session) => {
        if (session.startTime && session.endTime) {
          if (new Date(session.startTime) >= new Date(session.endTime)) {
            throw new Error('End time must be after start time');
          }
        }
        
        if (session.startBatteryLevel && session.endBatteryLevel) {
          if (session.startBatteryLevel >= session.endBatteryLevel) {
            throw new Error('End battery level must be greater than start level');
          }
        }
      }
    }
  });

  ChargingSession.associate = (models) => {
    ChargingSession.belongsTo(models.Vehicle, {
      foreignKey: 'vehicleId',
      as: 'vehicle'
    });
  };

  return ChargingSession;
};