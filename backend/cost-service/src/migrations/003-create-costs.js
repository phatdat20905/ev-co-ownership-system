// src/migrations/003-create-costs.js
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('costs', {
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
      vehicle_id: {
        type: Sequelize.UUID,
        allowNull: false
      },
      category_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'cost_categories',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      cost_name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      total_amount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false
      },
      split_type: {
        type: Sequelize.ENUM('ownership_ratio', 'usage_based', 'equal', 'custom'),
        defaultValue: 'ownership_ratio',
        allowNull: false
      },
      cost_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_by: {
        type: Sequelize.UUID,
        allowNull: false
      },
      invoiced: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
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
    await queryInterface.addIndex('costs', ['group_id'], {
      name: 'idx_costs_group_id'
    });
    await queryInterface.addIndex('costs', ['vehicle_id'], {
      name: 'idx_costs_vehicle_id'
    });
    await queryInterface.addIndex('costs', ['category_id'], {
      name: 'idx_costs_category_id'
    });
    await queryInterface.addIndex('costs', ['cost_date'], {
      name: 'idx_costs_date'
    });
    await queryInterface.addIndex('costs', ['created_by'], {
      name: 'idx_costs_created_by'
    });
    await queryInterface.addIndex('costs', ['deleted_at'], {
      name: 'idx_costs_deleted_at'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('costs');
  }
};