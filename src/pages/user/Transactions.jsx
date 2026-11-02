import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowUpCircle, ArrowDownCircle, TrendingUp, ShoppingCart, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getUserTransactions } from '../../lib/db';

const TX_META = {
  deposit:             { icon: ArrowUpCircle,   color: '#00ff88', label: 'Deposit'    },
  return:              { icon: TrendingUp,       color: '#00d4ff', label: 'Return'     },
  purchase:            { icon: ShoppingCart,     color: '#ff6b35', label: 'Purchase'   },
  withdrawal:          { icon: ArrowDownCircle,  color: '#ef4444', label: 'Withdrawal' },
  referral_commission: { icon: Users,            color: '#a78bfa', label: 'Referral'   },
};

const TX_FILTERS = [
  { key: 'all',                label: 'All'         },
  { key: 'return',             label: 'Returns'     },
  { key: 'deposit',            label: 'Deposits'    },
  { key: 'purchase',           label: 'Purchases'   },
  { key: 'withdrawal',         label: 'Withdrawals' },
  { key: 'referral_commission',label: 'Referrals'   },
];

export function Transactions() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [txFilter, setTxFilter] = useState('all');

  useEffect(() => {
    if (!profile?.id) return;
    getUserTransactions(profile.id).then((txs) => {
      setTransactions(txs);
      setLoading(false);
    });
  }, [profile?.id]);

  const filteredTxs = txFilter === 'all'
    ? transactions
    : transactions.filter((tx) => tx.type === txFilter);

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-[#8888aa]">Loading...</div>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/user/profile')}
          className="w-9 h-9 rounded-xl bg-[#1a1a24] border border-[#2a2a3a] flex items-center justify-center text-[#8888aa] hover:text-[#f0f0ff] transition-colors flex-shrink-0"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <p className="text-lg font-black text-[#f0f0ff]">Transaction History</p>
          <p className="text-xs text-[#8888aa]">{transactions.length} total transactions</p>
        </div>
      </div>

      {/* Filter tabs */}
      {transactions.length > 0 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
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

      {/* List */}
      <div className="glass-card rounded-2xl overflow-hidden">
        {transactions.length === 0 ? (
          <p className="text-sm text-[#8888aa] text-center py-10">No transactions yet.</p>
        ) : filteredTxs.length === 0 ? (
          <p className="text-sm text-[#8888aa] text-center py-10">No {txFilter} transactions.</p>
        ) : (
          <div className="divide-y divide-[#2a2a3a]/50">
            {filteredTxs.map((tx) => {
              const meta = TX_META[tx.type] || { icon: ArrowUpCircle, color: '#8888aa' };
              const Icon = meta.icon;
              const isCredit = Number(tx.amount) > 0;
              return (
                <div key={tx.id} className="flex items-center gap-3 px-4 py-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${meta.color}15` }}
                  >
                    <Icon size={18} style={{ color: meta.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#f0f0ff] truncate">{tx.description}</p>
                    <p className="text-xs text-[#8888aa]">
                      {new Date(tx.created_at).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
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
    </div>
  );
}
