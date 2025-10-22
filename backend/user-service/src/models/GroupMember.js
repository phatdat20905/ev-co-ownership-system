// src/models/GroupMember.js
export default (sequelize, DataTypes) => {
  const GroupMember = sequelize.define('GroupMember', {
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
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id'
    },
    ownershipPercentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      field: 'ownership_percentage',
      validate: {
        min: 0.01,
        max: 100
      }
    },
    role: {
      type: DataTypes.ENUM('admin', 'member'),
      defaultValue: 'member',
      validate: {
        isIn: [['admin', 'member']]
      }
    },
    joinedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'joined_at'
    },
    leftAt: {
      type: DataTypes.DATE,
      field: 'left_at'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    }
  }, {
    tableName: 'group_members',
    underscored: true,
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['group_id', 'user_id']
      }
    ]
  });

  return GroupMember;
};