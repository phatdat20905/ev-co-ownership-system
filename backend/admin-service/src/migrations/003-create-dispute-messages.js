// src/migrations/003-create-dispute-messages.js
import { DataTypes } from 'sequelize';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('dispute_messages', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      dispute_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'disputes',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      sender_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      message_type: {
        type: DataTypes.ENUM('text', 'system', 'resolution'),
        allowNull: false,
        defaultValue: 'text',
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      attachments: {
        type: DataTypes.JSONB,
      },
      is_internal: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });

    // 🔹 Thêm index để tối ưu truy vấn
    await queryInterface.addIndex('dispute_messages', ['dispute_id']);
    await queryInterface.addIndex('dispute_messages', ['created_at']);
    await queryInterface.addIndex('dispute_messages', ['sender_id']);
  },

  async down(queryInterface, Sequelize) {
    // Xoá ENUM trước (Postgres cần cleanup thủ công)
    await queryInterface.removeIndex('dispute_messages', ['dispute_id']);
    await queryInterface.removeIndex('dispute_messages', ['created_at']);
    await queryInterface.removeIndex('dispute_messages', ['sender_id']);
    await queryInterface.dropTable('dispute_messages');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_dispute_messages_message_type";');
  },
};
