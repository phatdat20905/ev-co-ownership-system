// src/migrations/007-create-wallet-transactions.js
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('wallet_transactions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false
      },
      wallet_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'user_wallets',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      type: {
        type: Sequelize.ENUM('deposit', 'withdraw', 'transfer', 'refund'),
        allowNull: false
      },
      amount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false
      },
      related_payment_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'payments',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('wallet_transactions', ['wallet_id'], {
      name: 'idx_wallet_transactions_wallet_id'
    });
    await queryInterface.addIndex('wallet_transactions', ['related_payment_id'], {
      name: 'idx_wallet_transactions_related_payment_id'
    });
    await queryInterface.addIndex('wallet_transactions', ['type'], {
      name: 'idx_wallet_transactions_type'
    });
    await queryInterface.addIndex('wallet_transactions', ['created_at'], {
      name: 'idx_wallet_transactions_created_at'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('wallet_transactions');
  }
};