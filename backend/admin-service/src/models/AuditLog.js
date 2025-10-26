// src/models/AuditLog.js
export default (sequelize, DataTypes) => {
  const AuditLog = sequelize.define('AuditLog', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      field: 'user_id'
    },
    userRole: {
      type: DataTypes.STRING(20),
      field: 'user_role'
    },
    action: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    entityType: {
      type: DataTypes.STRING(100),
      field: 'entity_type'
    },
    entityId: {
      type: DataTypes.UUID,
      field: 'entity_id'
    },
    oldValues: {
      type: DataTypes.JSONB,
      field: 'old_values'
    },
    newValues: {
      type: DataTypes.JSONB,
      field: 'new_values'
    },
    ipAddress: {
      type: DataTypes.INET,
      field: 'ip_address'
    },
    userAgent: {
      type: DataTypes.TEXT,
      field: 'user_agent'
    }
  }, {
    tableName: 'audit_logs',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['user_id']
      },
      {
        fields: ['action']
      },
      {
        fields: ['entity_type', 'entity_id']
      },
      {
        fields: ['created_at']
      },
      {
        fields: ['user_role']
      },
      {
        fields: ['created_at'],
        order: [['created_at', 'DESC']]
      }
    ]
  });

  return AuditLog;
};