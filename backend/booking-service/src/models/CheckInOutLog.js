export default (sequelize, DataTypes) => {
  const CheckInOutLog = sequelize.define('CheckInOutLog', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    bookingId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'booking_id'
    },
    actionType: {
      type: DataTypes.ENUM('check_in', 'check_out'),
      allowNull: false,
      field: 'action_type'
    },
    odometerReading: {
      type: DataTypes.INTEGER,
      field: 'odometer_reading'
    },
    fuelLevel: {
      type: DataTypes.DECIMAL(5, 2),
      field: 'fuel_level'
    },
    images: {
      type: DataTypes.JSONB
    },
    notes: {
      type: DataTypes.TEXT
    },
    qrCode: {
      type: DataTypes.STRING(255),
      field: 'qr_code'
    },
    digitalSignature: {
      type: DataTypes.TEXT,
      field: 'digital_signature'
    },
    performedBy: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'performed_by'
    },
    location: {
      type: DataTypes.JSONB
    }
  }, {
    tableName: 'check_in_out_logs',
    timestamps: true,
    underscored: true
  });

  CheckInOutLog.associate = function(models) {
    CheckInOutLog.belongsTo(models.Booking, {
      foreignKey: 'bookingId',
      as: 'booking'
    });
  };

  return CheckInOutLog;
};