// src/migrations/001-create-user-profiles.js
import { DataTypes } from 'sequelize';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_profiles', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: true,
        unique: true
      },
      full_name: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      date_of_birth: {
        type: DataTypes.DATEONLY,
        allowNull: true
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      // avatar_url stores the uploaded avatar filename or full URL as a string
      // (we intentionally store as a plain STRING to allow local URLs or
      // stored filenames). Validation is done by higher-level code when
      // necessary.
      avatar_url: {
        type: DataTypes.STRING(500),
        allowNull: true
      },
      bio: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      preferences: {
        type: DataTypes.JSONB,
        defaultValue: {}
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

    await queryInterface.addIndex('user_profiles', ['user_id'], {
      unique: true,
      name: 'idx_user_profiles_user_id'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('user_profiles');
  }
};