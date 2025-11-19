import { DataTypes } from 'sequelize';

export default {
  async up(queryInterface, Sequelize) {
    // Check if column exists first
    const tableDescription = await queryInterface.describeTable('check_in_out_logs');
    
    if (!tableDescription.performed_at) {
      await queryInterface.addColumn('check_in_out_logs', 'performed_at', {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      });

      // Update existing rows to use created_at as performed_at
      await queryInterface.sequelize.query(
        'UPDATE check_in_out_logs SET performed_at = created_at WHERE performed_at IS NULL'
      );

      console.log('Added performed_at column to check_in_out_logs');
    } else {
      console.log('performed_at column already exists in check_in_out_logs');
    }
  },

  async down(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('check_in_out_logs');
    
    if (tableDescription.performed_at) {
      await queryInterface.removeColumn('check_in_out_logs', 'performed_at');
    }
  }
};
