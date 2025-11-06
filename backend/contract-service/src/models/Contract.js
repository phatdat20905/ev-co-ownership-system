// src/models/Contract.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Contract = sequelize.define('Contract', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    group_id: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'group_id'
    },
    contract_type: {
      type: DataTypes.ENUM('co_ownership', 'amendment', 'termination', 'renewal'),
      allowNull: false,
      field: 'contract_type'
    },
    contract_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('draft', 'pending_signatures', 'active', 'expired', 'terminated', 'executed'),
      defaultValue: 'draft'
    },
    effective_date: {
      type: DataTypes.DATEONLY,
      field: 'effective_date'
    },
    expiry_date: {
      type: DataTypes.DATEONLY,
      field: 'expiry_date'
    },
    auto_renew: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'auto_renew'
    },
    version: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    parent_contract_id: {
      type: DataTypes.UUID,
      field: 'parent_contract_id'
    },
    activated_at: {
      type: DataTypes.DATE,
      field: 'activated_at'
    },
    terminated_at: {
      type: DataTypes.DATE,
      field: 'terminated_at'
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'created_by'
    }
  }, {
    tableName: 'contracts',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['group_id']
      },
      {
        fields: ['status']
      },
      {
        fields: ['expiry_date']
      },
      {
        fields: ['contract_number']
      }
    ]
  });

  Contract.associate = (models) => {
    Contract.hasMany(models.ContractParty, {
      foreignKey: 'contract_id',
      as: 'parties'
    });
    
    Contract.hasMany(models.ContractDocument, {
      foreignKey: 'contract_id',
      as: 'documents'
    });
    
    Contract.hasMany(models.SignatureLog, {
      foreignKey: 'contract_id',
      as: 'signature_logs'
    });
    
    Contract.hasMany(models.ContractAmendment, {
      foreignKey: 'original_contract_id',
      as: 'amendments'
    });
    
    Contract.belongsTo(models.Contract, {
      foreignKey: 'parent_contract_id',
      as: 'parent_contract'
    });
  };

  return Contract;
};