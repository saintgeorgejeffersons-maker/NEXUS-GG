import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, TrendingUp, ShoppingCart, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StatCard } from '../../components/ui/StatCard';
import { getUserInvestments, getUserTransactions } from '../../lib/db';

const TX_ICONS = {
  deposit:    { icon: '↑', color: '#00ff88' },
  return:     { icon: '↑', color: '#00d4ff' },
  purchase:   { icon: '↓', color: '#ff6b35' },
  withdrawal: { icon: '↓', color: '#ef4444' },
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
  const recentTxs = transactions.slice(0, 4);

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-[#8888aa]">Loading...</div>
  );

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard icon={Wallet} label="Wallet Balance"
          value={`₵${Number(profile?.wallet_balance ?? 0).toFixed(2)}`}
          accent="#ff6b35" />
        <StatCard icon={TrendingUp} label="Total Earned"
          value={`₵${totalEarned.toFixed(2)}`}
          accent="#00ff88" />
      </div>

      {/* Active Investments */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-[#f0f0ff]">My Active Investments</h3>
          <button onClick={() => navigate('/user/catalog')}
            className="text-sm text-[#00d4ff] hover:underline">Browse Store</button>
        </div>

        {investments.length === 0 ? (
          <div className="text-center py-8 text-[#8888aa]">
            <ShoppingCart size={36} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No active investments yet.</p>
            <button onClick={() => navigate('/user/catalog')}
              className="mt-3 px-4 py-2 rounded-lg text-sm bg-[#00d4ff] text-black font-medium">
              Browse Products
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {investments.map((inv) => {
              const elapsed = inv.duration_days - inv.days_remaining;
              const progress = Math.round((elapsed / inv.duration_days) * 100);
              return (
                <div key={inv.id} className="p-4 rounded-lg bg-white/5 border border-[#2a2a3a]">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-semibold text-[#f0f0ff]">{inv.product_name}</p>
                    <span className="text-xs px-2 py-1 rounded-full bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/20">
                      +₵{inv.daily_return}/day
                    </span>
                  </div>
                  <div className="w-full bg-[#2a2a3a] rounded-full h-1.5 mb-2">
                    <div className="h-1.5 rounded-full bg-gradient-to-r from-[#00d4ff] to-[#00ff88] transition-all"
                      style={{ width: `${progress}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-[#8888aa]">
                    <span>Day {elapsed} of {inv.duration_days}</span>
                    <span>{inv.days_remaining} days left</span>
                  </div>
                  <div className="flex justify-between mt-2 text-xs">
                    <span className="text-[#8888aa]">Invested: <span className="text-[#f0f0ff]">₵{inv.price}</span></span>
                    <span className="text-[#8888aa]">Earned: <span className="text-[#00ff88]">₵{Number(inv.total_earned).toFixed(2)}</span></span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-[#f0f0ff]">Recent Transactions</h3>
          <button onClick={() => navigate('/user/wallet')}
            className="text-sm text-[#00d4ff] hover:underline">View All</button>
        </div>
        {recentTxs.length === 0 ? (
          <p className="text-sm text-[#8888aa] text-center py-4">No transactions yet.</p>
        ) : (
          <div className="space-y-2">
            {recentTxs.map((tx) => {
              const meta = TX_ICONS[tx.type] || { icon: '·', color: '#8888aa' };
              return (
                <div key={tx.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
                  <span className="text-lg font-bold w-6 text-center" style={{ color: meta.color }}>{meta.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#f0f0ff] truncate">{tx.description}</p>
                    <p className="text-xs text-[#8888aa]">{new Date(tx.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className="text-sm font-semibold" style={{ color: meta.color }}>
                    {Number(tx.amount) >= 0 ? '+' : ''}₵{Math.abs(tx.amount).toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <button onClick={() => navigate('/user/catalog')}
          className="px-6 py-2.5 rounded-lg text-sm font-medium bg-[#00d4ff] text-black hover:opacity-90 transition-all">
          Browse Store
        </button>
        <button onClick={() => navigate('/user/wallet')}
          className="px-6 py-2.5 rounded-lg text-sm font-medium border border-[#00d4ff] text-[#00d4ff] hover:bg-[#00d4ff]/10 transition-all">
          Manage Wallet
        </button>
      </div>
    </div>
  );
}
