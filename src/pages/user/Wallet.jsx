import { useState, useEffect, useCallback } from 'react';
import { Wallet as WalletIcon, ArrowUpCircle, ArrowDownCircle, TrendingUp, ShoppingCart, Clock, Copy, Check, Users } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import {
  getUserTransactions, createTransaction, updateWalletBalance,
  createDepositRequest, getUserDepositRequests, getSettings,
  createWithdrawalRequest, getUserWithdrawalRequests,
} from '../../lib/db';

const DEPOSIT_PRESETS = [120, 200, 500, 1000];

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

  function generateReference() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const rand = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    return `NXS-${rand}`;
  }
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

  const totalInvested = transactions
    .filter((t) => t.type === 'purchase')
    .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);

  const totalEarned = transactions
    .filter((t) => t.type === 'return')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const pendingDeposits = depositRequests
    .filter((r) => r.status === 'pending')
    .reduce((sum, r) => sum + Number(r.amount), 0);

  const pendingWithdrawals = withdrawalRequests
    .filter((r) => r.status === 'pending')
    .reduce((sum, r) => sum + Number(r.amount), 0);

  async function handleDeposit() {
    const val = parseFloat(amount);
    if (!val || val <= 0) { setTxError('Enter a valid amount.'); return; }
    if (val < minDeposit) { setTxError(`Minimum deposit amount is ₵${minDeposit}.`); return; }
    setTxError('');
    try {
      await createDepositRequest(profile.id, val, reference);
      const reqs = await getUserDepositRequests(profile.id);
      setDepositRequests(reqs);
      setTxSuccess(`Deposit request for ₵${val.toFixed(2)} submitted. Awaiting admin approval.`);
      setAmount('');
      setTimeout(() => { setTxSuccess(''); setShowDeposit(false); }, 2500);
    } catch (e) {
      setTxError('Failed to submit deposit request. Please try again.');
    }
  }

  async function handleWithdraw() {
    const val = parseFloat(amount);
    if (!val || val <= 0) { setTxError('Enter a valid amount.'); return; }
    if (val < minWithdrawal) { setTxError(`Minimum withdrawal amount is ₵${minWithdrawal}.`); return; }
    if (val > balance) { setTxError('Insufficient balance.'); return; }
    setTxError('');
    try {
      await createWithdrawalRequest(profile.id, val);
      const wreqs = await getUserWithdrawalRequests(profile.id);
      setWithdrawalRequests(wreqs);
      setTxSuccess(`Withdrawal request for ₵${val.toFixed(2)} submitted. Awaiting admin approval.`);
      setAmount('');
      setTimeout(() => { setTxSuccess(''); setShowWithdraw(false); }, 2500);
    } catch (e) {
      setTxError('Failed to submit withdrawal request. Please try again.');
    }
  }

  function openDeposit() { setAmount(''); setTxError(''); setTxSuccess(''); setReference(generateReference()); setCopied(false); setShowDeposit(true); }
  function openWithdraw() { setAmount(''); setTxError(''); setTxSuccess(''); setShowWithdraw(true); }

  function handleCopy() {
    navigator.clipboard.writeText(reference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const inputClass = 'w-full bg-[#111118] border border-[#2a2a3a] rounded-lg px-4 py-3 text-[#f0f0ff] text-sm placeholder-[#8888aa] focus:outline-none focus:border-[#00d4ff] transition-colors';

  if (loading) return <div className="flex items-center justify-center h-64 text-[#8888aa]">Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <div className="glass-card p-8 text-center" style={{ border: '1px solid rgba(0,212,255,0.2)' }}>
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#ff6b35]/10 mb-4">
          <WalletIcon size={28} className="text-[#ff6b35]" />
        </div>
        <p className="text-[#8888aa] text-sm mb-1">Available Balance</p>
        <p className="text-5xl font-black text-[#f0f0ff] mb-2">₵{balance.toLocaleString()}</p>
        {pendingDeposits > 0 && (
          <p className="text-xs text-yellow-400 mb-1 flex items-center justify-center gap-1">
            <Clock size={12} /> ₵{pendingDeposits.toFixed(2)} deposit pending approval
          </p>
        )}
        {pendingWithdrawals > 0 && (
          <p className="text-xs text-orange-400 mb-4 flex items-center justify-center gap-1">
            <Clock size={12} /> ₵{pendingWithdrawals.toFixed(2)} withdrawal pending approval
          </p>
        )}
        <div className="flex gap-3 justify-center mt-4">
          <button onClick={openDeposit}
            className="px-8 py-3 rounded-lg bg-[#00d4ff] text-black font-bold text-sm hover:opacity-90 transition-all">
            Deposit
          </button>
          <button onClick={openWithdraw}
            className="px-8 py-3 rounded-lg border border-[#00d4ff] text-[#00d4ff] font-bold text-sm hover:bg-[#00d4ff]/10 transition-all">
            Withdraw
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Invested', value: `₵${totalInvested.toFixed(2)}`, color: '#ff6b35' },
          { label: 'Total Earned',   value: `₵${totalEarned.toFixed(2)}`,   color: '#00ff88' },
          { label: 'Available',      value: `₵${balance.toFixed(2)}`,       color: '#00d4ff' },
        ].map((s) => (
          <div key={s.label} className="glass-card p-4 text-center">
            <p className="text-lg font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-[#8888aa] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Deposit Requests */}
      {depositRequests.length > 0 && (
        <div className="glass-card p-5">
          <h3 className="text-base font-semibold text-[#f0f0ff] mb-4 flex items-center gap-2">
            <Clock size={16} className="text-yellow-400" /> Deposit Requests
          </h3>
          <div className="space-y-2">
            {depositRequests.map((req) => (
              <div key={req.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div>
                  <p className="text-sm text-[#f0f0ff] font-medium">₵{Number(req.amount).toFixed(2)}</p>
                  <p className="text-xs text-[#8888aa]">{new Date(req.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${STATUS_STYLE[req.status]}`}>
                  {req.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Withdrawal Requests */}
      {withdrawalRequests.length > 0 && (
        <div className="glass-card p-5">
          <h3 className="text-base font-semibold text-[#f0f0ff] mb-4 flex items-center gap-2">
            <Clock size={16} className="text-orange-400" /> Withdrawal Requests
          </h3>
          <div className="space-y-2">
            {withdrawalRequests.map((req) => (
              <div key={req.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div>
                  <p className="text-sm text-[#f0f0ff] font-medium">₵{Number(req.amount).toFixed(2)}</p>
                  <p className="text-xs text-[#8888aa]">{new Date(req.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${STATUS_STYLE[req.status]}`}>
                  {req.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transaction History */}
      <div className="glass-card p-5">
        <h3 className="text-base font-semibold text-[#f0f0ff] mb-4">Transaction History</h3>

        {/* Filter tabs */}
        {transactions.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-4">
            {TX_FILTERS.filter(({ key }) => {
              if (key === 'all') return true;
              return transactions.some((tx) => tx.type === key);
            }).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTxFilter(key)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  txFilter === key
                    ? 'border-[#00d4ff] bg-[#00d4ff]/10 text-[#00d4ff]'
                    : 'border-[#2a2a3a] text-[#8888aa] hover:text-[#f0f0ff] hover:border-[#8888aa]'
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
          <p className="text-sm text-[#8888aa] text-center py-6">No transactions yet.</p>
        ) : (() => {
          const filtered = txFilter === 'all'
            ? transactions
            : transactions.filter((tx) => tx.type === txFilter);
          return filtered.length === 0 ? (
            <p className="text-sm text-[#8888aa] text-center py-6">No {txFilter} transactions yet.</p>
          ) : (
            <div className="space-y-2">
              {filtered.map((tx) => {
                const meta = TX_META[tx.type] || { icon: ArrowUpCircle, color: '#8888aa' };
                const Icon = meta.icon;
                const isCredit = Number(tx.amount) > 0;
                return (
                  <div key={tx.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
                    <Icon size={20} style={{ color: meta.color }} className="flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#f0f0ff] truncate">{tx.description}</p>
                      <p className="text-xs text-[#8888aa]">{new Date(tx.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className="text-sm font-semibold" style={{ color: meta.color }}>
                      {isCredit ? '+' : ''}₵{Math.abs(Number(tx.amount)).toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>

      {/* Deposit Modal */}
      <Modal isOpen={showDeposit} onClose={() => setShowDeposit(false)} title="Request Deposit">
        <div className="space-y-4">
          {/* Momo Payment Details */}
          {momoSettings && (
            <div className="p-4 rounded-lg bg-[#00d4ff]/5 border border-[#00d4ff]/20 space-y-2">
              <p className="text-xs font-semibold text-[#00d4ff] uppercase tracking-wide mb-2">Send payment to</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs text-[#8888aa]">Network</p>
                  <p className="text-[#f0f0ff] font-semibold">{momoSettings.momo_network}</p>
                </div>
                <div>
                  <p className="text-xs text-[#8888aa]">Number</p>
                  <p className="text-[#f0f0ff] font-semibold">{momoSettings.momo_number}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-[#8888aa]">Account Name</p>
                  <p className="text-[#f0f0ff] font-semibold">{momoSettings.momo_name}</p>
                </div>
              </div>
              <p className="text-xs text-[#8888aa] pt-1">After sending, submit your request below for admin confirmation.</p>
            </div>
          )}

          {/* Reference */}
          <div className="p-3 rounded-lg bg-[#7c3aed]/10 border border-[#7c3aed]/30">
            <p className="text-xs text-[#8888aa] mb-1.5">Your payment reference — use this when sending</p>
            <div className="flex items-center justify-between gap-2">
              <span className="text-base font-mono font-bold text-[#a78bfa] tracking-widest">{reference}</span>
              <button onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#7c3aed]/20 text-[#a78bfa] hover:bg-[#7c3aed]/30 transition-all flex-shrink-0">
                {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {DEPOSIT_PRESETS.map((p) => (
              <button key={p} onClick={() => setAmount(p.toString())}
                className={`py-2 rounded-lg text-sm font-medium border transition-all ${
                  amount === p.toString()
                    ? 'border-[#00d4ff] bg-[#00d4ff]/10 text-[#00d4ff]'
                    : 'border-[#2a2a3a] text-[#8888aa] hover:text-[#f0f0ff]'
                }`}>
                ₵{p}
              </button>
            ))}
          </div>
          <input type="number" placeholder="Custom amount" value={amount}
            onChange={(e) => setAmount(e.target.value)} className={inputClass} />
          <p className="text-xs text-[#8888aa] mt-1">Minimum deposit: ₵{minDeposit}</p>
          {txError && <p className="text-red-400 text-sm bg-red-900/20 rounded-lg px-3 py-2">{txError}</p>}
          {txSuccess && <p className="text-yellow-400 text-sm bg-yellow-900/20 rounded-lg px-3 py-2">{txSuccess}</p>}
          {!txSuccess && (
            <button onClick={handleDeposit}
              className="w-full py-3 rounded-lg bg-[#00d4ff] text-black font-bold text-sm hover:opacity-90 transition-all">
              Submit Deposit Request
            </button>
          )}
        </div>
      </Modal>

      {/* Withdraw Modal */}
      <Modal isOpen={showWithdraw} onClose={() => setShowWithdraw(false)} title="Withdraw Funds">
        <div className="space-y-4">
          <p className="text-sm text-[#8888aa]">Available balance: <span className="text-[#f0f0ff] font-semibold">₵{balance.toFixed(2)}</span></p>
          <p className="text-xs text-[#8888aa]">Minimum withdrawal: ₵{minWithdrawal}. Your request will be reviewed by an admin before being processed.</p>
          <input type="number" placeholder="Amount to withdraw" value={amount}
            onChange={(e) => setAmount(e.target.value)} className={inputClass} />
          {txError && <p className="text-red-400 text-sm bg-red-900/20 rounded-lg px-3 py-2">{txError}</p>}
          {txSuccess && <p className="text-[#00ff88] text-sm bg-green-900/20 rounded-lg px-3 py-2">{txSuccess}</p>}
          {!txSuccess && (
            <button onClick={handleWithdraw}
              className="w-full py-3 rounded-lg bg-[#00d4ff] text-black font-bold text-sm hover:opacity-90 transition-all">
              Submit Withdrawal Request
            </button>
          )}
        </div>
      </Modal>
    </div>
  );
}
