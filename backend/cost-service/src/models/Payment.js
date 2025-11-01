// src/models/Payment.js
export default (sequelize, DataTypes) => {
  const Payment = sequelize.define('Payment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    costSplitId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'cost_split_id'
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id'
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false
    },
    paymentMethod: {
      type: DataTypes.ENUM('e_wallet', 'vnpay', 'bank_transfer', 'internal_wallet'),
      allowNull: false,
      field: 'payment_method'
    },
    providerName: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'provider_name'
    },
    transactionId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'transaction_id'
    },
    orderRef: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'order_ref'
    },
    paymentStatus: {
      type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
      defaultValue: 'pending',
      field: 'payment_status'
    },
    paymentUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'payment_url'
    },
    gatewayResponse: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'gateway_response'
    },
    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    paymentDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'payment_date'
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'deleted_at'
    }
  }, {
    tableName: 'payments',
    timestamps: true,
    underscored: true,
    paranoid: true,
    indexes: [
      {
        fields: ['cost_split_id']
      },
      {
        fields: ['user_id']
      },
      {
        fields: ['payment_status']
      },
      {
        fields: ['transaction_id']
      }
    ]
  });

  Payment.associate = function(models) {
    Payment.belongsTo(models.CostSplit, {
      foreignKey: 'costSplitId',
      as: 'costSplit'
    });
    
    Payment.hasMany(models.WalletTransaction, {
      foreignKey: 'relatedPaymentId',
      as: 'walletTransactions'
    });
  };

  return Payment;
};