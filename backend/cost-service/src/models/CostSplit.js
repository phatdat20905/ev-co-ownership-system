// src/models/CostSplit.js
export default (sequelize, DataTypes) => {
  const CostSplit = sequelize.define('CostSplit', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    costId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'cost_id'
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id'
    },
    splitAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      field: 'split_amount'
    },
    paidAmount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
      field: 'paid_amount'
    },
    paymentStatus: {
      type: DataTypes.ENUM('pending', 'paid', 'overdue', 'partial'),
      defaultValue: 'pending',
      field: 'payment_status'
    },
    dueDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'due_date'
    },
    paidAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'paid_at'
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'deleted_at'
    }
  }, {
    tableName: 'cost_splits',
    timestamps: true,
    underscored: true,
    paranoid: true,
    indexes: [
      {
        fields: ['cost_id']
      },
      {
        fields: ['user_id']
      },
      {
        fields: ['payment_status']
      }
    ]
  });

  CostSplit.associate = function(models) {
    CostSplit.belongsTo(models.Cost, {
      foreignKey: 'costId',
      as: 'cost'
    });
    
    CostSplit.hasMany(models.Payment, {
      foreignKey: 'costSplitId',
      as: 'payments'
    });
  };

  return CostSplit;
};