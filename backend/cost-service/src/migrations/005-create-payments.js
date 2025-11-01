// src/migrations/005-create-payments.js
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('payments', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false
      },
      cost_split_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'cost_splits',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false
      },
      amount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false
      },
      payment_method: {
        type: Sequelize.ENUM('e_wallet', 'vnpay', 'bank_transfer', 'internal_wallet'),
        allowNull: false
      },
      provider_name: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      transaction_id: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      order_ref: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      payment_status: {
        type: Sequelize.ENUM('pending', 'completed', 'failed', 'refunded'),
        defaultValue: 'pending',
        allowNull: false
      },
      payment_url: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      gateway_response: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      payment_date: {
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
    await queryInterface.addIndex('payments', ['cost_split_id'], {
      name: 'idx_payments_cost_split_id'
    });
    await queryInterface.addIndex('payments', ['user_id'], {
      name: 'idx_payments_user_id'
    });
    await queryInterface.addIndex('payments', ['payment_status'], {
      name: 'idx_payments_payment_status'
    });
    await queryInterface.addIndex('payments', ['transaction_id'], {
      name: 'idx_payments_transaction_id'
    });
    await queryInterface.addIndex('payments', ['order_ref'], {
      name: 'idx_payments_order_ref'
    });
    await queryInterface.addIndex('payments', ['payment_method'], {
      name: 'idx_payments_payment_method'
    });
    await queryInterface.addIndex('payments', ['deleted_at'], {
      name: 'idx_payments_deleted_at'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('payments');
  }
};