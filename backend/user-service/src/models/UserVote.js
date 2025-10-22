// src/models/UserVote.js
export default (sequelize, DataTypes) => {
  const UserVote = sequelize.define('UserVote', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    voteId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'vote_id'
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id'
    },
    optionId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'option_id'
    },
    votedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'voted_at'
    }
  }, {
    tableName: 'user_votes',
    underscored: true,
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['vote_id', 'user_id']
      }
    ]
  });

  return UserVote;
};