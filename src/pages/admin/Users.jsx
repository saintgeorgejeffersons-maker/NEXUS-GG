import { useEffect, useState } from 'react';
import { Search, Wallet, TrendingUp, Trash2, KeyRound, Eye, EyeOff } from 'lucide-react';
import { getAllProfiles, getAllInvestments, deleteUserAccount, adminResetPassword } from '../../lib/db';
import { Modal } from '../../components/ui/Modal';

export function Users() {
  const [users, setUsers] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [confirmId, setConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(null);

  // Reset password state
  const [resetUser, setResetUser] = useState(null); // { id, full_name }
  const [newPassword, setNewPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [resetSaving, setResetSaving] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

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
    setResetUser(u);
    setNewPassword('');
    setShowPw(false);
    setResetError('');
    setResetSuccess('');
  }

  function closeResetModal() {
    setResetUser(null);
    setNewPassword('');
    setResetError('');
    setResetSuccess('');
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
    } finally {
      setResetSaving(false);
    }
  }

  async function handleDelete(userId) {
    setDeleting(userId);
    try {
      await deleteUserAccount(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (e) {
      console.error('Failed to delete user:', e);
    }
    setDeleting(null);
    setConfirmId(null);
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
                <th className="px-5 py-3">
                  <span className="flex items-center gap-1"><Wallet size={13} /> Balance</span>
                </th>
                <th className="px-5 py-3">
                  <span className="flex items-center gap-1"><TrendingUp size={13} /> Investments</span>
                </th>
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
                  <tr key={u.id} className="hover:bg-white/5 transition-colors">
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
                    <td className="px-5 py-3 text-[#8888aa]">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        {/* Reset Password */}
                        <button
                          onClick={() => openResetModal(u)}
                          title="Reset password"
                          className="p-1.5 rounded-lg text-[#8888aa] hover:text-[#00d4ff] hover:bg-[#00d4ff]/10 transition-all">
                          <KeyRound size={14} />
                        </button>
                        {/* Delete */}
                        {confirmId === u.id ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleDelete(u.id)}
                              disabled={deleting === u.id}
                              className="px-2 py-1 rounded text-xs font-medium bg-red-900/30 text-red-400 border border-red-700/30 hover:bg-red-900/50 transition-all disabled:opacity-50">
                              {deleting === u.id ? 'Deleting…' : 'Confirm'}
                            </button>
                            <button
                              onClick={() => setConfirmId(null)}
                              className="px-2 py-1 rounded text-xs text-[#8888aa] hover:text-[#f0f0ff] transition-all">
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmId(u.id)}
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
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8888aa] hover:text-[#f0f0ff] transition-colors">
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {resetError   && <p className="text-red-400 text-sm bg-red-900/20 rounded-xl px-3 py-2">{resetError}</p>}
          {resetSuccess && <p className="text-[#00ff88] text-sm bg-green-900/20 rounded-xl px-3 py-2">{resetSuccess}</p>}
          {!resetSuccess && (
            <button
              onClick={handleResetPassword}
              disabled={resetSaving}
              className="w-full py-3 rounded-xl bg-[#00d4ff] text-black font-bold text-sm disabled:opacity-50">
              {resetSaving ? 'Updating…' : 'Set New Password'}
            </button>
          )}
        </div>
      </Modal>
    </div>
  );
}
