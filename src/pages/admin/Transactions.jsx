import { useEffect, useState } from 'react';
import { Trash2, Filter, ArrowUpCircle, ArrowDownCircle, TrendingUp, ShoppingCart } from 'lucide-react';
import { getAllTransactions, deleteTransaction } from '../../lib/db';

const TX_META = {
  deposit:    { icon: ArrowUpCircle,   color: '#00ff88', label: 'Deposit'    },
  return:     { icon: TrendingUp,      color: '#00d4ff', label: 'Return'     },
  purchase:   { icon: ShoppingCart,    color: '#ff6b35', label: 'Purchase'   },
  withdrawal: { icon: ArrowDownCircle, color: '#ef4444', label: 'Withdrawal' },
};

export function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  async function load() {
    const data = await getAllTransactions();
    setTransactions(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id) {
    setDeleting(id);
    try {
      await deleteTransaction(id);
      setTransactions((prev) => prev.filter((tx) => tx.id !== id));
    } catch (e) {
      console.error(e);
    }
    setDeleting(null);
    setConfirmId(null);
  }

  const filtered = filter === 'all' ? transactions : transactions.filter((tx) => tx.type === filter);

  if (loading)
    return <div className="flex items-center justify-center h-64 text-[#8888aa]">Loading...</div>;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#f0f0ff]">Transactions</h2>
          <p className="text-sm text-[#8888aa]">{filtered.length} transaction{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-[#8888aa]" />
          {['all', 'deposit', 'withdrawal', 'purchase', 'return'].map((f) => (
            <button key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                filter === f
                  ? 'bg-[#00d4ff]/10 text-[#00d4ff] border border-[#00d4ff]/30'
                  : 'text-[#8888aa] border border-[#2a2a3a] hover:text-[#f0f0ff]'
              }`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#8888aa] border-b border-[#2a2a3a]">
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Description</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a3a]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-[#8888aa]">No transactions found.</td>
                </tr>
              ) : (
                filtered.map((tx) => {
                  const meta = TX_META[tx.type] ?? { icon: ArrowUpCircle, color: '#8888aa', label: tx.type };
                  const Icon = meta.icon;
                  return (
                    <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <Icon size={15} style={{ color: meta.color }} />
                          <span className="capitalize text-[#8888aa] text-xs">{meta.label}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-[#f0f0ff] font-medium">{tx.profiles?.full_name ?? 'Unknown'}</p>
                        <p className="text-xs text-[#8888aa]">{tx.profiles?.email ?? ''}</p>
                      </td>
                      <td className="px-5 py-3 text-[#8888aa] max-w-[180px] truncate">{tx.description}</td>
                      <td className="px-5 py-3 font-semibold" style={{ color: meta.color }}>
                        {Number(tx.amount) > 0 ? '+' : ''}₵{Math.abs(Number(tx.amount)).toFixed(2)}
                      </td>
                      <td className="px-5 py-3 text-[#8888aa]">
                        {new Date(tx.created_at).toLocaleDateString()}{' '}
                        <span className="text-xs">{new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </td>
                      <td className="px-5 py-3">
                        {confirmId === tx.id ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleDelete(tx.id)}
                              disabled={deleting === tx.id}
                              className="px-2 py-1 rounded text-xs font-medium bg-red-900/30 text-red-400 border border-red-700/30 hover:bg-red-900/50 transition-all disabled:opacity-50">
                              {deleting === tx.id ? 'Deleting…' : 'Confirm'}
                            </button>
                            <button
                              onClick={() => setConfirmId(null)}
                              className="px-2 py-1 rounded text-xs text-[#8888aa] hover:text-[#f0f0ff] transition-all">
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmId(tx.id)}
                            className="p-1.5 rounded-lg text-[#8888aa] hover:text-red-400 hover:bg-red-900/20 transition-all">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
