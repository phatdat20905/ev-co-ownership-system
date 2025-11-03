import { DataTypes } from 'sequelize';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_preferences', {
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
      preferences: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {
          email: true,
          push: true,
          sms: false,
          in_app: true
        }
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    });

    await queryInterface.addIndex('user_preferences', ['user_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('user_preferences');
  }
};
