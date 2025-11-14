#!/usr/bin/env node
/**
 * 🌱 MASTER SEED SCRIPT
 * Run all seed files across all microservices in correct order
 * 
 * Usage: npm run seed:all
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}\n`)
};

// Define services and their seed order
const seedOrder = [
  {
    name: 'Auth Service',
    path: 'backend/auth-service',
    description: 'Users & KYC verification'
  },
  {
    name: 'User Service',
    path: 'backend/user-service',
    description: 'Profiles, Groups & Members'
  },
  {
    name: 'Vehicle Service',
    path: 'backend/vehicle-service',
    description: 'Vehicles & Maintenance'
  },
  {
    name: 'Booking Service',
    path: 'backend/booking-service',
    description: 'Bookings & Check-in/out logs'
  },
  {
    name: 'Cost Service',
    path: 'backend/cost-service',
    description: 'Costs, Splits & Wallets'
  },
  {
    name: 'Contract Service',
    path: 'backend/contract-service',
    description: 'Contracts & Templates'
  },
  {
    name: 'Notification Service',
    path: 'backend/notification-service',
    description: 'Templates & Preferences'
  },
  {
    name: 'Admin Service',
    path: 'backend/admin-service',
    description: 'Staff, Disputes & Settings'
  }
];

async function runSeed(service) {
  log.header(`📦 Seeding ${service.name} - ${service.description}`);
  
  const servicePath = path.join(__dirname, '..', service.path);
  
  try {
    // Run migration first (in case not run yet)
    log.info(`Running migrations for ${service.name}...`);
    await execAsync('npm run migrate', { cwd: servicePath });
    
    // Run seed
    log.info(`Running seeders for ${service.name}...`);
    const { stdout, stderr } = await execAsync('npm run seed', { cwd: servicePath });
    
    if (stdout) console.log(stdout);
    if (stderr && !stderr.includes('Deprecation')) log.warning(stderr);
    
    log.success(`${service.name} seeded successfully\n`);
    return true;
  } catch (error) {
    log.error(`Failed to seed ${service.name}`);
    console.error(error.message);
    return false;
  }
}

async function runAllSeeds() {
  log.header('🌱 EV CO-OWNERSHIP SYSTEM - MASTER SEED SCRIPT 🌱');
  log.info('This will seed all microservices with sample data');
  log.info('Make sure all databases are created and services are configured\n');
  
  const startTime = Date.now();
  let successCount = 0;
  let failCount = 0;
  
  for (const service of seedOrder) {
    const success = await runSeed(service);
    if (success) {
      successCount++;
    } else {
      failCount++;
      log.warning(`Continuing with next service...\n`);
    }
  }
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  
  log.header('📊 SEED SUMMARY');
  log.success(`Successfully seeded: ${successCount}/${seedOrder.length} services`);
  if (failCount > 0) {
    log.error(`Failed: ${failCount} services`);
  }
  log.info(`Total time: ${duration}s`);
  
  log.header('✨ Sample Data Created:');
  console.log(`
  👥 Users:
     - 2 Admins
     - 3 Staff
     - 13 Co-owners (verified)
     - 2 New users (pending KYC)
  
  🚗 Vehicles:
     - 1 Tesla Model 3
     - 1 VinFast VF e34
     - 1 Hyundai Ioniq 5
  
  👨‍👩‍👧‍👦 Groups:
     - 3 Co-ownership groups
     - 12 Group members
  
  📅 Bookings:
     - 3 Completed bookings
     - 3 Confirmed (upcoming)
     - 2 Pending approval
     - 1 In-use (active now)
     - 1 Cancelled
  
  💰 Financial:
     - User wallets with balances
     - Group wallets with funds
     - Cost splits & payments
  
  📄 Contracts:
     - Contract templates
     - Signed contracts
  
  🔔 Notifications:
     - Email/SMS templates
     - User preferences
  
  👨‍💼 Admin:
     - Staff accounts
     - Sample disputes
     - System settings
  `);
  
  log.header('🚀 Next Steps:');
  console.log(`
  1. Start all services:
     ${colors.cyan}npm run dev${colors.reset} (in each service folder)
     
  2. Start frontend:
     ${colors.cyan}cd frontend && npm run dev${colors.reset}
     
  3. Login with sample accounts:
     ${colors.yellow}Admin:${colors.reset} admin@evcoownership.com / Password123!
     ${colors.yellow}Staff:${colors.reset} staff.nguyen@evcoownership.com / Password123!
     ${colors.yellow}Co-owner:${colors.reset} nguyen.van.a@gmail.com / Password123!
     
  4. Explore the system! 🎉
  `);
  
  if (failCount === 0) {
    log.success('All seeds completed successfully! 🎊');
  } else {
    log.warning(`Some seeds failed. Check the errors above and re-run if needed.`);
  }
}

// Run the script
runAllSeeds().catch((error) => {
  log.error('Fatal error during seeding:');
  console.error(error);
  process.exit(1);
});
