import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'booking_db',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres123',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5434,
    dialect: 'postgres',
    logging: console.log
  }
);

async function runMigration() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');

    const [results] = await sequelize.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name='check_in_out_logs' AND column_name='performed_at'"
    );

    if (results.length === 0) {
      console.log('Adding performed_at column...');
      
      await sequelize.query(`
        ALTER TABLE check_in_out_logs 
        ADD COLUMN performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      `);

      await sequelize.query(`
        UPDATE check_in_out_logs 
        SET performed_at = created_at 
        WHERE performed_at IS NULL
      `);

      console.log('✓ Column performed_at added successfully');
    } else {
      console.log('✓ Column performed_at already exists');
    }

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
