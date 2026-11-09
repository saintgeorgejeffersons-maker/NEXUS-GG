import { useEffect, useState } from 'react';
import { Search, Wallet, TrendingUp, Trash2, KeyRound, Eye, EyeOff, Users as UsersIcon, ArrowDownCircle, ArrowUpCircle, ShoppingCart } from 'lucide-react';
import { getAllProfiles, getAllInvestments, deleteUserAccount, adminResetPassword, getUserInvestments, getUserTransactions } from '../../lib/db';
import { Modal } from '../../components/ui/Modal';
import { supabase } from '../../lib/supabase';

export function Users() {
  const [users, setUsers] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [confirmId, setConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const [resetUser, setResetUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [resetSaving, setResetSaving] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  const [detailUser, setDetailUser] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  async function load() {
    const [profiles, invs] = await Promise.all([getAllProfiles(), getAllInvestments()]);
    setUsers(profiles.filter((p) => p.role === 'user'));
    setInvestments(invs);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = users.filter(
    (u) =>
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.mobile?.includes(search)
  );

  function activeInvestmentsCount(userId) {
    return investments.filter((i) => i.user_id === userId && i.active).length;
  }

  function openResetModal(u) {
    setResetUser(u); setNewPassword(''); setShowPw(false); setResetError(''); setResetSuccess('');
  }

  function closeResetModal() {
    setResetUser(null); setNewPassword(''); setResetError(''); setResetSuccess('');
  }

  async function openDetail(u) {
    setDetailUser(u); setDetailData(null); setDetailLoading(true);
    try {
      const [invs, txs, referralsRes] = await Promise.all([
        getUserInvestments(u.id),
        getUserTransactions(u.id),
        supabase
          .from('referrals')
          .select('referred_id, referred:profiles!referred_id(full_name, email, mobile, created_at)')
          .eq('referrer_id', u.id),
      ]);
      setDetailData({ invs: invs ?? [], txs: txs ?? [], referrals: referralsRes.data ?? [] });
    } catch (_) {
      setDetailData({ invs: [], txs: [], referrals: [] });
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleResetPassword() {
    if (newPassword.length < 6) { setResetError('Password must be at least 6 characters.'); return; }
    setResetSaving(true); setResetError('');
    try {
      await adminResetPassword(resetUser.id, newPassword);
      setResetSuccess('Password updated successfully.');
      setTimeout(() => closeResetModal(), 2000);
    } catch (e) {
      setResetError(e.message || 'Failed to reset password.');
    } finally { setResetSaving(false); }
  }

  async function handleDelete(userId) {
    setDeleting(userId);
    try {
      await deleteUserAccount(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (e) { console.error('Failed to delete user:', e); }
    setDeleting(null); setConfirmId(null);
  }

  if (loading)
    return <div className="flex items-center justify-center h-64 text-[#8888aa]">Loading...</div>;

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#f0f0ff]">Users</h2>
          <p className="text-sm text-[#8888aa]">{users.length} registered player{users.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8888aa]" />
          <input
            type="text"
            placeholder="Search by name, email, mobile…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#1a1a24] border border-[#2a2a3a] text-sm text-[#f0f0ff] placeholder-[#8888aa] focus:outline-none focus:border-[#00d4ff] transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#8888aa] border-b border-[#2a2a3a]">
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Mobile</th>
                <th className="px-5 py-3"><span className="flex items-center gap-1"><Wallet size={13} /> Balance</span></th>
                <th className="px-5 py-3"><span className="flex items-center gap-1"><TrendingUp size={13} /> Investments</span></th>
                <th className="px-5 py-3">Joined</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a3a]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-[#8888aa]">
                    {search ? 'No users match your search.' : 'No users yet.'}
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors cursor-pointer" onClick={() => openDetail(u)}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#00d4ff]/20 flex items-center justify-center text-xs font-bold text-[#00d4ff] flex-shrink-0">
                          {u.full_name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-[#f0f0ff] font-medium">{u.full_name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[#8888aa]">{u.email}</td>
                    <td className="px-5 py-3 text-[#8888aa]">{u.mobile || '—'}</td>
                    <td className="px-5 py-3 font-semibold text-[#00ff88]">
                      ₵{Number(u.wallet_balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        activeInvestmentsCount(u.id) > 0
                          ? 'bg-[#7c3aed]/10 text-[#a78bfa] border border-[#7c3aed]/20'
                          : 'bg-white/5 text-[#8888aa] border border-[#2a2a3a]'
                      }`}>
                        {activeInvestmentsCount(u.id)} active
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[#8888aa]">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openResetModal(u)} title="Reset password"
                          className="p-1.5 rounded-lg text-[#8888aa] hover:text-[#00d4ff] hover:bg-[#00d4ff]/10 transition-all">
                          <KeyRound size={14} />
                        </button>
                        {confirmId === u.id ? (
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleDelete(u.id)} disabled={deleting === u.id}
                              className="px-2 py-1 rounded text-xs font-medium bg-red-900/30 text-red-400 border border-red-700/30 hover:bg-red-900/50 transition-all disabled:opacity-50">
                              {deleting === u.id ? 'Deleting…' : 'Confirm'}
                            </button>
                            <button onClick={() => setConfirmId(null)}
                              className="px-2 py-1 rounded text-xs text-[#8888aa] hover:text-[#f0f0ff] transition-all">
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmId(u.id)}
                            className="p-1.5 rounded-lg text-[#8888aa] hover:text-red-400 hover:bg-red-900/20 transition-all">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail Modal */}
      <Modal isOpen={!!detailUser} onClose={() => { setDetailUser(null); setDetailData(null); }} title="User Details">
        {detailLoading || !detailData || !detailUser ? (
          <div className="flex items-center justify-center h-32 text-[#8888aa]">Loading...</div>
        ) : (
          <div className="space-y-5 text-sm">

            {/* Profile — flat rows */}
            <div className="divide-y divide-[#2a2a3a]">
              {[
                { label: 'Full Name',      value: detailUser.full_name },
                { label: 'Mobile',         value: detailUser.mobile || '—' },
                { label: 'Email',          value: detailUser.email },
                { label: 'Joined',         value: new Date(detailUser.created_at).toLocaleDateString() },
                { label: 'Referral Code',  value: detailUser.referral_code || '—' },
                { label: 'Wallet Balance', value: `₵${Number(detailUser.wallet_balance).toFixed(2)}` },
                { label: 'MoMo Network',   value: detailUser.momo_network || '—' },
                { label: 'MoMo Number',    value: detailUser.momo_number || '—' },
                { label: 'Account Name',   value: detailUser.momo_account_name || '—' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center py-2.5">
                  <p className="text-[#8888aa]">{label}</p>
                  <p className="text-[#f0f0ff] font-semibold break-all text-right max-w-[55%]">{value}</p>
                </div>
              ))}
            </div>

            {/* Active Investments */}
            <div>
              <p className="text-xs font-bold text-[#8888aa] uppercase tracking-wide mb-2">Active Investments ({detailData.invs.length})</p>
              {detailData.invs.length === 0 ? (
                <p className="text-[#8888aa] text-xs">No active investments.</p>
              ) : (
                <div className="divide-y divide-[#2a2a3a]">
                  {detailData.invs.map((inv) => (
                    <div key={inv.id} className="flex justify-between items-center py-2.5">
                      <div>
                        <p className="text-[#f0f0ff] font-medium">{inv.product_name}</p>
                        <p className="text-xs text-[#8888aa]">Day {inv.duration_days - inv.days_remaining} of {inv.duration_days}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[#00ff88] font-bold">+₵{inv.daily_return}/day</p>
                        <p className="text-xs text-[#8888aa]">Earned: ₵{Number(inv.total_earned).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Referred Users */}
            <div>
              <p className="text-xs font-bold text-[#8888aa] uppercase tracking-wide mb-2">
                Referred Users ({detailData.referrals?.length ?? 0})
              </p>
              {!detailData.referrals?.length ? (
                <p className="text-[#8888aa] text-xs">No referred users yet.</p>
              ) : (
                <div className="divide-y divide-[#2a2a3a]">
                  {detailData.referrals.map((r) => (
                    <div key={r.referred_id} className="flex justify-between items-center py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#7c3aed]/20 flex items-center justify-center text-xs font-bold text-[#a78bfa] flex-shrink-0">
                          {r.referred?.full_name?.charAt(0).toUpperCase() ?? '?'}
                        </div>
                        <div>
                          <p className="text-[#f0f0ff] font-medium">{r.referred?.full_name ?? '—'}</p>
                          <p className="text-xs text-[#8888aa]">{r.referred?.mobile || r.referred?.email || '—'}</p>
                        </div>
                      </div>
                      <p className="text-xs text-[#8888aa]">
                        {r.referred?.created_at ? new Date(r.referred.created_at).toLocaleDateString() : '—'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Transactions */}
            <div>
              <p className="text-xs font-bold text-[#8888aa] uppercase tracking-wide mb-2">Recent Transactions</p>
              {detailData.txs.length === 0 ? (
                <p className="text-[#8888aa] text-xs">No transactions yet.</p>
              ) : (
                <div className="divide-y divide-[#2a2a3a] max-h-48 overflow-y-auto">
                  {detailData.txs.slice(0, 10).map((tx) => (
                    <div key={tx.id} className="flex justify-between items-center py-2.5">
                      <div className="flex items-center gap-2">
                        {tx.type === 'deposit'             && <ArrowDownCircle size={13} className="text-[#00ff88] flex-shrink-0" />}
                        {tx.type === 'withdrawal'          && <ArrowUpCircle size={13} className="text-red-400 flex-shrink-0" />}
                        {tx.type === 'purchase'            && <ShoppingCart size={13} className="text-[#00d4ff] flex-shrink-0" />}
                        {tx.type === 'return'              && <TrendingUp size={13} className="text-[#00ff88] flex-shrink-0" />}
                        {tx.type === 'referral_commission' && <UsersIcon size={13} className="text-[#a78bfa] flex-shrink-0" />}
                        <p className="text-[#8888aa] text-xs truncate max-w-[160px]">{tx.description}</p>
                      </div>
                      <p className={`text-xs font-bold flex-shrink-0 ${Number(tx.amount) >= 0 ? 'text-[#00ff88]' : 'text-red-400'}`}>
                        {Number(tx.amount) >= 0 ? '+' : ''}₵{Math.abs(Number(tx.amount)).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
      </Modal>

      {/* Reset Password Modal */}
      <Modal isOpen={!!resetUser} onClose={closeResetModal} title="Reset User Password">
        <div className="space-y-4">
          <p className="text-sm text-[#8888aa]">
            Setting a new password for <span className="text-[#f0f0ff] font-semibold">{resetUser?.full_name}</span>.
          </p>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              placeholder="New password (min 6 characters)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-[#0a0a0f] border border-[#2a2a3a] rounded-xl px-4 py-3 pr-11 text-[#f0f0ff] text-sm placeholder-[#8888aa] focus:outline-none focus:border-[#00d4ff] transition-colors"
            />
            <button type="button" onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8888aa] hover:text-[#f0f0ff] transition-colors">
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {resetError   && <p className="text-red-400 text-sm bg-red-900/20 rounded-xl px-3 py-2">{resetError}</p>}
          {resetSuccess && <p className="text-[#00ff88] text-sm bg-green-900/20 rounded-xl px-3 py-2">{resetSuccess}</p>}
          {!resetSuccess && (
            <button onClick={handleResetPassword} disabled={resetSaving}
              className="w-full py-3 rounded-xl bg-[#00d4ff] text-black font-bold text-sm disabled:opacity-50">
              {resetSaving ? 'Updating…' : 'Set New Password'}
            </button>
          )}
        </div>
      </Modal>

    </div>
  );
}
