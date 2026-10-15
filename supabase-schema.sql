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
