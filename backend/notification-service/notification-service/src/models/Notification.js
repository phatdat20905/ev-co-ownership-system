// src/models/Notification.js
export default (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id'
    },
    type: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    channels: {
      type: DataTypes.ARRAY(DataTypes.STRING(20)),
      defaultValue: ['email'],
      field: 'channels'
    },
    status: {
      type: DataTypes.ENUM('pending', 'queued', 'sent', 'failed', 'read'),
      defaultValue: 'pending'
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    sentAt: {
      type: DataTypes.DATE,
      field: 'sent_at'
    },
    readAt: {
      type: DataTypes.DATE,
      field: 'read_at'
    }
  }, {
    tableName: 'notifications',
    underscored: true,
    timestamps: true,
    indexes: [
      {
        fields: ['user_id']
      },
      {
        fields: ['status']
      },
      {
        fields: ['created_at']
      }
    ]
  });

  Notification.associate = function(models) {
    // Associations if needed
  };

  return Notification;
};