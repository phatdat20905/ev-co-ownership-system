// src/migrations/002-create-templates.js
import { DataTypes } from 'sequelize';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('notification_templates', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
      },
      type: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      subject: {
        type: DataTypes.STRING(255)
      },
      body: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      // ✅ đổi sang JSONB cho an toàn & tương thích khi seed
      channels: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: ['email']
      },
      variables: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: []
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
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

    await queryInterface.addIndex('notification_templates', ['type']);
    await queryInterface.addIndex('notification_templates', ['is_active']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('notification_templates');
  }
};
