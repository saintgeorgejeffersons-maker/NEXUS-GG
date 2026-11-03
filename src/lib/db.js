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

// ── REFERRAL HELPERS ──────────────────────────────────────
export async function generateReferralCode(userId) {
  const code = userId.replace(/-/g, '').slice(0, 8).toUpperCase();
  const { error } = await supabase
    .from('profiles')
    .update({ referral_code: code })
    .eq('id', userId);
  if (error) throw error;
  return code;
}

export async function updateReferralCode(userId, newCode) {
  if (!/^[a-zA-Z0-9]{4,16}$/.test(newCode)) {
    return { success: false, error: 'Code must be 4–16 alphanumeric characters.' };
  }
  const upper = newCode.toUpperCase();
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('referral_code', upper)
    .neq('id', userId)
    .maybeSingle();
  if (existing) {
    return { success: false, error: 'Code already taken.' };
  }
  const { error } = await supabase
    .from('profiles')
    .update({ referral_code: upper })
    .eq('id', userId);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function getReferralStats(userId) {
  const { data: referrals, error: refError } = await supabase
    .from('referrals')
    .select('*, referred:profiles!referred_id(full_name, email, created_at)')
    .eq('referrer_id', userId);
  if (refError) throw refError;

  const { data: commTxs, error: txError } = await supabase
    .from('transactions')
    .select('amount')
    .eq('user_id', userId)
    .eq('type', 'referral_commission');
  if (txError) throw txError;

  const totalEarned = (commTxs ?? []).reduce((sum, t) => sum + Number(t.amount), 0);

  const referredIds = (referrals ?? []).map((r) => r.referred_id);
  let activeCount = 0;
  if (referredIds.length > 0) {
    const { data: activeInv } = await supabase
      .from('investments')
      .select('user_id')
      .in('user_id', referredIds)
      .eq('active', true);
    const distinctUsers = new Set((activeInv ?? []).map((r) => r.user_id));
    activeCount = distinctUsers.size;
  }

  return { referrals: referrals ?? [], totalEarned, activeCount };
}

export async function applyReferralBonus(referredUserId) {
  const { data: referralRow } = await supabase
    .from('referrals')
    .select('id')
    .eq('referred_id', referredUserId)
    .eq('bonus_paid', false)
    .maybeSingle();
  if (!referralRow) return;

  const settings = await getSettings();
  const bonusAmount = Number(settings.referral_bonus_amount ?? 50);

  const referred = await getProfile(referredUserId);
  const newBalance = Number(referred.wallet_balance) + bonusAmount;
  await updateWalletBalance(referredUserId, newBalance);

  await createTransaction({
    user_id: referredUserId,
    type: 'return',
    description: 'Referral signup bonus',
    amount: bonusAmount,
  });

  await supabase
    .from('referrals')
    .update({ bonus_paid: true })
    .eq('referred_id', referredUserId);
}

export async function payReferralCommission(referredUserId, dailyReturn) {
  const { error } = await supabase.rpc('pay_referral_commission', {
    p_referred_user_id: referredUserId,
    p_daily_return: dailyReturn,
  });
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

// ── ACTIVE INVESTMENT PRODUCT IDS ────────────────────────
export async function getUserActiveInvestmentIds(userId) {
  const { data, error } = await supabase
    .from('investments')
    .select('product_id')
    .eq('user_id', userId)
    .eq('active', true);
  if (error) throw error;
  return data.map((row) => row.product_id);
}

// ── CLAIM DAILY RETURN ────────────────────────────────────
export async function claimDailyReturn(investment, userId) {
  // Check midnight-based gate: only one claim per calendar day
  if (investment.last_claimed_at) {
    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const lastClaimed = new Date(investment.last_claimed_at);
    if (lastClaimed >= todayMidnight) {
      throw new Error('Daily return already claimed today. Come back after midnight.');
    }
  }

  // Fetch current wallet balance
  const profile = await getProfile(userId);
  const newBalance = Number(profile.wallet_balance) + Number(investment.daily_return);

  // Credit wallet
  await updateWalletBalance(userId, newBalance);

  // Determine updated investment fields
  const newDaysRemaining = investment.days_remaining - 1;
  const updates = {
    total_earned: Number(investment.total_earned) + Number(investment.daily_return),
    days_remaining: newDaysRemaining,
    last_claimed_at: new Date().toISOString(),
    active: newDaysRemaining > 0,
  };

  // Update the investment row
  const { data: updatedInvestment, error: invError } = await supabase
    .from('investments')
    .update(updates)
    .eq('id', investment.id)
    .select()
    .single();
  if (invError) throw invError;

  // Insert return transaction
  await createTransaction({
    user_id: userId,
    type: 'return',
    description: `Daily return: ${investment.product_name}`,
    amount: investment.daily_return,
  });

  return updatedInvestment;
}

// ── CLAIM MISSED EARNINGS ─────────────────────────────────
// Returns the number of missed days (calendar days since last claim / purchase
// that had no claim, excluding today).
export function getMissedDays(investment) {
  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

  // Reference point: last claimed date or purchase date
  const refDate = investment.last_claimed_at
    ? new Date(investment.last_claimed_at)
    : new Date(investment.purchase_date);

  // Midnight at the end of the reference day
  const refMidnight = new Date(
    refDate.getFullYear(),
    refDate.getMonth(),
    refDate.getDate(),
    0, 0, 0, 0
  );

  // Days between reference midnight and today's midnight (exclude today — user
  // can still claim today normally)
  const msPerDay = 24 * 60 * 60 * 1000;
  const missed = Math.floor((todayMidnight - refMidnight) / msPerDay);

  // At least 1 missed day means refMidnight < todayMidnight, and the user
  // hasn't claimed today yet. Return 0 if nothing was missed.
  return Math.max(0, missed - (investment.last_claimed_at ? 1 : 0));
}

export async function claimMissedEarnings(investment, userId) {
  const missedDays = getMissedDays(investment);
  if (missedDays <= 0) throw new Error('No missed earnings to claim.');

  const settings = await getSettings();
  const pct = Number(settings.missed_earnings_pct ?? 50);
  const missedAmount = Math.round(Number(investment.daily_return) * missedDays * (pct / 100) * 100) / 100;

  if (missedAmount <= 0) throw new Error('Missed earnings amount is zero.');

  // Credit wallet
  const profile = await getProfile(userId);
  await updateWalletBalance(userId, Number(profile.wallet_balance) + missedAmount);

  // Update investment: deduct the missed days from days_remaining, update total_earned
  // Do NOT update last_claimed_at — the user still needs to claim today's full earnings
  const newDaysRemaining = Math.max(0, investment.days_remaining - missedDays);
  const updates = {
    total_earned: Number(investment.total_earned) + missedAmount,
    days_remaining: newDaysRemaining,
    active: newDaysRemaining > 0,
  };

  const { data: updatedInvestment, error: invError } = await supabase
    .from('investments')
    .update(updates)
    .eq('id', investment.id)
    .select()
    .single();
  if (invError) throw invError;

  // Record transaction
  await createTransaction({
    user_id: userId,
    type: 'return',
    description: `Missed earnings (${missedDays}d × ${pct}%): ${investment.product_name}`,
    amount: missedAmount,
  });

  return { updatedInvestment, missedDays, missedAmount, pct };
}

// ── PRODUCT IMAGE UPLOAD ─────────────────────────────────
export async function uploadProductImage(file) {
  const ext = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage
    .from('products-images')
    .upload(fileName, file, { upsert: false, contentType: file.type });
  if (error) throw error;
  const { data } = supabase.storage.from('products-images').getPublicUrl(fileName);
  return data.publicUrl;
}

// ── NOTIFICATIONS ─────────────────────────────────────────
export async function markNotificationRead(notificationId) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);
  if (error) throw error;
}

export async function markAllNotificationsRead(userId) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);
  if (error) throw error;
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
