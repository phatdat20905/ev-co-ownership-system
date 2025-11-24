// src/migrations/003-create-contract-documents.js
import { DataTypes } from 'sequelize';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('contract_documents', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      contract_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'contracts',
          key: 'id'
        },
        onDelete: 'CASCADE'
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
        allowNull: false
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    });

    await queryInterface.addIndex('contract_documents', ['contract_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('contract_documents');
  }
};