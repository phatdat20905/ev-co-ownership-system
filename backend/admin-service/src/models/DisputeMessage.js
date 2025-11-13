// src/models/DisputeMessage.js
export default (sequelize, DataTypes) => {
  const DisputeMessage = sequelize.define('DisputeMessage', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    disputeId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'dispute_id'
    },
    senderId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'sender_id'
    },
    messageType: {
      type: DataTypes.ENUM('text', 'system', 'resolution'),
      allowNull: false,
      defaultValue: 'text',
      field: 'message_type'
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    attachments: {
      type: DataTypes.JSONB
    },
    isInternal: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_internal'
    }
  }, {
    tableName: 'dispute_messages',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['dispute_id']
      },
      {
        fields: ['created_at']
      },
      {
        fields: ['sender_id']
      }
    ]
  });

  DisputeMessage.associate = function(models) {
    DisputeMessage.belongsTo(models.Dispute, {
      foreignKey: 'dispute_id',
      as: 'dispute'
    });
  };

  return DisputeMessage;
};