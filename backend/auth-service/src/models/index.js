import User from './User.js';
import KYCVerification from './KYCVerification.js';
import RefreshToken from './RefreshToken.js';
import PasswordReset from './PasswordReset.js';

// Define associations
User.hasOne(KYCVerification, { foreignKey: 'userId', as: 'kyc' });
KYCVerification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(RefreshToken, { foreignKey: 'userId', as: 'refreshTokens' });
RefreshToken.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(PasswordReset, { foreignKey: 'userId', as: 'passwordResets' });
PasswordReset.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(KYCVerification, { foreignKey: 'verifiedBy', as: 'verifiedKyc' });
KYCVerification.belongsTo(User, { foreignKey: 'verifiedBy', as: 'verifier' });

export {
  User,
  KYCVerification,
  RefreshToken,
  PasswordReset
};

export default {
  User,
  KYCVerification,
  RefreshToken,
  PasswordReset
};