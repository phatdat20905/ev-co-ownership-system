// src/migrations/009-create-group-wallet-transactions.js
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('group_wallet_transactions', {
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
          model: 'group_wallets',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      type: {
        type: Sequelize.ENUM('deposit', 'withdraw', 'expense', 'refund'),
        allowNull: false
      },
      amount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      reference_id: {
        type: Sequelize.UUID,
        allowNull: true
      },
      created_by: {
        type: Sequelize.UUID,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('group_wallet_transactions', ['wallet_id'], {
      name: 'idx_group_wallet_transactions_wallet_id'
    });
    await queryInterface.addIndex('group_wallet_transactions', ['type'], {
      name: 'idx_group_wallet_transactions_type'
    });
    await queryInterface.addIndex('group_wallet_transactions', ['created_at'], {
      name: 'idx_group_wallet_transactions_created_at'
    });
    await queryInterface.addIndex('group_wallet_transactions', ['reference_id'], {
      name: 'idx_group_wallet_transactions_reference_id'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('group_wallet_transactions');
  }
};