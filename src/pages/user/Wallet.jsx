import { useState, useEffect } from 'react';
import {
  Wallet as WalletIcon, ArrowUpCircle, ArrowDownCircle, TrendingUp,
  ShoppingCart, Clock, Copy, Check, Users, Plus, Minus,
} from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import {
  getUserTransactions, createDepositRequest, getUserDepositRequests,
  getSettings, createWithdrawalRequest, getUserWithdrawalRequests,
} from '../../lib/db';

const TX_META = {
  deposit:             { icon: ArrowUpCircle,   color: '#00ff88', label: 'Deposit'    },
  return:              { icon: TrendingUp,       color: '#00d4ff', label: 'Return'     },
  purchase:            { icon: ShoppingCart,     color: '#ff6b35', label: 'Purchase'   },
  withdrawal:          { icon: ArrowDownCircle,  color: '#ef4444', label: 'Withdrawal' },
  referral_commission: { icon: Users,            color: '#a78bfa', label: 'Referral'   },
};

const TX_FILTERS = [
  { key: 'all',                label: 'All'        },
  { key: 'return',             label: 'Returns'    },
  { key: 'deposit',            label: 'Deposits'   },
  { key: 'purchase',           label: 'Purchases'  },
  { key: 'withdrawal',         label: 'Withdrawals'},
  { key: 'referral_commission',label: 'Referrals'  },
];

const STATUS_STYLE = {
  pending:  'bg-yellow-900/20 text-yellow-400 border border-yellow-700/30',
  approved: 'bg-green-900/20 text-[#00ff88] border border-green-700/30',
  rejected: 'bg-red-900/20 text-red-400 border border-red-700/30',
};

const DEPOSIT_PRESETS = [120, 200, 500, 1000];

function generateReference() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const rand = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `NXS-${rand}`;
}

