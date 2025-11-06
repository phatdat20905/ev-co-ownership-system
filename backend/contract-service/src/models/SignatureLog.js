// src/models/SignatureLog.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const SignatureLog = sequelize.define('SignatureLog', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    contract_id: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'contract_id'
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id'
    },
    signature_data: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    signed_at: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'signed_at'
    },
    ip_address: {
      type: DataTypes.STRING(45)
    },
    user_agent: {
      type: DataTypes.TEXT
    }
  }, {
    tableName: 'signature_logs',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['contract_id']
      },
      {
        fields: ['user_id']
      },
      {
        fields: ['signed_at']
      }
    ]
  });

  SignatureLog.associate = (models) => {
    SignatureLog.belongsTo(models.Contract, {
      foreignKey: 'contract_id',
      as: 'contract'
    });
  };

  return SignatureLog;
};