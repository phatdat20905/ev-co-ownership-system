// src/migrations/002-create-contract-parties.js
import { DataTypes } from 'sequelize';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('contract_parties', {
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
      user_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      party_role: {
        type: DataTypes.ENUM('owner', 'co_owner', 'witness', 'legal_representative'),
        allowNull: false
      },
      ownership_percentage: {
        type: DataTypes.DECIMAL(5, 2)
      },
      signing_order: {
        type: DataTypes.INTEGER
      },
      has_signed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      signed_at: {
        type: DataTypes.DATE
      },
      signature_data: {
        type: DataTypes.TEXT
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

    await queryInterface.addIndex('contract_parties', ['contract_id']);
    await queryInterface.addIndex('contract_parties', ['user_id']);
    await queryInterface.addIndex('contract_parties', ['contract_id', 'user_id'], {
      unique: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('contract_parties');
  }
};