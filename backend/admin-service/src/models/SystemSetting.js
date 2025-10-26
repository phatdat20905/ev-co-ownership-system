// src/models/SystemSetting.js
export default (sequelize, DataTypes) => {
  const SystemSetting = sequelize.define('SystemSetting', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    settingKey: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      field: 'setting_key'
    },
    settingValue: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'setting_value'
    },
    dataType: {
      type: DataTypes.ENUM('string', 'number', 'boolean', 'json'),
      allowNull: false,
      defaultValue: 'string',
      field: 'data_type'
    },
    category: {
      type: DataTypes.ENUM('general', 'notifications', 'billing', 'security', 'analytics'),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_public'
    },
    updatedBy: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'updated_by'
    }
  }, {
    tableName: 'system_settings',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['category']
      },
      {
        fields: ['is_public']
      },
      {
        fields: ['setting_key']
      }
    ]
  });

  // Instance method để parse giá trị theo data type
  SystemSetting.prototype.getParsedValue = function() {
    switch (this.dataType) {
      case 'number':
        return Number(this.settingValue);
      case 'boolean':
        return this.settingValue === 'true';
      case 'json':
        try {
          return JSON.parse(this.settingValue);
        } catch {
          return this.settingValue;
        }
      default:
        return this.settingValue;
    }
  };

  return SystemSetting;
};