// src/migrations/001-create-staff-profiles.js
import { DataTypes } from 'sequelize';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('staff_profiles', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true
      },
      employee_id: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
      },
      position: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      department: {
        type: DataTypes.ENUM('support', 'finance', 'operations', 'admin'),
        allowNull: false
      },
      permissions: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {
          user_management: false,
          dispute_management: false,
          kyc_approval: false,
          system_settings: false,
          reports_view: false,
          analytics_view: false
        }
      },
      hire_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
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

    await queryInterface.addIndex('staff_profiles', ['department']);
    await queryInterface.addIndex('staff_profiles', ['is_active']);
    await queryInterface.addIndex('staff_profiles', ['user_id']);
    await queryInterface.addIndex('staff_profiles', ['created_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('staff_profiles');
  }
};