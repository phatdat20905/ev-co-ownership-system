export default (sequelize, DataTypes) => {
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
    licensePlate: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      field: 'license_plate'
    },
    brand: {
      type: DataTypes.STRING(100)
    },
    model: {
      type: DataTypes.STRING(100)
    },
    year: {
      type: DataTypes.INTEGER
    },
    color: {
      type: DataTypes.STRING(50)
    },
    batteryCapacityKwh: {
      type: DataTypes.DECIMAL(6, 2),
      field: 'battery_capacity_kwh'
    },
    currentOdometer: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'current_odometer'
    },
    status: {
      type: DataTypes.ENUM('available', 'in_use', 'maintenance', 'unavailable'),
      defaultValue: 'available'
    }
  }, {
    tableName: 'vehicles',
    timestamps: true,
    underscored: true
  });

  Vehicle.associate = function(models) {
    Vehicle.hasMany(models.Booking, {
      foreignKey: 'vehicleId',
      as: 'bookings'
    });
    Vehicle.hasMany(models.CalendarCache, {
      foreignKey: 'vehicleId',
      as: 'calendarCache'
    });
  };

  return Vehicle;
};