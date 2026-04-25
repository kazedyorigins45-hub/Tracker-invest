import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();
dotenv.config({ path: '.env.local', override: true });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing env vars: NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const fallbackDomain = process.env.TEST_ACCOUNTS_DOMAIN || 'example.com';

const defaultAccounts = [
  {
    planCode: 'starter',
    email: `starter.test@${fallbackDomain}`,
    password: process.env.TEST_ACCOUNT_STARTER_PASSWORD || 'Starter123!',
  },
  {
    planCode: 'trader',
    email: `trader.test@${fallbackDomain}`,
    password: process.env.TEST_ACCOUNT_TRADER_PASSWORD || 'Trader123!',
  },
  {
    planCode: 'investor',
    email: `investor.test@${fallbackDomain}`,
    password: process.env.TEST_ACCOUNT_INVESTOR_PASSWORD || 'Investor123!',
  },
  {
    planCode: 'empire',
    email: `empire.test@${fallbackDomain}`,
    password: process.env.TEST_ACCOUNT_EMPIRE_PASSWORD || 'Empire123!',
  },
];

const accounts = process.env.SUPABASE_TEST_ACCOUNTS
  ? JSON.parse(process.env.SUPABASE_TEST_ACCOUNTS)
  : defaultAccounts;

if (!Array.isArray(accounts) || accounts.length === 0) {
  console.error('No test accounts configured.');
  process.exit(1);
}

function cleanEmail(value) {
  return String(value || '').trim().toLowerCase();
}

async function findUserByEmail(email) {
  const target = cleanEmail(email);
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });

  if (error) throw error;

  return data.users.find((user) => cleanEmail(user.email) === target) || null;
}

async function ensureUser(account) {
  const email = cleanEmail(account.email);
  const password = String(account.password || '');
  const planCode = String(account.planCode || '').trim();

  if (!email.includes('@') || password.length < 8 || !planCode) {
    throw new Error(`Invalid account config: ${JSON.stringify(account)}`);
  }

  let user = await findUserByEmail(email);

  if (!user) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        plan_code: planCode,
        source: 'seed-script',
      },
    });

    if (error) throw error;
    user = data.user;
  }

  if (!user?.id) {
    throw new Error(`Unable to create or find user for ${email}`);
  }

  const { error: subscriptionError } = await supabase.from('user_subscriptions').upsert({
    user_id: user.id,
    plan_code: planCode,
    billing_cycle: 'monthly',
    status: 'active',
    updated_at: new Date().toISOString(),
  });

  if (subscriptionError) throw subscriptionError;

  return { email, planCode, userId: user.id };
}

async function main() {
  const results = [];

  for (const account of accounts) {
    const result = await ensureUser(account);
    results.push(result);
    console.log(`OK  ${result.planCode.padEnd(8)} ${result.email}`);
  }

  console.log('\nDone. Created or updated accounts:');
  for (const item of results) {
    console.log(`- ${item.planCode}: ${item.email}`);
  }
}

main().catch((error) => {
  console.error('\nSeed failed:');
  console.error(error?.message || error);
  process.exit(1);
});
