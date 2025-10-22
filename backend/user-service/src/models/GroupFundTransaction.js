// src/models/GroupFundTransaction.js
export default (sequelize, DataTypes) => {
  const GroupFundTransaction = sequelize.define('GroupFundTransaction', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    groupId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'group_id'
    },
    transactionType: {
      type: DataTypes.ENUM('deposit', 'withdrawal', 'allocation'),
      allowNull: false,
      field: 'transaction_type'
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      validate: {
        min: 0.01
      }
    },
    description: {
      type: DataTypes.TEXT
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'created_by'
    }
  }, {
    tableName: 'group_fund_transactions',
    underscored: true,
    timestamps: true,
    updatedAt: false
  });

  return GroupFundTransaction;
};