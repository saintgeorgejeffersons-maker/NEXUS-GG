import { useState } from 'react';
import { Search } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { adminOrders as initialOrders } from '../../data/mockData';

const TABS = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const NEXT_STATUS = { Pending: 'Processing', Processing: 'Shipped', Shipped: 'Delivered' };

function statusVariant(s) { return s.toLowerCase().replace(' ', ''); }

export function OrderFulfillment() {
  const [orders, setOrders] = useState(initialOrders);
  const [tab, setTab] = useState('All');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]);
  const [bulkStatus, setBulkStatus] = useState('Processing');

  const filtered = orders.filter((o) => {
    const matchTab = tab === 'All' || o.status === tab;
    const matchSearch = !search || o.orderNumber.toLowerCase().includes(search.toLowerCase()) || o.customer.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const updateStatus = (id, status) => setOrders((list) => list.map((o) => o.id === id ? { ...o, status } : o));
  const toggleSelect = (id) => setSelected((s) => s.includes(id) ? s.filter((i) => i !== id) : [...s, id]);
  const applyBulk = () => { selected.forEach((id) => updateStatus(id, bulkStatus)); setSelected([]); };

  const statusCounts = TABS.slice(1).reduce((acc, t) => { acc[t] = orders.filter((o) => o.status === t).length; return acc; }, {});

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8888aa]" />
          <input
            className="w-full pl-9 pr-4 py-2.5 bg-[#1a1a24] border border-[#2a2a3a] rounded-lg text-sm text-[#f0f0ff] placeholder-[#8888aa] focus:outline-none focus:border-[#00d4ff] transition-colors"
            placeholder="Search by order # or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {selected.length > 0 && (
          <div className="flex items-center gap-2">
            <select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)}
              className="bg-[#1a1a24] border border-[#2a2a3a] rounded-lg px-3 py-2.5 text-sm text-[#f0f0ff] focus:outline-none">
              {['Processing', 'Shipped', 'Delivered', 'Cancelled'].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <button onClick={applyBulk} className="px-4 py-2.5 rounded-lg bg-[#7c3aed] text-white text-sm font-medium hover:bg-[#6d28d9] transition-colors whitespace-nowrap">
              Apply to {selected.length}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
        {TABS.slice(1).map((t) => (
          <div key={t} className="glass-card p-3 text-center">
            <p className="text-xl font-bold text-[#f0f0ff]">{statusCounts[t]}</p>
            <p className="text-xs text-[#8888aa] mt-0.5">{t}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-full text-sm transition-all ${
              tab === t ? 'bg-[#00d4ff] text-black font-medium' : 'bg-[#1a1a24] border border-[#2a2a3a] text-[#8888aa] hover:text-[#f0f0ff]'
            }`}>{t}</button>
        ))}
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#8888aa] border-b border-[#2a2a3a]">
                <th className="p-4 w-10">
                  <input type="checkbox"
                    checked={selected.length === filtered.length && filtered.length > 0}
                    onChange={(e) => setSelected(e.target.checked ? filtered.map((o) => o.id) : [])}
                    className="accent-[#00d4ff]" />
                </th>
                <th className="p-4">Order #</th>
                <th className="p-4">Customer</th>
                <th className="p-4 hidden md:table-cell">Product</th>
                <th className="p-4 hidden sm:table-cell">Date</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a3a]">
              {filtered.map((o) => (
                <tr key={o.id} className={`hover:bg-white/5 transition-colors ${selected.includes(o.id) ? 'bg-[#00d4ff]/5' : ''}`}>
                  <td className="p-4">
                    <input type="checkbox" checked={selected.includes(o.id)} onChange={() => toggleSelect(o.id)} className="accent-[#00d4ff]" />
                  </td>
                  <td className="p-4 font-mono text-[#00d4ff] text-xs">{o.orderNumber}</td>
                  <td className="p-4 text-[#f0f0ff] font-medium">{o.customer}</td>
                  <td className="p-4 text-[#8888aa] hidden md:table-cell max-w-[140px] truncate">{o.product}</td>
                  <td className="p-4 text-[#8888aa] hidden sm:table-cell">{o.date}</td>
                  <td className="p-4 font-medium">${o.amount.toFixed(2)}</td>
                  <td className="p-4"><Badge variant={statusVariant(o.status)}>{o.status}</Badge></td>
                  <td className="p-4">
                    <select
                      value={o.status}
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                      className="bg-[#1a1a24] border border-[#2a2a3a] rounded px-2 py-1 text-xs text-[#f0f0ff] focus:outline-none focus:border-[#00d4ff] transition-colors"
                    >
                      {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
