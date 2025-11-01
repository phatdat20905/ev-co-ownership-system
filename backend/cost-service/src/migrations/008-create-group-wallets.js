// src/migrations/008-create-group-wallets.js
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('group_wallets', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true,
        allowNull: false
      },
      group_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true
      },
      balance: {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0,
        allowNull: false
      },
      currency: {
        type: Sequelize.STRING(10),
        defaultValue: 'VND',
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
      }
    });

    // Add indexes
    await queryInterface.addIndex('group_wallets', ['group_id'], {
      name: 'idx_group_wallets_group_id',
      unique: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('group_wallets');
  }
};