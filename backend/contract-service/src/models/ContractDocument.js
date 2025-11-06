// src/models/ContractDocument.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const ContractDocument = sequelize.define('ContractDocument', {
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
    document_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    document_type: {
      type: DataTypes.STRING(50)
    },
    file_url: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    file_size: {
      type: DataTypes.INTEGER
    },
    mime_type: {
      type: DataTypes.STRING(100)
    },
    uploaded_by: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'uploaded_by'
    }
  }, {
    tableName: 'contract_documents',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['contract_id']
      }
    ]
  });

  ContractDocument.associate = (models) => {
    ContractDocument.belongsTo(models.Contract, {
      foreignKey: 'contract_id',
      as: 'contract'
    });
  };

  return ContractDocument;
};