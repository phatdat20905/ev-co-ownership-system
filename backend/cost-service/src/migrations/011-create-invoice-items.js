// src/migrations/011-create-invoice-items.js
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('invoice_items', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false
      },
      invoice_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'invoices',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      cost_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'costs',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      item_description: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      amount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('invoice_items', ['invoice_id'], {
      name: 'idx_invoice_items_invoice_id'
    });
    await queryInterface.addIndex('invoice_items', ['cost_id'], {
      name: 'idx_invoice_items_cost_id'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('invoice_items');
  }
};