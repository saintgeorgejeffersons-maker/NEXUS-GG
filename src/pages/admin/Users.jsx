import { useEffect, useState } from 'react';
import { Users as UsersIcon, Search, Wallet, TrendingUp } from 'lucide-react';
import { getAllProfiles, getAllInvestments } from '../../lib/db';

export function Users() {
  const [users, setUsers] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAllProfiles(), getAllInvestments()]).then(([profiles, invs]) => {
      // exclude admins
      setUsers(profiles.filter((p) => p.role === 'user'));
      setInvestments(invs);
      setLoading(false);
    });
  }, []);

  const filtered = users.filter(
    (u) =>
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.mobile?.includes(search)
  );

  function activeInvestmentsCount(userId) {
    return investments.filter((i) => i.user_id === userId && i.active).length;
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
        {/* Search */}
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
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a3a]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-[#8888aa]">
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