export function Wallet() {
  const { profile, refreshProfile } = useAuth();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [depositRequests, setDepositRequests] = useState([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [momoSettings, setMomoSettings] = useState(null);
  const [minDeposit, setMinDeposit] = useState(120);
  const [minWithdrawal, setMinWithdrawal] = useState(50);
  const [loading, setLoading] = useState(true);

  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [txFilter, setTxFilter] = useState('all');
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [copied, setCopied] = useState(false);
  const [txError, setTxError] = useState('');
  const [txSuccess, setTxSuccess] = useState('');

  useEffect(() => {
    if (!profile?.id) return;
    setBalance(Number(profile.wallet_balance));
    Promise.all([
      getUserTransactions(profile.id),
      getUserDepositRequests(profile.id),
      getUserWithdrawalRequests(profile.id),
      getSettings(),
    ]).then(([txs, reqs, wreqs, settings]) => {
      setTransactions(txs);
      setDepositRequests(reqs);
      setWithdrawalRequests(wreqs);
      setMomoSettings(settings);
      setMinDeposit(Number(settings.min_deposit_amount ?? 120));
      setMinWithdrawal(Number(settings.min_withdrawal_amount ?? 50));
      setLoading(false);
    });
  }, [profile?.id, profile?.wallet_balance]);

  const totalInvested = transactions.filter((t) => t.type === 'purchase').reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
  const totalEarned   = transactions.filter((t) => t.type === 'return').reduce((s, t) => s + Number(t.amount), 0);
  const pendingDeposits    = depositRequests.filter((r) => r.status === 'pending').reduce((s, r) => s + Number(r.amount), 0);
  const pendingWithdrawals = withdrawalRequests.filter((r) => r.status === 'pending').reduce((s, r) => s + Number(r.amount), 0);

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
    } catch (_) {
      setTxError('Failed to submit deposit. Please try again.');
    }
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
    } catch (_) {
      setTxError('Failed to submit withdrawal. Please try again.');
    }
  }

  function openDeposit() {
    setAmount(''); setTxError(''); setTxSuccess('');
    setReference(generateReference()); setCopied(false);
    setShowDeposit(true);
  }
  function openWithdraw() { setAmount(''); setTxError(''); setTxSuccess(''); setShowWithdraw(true); }
  function handleCopy() {
    navigator.clipboard.writeText(reference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const inputClass = 'w-full bg-[#0a0a0f] border border-[#2a2a3a] rounded-xl px-4 py-3 text-[#f0f0ff] text-sm placeholder-[#8888aa] focus:outline-none focus:border-[#00d4ff] transition-colors';

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-[#8888aa]">Loading...</div>
  );

  const filteredTxs = txFilter === 'all' ? transactions : transactions.filter((tx) => tx.type === txFilter);

  return (
    <div className="space-y-4">
      {/* Balance card */}
      <div
        className="rounded-2xl p-5 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0d1f2d 0%, #0a0a0f 100%)', border: '1px solid rgba(0,212,255,0.2)' }}
      >
        <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-[#ff6b35]/5" />
        <div className="w-10 h-10 rounded-2xl bg-[#ff6b35]/10 flex items-center justify-center mb-3">
          <WalletIcon size={20} className="text-[#ff6b35]" />
        </div>
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
          <p className="text-xs text-orange-400 mb-3 flex items-center gap-1">
            <Clock size={11} /> ₵{pendingWithdrawals.toFixed(2)} withdrawal pending
          </p>
        )}
        <div className="flex gap-3 mt-4">
          <button
            onClick={openDeposit}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#00d4ff] text-black font-bold text-sm"
          >
            <Plus size={16} /> Deposit
          </button>
          <button
            onClick={openWithdraw}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-[#00d4ff]/40 text-[#00d4ff] font-bold text-sm"
          >
            <Minus size={16} /> Withdraw
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card rounded-2xl p-4">
          <p className="text-xs text-[#8888aa]">Total Invested</p>
          <p className="text-lg font-black text-[#ff6b35]">₵{totalInvested.toFixed(2)}</p>
        </div>
        <div className="glass-card rounded-2xl p-4">
          <p className="text-xs text-[#8888aa]">Total Earned</p>
          <p className="text-lg font-black text-[#00ff88]">₵{totalEarned.toFixed(2)}</p>
        </div>
      </div>

      {/* Deposit Requests */}
      {depositRequests.length > 0 && (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="px-4 pt-4 pb-2 flex items-center gap-2">
            <Clock size={14} className="text-yellow-400" />
            <p className="text-sm font-bold text-[#f0f0ff]">Deposit Requests</p>
          </div>
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
        </div>
      )}

      {/* Withdrawal Requests */}
      {withdrawalRequests.length > 0 && (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="px-4 pt-4 pb-2 flex items-center gap-2">
            <Clock size={14} className="text-orange-400" />
            <p className="text-sm font-bold text-[#f0f0ff]">Withdrawal Requests</p>
          </div>
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
        </div>
      )}

      {/* Transaction History */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="px-4 pt-4 pb-2">
          <p className="text-sm font-bold text-[#f0f0ff]">Transaction History</p>
        </div>

        {/* Filter tabs */}
        {transactions.length > 0 && (
          <div className="px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-none">
            {TX_FILTERS.filter(({ key }) =>
              key === 'all' || transactions.some((tx) => tx.type === key)
            ).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTxFilter(key)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  txFilter === key
                    ? 'border-[#00d4ff] bg-[#00d4ff]/10 text-[#00d4ff]'
                    : 'border-[#2a2a3a] text-[#8888aa]'
                }`}
              >
                {label}
                {key !== 'all' && (
                  <span className="ml-1 opacity-60">
                    ({transactions.filter((tx) => tx.type === key).length})
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {transactions.length === 0 ? (
          <p className="text-sm text-[#8888aa] text-center py-8">No transactions yet.</p>
        ) : filteredTxs.length === 0 ? (
          <p className="text-sm text-[#8888aa] text-center py-8">No {txFilter} transactions.</p>
        ) : (
          <div className="divide-y divide-[#2a2a3a]/50">
            {filteredTxs.map((tx) => {
              const meta = TX_META[tx.type] || { icon: ArrowUpCircle, color: '#8888aa' };
              const Icon = meta.icon;
              const isCredit = Number(tx.amount) > 0;
              return (
                <div key={tx.id} className="flex items-center gap-3 px-4 py-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${meta.color}15` }}
                  >
                    <Icon size={16} style={{ color: meta.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#f0f0ff] truncate">{tx.description}</p>
                    <p className="text-xs text-[#8888aa]">{new Date(tx.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className="text-sm font-bold flex-shrink-0" style={{ color: meta.color }}>
                    {isCredit ? '+' : ''}₵{Math.abs(Number(tx.amount)).toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Deposit Modal */}
      <Modal isOpen={showDeposit} onClose={() => setShowDeposit(false)} title="Request Deposit">
        <div className="space-y-4">
          {momoSettings && (
            <div className="p-4 rounded-xl bg-[#00d4ff]/5 border border-[#00d4ff]/20 space-y-2">
              <p className="text-xs font-bold text-[#00d4ff] uppercase tracking-wide mb-2">Send payment to</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs text-[#8888aa]">Network</p>
                  <p className="text-[#f0f0ff] font-bold">{momoSettings.momo_network}</p>
                </div>
                <div>
                  <p className="text-xs text-[#8888aa]">Number</p>
                  <p className="text-[#f0f0ff] font-bold">{momoSettings.momo_number}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-[#8888aa]">Account Name</p>
                  <p className="text-[#f0f0ff] font-bold">{momoSettings.momo_name}</p>
                </div>
              </div>
            </div>
          )}

          {/* Reference */}
          <div className="p-3 rounded-xl bg-[#7c3aed]/10 border border-[#7c3aed]/30">
            <p className="text-xs text-[#8888aa] mb-2">Use this reference when sending</p>
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-lg font-black text-[#a78bfa] tracking-widest">{reference}</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#7c3aed]/20 text-[#a78bfa]"
              >
                {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
              </button>
            </div>
          </div>

          {/* Presets */}
          <div className="grid grid-cols-4 gap-2">
            {DEPOSIT_PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => setAmount(p.toString())}
                className={`py-2 rounded-xl text-sm font-semibold border transition-all ${
                  amount === p.toString()
                    ? 'border-[#00d4ff] bg-[#00d4ff]/10 text-[#00d4ff]'
                    : 'border-[#2a2a3a] text-[#8888aa]'
                }`}
              >
                ₵{p}
              </button>
            ))}
          </div>

          <input
            type="number"
            placeholder={`Min ₵${minDeposit}`}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={inputClass}
          />

          {txError && <p className="text-red-400 text-sm bg-red-900/20 rounded-xl px-3 py-2">{txError}</p>}
          {txSuccess && <p className="text-yellow-400 text-sm bg-yellow-900/20 rounded-xl px-3 py-2">{txSuccess}</p>}
          {!txSuccess && (
            <button
              onClick={handleDeposit}
              className="w-full py-3 rounded-xl bg-[#00d4ff] text-black font-bold text-sm"
            >
              Submit Deposit Request
            </button>
          )}
        </div>
      </Modal>

      {/* Withdraw Modal */}
      <Modal isOpen={showWithdraw} onClose={() => setShowWithdraw(false)} title="Withdraw Funds">
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-[#0a0a0f] border border-[#2a2a3a]">
            <p className="text-xs text-[#8888aa]">Available Balance</p>
            <p className="text-xl font-black text-[#f0f0ff]">₵{balance.toFixed(2)}</p>
          </div>
          <p className="text-xs text-[#8888aa]">
            Minimum withdrawal: ₵{minWithdrawal}. Your request will be reviewed by an admin.
          </p>
          <input
            type="number"
            placeholder={`Min ₵${minWithdrawal}`}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={inputClass}
          />
          {txError && <p className="text-red-400 text-sm bg-red-900/20 rounded-xl px-3 py-2">{txError}</p>}
          {txSuccess && <p className="text-[#00ff88] text-sm bg-green-900/20 rounded-xl px-3 py-2">{txSuccess}</p>}
          {!txSuccess && (
            <button
              onClick={handleWithdraw}
              className="w-full py-3 rounded-xl bg-[#00d4ff] text-black font-bold text-sm"
            >
              Submit Withdrawal Request
            </button>
          )}
        </div>
      </Modal>
    </div>
  );
}
