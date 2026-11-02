import { useState, useEffect } from 'react';
import {
  ArrowUpCircle, ArrowDownCircle, TrendingUp, ShoppingCart,
  Clock, Copy, Check, Users, Plus, Minus,
  Edit3, Save, X, Lock, ChevronDown, ChevronUp, ArrowRight,
} from 'lucide-react';import { Modal } from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import {
  createDepositRequest, getUserDepositRequests,
  getSettings, createWithdrawalRequest, getUserWithdrawalRequests,
} from '../../lib/db';

// ── Constants ────────────────────────────────────────────
const STATUS_STYLE = {
  pending:  'bg-yellow-900/20 text-yellow-400 border border-yellow-700/30',
  approved: 'bg-green-900/20 text-[#00ff88] border border-green-700/30',
  rejected: 'bg-red-900/20 text-red-400 border border-red-700/30',
};

const DEPOSIT_PRESETS = [120, 200, 500, 1000];

function generateReference() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return 'NXS-' + Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

const inputClass = 'w-full bg-[#0a0a0f] border border-[#2a2a3a] rounded-xl px-4 py-3 text-[#f0f0ff] text-sm placeholder-[#8888aa] focus:outline-none focus:border-[#00d4ff] transition-colors';

// ── Collapsible section wrapper ───────────────────────────
function Section({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-4"
        onClick={() => setOpen((o) => !o)}
      >
        <p className="text-sm font-bold text-[#f0f0ff]">{title}</p>
        {open ? <ChevronUp size={16} className="text-[#8888aa]" /> : <ChevronDown size={16} className="text-[#8888aa]" />}
      </button>
      {open && <div className="border-t border-[#2a2a3a]">{children}</div>}
    </div>
  );
}

