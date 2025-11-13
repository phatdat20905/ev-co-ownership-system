// migrations/20251110-add-phone-to-user-profile.js
export const up = async (queryInterface, Sequelize) => {
  await queryInterface.addColumn('user_profiles', 'phone_number', {
    type: Sequelize.STRING(20),
    allowNull: true,
    after: 'gender'
  });
  
  await queryInterface.addColumn('user_profiles', 'email', {
    type: Sequelize.STRING(255),
    allowNull: true,
    after: 'phone_number'
  });
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.removeColumn('user_profiles', 'email');
  await queryInterface.removeColumn('user_profiles', 'phone_number');
};
