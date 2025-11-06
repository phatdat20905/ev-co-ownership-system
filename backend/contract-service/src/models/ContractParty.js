// src/models/ContractParty.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const ContractParty = sequelize.define('ContractParty', {
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
    party_role: {
      type: DataTypes.ENUM('owner', 'co_owner', 'witness', 'legal_representative'),
      allowNull: false,
      field: 'party_role'
    },
    ownership_percentage: {
      type: DataTypes.DECIMAL(5, 2),
      field: 'ownership_percentage'
    },
    signing_order: {
      type: DataTypes.INTEGER,
      field: 'signing_order'
    },
    has_signed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'has_signed'
    },
    signed_at: {
      type: DataTypes.DATE,
      field: 'signed_at'
    },
    signature_data: {
      type: DataTypes.TEXT,
      field: 'signature_data'
    }
  }, {
    tableName: 'contract_parties',
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
        fields: ['contract_id', 'user_id'],
        unique: true
      }
    ]
  });

  ContractParty.associate = (models) => {
    ContractParty.belongsTo(models.Contract, {
      foreignKey: 'contract_id',
      as: 'contract'
    });
  };

  return ContractParty;
};