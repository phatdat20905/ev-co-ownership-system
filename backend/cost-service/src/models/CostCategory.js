// src/models/CostCategory.js
export default (sequelize, DataTypes) => {
  const CostCategory = sequelize.define('CostCategory', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    categoryName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      field: 'category_name'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isRecurring: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_recurring'
    }
  }, {
    tableName: 'cost_categories',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['category_name']
      }
    ]
  });

  CostCategory.associate = function(models) {
    CostCategory.hasMany(models.Cost, {
      foreignKey: 'categoryId',
      as: 'costs'
    });
  };

  return CostCategory;
};