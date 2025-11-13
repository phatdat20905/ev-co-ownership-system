// src/migrations/007-create-user-votes.js
import { DataTypes } from 'sequelize';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_votes', {
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
      user_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      option_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'vote_options',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      voted_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    });

    await queryInterface.addIndex('user_votes', ['vote_id', 'user_id'], {
      unique: true,
      name: 'idx_user_votes_unique'
    });

    await queryInterface.addIndex('user_votes', ['vote_id'], {
      name: 'idx_user_votes_vote_id'
    });

    await queryInterface.addIndex('user_votes', ['user_id'], {
      name: 'idx_user_votes_user_id'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('user_votes');
  }
};