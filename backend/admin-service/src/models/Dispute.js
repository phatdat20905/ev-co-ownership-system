// src/models/Dispute.js
export default (sequelize, DataTypes) => {
  const Dispute = sequelize.define('Dispute', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    disputeNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      field: 'dispute_number'
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    disputeType: {
      type: DataTypes.ENUM('booking_conflict', 'cost_dispute', 'damage_claim', 'other'),
      allowNull: false,
      field: 'dispute_type'
    },
    status: {
      type: DataTypes.ENUM('open', 'investigating', 'resolved', 'closed'),
      allowNull: false,
      defaultValue: 'open'
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      allowNull: false,
      defaultValue: 'medium'
    },
    filedBy: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'filed_by'
    },
    againstUser: {
      type: DataTypes.UUID,
      field: 'against_user'
    },
    groupId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'group_id'
    },
    assignedTo: {
      type: DataTypes.UUID,
      field: 'assigned_to'
    },
    resolution: {
      type: DataTypes.TEXT
    },
    resolvedAt: {
      type: DataTypes.DATE,
      field: 'resolved_at'
    }
  }, {
    tableName: 'disputes',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['status']
      },
      {
        fields: ['priority']
      },
      {
        fields: ['assigned_to']
      },
      {
        fields: ['filed_by']
      },
      {
        fields: ['group_id']
      },
      {
        fields: ['created_at']
      },
      {
        fields: ['dispute_type']
      }
    ]
  });

  Dispute.associate = function(models) {
    Dispute.belongsTo(models.StaffProfile, {
      foreignKey: 'assigned_to',
      as: 'assignedStaff'
    });
    Dispute.hasMany(models.DisputeMessage, {
      foreignKey: 'dispute_id',
      as: 'messages'
    });
  };

  // Instance method để generate dispute number
  Dispute.beforeCreate(async (dispute) => {
    if (!dispute.disputeNumber) {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const count = await Dispute.count({
        where: {
          createdAt: {
            [sequelize.Sequelize.Op.gte]: new Date(date.getFullYear(), date.getMonth(), 1)
          }
        }
      });
      dispute.disputeNumber = `DP${year}${month}${String(count + 1).padStart(4, '0')}`;
    }
  });

  return Dispute;
};