// src/models/Vehicle.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Vehicle = sequelize.define('Vehicle', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    groupId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'group_id'
    },
    vehicleName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'vehicle_name'
    },
    brand: {
      type: DataTypes.STRING(100)
    },
    model: {
      type: DataTypes.STRING(100)
    },
    year: {
      type: DataTypes.INTEGER,
      validate: {
        min: 2000,
        max: new Date().getFullYear() + 1
      }
    },
    licensePlate: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      field: 'license_plate',
      validate: {
        is: /^[A-Z0-9-]{1,20}$/
      }
    },
    vin: {
      type: DataTypes.STRING(17),
      unique: true,
      validate: {
        is: /^[A-HJ-NPR-Z0-9]{17}$/
      }
    },
    color: {
      type: DataTypes.STRING(50)
    },
    batteryCapacityKwh: {
      type: DataTypes.DECIMAL(6, 2),
      field: 'battery_capacity_kwh',
      validate: {
        min: 10,
        max: 200
      }
    },
    currentOdometer: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'current_odometer',
      validate: {
        min: 0,
        max: 1000000
      }
    },
    status: {
      type: DataTypes.ENUM('available', 'in_use', 'maintenance', 'unavailable'),
      defaultValue: 'available'
    },
    purchaseDate: {
      type: DataTypes.DATEONLY,
      field: 'purchase_date'
    },
    purchasePrice: {
      type: DataTypes.DECIMAL(15, 2),
      field: 'purchase_price'
    },
    images: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    specifications: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    tableName: 'vehicles',
    timestamps: true,
    underscored: true,
    hooks: {
      beforeValidate: (vehicle) => {
        if (vehicle.licensePlate) {
          vehicle.licensePlate = vehicle.licensePlate.toUpperCase().replace(/\s/g, '');
        }
      }
    }
  });

  Vehicle.associate = (models) => {
    Vehicle.hasMany(models.MaintenanceSchedule, {
      foreignKey: 'vehicleId',
      as: 'maintenanceSchedules'
    });
    Vehicle.hasMany(models.MaintenanceHistory, {
      foreignKey: 'vehicleId',
      as: 'maintenanceHistory'
    });
    Vehicle.hasMany(models.VehicleInsurance, {
      foreignKey: 'vehicleId',
      as: 'insurancePolicies'
    });
    Vehicle.hasMany(models.ChargingSession, {
      foreignKey: 'vehicleId',
      as: 'chargingSessions'
    });
  };

  Vehicle.prototype.toJSON = function() {
    const values = { ...this.get() };
    return values;
  };

  return Vehicle;
};