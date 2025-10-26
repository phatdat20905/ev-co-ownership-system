// src/migrations/004-create-audit-logs.js
import { DataTypes } from 'sequelize';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('audit_logs', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: true
      },
      user_role: {
        type: DataTypes.STRING(20),
        allowNull: true
      },
      action: {
        type: DataTypes.STRING(100),
        allowNull: false
      },
      entity_type: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      entity_id: {
        type: DataTypes.UUID,
        allowNull: true
      },
      old_values: {
        type: DataTypes.JSONB,
        allowNull: true
      },
      new_values: {
        type: DataTypes.JSONB,
        allowNull: true
      },
      ip_address: {
        type: DataTypes.INET,
        allowNull: true
      },
      user_agent: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    });

    // 🔹 Thêm index (mỗi cái có tên riêng, tránh trùng)
    await queryInterface.addIndex('audit_logs', ['user_id'], {
      name: 'idx_audit_logs_user_id'
    });

    await queryInterface.addIndex('audit_logs', ['action'], {
      name: 'idx_audit_logs_action'
    });

    await queryInterface.addIndex('audit_logs', ['entity_type', 'entity_id'], {
      name: 'idx_audit_logs_entity'
    });

    await queryInterface.addIndex('audit_logs', ['user_role'], {
      name: 'idx_audit_logs_user_role'
    });

    // 🔹 Index DESC cho truy vấn log mới nhất
    await queryInterface.addIndex('audit_logs', ['created_at'], {
      name: 'idx_audit_logs_created_at_desc',
      order: [['created_at', 'DESC']]
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('audit_logs');
  }
};
