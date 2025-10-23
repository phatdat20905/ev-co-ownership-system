export default (sequelize, DataTypes) => {
  const BookingConflict = sequelize.define('BookingConflict', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    bookingId_1: {
      type: DataTypes.UUID,
      field: 'booking_id_1'
    },
    bookingId_2: {
      type: DataTypes.UUID,
      field: 'booking_id_2'
    },
    conflictType: {
      type: DataTypes.ENUM('TIME_OVERLAP', 'VEHICLE_UNAVAILABLE', 'USER_QUOTA_EXCEEDED', 'MAINTENANCE_SCHEDULE', 'GROUP_RESTRICTION'),
      allowNull: false,
      field: 'conflict_type'
    },
    resolved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    resolutionNote: {
      type: DataTypes.TEXT,
      field: 'resolution_note'
    },
    resolvedBy: {
      type: DataTypes.UUID,
      field: 'resolved_by'
    }
  }, {
    tableName: 'booking_conflicts',
    timestamps: true,
    underscored: true
  });

  BookingConflict.associate = function(models) {
    BookingConflict.belongsTo(models.Booking, {
      foreignKey: 'bookingId_1',
      as: 'booking1'
    });
    BookingConflict.belongsTo(models.Booking, {
      foreignKey: 'bookingId_2',
      as: 'booking2'
    });
  };

  return BookingConflict;
};