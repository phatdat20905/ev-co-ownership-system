// src/models/GroupVote.js
export default (sequelize, DataTypes) => {
  const GroupVote = sequelize.define('GroupVote', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    groupId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'group_id'
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [5, 255]
      }
    },
    description: {
      type: DataTypes.TEXT
    },
    voteType: {
      type: DataTypes.ENUM('upgrade', 'maintenance', 'insurance', 'sell_vehicle', 'other'),
      allowNull: false,
      field: 'vote_type'
    },
    status: {
      type: DataTypes.ENUM('open', 'closed', 'executed'),
      defaultValue: 'open'
    },
    deadline: {
      type: DataTypes.DATE,
      allowNull: false
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'created_by'
    },
    closedAt: {
      type: DataTypes.DATE,
      field: 'closed_at'
    }
  }, {
    tableName: 'group_votes',
    underscored: true,
    timestamps: true
  });

  return GroupVote;
};