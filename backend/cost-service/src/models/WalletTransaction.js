// src/models/WalletTransaction.js
export default (sequelize, DataTypes) => {
  const WalletTransaction = sequelize.define('WalletTransaction', {
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
      type: DataTypes.ENUM('deposit', 'withdraw', 'transfer', 'refund'),
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    relatedPaymentId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'related_payment_id'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'wallet_transactions',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['wallet_id']
      },
      {
        fields: ['related_payment_id']
      },
      {
        fields: ['created_at']
      }
    ]
  });

  WalletTransaction.associate = function(models) {
    WalletTransaction.belongsTo(models.UserWallet, {
      foreignKey: 'walletId',
      as: 'wallet'
    });
    
    WalletTransaction.belongsTo(models.Payment, {
      foreignKey: 'relatedPaymentId',
      as: 'relatedPayment'
    });
  };

  return WalletTransaction;
};