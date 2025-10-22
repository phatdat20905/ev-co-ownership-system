// src/models/VoteOption.js
export default (sequelize, DataTypes) => {
  const VoteOption = sequelize.define('VoteOption', {
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
    optionText: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'option_text',
      validate: {
        notEmpty: true,
        len: [1, 255]
      }
    },
    voteCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'vote_count',
      validate: {
        min: 0
      }
    }
  }, {
    tableName: 'vote_options',
    underscored: true,
    timestamps: false
  });

  return VoteOption;
};