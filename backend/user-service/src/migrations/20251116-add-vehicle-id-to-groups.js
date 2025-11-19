// Migration: Add vehicle_id column to co_ownership_groups table
export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn('co_ownership_groups', 'vehicle_id', {
    type: Sequelize.UUID,
    allowNull: true,
    comment: 'Reference to vehicle in vehicle-service',
    after: 'group_fund_balance'
  });

  console.log('✅ Added vehicle_id column to co_ownership_groups table');
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn('co_ownership_groups', 'vehicle_id');
  
  console.log('✅ Removed vehicle_id column from co_ownership_groups table');
}
