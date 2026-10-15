import { useEffect, useState } from 'react';
import { TrendingUp, Users, Package, DollarSign } from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';
import { getAdminMetrics, getProducts, getAllTransactions } from '../../lib/db';

export function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [products, setProducts] = useState([]);
  const [recentTxs, setRecentTxs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getAdminMetrics(),
      getProducts(),
      getAllTransactions(),
    ]).then(([m, p, txs]) => {
      setMetrics(m);
      setProducts(p);
      setRecentTxs(txs.slice(0, 8));
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-[#8888aa]">Loading...</div>
  );

  const TX_COLORS = { deposit: '#00ff88', withdrawal: '#ef4444', purchase: '#ff6b35', return: '#00d4ff' };

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label="Total Deposits"
          value={`₵${Number(metrics?.totalDeposits ?? 0).toLocaleString()}`}
          accent="#00ff88" />
        <StatCard icon={Users} label="Total Users"
          value={metrics?.totalUsers ?? 0}
          accent="#00d4ff" />
        <StatCard icon={Package} label="Active Investments"
          value={metrics?.activeInvestments ?? 0}
          accent="#7c3aed" />
        <StatCard icon={TrendingUp} label="Total Paid Out"
          value={`₵${Number(metrics?.totalPaidOut ?? 0).toLocaleString()}`}
          accent="#ff6b35" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Products Overview */}
        <div className="glass-card p-5">
          <h3 className="text-base font-semibold text-[#f0f0ff] mb-4">Products Overview</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[#8888aa] border-b border-[#2a2a3a]">
                  <th className="pb-3 pr-4">Product</th>
                  <th className="pb-3 pr-4">Price</th>
                  <th className="pb-3 pr-4">Daily</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a3a]">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 pr-4 text-[#f0f0ff] font-medium truncate max-w-[120px]">{p.name}</td>
                    <td className="py-3 pr-4 text-[#8888aa]">₵{p.price}</td>
                    <td className="py-3 pr-4" style={{ color: '#00ff88' }}>+₵{Math.abs(Number(p.daily_return))}</td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        p.active
                          ? 'bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/20'
                          : 'bg-[#8888aa]/10 text-[#8888aa] border border-[#8888aa]/20'
                      }`}>
                        {p.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="glass-card p-5">
          <h3 className="text-base font-semibold text-[#f0f0ff] mb-4">Recent Transactions</h3>
          {recentTxs.length === 0 ? (
            <p className="text-sm text-[#8888aa] text-center py-6">No transactions yet.</p>
          ) : (
            <div className="space-y-2">
              {recentTxs.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-[#f0f0ff] truncate">{tx.description}</p>
                    <p className="text-xs text-[#8888aa]">
                      {tx.profiles?.full_name ?? 'Unknown'} · {new Date(tx.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-sm font-semibold ml-3 flex-shrink-0"
                    style={{ color: TX_COLORS[tx.type] ?? '#f0f0ff' }}>
                    {Number(tx.amount) > 0 ? '+' : ''}₵{Math.abs(Number(tx.amount)).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
