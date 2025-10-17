import { DataTypes } from 'sequelize';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('kyc_verifications', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      id_card_number: {
        type: DataTypes.STRING(20),
        unique: true,
        allowNull: true
      },
      id_card_front_url: {
        type: DataTypes.STRING(500),
        allowNull: true
      },
      id_card_back_url: {
        type: DataTypes.STRING(500),
        allowNull: true
      },
      driver_license_number: {
        type: DataTypes.STRING(20),
        allowNull: true
      },
      driver_license_url: {
        type: DataTypes.STRING(500),
        allowNull: true
      },
      verification_status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending'
      },
      verified_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      verified_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      rejection_reason: {
        type: DataTypes.TEXT,
        allowNull: true
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

    await queryInterface.addIndex('kyc_verifications', ['user_id']);
    await queryInterface.addIndex('kyc_verifications', ['verification_status']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('kyc_verifications');
  }
};