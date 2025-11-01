// src/models/GroupWallet.js
export default (sequelize, DataTypes) => {
  const GroupWallet = sequelize.define('GroupWallet', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    groupId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      field: 'group_id'
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
    tableName: 'group_wallets',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['group_id'],
        unique: true
      }
    ]
  });

  GroupWallet.associate = function(models) {
    GroupWallet.hasMany(models.GroupWalletTransaction, {
      foreignKey: 'walletId',
      as: 'transactions'
    });
  };

  return GroupWallet;
};