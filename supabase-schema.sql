-- Mindset Invest schema

-- =========================
-- Helpers
-- =========================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =========================
-- Plans
-- =========================
create table if not exists public.pricing_plans (
  code text primary key,
  name text not null,
  description text,
  stripe_product_id text,
  stripe_price_monthly_id text,
  stripe_price_yearly_id text,
  features jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_pricing_plans_updated_at on public.pricing_plans;
create trigger trg_pricing_plans_updated_at
before update on public.pricing_plans
for each row execute function public.set_updated_at();

-- =========================
-- Subscriptions
-- =========================
create table if not exists public.user_subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  plan_code text references public.pricing_plans(code),
  billing_cycle text not null check (billing_cycle in ('monthly', 'yearly')),
  status text not null check (status in ('active', 'trialing', 'past_due', 'canceled', 'unpaid', 'incomplete')),
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  trial_end timestamptz,
  last_stripe_event_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_user_subscriptions_updated_at on public.user_subscriptions;
create trigger trg_user_subscriptions_updated_at
before update on public.user_subscriptions
for each row execute function public.set_updated_at();

create index if not exists idx_user_subscriptions_plan_code on public.user_subscriptions(plan_code);
create index if not exists idx_user_subscriptions_status on public.user_subscriptions(status);
create index if not exists idx_user_subscriptions_stripe_customer_id on public.user_subscriptions(stripe_customer_id);

-- =========================
-- App data (persisted calculations / forms)
-- =========================
create table if not exists public.user_app_data (
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_key text not null,
  payload text not null default ''::text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, storage_key)
);

drop trigger if exists trg_user_app_data_updated_at on public.user_app_data;
create trigger trg_user_app_data_updated_at
before update on public.user_app_data
for each row execute function public.set_updated_at();

create index if not exists idx_user_app_data_storage_key on public.user_app_data(storage_key);

-- =========================
-- Webhook idempotency
-- =========================
create table if not exists public.stripe_webhook_events (
  id text primary key,
  type text not null,
  payload jsonb not null,
  processed_at timestamptz not null default now()
);

-- =========================
-- RLS
-- =========================
alter table public.pricing_plans enable row level security;
alter table public.user_subscriptions enable row level security;
alter table public.user_app_data enable row level security;
alter table public.stripe_webhook_events enable row level security;

drop policy if exists "read pricing plans" on public.pricing_plans;
create policy "read pricing plans"
on public.pricing_plans
for select
using (true);

drop policy if exists "read own subscription" on public.user_subscriptions;
create policy "read own subscription"
on public.user_subscriptions
for select
using (auth.uid() = user_id);

drop policy if exists "read own app data" on public.user_app_data;
create policy "read own app data"
on public.user_app_data
for select
using (auth.uid() = user_id);

drop policy if exists "write own app data" on public.user_app_data;
create policy "write own app data"
on public.user_app_data
for insert
with check (auth.uid() = user_id);

drop policy if exists "update own app data" on public.user_app_data;
create policy "update own app data"
on public.user_app_data
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- =========================
-- Seed plans
-- =========================
insert into public.pricing_plans (code, name, description, features, sort_order)
values
(
  'starter',
  'Starter',
  'Le socle essentiel pour travailler ton mindset et ta discipline.',
  '{"mindset":true,"tracker":false,"invest":false,"portfolio":false}'::jsonb,
  1
),
(
  'trader',
  'Trading',
  'Accès Trading seul pour suivre ton activité avec plus de rigueur.',
  '{"mindset":true,"tracker":true,"invest":false,"portfolio":false}'::jsonb,
  2
),
(
  'investor',
  'Investissement',
  'Accès Investissement seul pour structurer le long terme.',
  '{"mindset":true,"tracker":false,"invest":true,"portfolio":true}'::jsonb,
  3
),
(
  'empire',
  'Trading + Investissement',
  'Accès complet à la partie Trading et Investissement.',
  '{"mindset":true,"tracker":true,"invest":true,"portfolio":true}'::jsonb,
  4
)
on conflict (code) do update
set
  name = excluded.name,
  description = excluded.description,
  features = excluded.features,
  sort_order = excluded.sort_order,
  updated_at = now();

update public.pricing_plans
set
  stripe_product_id = case code
    when 'starter' then 'prod_test_starter'
    when 'trader' then 'prod_test_trader'
    when 'investor' then 'prod_test_investor'
    when 'empire' then 'prod_test_empire'
    else stripe_product_id
  end,
  stripe_price_monthly_id = case code
    when 'starter' then 'price_test_starter_monthly'
    when 'trader' then 'price_test_trader_monthly'
    when 'investor' then 'price_test_investor_monthly'
    when 'empire' then 'price_test_empire_monthly'
    else stripe_price_monthly_id
  end,
  stripe_price_yearly_id = case code
    when 'starter' then 'price_test_starter_yearly'
    when 'trader' then 'price_test_trader_yearly'
    when 'investor' then 'price_test_investor_yearly'
    when 'empire' then 'price_test_empire_yearly'
    else stripe_price_yearly_id
  end,
  updated_at = now()
where code in ('starter', 'trader', 'investor', 'empire');
