import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, ShoppingCart, Wallet, ArrowRight, Coins } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getUserInvestments, getUserTransactions } from '../../lib/db';

const TX_META = {
  deposit:             { color: '#00ff88', sign: '+' },
  return:              { color: '#00d4ff', sign: '+' },
  purchase:            { color: '#ff6b35', sign: '-' },
  withdrawal:          { color: '#ef4444', sign: '-' },
  referral_commission: { color: '#a78bfa', sign: '+' },
};

export function UserDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [investments, setInvestments] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.id) return;
    Promise.all([
      getUserInvestments(profile.id),
      getUserTransactions(profile.id),
    ]).then(([inv, txs]) => {
      setInvestments(inv);
      setTransactions(txs);
      setLoading(false);
    });
  }, [profile?.id]);

  const totalEarned = investments.reduce((sum, i) => sum + Number(i.total_earned), 0);
  const balance = Number(profile?.wallet_balance ?? 0);
  const recentTxs = transactions.slice(0, 5);

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-[#8888aa]">Loading...</div>
  );

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <div className="pt-1">
        <p className="text-xs text-[#8888aa]">Welcome back 👋</p>
        <p className="text-xl font-black text-[#f0f0ff] truncate">{profile?.full_name ?? 'Investor'}</p>
      </div>

      {/* Balance Hero */}
      <div
        className="rounded-2xl p-5 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0d1f2d 0%, #0a0a0f 100%)', border: '1px solid rgba(0,212,255,0.2)' }}
      >
        <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-[#00d4ff]/5" />
        <div className="absolute -right-2 -bottom-4 w-20 h-20 rounded-full bg-[#00ff88]/5" />
        <p className="text-xs text-[#8888aa] mb-1">Wallet Balance</p>
        <p className="text-4xl font-black text-[#f0f0ff] mb-4">₵{balance.toLocaleString('en', { minimumFractionDigits: 2 })}</p>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/user/wallet')}
            className="flex-1 py-2.5 rounded-xl bg-[#00d4ff] text-black text-sm font-bold"
          >
            Deposit
          </button>
          <button
            onClick={() => navigate('/user/wallet')}
            className="flex-1 py-2.5 rounded-xl border border-[#00d4ff]/40 text-[#00d4ff] text-sm font-bold"
          >
            Withdraw
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card p-4 rounded-2xl">
          <div className="w-8 h-8 rounded-xl bg-[#00ff88]/10 flex items-center justify-center mb-2">
            <TrendingUp size={16} className="text-[#00ff88]" />
          </div>
          <p className="text-xs text-[#8888aa]">Total Earned</p>
          <p className="text-lg font-black text-[#00ff88]">₵{totalEarned.toFixed(2)}</p>
        </div>
        <div className="glass-card p-4 rounded-2xl">
          <div className="w-8 h-8 rounded-xl bg-[#7c3aed]/10 flex items-center justify-center mb-2">
            <Coins size={16} className="text-[#7c3aed]" />
          </div>
          <p className="text-xs text-[#8888aa]">Active Plans</p>
          <p className="text-lg font-black text-[#f0f0ff]">{investments.length}</p>
        </div>
      </div>

      {/* Active Investments */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <p className="text-sm font-bold text-[#f0f0ff]">Active Investments</p>
          <button
            onClick={() => navigate('/user/investments')}
            className="flex items-center gap-1 text-xs text-[#00d4ff]"
          >
            View all <ArrowRight size={12} />
          </button>
        </div>

        {investments.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-8 px-4">
            <div className="w-12 h-12 rounded-2xl bg-[#2a2a3a] flex items-center justify-center">
              <ShoppingCart size={22} className="text-[#8888aa]" />
            </div>
            <p className="text-sm text-[#8888aa] text-center">No active investments yet.</p>
            <button
              onClick={() => navigate('/user/catalog')}
              className="px-5 py-2 rounded-xl bg-[#00d4ff] text-black text-sm font-bold"
            >
              Browse Store
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#2a2a3a]/50">
            {investments.slice(0, 3).map((inv) => {
              const elapsed = inv.duration_days - inv.days_remaining;
              const progress = Math.round((elapsed / inv.duration_days) * 100);
              return (
                <div key={inv.id} className="px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-[#f0f0ff] truncate flex-1 mr-2">{inv.product_name}</p>
                    <span className="text-xs text-[#00ff88] font-semibold flex-shrink-0">+₵{Number(inv.daily_return).toFixed(2)}/d</span>
                  </div>
                  <div className="w-full bg-[#2a2a3a] rounded-full h-1 mb-1.5">
                    <div
                      className="h-1 rounded-full bg-gradient-to-r from-[#00d4ff] to-[#00ff88]"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-[#8888aa]">
                    <span>Day {elapsed} / {inv.duration_days}</span>
                    <span className="text-[#00ff88]">₵{Number(inv.total_earned).toFixed(2)} earned</span>
                  </div>
                </div>
              );
            })}
            {investments.length > 3 && (
              <div className="px-4 py-3 text-center">
                <button onClick={() => navigate('/user/investments')} className="text-xs text-[#00d4ff]">
                  +{investments.length - 3} more
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <p className="text-sm font-bold text-[#f0f0ff]">Recent Transactions</p>
          <button
            onClick={() => navigate('/user/wallet')}
            className="flex items-center gap-1 text-xs text-[#00d4ff]"
          >
            View all <ArrowRight size={12} />
          </button>
        </div>

        {recentTxs.length === 0 ? (
          <p className="text-sm text-[#8888aa] text-center py-8">No transactions yet.</p>
        ) : (
          <div className="divide-y divide-[#2a2a3a]/50">
            {recentTxs.map((tx) => {
              const meta = TX_META[tx.type] || { color: '#8888aa', sign: '' };
              const isCredit = Number(tx.amount) > 0;
              return (
                <div key={tx.id} className="flex items-center gap-3 px-4 py-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold"
                    style={{ background: `${meta.color}15`, color: meta.color }}
                  >
                    {isCredit ? '↑' : '↓'}
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

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 pb-2">
        <button
          onClick={() => navigate('/user/catalog')}
          className="py-3.5 rounded-2xl bg-[#00d4ff] text-black text-sm font-bold"
        >
          Browse Store
        </button>
        <button
          onClick={() => navigate('/user/referrals')}
          className="py-3.5 rounded-2xl border border-[#00d4ff]/40 text-[#00d4ff] text-sm font-bold"
        >
          Refer & Earn
        </button>
      </div>
    </div>
  );
}
