// src/models/GroupWalletTransaction.js
export default (sequelize, DataTypes) => {
  const GroupWalletTransaction = sequelize.define('GroupWalletTransaction', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    walletId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'wallet_id'
    },
    type: {
      type: DataTypes.ENUM('deposit', 'withdraw', 'expense', 'refund'),
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    referenceId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'reference_id'
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'created_by'
    }
  }, {
    tableName: 'group_wallet_transactions',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['wallet_id']
      },
      {
        fields: ['created_at']
      }
    ]
  });

  GroupWalletTransaction.associate = function(models) {
    GroupWalletTransaction.belongsTo(models.GroupWallet, {
      foreignKey: 'walletId',
      as: 'wallet'
    });
  };

  return GroupWalletTransaction;
};