-- ============================================================
-- NEXUS GG - Supabase Schema
-- Run this entire file in Supabase → SQL Editor → New Query
-- ============================================================

-- 1. PROFILES (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text not null,
  email text not null,
  mobile text not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  wallet_balance numeric(12,2) not null default 0,
  created_at timestamptz default now()
);

-- 2. PRODUCTS (managed by admin)
create table if not exists public.products (
  id bigserial primary key,
  name text not null,
  description text,
  price numeric(12,2) not null,
  daily_return numeric(12,2) not null,
  duration_days int not null default 30,
  image_url text,
  active boolean not null default true,
  created_at timestamptz default now()
);

-- 3. INVESTMENTS (user purchases a product)
create table if not exists public.investments (
  id bigserial primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  product_id bigint references public.products(id) on delete set null,
  product_name text not null,
  price numeric(12,2) not null,
  daily_return numeric(12,2) not null,
  duration_days int not null,
  days_remaining int not null,
  total_earned numeric(12,2) not null default 0,
  purchase_date date not null default current_date,
  active boolean not null default true,
  last_claimed_at timestamptz default null,
  created_at timestamptz default now()
);

-- 4. TRANSACTIONS (wallet history)
create table if not exists public.transactions (
  id bigserial primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in ('deposit', 'withdrawal', 'purchase', 'return')),
  description text not null,
  amount numeric(12,2) not null,
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.investments enable row level security;
alter table public.transactions enable row level security;

-- Profiles: users can read/update their own; admins can read all
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Products: everyone authenticated can read active products
create policy "Anyone can view active products"
  on public.products for select
  using (auth.role() = 'authenticated');

-- Products: only admins can insert/update/delete
create policy "Admins can manage products"
  on public.products for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Investments: users see only their own
create policy "Users can view own investments"
  on public.investments for select
  using (auth.uid() = user_id);

create policy "Users can insert own investments"
  on public.investments for insert
  with check (auth.uid() = user_id);

create policy "Users can update own investments"
  on public.investments for update
  using (auth.uid() = user_id);

-- Admins can see all investments
create policy "Admins can view all investments"
  on public.investments for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Transactions: users see only their own
create policy "Users can view own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "Users can insert own transactions"
  on public.transactions for insert
  with check (auth.uid() = user_id);

-- Admins can see all transactions
create policy "Admins can view all transactions"
  on public.transactions for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, email, mobile, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'User'),
    new.email,
    coalesce(new.raw_user_meta_data->>'mobile', ''),
    coalesce(new.raw_user_meta_data->>'role', 'user')
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- SEED: Default admin account
-- (Sign up via Supabase Auth manually, then run this to set role)
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@nexus.gg';
-- ============================================================

-- SEED: Sample products
insert into public.products (name, description, price, daily_return, duration_days, image_url, active) values
  ('PlayStation 5 Pro',     'High-performance gaming console with top-tier daily yields.',     500, 20, 30, '', true),
  ('Xbox Series X Cyber',   'Next-gen Xbox with steady daily returns for investors.',          350, 13, 30, '', true),
  ('Nintendo Switch OLED',  'Portable gaming investment with consistent yields.',              200,  7, 30, '', true),
  ('Steam Deck OLED 1TB',   'PC handheld powerhouse delivering strong daily returns.',         450, 17, 30, '', true),
  ('Asus ROG Ally X',       'Premium ROG gaming rig with the highest daily payout.',           650, 26, 30, '', true),
  ('PS5 Digital Slim',      'Sleek entry-level PS5 for consistent earners.',                   280, 10, 30, '', true)
on conflict do nothing;

-- ============================================================
-- DEPOSIT REQUESTS
-- Run this if you already applied the schema above
-- ============================================================
create table if not exists public.deposit_requests (
  id bigserial primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  amount numeric(12,2) not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_at timestamptz,
  created_at timestamptz default now()
);

alter table public.deposit_requests enable row level security;

create policy "Users can view own deposit requests"
  on public.deposit_requests for select
  using (auth.uid() = user_id);

create policy "Users can insert own deposit requests"
  on public.deposit_requests for insert
  with check (auth.uid() = user_id);

create policy "Admins can manage all deposit requests"
  on public.deposit_requests for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================================
-- ADDITIONAL POLICIES (run these if not already applied)
-- ============================================================

-- Allow admins to update any profile (e.g. wallet balance)
create policy if not exists "Admins can update all profiles"
  on public.profiles for update
  using (public.is_admin());

-- Allow admins to insert transactions for any user
create policy if not exists "Admins can insert transactions for all users"
  on public.transactions for insert
  with check (public.is_admin());

-- ============================================================
-- WITHDRAWAL REQUESTS
-- ============================================================
create table if not exists public.withdrawal_requests (
  id bigserial primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  amount numeric(12,2) not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_at timestamptz,
  created_at timestamptz default now()
);

alter table public.withdrawal_requests enable row level security;

create policy "Users can view own withdrawal requests"
  on public.withdrawal_requests for select
  using (auth.uid() = user_id);

