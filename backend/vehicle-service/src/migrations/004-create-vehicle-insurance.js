// src/migrations/004-create-vehicle-insurance.js
import { DataTypes } from 'sequelize';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('vehicle_insurance', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      vehicle_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'vehicles',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      insurance_provider: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      policy_number: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
      },
      coverage_type: {
        type: DataTypes.STRING(100)
      },
      premium_amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
      },
      start_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      end_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      document_url: {
        type: DataTypes.STRING(500)
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('vehicle_insurance', ['vehicle_id']);
    await queryInterface.addIndex('vehicle_insurance', ['end_date']);
    await queryInterface.addIndex('vehicle_insurance', ['is_active']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('vehicle_insurance');
  }
};