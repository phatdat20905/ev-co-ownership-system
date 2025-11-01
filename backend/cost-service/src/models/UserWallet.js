// src/models/UserWallet.js
export default (sequelize, DataTypes) => {
  const UserWallet = sequelize.define('UserWallet', {
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
    balance: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0
    },
    currency: {
      type: DataTypes.STRING(10),
      defaultValue: 'VND'
    }
  }, {
    tableName: 'user_wallets',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['user_id'],
        unique: true
      }
    ]
  });

  UserWallet.associate = function(models) {
    UserWallet.hasMany(models.WalletTransaction, {
      foreignKey: 'walletId',
      as: 'transactions'
    });
  };

  return UserWallet;
};