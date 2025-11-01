// src/migrations/004-create-cost-splits.js
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('cost_splits', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false
      },
      cost_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'costs',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false
      },
      split_amount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false
      },
      paid_amount: {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0,
        allowNull: false
      },
      payment_status: {
        type: Sequelize.ENUM('pending', 'paid', 'overdue', 'partial'),
        defaultValue: 'pending',
        allowNull: false
      },
      due_date: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      paid_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // Add indexes
    await queryInterface.addIndex('cost_splits', ['cost_id'], {
      name: 'idx_cost_splits_cost_id'
    });
    await queryInterface.addIndex('cost_splits', ['user_id'], {
      name: 'idx_cost_splits_user_id'
    });
    await queryInterface.addIndex('cost_splits', ['payment_status'], {
      name: 'idx_cost_splits_payment_status'
    });
    await queryInterface.addIndex('cost_splits', ['due_date'], {
      name: 'idx_cost_splits_due_date'
    });
    await queryInterface.addIndex('cost_splits', ['deleted_at'], {
      name: 'idx_cost_splits_deleted_at'
    });

    // Add unique constraint to prevent duplicate splits
    await queryInterface.addConstraint('cost_splits', {
      fields: ['cost_id', 'user_id'],
      type: 'unique',
      name: 'unique_cost_user_split'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('cost_splits');
  }
};