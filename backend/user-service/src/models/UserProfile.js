// src/models/UserProfile.js
export default (sequelize, DataTypes) => {
  const UserProfile = sequelize.define('UserProfile', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      field: 'user_id'
    },
    fullName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'full_name',
      validate: {
        notEmpty: true,
        len: [2, 255]
      }
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      field: 'date_of_birth',
      validate: {
        isDate: true
      }
    },
    address: {
      type: DataTypes.TEXT,
      validate: {
        len: [0, 1000]
      }
    },
    avatarUrl: {
      type: DataTypes.STRING(500),
      field: 'avatar_url',
      validate: {
        isUrl: true
      }
    },
    bio: {
      type: DataTypes.TEXT,
      validate: {
        len: [0, 1000]
      }
    },
    preferences: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    tableName: 'user_profiles',
    underscored: true,
    timestamps: true,
    hooks: {
      beforeValidate: (userProfile) => {
        if (userProfile.preferences && typeof userProfile.preferences === 'string') {
          try {
            userProfile.preferences = JSON.parse(userProfile.preferences);
          } catch (error) {
            throw new Error('Invalid preferences JSON format');
          }
        }
      }
    }
  });

  UserProfile.prototype.getPublicProfile = function() {
    const values = { ...this.get() };
    delete values.preferences;
    return values;
  };

  return UserProfile;
};