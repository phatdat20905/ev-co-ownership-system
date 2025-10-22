// src/migrations/006-create-vote-options.js
import { DataTypes } from 'sequelize';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('vote_options', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      vote_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'group_votes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      option_text: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      vote_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
      }
    });

    await queryInterface.addIndex('vote_options', ['vote_id'], {
      name: 'idx_vote_options_vote_id'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('vote_options');
  }
};