// src/models/NotificationTemplate.js
export default (sequelize, DataTypes) => {
  const NotificationTemplate = sequelize.define('NotificationTemplate', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    type: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    subject: {
      type: DataTypes.STRING(255)
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    channels: {
      type: DataTypes.ARRAY(DataTypes.STRING(20)),
      defaultValue: ['email'],
      field: 'channels'
    },
    variables: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    }
  }, {
    tableName: 'notification_templates',
    underscored: true,
    timestamps: true,
    indexes: [
      {
        fields: ['type']
      },
      {
        fields: ['is_active']
      }
    ]
  });

  return NotificationTemplate;
};