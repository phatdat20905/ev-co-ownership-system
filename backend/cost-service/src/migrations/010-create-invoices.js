// src/migrations/010-create-invoices.js
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('invoices', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false
      },
      group_id: {
        type: Sequelize.UUID,
        allowNull: false
      },
      invoice_number: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      invoice_period_start: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      invoice_period_end: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      total_amount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('unpaid', 'paid', 'overdue', 'cancelled'),
        defaultValue: 'unpaid',
        allowNull: false
      },
      generated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      due_date: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      paid_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      pdf_url: {
        type: Sequelize.STRING(500),
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
    await queryInterface.addIndex('invoices', ['group_id'], {
      name: 'idx_invoices_group_id'
    });
    await queryInterface.addIndex('invoices', ['invoice_number'], {
      name: 'idx_invoices_invoice_number',
      unique: true
    });
    await queryInterface.addIndex('invoices', ['status'], {
      name: 'idx_invoices_status'
    });
    await queryInterface.addIndex('invoices', ['invoice_period_start', 'invoice_period_end'], {
      name: 'idx_invoices_period'
    });
    await queryInterface.addIndex('invoices', ['due_date'], {
      name: 'idx_invoices_due_date'
    });
    await queryInterface.addIndex('invoices', ['deleted_at'], {
      name: 'idx_invoices_deleted_at'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('invoices');
  }
};