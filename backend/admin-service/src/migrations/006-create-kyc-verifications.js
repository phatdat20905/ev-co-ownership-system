// src/migrations/006-create-kyc-verifications.js
import { DataTypes } from 'sequelize';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('kyc_verifications', {
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
      id_card_number: {
        type: DataTypes.STRING(20)
      },
      id_card_front_url: {
        type: DataTypes.STRING(500)
      },
      id_card_back_url: {
        type: DataTypes.STRING(500)
      },
      driver_license_number: {
        type: DataTypes.STRING(20)
      },
      driver_license_url: {
        type: DataTypes.STRING(500)
      },
      verification_status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'pending'
      },
      verified_by: {
        type: DataTypes.UUID,
        references: {
          model: 'staff_profiles',
          key: 'id'
        }
      },
      verified_at: {
        type: DataTypes.DATE
      },
      rejection_reason: {
        type: DataTypes.TEXT
      },
      submitted_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
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

    await queryInterface.addIndex('kyc_verifications', ['verification_status']);
    await queryInterface.addIndex('kyc_verifications', ['user_id']);
    await queryInterface.addIndex('kyc_verifications', ['verified_by']);
    await queryInterface.addIndex('kyc_verifications', ['submitted_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('kyc_verifications');
  }
};