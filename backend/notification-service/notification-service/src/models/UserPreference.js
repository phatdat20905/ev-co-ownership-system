export default (sequelize, DataTypes) => {
  const UserPreference = sequelize.define('UserPreference', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      field: 'user_id'
    },
    preferences: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {
        email: true,
        push: true,
        sms: false,
        in_app: true
      }
    }
  }, {
    tableName: 'user_preferences',
    underscored: true,
    timestamps: true,
    indexes: [
      {
        fields: ['user_id']
      }
    ]
  });

  return UserPreference;
};