create policy "Users can insert own withdrawal requests"
  on public.withdrawal_requests for insert
  with check (auth.uid() = user_id);

create policy "Admins can manage all withdrawal requests"
  on public.withdrawal_requests for all
  using (public.is_admin());

-- ============================================================
-- SETTINGS
-- ============================================================
create table if not exists public.settings (
  key text primary key,
  value text not null,
  updated_at timestamptz default now()
);

alter table public.settings enable row level security;

create policy "Anyone authenticated can read settings"
  on public.settings for select
  using (auth.role() = 'authenticated');

create policy "Admins can manage settings"
  on public.settings for all
  using (public.is_admin());

insert into public.settings (key, value) values
  ('momo_number', '0200000000'),
  ('momo_name', 'Nexus GG'),
  ('momo_network', 'MTN')
on conflict do nothing;

-- ============================================================
-- MIGRATION: run this if the investments table already exists
-- ============================================================
ALTER TABLE public.investments ADD COLUMN IF NOT EXISTS last_claimed_at timestamptz default null;

-- ============================================================
-- NOTIFICATIONS TABLE
-- ============================================================
create table if not exists public.notifications (
  id bigserial primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  subtitle text,
  type text not null default 'info',
  is_read boolean not null default false,
  created_at timestamptz default now()
);

alter table public.notifications enable row level security;

create policy "Users can view own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Users can update own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);

create policy "Admins can manage all notifications"
  on public.notifications for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- MIGRATION: add is_read to notifications (run if table already exists without this column)
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS is_read boolean not null default false;

-- ============================================================
-- REFERRAL SYSTEM MIGRATION
-- ============================================================
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_code text unique;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referred_by uuid references public.profiles(id) on delete set null;

CREATE TABLE IF NOT EXISTS public.referrals (
  id bigserial primary key,
  referrer_id uuid references public.profiles(id) on delete cascade not null,
  referred_id uuid references public.profiles(id) on delete cascade not null,
  bonus_paid boolean not null default false,
  created_at timestamptz default now(),
  CONSTRAINT referrals_referred_id_key UNIQUE(referred_id)
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view own referral rows"
  ON public.referrals FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY IF NOT EXISTS "Admins can manage all referral rows"
  ON public.referrals FOR ALL
  USING (public.is_admin());

CREATE POLICY IF NOT EXISTS "Authenticated users can insert referral rows"
  ON public.referrals FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Extend transactions.type to include referral_commission
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_type_check;
ALTER TABLE public.transactions ADD CONSTRAINT transactions_type_check
  CHECK (type IN ('deposit', 'withdrawal', 'purchase', 'return', 'referral_commission'));

-- Seed referral settings
INSERT INTO public.settings (key, value) VALUES
  ('referral_commission_pct', '10'),
  ('referral_bonus_amount',   '50'),
  ('missed_earnings_pct',     '50'),
  ('min_deposit_amount',      '120'),
  ('min_withdrawal_amount',   '50')
ON CONFLICT DO NOTHING;

-- ============================================================
-- THEME PREFERENCE
-- ============================================================
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS theme text not null default 'neon';

-- ============================================================
-- PAY REFERRAL COMMISSION FUNCTION
-- Run this in Supabase → SQL Editor
-- ============================================================
CREATE OR REPLACE FUNCTION public.pay_referral_commission(
  p_referred_user_id uuid,
  p_daily_return numeric
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_referrer_id uuid;
  v_commission_pct numeric;
  v_commission numeric;
BEGIN
  -- Bypass RLS so we can write to another user's wallet and transactions
  SET LOCAL row_security = off;

  -- Find the referrer
  SELECT referrer_id INTO v_referrer_id
  FROM public.referrals
  WHERE referred_id = p_referred_user_id
  LIMIT 1;

  -- No referrer, nothing to do
  IF v_referrer_id IS NULL THEN
    RETURN;
  END IF;

  -- Get commission percentage from settings (default 10%)
  SELECT COALESCE(NULLIF(value, ''), '10')::numeric INTO v_commission_pct
  FROM public.settings
  WHERE key = 'referral_commission_pct';

  IF v_commission_pct IS NULL THEN
    v_commission_pct := 10;
  END IF;

  v_commission := ROUND((p_daily_return * v_commission_pct / 100)::numeric, 2);

  IF v_commission <= 0 THEN
    RETURN;
  END IF;

  -- Credit the referrer's wallet
  UPDATE public.profiles
  SET wallet_balance = wallet_balance + v_commission
  WHERE id = v_referrer_id;

  -- Record the commission transaction
  INSERT INTO public.transactions (user_id, type, description, amount)
  VALUES (
    v_referrer_id,
    'referral_commission',
    'Referral commission from daily claim',
    v_commission
  );
END;
$$;

-- Grant execute to authenticated users (called via RPC from the client)
GRANT EXECUTE ON FUNCTION public.pay_referral_commission(uuid, numeric) TO authenticated;
