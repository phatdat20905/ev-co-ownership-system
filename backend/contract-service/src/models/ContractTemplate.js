// src/models/ContractTemplate.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const ContractTemplate = sequelize.define('ContractTemplate', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    template_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    template_type: {
      type: DataTypes.ENUM('co_ownership', 'amendment', 'termination'),
      allowNull: false,
      field: 'template_type'
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    variables: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    },
    version: {
      type: DataTypes.STRING(20),
      defaultValue: '1.0'
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'created_by'
    }
  }, {
    tableName: 'contract_templates',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['template_type']
      },
      {
        fields: ['is_active']
      }
    ]
  });

  return ContractTemplate;
};