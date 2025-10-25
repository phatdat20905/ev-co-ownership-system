// src/models/ContractAmendment.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const ContractAmendment = sequelize.define('ContractAmendment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    original_contract_id: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'original_contract_id'
    },
    amendment_contract_id: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'amendment_contract_id'
    },
    amendment_reason: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    changes_summary: {
      type: DataTypes.TEXT
    }
  }, {
    tableName: 'contract_amendments',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['original_contract_id']
      },
      {
        fields: ['amendment_contract_id'],
        unique: true
      }
    ]
  });

  ContractAmendment.associate = (models) => {
    ContractAmendment.belongsTo(models.Contract, {
      foreignKey: 'original_contract_id',
      as: 'original_contract'
    });
    
    ContractAmendment.belongsTo(models.Contract, {
      foreignKey: 'amendment_contract_id',
      as: 'amendment_contract'
    });
  };

  return ContractAmendment;
};