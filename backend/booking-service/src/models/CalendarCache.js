export default (sequelize, DataTypes) => {
  const CalendarCache = sequelize.define('CalendarCache', {
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
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    timeSlots: {
      type: DataTypes.JSONB,
      allowNull: false,
      field: 'time_slots'
    }
  }, {
    tableName: 'calendar_cache',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['vehicle_id', 'date']
      }
    ]
  });

  CalendarCache.associate = function(models) {
    CalendarCache.belongsTo(models.Vehicle, {
      foreignKey: 'vehicleId',
      as: 'vehicle'
    });
  };

  return CalendarCache;
};