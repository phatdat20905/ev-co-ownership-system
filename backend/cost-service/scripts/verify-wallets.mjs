import db from '../src/models/index.js';

async function run() {
  const {
    UserWallet,
    GroupWallet,
    Payment,
    CostSplit,
    WalletTransaction,
    GroupWalletTransaction,
    sequelize
  } = db;

  try {
    console.log('\n--- Wallet balances (user) ---');
    const userWallets = await UserWallet.findAll({ order: [['user_id', 'ASC']] });
    for (const w of userWallets) {
      console.log(`${w.user_id} -> balance: ${w.balance}`);
    }

    console.log('\n--- Wallet balances (group) ---');
    const groupWallets = await GroupWallet.findAll({ order: [['group_id', 'ASC']] });
    for (const g of groupWallets) {
      console.log(`${g.group_id} -> balance: ${g.balance}`);
    }

    console.log('\n--- Payments summary (completed) per user ---');
    const [paymentsByUser] = await sequelize.query(
      `SELECT user_id, SUM(amount) as total_paid FROM payments WHERE payment_status = 'completed' GROUP BY user_id ORDER BY user_id`);
    for (const p of paymentsByUser) {
      console.log(`${p.user_id} -> total_paid: ${p.total_paid}`);
    }

    console.log('\n--- Cost splits paid summary per user ---');
    const [splitsByUser] = await sequelize.query(
      `SELECT user_id, SUM(paid_amount) as total_paid_amount FROM cost_splits WHERE payment_status = 'paid' GROUP BY user_id ORDER BY user_id`);
    for (const s of splitsByUser) {
      console.log(`${s.user_id} -> total_paid_amount: ${s.total_paid_amount}`);
    }

    console.log('\n--- Wallet transactions (recent 20) ---');
    const tx = await WalletTransaction.findAll({ order: [['created_at', 'DESC']], limit: 20 });
    for (const t of tx) {
      console.log(`${t.id} | user:${t.user_id} | amount:${t.amount} | type:${t.type} | created_at:${t.created_at}`);
    }

    console.log('\n--- Group wallet transactions (recent 20) ---');
    const gtx = await GroupWalletTransaction.findAll({ order: [['created_at', 'DESC']], limit: 20 });
    for (const t of gtx) {
      console.log(`${t.id} | group:${t.group_id} | amount:${t.amount} | type:${t.type} | created_at:${t.created_at}`);
    }

    console.log('\nVerification finished.');
    process.exit(0);
  } catch (err) {
    console.error('Error during verification:', err);
    process.exit(2);
  }
}

run();
