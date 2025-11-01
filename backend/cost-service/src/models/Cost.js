// src/models/Cost.js
export default (sequelize, DataTypes) => {
  const Cost = sequelize.define('Cost', {
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
    vehicleId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'vehicle_id'
    },
    categoryId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'category_id'
    },
    costName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'cost_name'
    },
    totalAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      field: 'total_amount'
    },
    splitType: {
      type: DataTypes.ENUM('ownership_ratio', 'usage_based', 'equal', 'custom'),
      defaultValue: 'ownership_ratio',
      field: 'split_type'
    },
    costDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'cost_date'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'created_by'
    },
    invoiced: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'deleted_at'
    }
  }, {
    tableName: 'costs',
    timestamps: true,
    underscored: true,
    paranoid: true, // Enable soft delete
    indexes: [
      {
        fields: ['group_id']
      },
      {
        fields: ['vehicle_id']
      },
      {
        fields: ['cost_date']
      },
      {
        fields: ['created_by']
      }
    ]
  });

  Cost.associate = function(models) {
    Cost.belongsTo(models.CostCategory, {
      foreignKey: 'categoryId',
      as: 'category'
    });
    
    Cost.hasMany(models.CostSplit, {
      foreignKey: 'costId',
      as: 'splits'
    });
    
    Cost.hasMany(models.InvoiceItem, {
      foreignKey: 'costId',
      as: 'invoiceItems'
    });
  };

  return Cost;
};