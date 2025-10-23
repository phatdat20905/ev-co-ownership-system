export default (sequelize, DataTypes) => {
  const Booking = sequelize.define('Booking', {
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
    groupId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'group_id'
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'start_time'
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'end_time'
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'conflict'),
      defaultValue: 'pending'
    },
    priorityScore: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'priority_score'
    },
    purpose: {
      type: DataTypes.STRING(500)
    },
    notes: {
      type: DataTypes.TEXT
    },
    cancellationReason: {
      type: DataTypes.TEXT,
      field: 'cancellation_reason'
    },
    autoConfirmed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'auto_confirmed'
    }
  }, {
    tableName: 'bookings',
    timestamps: true,
    underscored: true
  });

  Booking.associate = function(models) {
    Booking.belongsTo(models.Vehicle, {
      foreignKey: 'vehicleId',
      as: 'vehicle'
    });
    Booking.hasMany(models.CheckInOutLog, {
      foreignKey: 'bookingId',
      as: 'checkLogs'
    });
    Booking.hasMany(models.BookingConflict, {
      foreignKey: 'bookingId_1',
      as: 'conflictsAsBooking1'
    });
    Booking.hasMany(models.BookingConflict, {
      foreignKey: 'bookingId_2',
      as: 'conflictsAsBooking2'
    });
  };

  return Booking;
};