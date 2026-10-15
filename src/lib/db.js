import { supabase } from './supabase';

// ── PRODUCTS ──────────────────────────────────────────────
export async function getProducts(activeOnly = false) {
  let query = supabase.from('products').select('*').order('created_at', { ascending: true });
  if (activeOnly) query = query.eq('active', true);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function upsertProduct(product) {
  const { data, error } = await supabase
    .from('products')
    .upsert(product)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteProduct(id) {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}

export async function updateProduct(id, updates) {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ── PROFILE / WALLET ──────────────────────────────────────
export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}

export async function updateWalletBalance(userId, newBalance) {
  const { error } = await supabase
    .from('profiles')
    .update({ wallet_balance: newBalance })
    .eq('id', userId);
  if (error) throw error;
}

// ── INVESTMENTS ───────────────────────────────────────────
export async function getUserInvestments(userId) {
  const { data, error } = await supabase
    .from('investments')
    .select('*')
    .eq('user_id', userId)
    .eq('active', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createInvestment(investment) {
  const { data, error } = await supabase
    .from('investments')
    .insert(investment)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getAllInvestments() {
  const { data, error } = await supabase
    .from('investments')
    .select('*, profiles(full_name, email)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

// ── TRANSACTIONS ──────────────────────────────────────────
export async function getUserTransactions(userId) {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createTransaction(tx) {
  const { data, error } = await supabase
    .from('transactions')
    .insert(tx)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getAllTransactions() {
  const { data, error } = await supabase
    .from('transactions')
    .select('*, profiles(full_name, email)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

// ── ADMIN METRICS ─────────────────────────────────────────
export async function getAdminMetrics() {
  const [profilesRes, investmentsRes, transactionsRes] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'user'),
    supabase.from('investments').select('id', { count: 'exact' }).eq('active', true),
    supabase.from('transactions').select('amount, type'),
  ]);

  const totalUsers = profilesRes.count ?? 0;
  const activeInvestments = investmentsRes.count ?? 0;
  const txs = transactionsRes.data ?? [];

  const totalDeposits = txs
    .filter((t) => t.type === 'deposit')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalPaidOut = txs
    .filter((t) => t.type === 'return' || t.type === 'withdrawal')
    .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);

  return { totalUsers, activeInvestments, totalDeposits, totalPaidOut };
}

// ── ALL PROFILES (admin) ──────────────────────────────────
export async function getAllProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

// ── DEPOSIT REQUESTS ──────────────────────────────────────
export async function createDepositRequest(userId, amount, reference) {
  const { data, error } = await supabase
    .from('deposit_requests')
    .insert({ user_id: userId, amount, status: 'pending', reference })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getUserDepositRequests(userId) {
  const { data, error } = await supabase
    .from('deposit_requests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getAllDepositRequests() {
  const { data, error } = await supabase
    .from('deposit_requests')
    .select('*, profiles(full_name, email)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function updateDepositRequestStatus(id, status) {
  const { data, error } = await supabase
    .from('deposit_requests')
    .update({ status, reviewed_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ── SETTINGS ──────────────────────────────────────────────
export async function getSettings() {
  const { data, error } = await supabase
    .from('settings')
    .select('key, value');
  if (error) throw error;
  // Return as a plain object { momo_number: '...', momo_name: '...', ... }
  return Object.fromEntries(data.map((row) => [row.key, row.value]));
}

export async function upsertSetting(key, value) {
  const { error } = await supabase
    .from('settings')
    .upsert({ key, value, updated_at: new Date().toISOString() });
  if (error) throw error;
}

// ── WITHDRAWAL REQUESTS ───────────────────────────────────
export async function createWithdrawalRequest(userId, amount) {
  const { data, error } = await supabase
    .from('withdrawal_requests')
    .insert({ user_id: userId, amount, status: 'pending' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getUserWithdrawalRequests(userId) {
  const { data, error } = await supabase
    .from('withdrawal_requests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getAllWithdrawalRequests() {
  const { data, error } = await supabase
    .from('withdrawal_requests')
    .select('*, profiles(full_name, email)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function updateWithdrawalRequestStatus(id, status) {
  const { data, error } = await supabase
    .from('withdrawal_requests')
    .update({ status, reviewed_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ── DELETE TRANSACTION ────────────────────────────────────
export async function deleteTransaction(id) {
  const { error } = await supabase.from('transactions').delete().eq('id', id);
  if (error) throw error;
}

// ── DELETE USER ACCOUNT ───────────────────────────────────
export async function deleteUserAccount(userId) {
  const { error } = await supabase.rpc('delete_user_account', { target_user_id: userId });
  if (error) throw error;
}