// ── Main component ────────────────────────────────────────
export function Profile() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  // Wallet data
  const [balance, setBalance] = useState(0);
  const [depositRequests, setDepositRequests] = useState([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [momoSettings, setMomoSettings] = useState(null);
  const [minDeposit, setMinDeposit] = useState(120);
  const [minWithdrawal, setMinWithdrawal] = useState(50);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [copied, setCopied] = useState(false);
  const [txError, setTxError] = useState('');
  const [txSuccess, setTxSuccess] = useState('');

  // Profile editing
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ full_name: '', mobile: '' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password change
  const [editingPassword, setEditingPassword] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState('');
  const [pwError, setPwError] = useState('');

  // Load wallet data
  useEffect(() => {
    if (!profile?.id) return;
    setBalance(Number(profile.wallet_balance));
    setProfileForm({ full_name: profile.full_name ?? '', mobile: profile.mobile ?? '' });
    Promise.all([
      getUserDepositRequests(profile.id),
      getUserWithdrawalRequests(profile.id),
      getSettings(),
    ]).then(([reqs, wreqs, settings]) => {
      setDepositRequests(reqs);
      setWithdrawalRequests(wreqs);
      setMomoSettings(settings);
      setMinDeposit(Number(settings.min_deposit_amount ?? 120));
      setMinWithdrawal(Number(settings.min_withdrawal_amount ?? 50));
      setLoading(false);
    });
  }, [profile?.id, profile?.wallet_balance]);

  // ── Deposit / Withdraw ──────────────────────────────────
  async function handleDeposit() {
    const val = parseFloat(amount);
    if (!val || val <= 0) { setTxError('Enter a valid amount.'); return; }
    if (val < minDeposit) { setTxError(`Minimum deposit is ₵${minDeposit}.`); return; }
    setTxError('');
    try {
      await createDepositRequest(profile.id, val, reference);
      const reqs = await getUserDepositRequests(profile.id);
      setDepositRequests(reqs);
      setTxSuccess(`Deposit request for ₵${val.toFixed(2)} submitted.`);
      setAmount('');
      setTimeout(() => { setTxSuccess(''); setShowDeposit(false); }, 2500);
    } catch (_) { setTxError('Failed to submit deposit. Please try again.'); }
  }

  async function handleWithdraw() {
    const val = parseFloat(amount);
    if (!val || val <= 0) { setTxError('Enter a valid amount.'); return; }
    if (val < minWithdrawal) { setTxError(`Minimum withdrawal is ₵${minWithdrawal}.`); return; }
    if (val > balance) { setTxError('Insufficient balance.'); return; }
    setTxError('');
    try {
      await createWithdrawalRequest(profile.id, val);
      const wreqs = await getUserWithdrawalRequests(profile.id);
      setWithdrawalRequests(wreqs);
      setTxSuccess(`Withdrawal request for ₵${val.toFixed(2)} submitted.`);
      setAmount('');
      setTimeout(() => { setTxSuccess(''); setShowWithdraw(false); }, 2500);
    } catch (_) { setTxError('Failed to submit withdrawal. Please try again.'); }
  }

  function openDeposit() {
    setAmount(''); setTxError(''); setTxSuccess('');
    setReference(generateReference()); setCopied(false);
    setShowDeposit(true);
  }
  function openWithdraw() { setAmount(''); setTxError(''); setTxSuccess(''); setShowWithdraw(true); }

  // ── Profile edit ────────────────────────────────────────
  async function handleSaveProfile() {
    if (!profileForm.full_name.trim()) { setProfileError('Name is required.'); return; }
    setProfileSaving(true); setProfileError('');
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: profileForm.full_name.trim(), mobile: profileForm.mobile.trim() })
        .eq('id', profile.id);
      if (error) throw error;
      await refreshProfile();
      setProfileMsg('Profile updated!');
      setEditingProfile(false);
      setTimeout(() => setProfileMsg(''), 3000);
    } catch (e) {
      setProfileError('Failed to update profile.');
    } finally {
      setProfileSaving(false);
    }
  }

  // ── Password change ─────────────────────────────────────
  async function handleChangePassword() {
    if (!pwForm.newPw) { setPwError('Enter a new password.'); return; }
    if (pwForm.newPw.length < 6) { setPwError('Password must be at least 6 characters.'); return; }
    if (pwForm.newPw !== pwForm.confirm) { setPwError('Passwords do not match.'); return; }
    setPwSaving(true); setPwError('');
    try {
      const { error } = await supabase.auth.updateUser({ password: pwForm.newPw });
      if (error) throw error;
      setPwMsg('Password updated successfully!');
      setEditingPassword(false);
      setPwForm({ current: '', newPw: '', confirm: '' });
      setTimeout(() => setPwMsg(''), 3000);
    } catch (e) {
      setPwError(e.message || 'Failed to update password.');
    } finally {
      setPwSaving(false);
    }
  }

  const pendingDeposits    = depositRequests.filter((r) => r.status === 'pending').reduce((s, r) => s + Number(r.amount), 0);
  const pendingWithdrawals = withdrawalRequests.filter((r) => r.status === 'pending').reduce((s, r) => s + Number(r.amount), 0);
  const initials           = (profile?.full_name ?? '?').charAt(0).toUpperCase();
  const joinedDate         = profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en', { month: 'long', year: 'numeric' }) : '—';

  if (loading) return <div className="flex items-center justify-center h-64 text-[#8888aa]">Loading...</div>;

  return (
    <div className="space-y-4">

      {/* ── Avatar + name ── */}
      <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-[#7c3aed]/20 flex items-center justify-center flex-shrink-0">
          <span className="text-2xl font-black text-[#7c3aed]">{initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-lg font-black text-[#f0f0ff] truncate">{profile?.full_name}</p>
          <p className="text-xs text-[#8888aa] truncate">{profile?.email}</p>
          <p className="text-xs text-[#8888aa]">Joined {joinedDate}</p>
        </div>
      </div>

      {/* ── Balance card ── */}
      <div
        className="rounded-2xl p-5 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0d1f2d 0%, #0a0a0f 100%)', border: '1px solid rgba(0,212,255,0.2)' }}
      >
        <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-[#ff6b35]/5" />
        <p className="text-xs text-[#8888aa] mb-1">Available Balance</p>
        <p className="text-4xl font-black text-[#f0f0ff] mb-1">
          ₵{balance.toLocaleString('en', { minimumFractionDigits: 2 })}
        </p>
        {pendingDeposits > 0 && (
          <p className="text-xs text-yellow-400 mb-0.5 flex items-center gap-1">
            <Clock size={11} /> ₵{pendingDeposits.toFixed(2)} deposit pending
          </p>
        )}
        {pendingWithdrawals > 0 && (
          <p className="text-xs text-orange-400 mb-1 flex items-center gap-1">
            <Clock size={11} /> ₵{pendingWithdrawals.toFixed(2)} withdrawal pending
          </p>
        )}
        <div className="flex gap-3 mt-4">
          <button onClick={openDeposit} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#00d4ff] text-black font-bold text-sm">
            <Plus size={16} /> Deposit
          </button>
          <button onClick={openWithdraw} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-[#00d4ff]/40 text-[#00d4ff] font-bold text-sm">
            <Minus size={16} /> Withdraw
          </button>
        </div>
      </div>

      {/* ── Transaction History button ── */}
      <button
        onClick={() => navigate('/user/transactions')}
        className="w-full glass-card rounded-2xl p-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00d4ff]/10 flex items-center justify-center">
            <TrendingUp size={18} className="text-[#00d4ff]" />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-[#f0f0ff]">Transaction History</p>
            <p className="text-xs text-[#8888aa]">View all your transactions</p>
          </div>
        </div>
        <ArrowRight size={18} className="text-[#8888aa]" />
      </button>

      {/* ── Edit Profile ── */}
      <Section title="Edit Profile">
        <div className="p-4 space-y-3">
          {profileMsg && <p className="text-[#00ff88] text-sm bg-green-900/20 rounded-xl px-3 py-2">{profileMsg}</p>}
          {editingProfile ? (
            <>
              <div>
                <label className="text-xs text-[#8888aa] mb-1 block">Full Name</label>
                <input
                  className={inputClass}
                  value={profileForm.full_name}
                  onChange={(e) => setProfileForm((f) => ({ ...f, full_name: e.target.value }))}
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="text-xs text-[#8888aa] mb-1 block">Mobile</label>
                <input
                  className={inputClass}
                  value={profileForm.mobile}
                  onChange={(e) => setProfileForm((f) => ({ ...f, mobile: e.target.value }))}
                  placeholder="e.g. 0241234567"
                />
              </div>
              <div>
                <label className="text-xs text-[#8888aa] mb-1 block">Email</label>
                <input className={inputClass} value={profile?.email ?? ''} disabled style={{ opacity: 0.5 }} />
              </div>
              {profileError && <p className="text-red-400 text-sm bg-red-900/20 rounded-xl px-3 py-2">{profileError}</p>}
              <div className="flex gap-2">
                <button onClick={handleSaveProfile} disabled={profileSaving}
                  className="flex-1 py-3 rounded-xl bg-[#00d4ff] text-black font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-1.5">
                  <Save size={14} /> {profileSaving ? 'Saving...' : 'Save'}
                </button>
                <button onClick={() => { setEditingProfile(false); setProfileError(''); }}
                  className="flex-1 py-3 rounded-xl border border-[#2a2a3a] text-[#8888aa] font-bold text-sm flex items-center justify-center gap-1.5">
                  <X size={14} /> Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                {[
                  { label: 'Full Name', value: profile?.full_name },
                  { label: 'Mobile',    value: profile?.mobile    },
                  { label: 'Email',     value: profile?.email     },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center py-2 border-b border-[#2a2a3a]/50 last:border-0">
                    <span className="text-xs text-[#8888aa]">{label}</span>
                    <span className="text-sm text-[#f0f0ff] font-medium">{value || '—'}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => setEditingProfile(true)}
                className="w-full py-3 rounded-xl border border-[#2a2a3a] text-[#8888aa] font-bold text-sm flex items-center justify-center gap-1.5 hover:text-[#f0f0ff] transition-colors">
                <Edit3 size={14} /> Edit Profile
              </button>
            </>
          )}
        </div>
      </Section>

      {/* ── Change Password ── */}
      <Section title="Change Password">
        <div className="p-4 space-y-3">
          {pwMsg && <p className="text-[#00ff88] text-sm bg-green-900/20 rounded-xl px-3 py-2">{pwMsg}</p>}
          {editingPassword ? (
            <>
              <input className={inputClass} type="password" placeholder="New password"
                value={pwForm.newPw} onChange={(e) => setPwForm((f) => ({ ...f, newPw: e.target.value }))} />
              <input className={inputClass} type="password" placeholder="Confirm new password"
                value={pwForm.confirm} onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))} />
              {pwError && <p className="text-red-400 text-sm bg-red-900/20 rounded-xl px-3 py-2">{pwError}</p>}
              <div className="flex gap-2">
                <button onClick={handleChangePassword} disabled={pwSaving}
                  className="flex-1 py-3 rounded-xl bg-[#00d4ff] text-black font-bold text-sm disabled:opacity-50">
                  {pwSaving ? 'Saving...' : 'Update Password'}
                </button>
                <button onClick={() => { setEditingPassword(false); setPwError(''); setPwForm({ current: '', newPw: '', confirm: '' }); }}
                  className="flex-1 py-3 rounded-xl border border-[#2a2a3a] text-[#8888aa] font-bold text-sm">
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <button onClick={() => setEditingPassword(true)}
              className="w-full py-3 rounded-xl border border-[#2a2a3a] text-[#8888aa] font-bold text-sm flex items-center justify-center gap-1.5 hover:text-[#f0f0ff] transition-colors">
              <Lock size={14} /> Change Password
            </button>
          )}
        </div>
      </Section>

      {/* ── Deposit Requests ── */}
      {depositRequests.length > 0 && (
        <Section title={`Deposit Requests (${depositRequests.length})`}>
          <div className="divide-y divide-[#2a2a3a]/50">
            {depositRequests.map((req) => (
              <div key={req.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-[#f0f0ff]">₵{Number(req.amount).toFixed(2)}</p>
                  <p className="text-xs text-[#8888aa]">{new Date(req.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${STATUS_STYLE[req.status]}`}>
                  {req.status}
                </span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── Withdrawal Requests ── */}
      {withdrawalRequests.length > 0 && (
        <Section title={`Withdrawal Requests (${withdrawalRequests.length})`}>
          <div className="divide-y divide-[#2a2a3a]/50">
            {withdrawalRequests.map((req) => (
              <div key={req.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-[#f0f0ff]">₵{Number(req.amount).toFixed(2)}</p>
                  <p className="text-xs text-[#8888aa]">{new Date(req.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${STATUS_STYLE[req.status]}`}>
                  {req.status}
                </span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── Deposit Modal ── */}
      <Modal isOpen={showDeposit} onClose={() => setShowDeposit(false)} title="Request Deposit">
        <div className="space-y-4">
          {momoSettings && (
            <div className="p-4 rounded-xl bg-[#00d4ff]/5 border border-[#00d4ff]/20">
              <p className="text-xs font-bold text-[#00d4ff] uppercase tracking-wide mb-3">Send payment to</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><p className="text-xs text-[#8888aa]">Network</p><p className="text-[#f0f0ff] font-bold">{momoSettings.momo_network}</p></div>
                <div><p className="text-xs text-[#8888aa]">Number</p><p className="text-[#f0f0ff] font-bold">{momoSettings.momo_number}</p></div>
                <div className="col-span-2"><p className="text-xs text-[#8888aa]">Account Name</p><p className="text-[#f0f0ff] font-bold">{momoSettings.momo_name}</p></div>
              </div>
            </div>
          )}
          <div className="p-3 rounded-xl bg-[#7c3aed]/10 border border-[#7c3aed]/30">
            <p className="text-xs text-[#8888aa] mb-2">Use this reference when sending</p>
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-lg font-black text-[#a78bfa] tracking-widest">{reference}</span>
              <button onClick={() => { navigator.clipboard.writeText(reference); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#7c3aed]/20 text-[#a78bfa]">
                {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {DEPOSIT_PRESETS.map((p) => (
              <button key={p} onClick={() => setAmount(p.toString())}
                className={`py-2 rounded-xl text-sm font-semibold border transition-all ${
                  amount === p.toString() ? 'border-[#00d4ff] bg-[#00d4ff]/10 text-[#00d4ff]' : 'border-[#2a2a3a] text-[#8888aa]'
                }`}>₵{p}</button>
            ))}
          </div>
          <input type="number" placeholder={`Min ₵${minDeposit}`} value={amount}
            onChange={(e) => setAmount(e.target.value)} className={inputClass} />
          {txError && <p className="text-red-400 text-sm bg-red-900/20 rounded-xl px-3 py-2">{txError}</p>}
          {txSuccess && <p className="text-yellow-400 text-sm bg-yellow-900/20 rounded-xl px-3 py-2">{txSuccess}</p>}
          {!txSuccess && (
            <button onClick={handleDeposit} className="w-full py-3 rounded-xl bg-[#00d4ff] text-black font-bold text-sm">
              Submit Deposit Request
            </button>
          )}
        </div>
      </Modal>

      {/* ── Withdraw Modal ── */}
      <Modal isOpen={showWithdraw} onClose={() => setShowWithdraw(false)} title="Withdraw Funds">
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-[#0a0a0f] border border-[#2a2a3a]">
            <p className="text-xs text-[#8888aa]">Available Balance</p>
            <p className="text-xl font-black text-[#f0f0ff]">₵{balance.toFixed(2)}</p>
          </div>
          <p className="text-xs text-[#8888aa]">Minimum withdrawal: ₵{minWithdrawal}. Reviewed by admin before processing.</p>
          <input type="number" placeholder={`Min ₵${minWithdrawal}`} value={amount}
            onChange={(e) => setAmount(e.target.value)} className={inputClass} />
          {txError && <p className="text-red-400 text-sm bg-red-900/20 rounded-xl px-3 py-2">{txError}</p>}
          {txSuccess && <p className="text-[#00ff88] text-sm bg-green-900/20 rounded-xl px-3 py-2">{txSuccess}</p>}
          {!txSuccess && (
            <button onClick={handleWithdraw} className="w-full py-3 rounded-xl bg-[#00d4ff] text-black font-bold text-sm">
              Submit Withdrawal Request
            </button>
          )}
        </div>
      </Modal>
    </div>
  );
}
