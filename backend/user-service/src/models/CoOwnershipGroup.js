// src/models/CoOwnershipGroup.js
export default (sequelize, DataTypes) => {
  const CoOwnershipGroup = sequelize.define('CoOwnershipGroup', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    groupName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'group_name',
      validate: {
        notEmpty: true,
        len: [2, 255]
      }
    },
    description: {
      type: DataTypes.TEXT,
      validate: {
        len: [0, 1000]
      }
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'created_by'
    },
    groupFundBalance: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
      field: 'group_fund_balance',
      validate: {
        min: 0
      }
    },
    vehicleId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'vehicle_id',
      comment: 'Reference to vehicle in vehicle-service'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    }
  }, {
    tableName: 'co_ownership_groups',
    underscored: true,
    timestamps: true,
    hooks: {
      beforeUpdate: (group) => {
        if (group.groupFundBalance < 0) {
          throw new Error('Group fund balance cannot be negative');
        }
      }
    }
  });

  return CoOwnershipGroup;
};