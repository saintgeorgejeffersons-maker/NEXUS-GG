import { useEffect, useState } from 'react';
import { Clock, CheckCircle, XCircle, Filter } from 'lucide-react';
import {
  getAllDepositRequests,
  updateDepositRequestStatus,
  updateWalletBalance,
  createTransaction,
  getProfile,
} from '../../lib/db';

const STATUS_STYLE = {
  pending:  'bg-yellow-900/20 text-yellow-400 border border-yellow-700/30',
  approved: 'bg-green-900/20 text-[#00ff88] border border-green-700/30',
  rejected: 'bg-red-900/20 text-red-400 border border-red-700/30',
};

export function Deposits() {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  async function load() {
    const data = await getAllDepositRequests();
    setRequests(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleApprove(req) {
    setProcessing(req.id);
    try {
      // 1. Mark request as approved
      await updateDepositRequestStatus(req.id, 'approved');
      // 2. Credit the user's wallet
      const profile = await getProfile(req.user_id);
      const newBalance = Number(profile.wallet_balance) + Number(req.amount);
      await updateWalletBalance(req.user_id, newBalance);
      // 3. Create a deposit transaction
      await createTransaction({
        user_id: req.user_id,
        type: 'deposit',
        description: 'Wallet Deposit (Approved)',
        amount: Number(req.amount),
      });
      await load();
    } catch (e) {
      console.error(e);
    }
    setProcessing(null);
  }

  async function handleReject(req) {
    setProcessing(req.id);
    try {
      await updateDepositRequestStatus(req.id, 'rejected');
      await load();
    } catch (e) {
      console.error(e);
    }
    setProcessing(null);
  }

  const filtered = requests.filter((r) => filter === 'all' || r.status === filter);
  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  if (loading)
    return <div className="flex items-center justify-center h-64 text-[#8888aa]">Loading...</div>;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#f0f0ff]">Deposit Requests</h2>
          <p className="text-sm text-[#8888aa]">
            {pendingCount > 0
              ? <span className="text-yellow-400">{pendingCount} pending approval</span>
              : 'No pending requests'}
          </p>
        </div>
        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-[#8888aa]" />
          {['pending', 'approved', 'rejected', 'all'].map((f) => (
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
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Reference</th>
                <th className="px-5 py-3">Requested</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a3a]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-[#8888aa]">
                    No {filter === 'all' ? '' : filter} deposit requests.
                  </td>
                </tr>
              ) : (
                filtered.map((req) => (
                  <tr key={req.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#00d4ff]/20 flex items-center justify-center text-xs font-bold text-[#00d4ff] flex-shrink-0">
                          {req.profiles?.full_name?.charAt(0).toUpperCase() ?? '?'}
                        </div>
                        <div>
                          <p className="text-[#f0f0ff] font-medium">{req.profiles?.full_name ?? 'Unknown'}</p>
                          <p className="text-xs text-[#8888aa]">{req.profiles?.email ?? ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-bold text-[#00ff88]">
                      ₵{Number(req.amount).toFixed(2)}
                    </td>
                    <td className="px-5 py-3">
                      <span className="font-mono text-sm text-[#a78bfa] bg-[#7c3aed]/10 px-2 py-1 rounded-lg">
                        {req.reference ?? '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[#8888aa]">
                      {new Date(req.created_at).toLocaleDateString()}{' '}
                      <span className="text-xs">{new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${STATUS_STYLE[req.status]}`}>
                        {req.status === 'pending' && <Clock size={10} className="inline mr-1" />}
                        {req.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {req.status === 'pending' ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApprove(req)}
                            disabled={processing === req.id}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/20 hover:bg-[#00ff88]/20 transition-all disabled:opacity-50">
                            <CheckCircle size={13} /> Approve
                          </button>
                          <button
                            onClick={() => handleReject(req)}
                            disabled={processing === req.id}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-900/20 text-red-400 border border-red-700/30 hover:bg-red-900/40 transition-all disabled:opacity-50">
                            <XCircle size={13} /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-[#8888aa]">
                          {req.reviewed_at ? new Date(req.reviewed_at).toLocaleDateString() : '—'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
