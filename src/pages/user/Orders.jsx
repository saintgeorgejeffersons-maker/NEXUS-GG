import { useState } from 'react';
import { Badge } from '../../components/ui/Badge';
import { userOrders } from '../../data/mockData';
import { Package } from 'lucide-react';

const TABS = ['All', 'Active', 'Completed', 'Cancelled'];

function statusVariant(s) { return s.toLowerCase().replace(' ', ''); }

function isActive(s) { return ['Pending', 'Processing', 'Shipped'].includes(s); }

export function Orders() {
  const [tab, setTab] = useState('All');

  const filtered = userOrders.filter((o) => {
    if (tab === 'All') return true;
    if (tab === 'Active') return isActive(o.status);
    if (tab === 'Completed') return o.status === 'Delivered';
    if (tab === 'Cancelled') return o.status === 'Cancelled';
    return true;
  });

  const totalSpent = userOrders.filter((o) => o.status === 'Delivered').reduce((sum, o) => sum + o.amount, 0);
  const pending = userOrders.filter((o) => isActive(o.status)).length;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        {[{ label: 'Total Spent', value: `$${totalSpent.toFixed(2)}` },
          { label: 'Total Orders', value: userOrders.length },
          { label: 'Active', value: pending }].map((s) => (
          <div key={s.label} className="glass-card p-4 text-center">
            <p className="text-xl font-bold text-[#f0f0ff]">{s.value}</p>
            <p className="text-xs text-[#8888aa] mt-1">{s.label}</p>
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
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-[#8888aa] flex flex-col items-center gap-3">
            <Package size={40} className="opacity-30" />
            <p>No orders in this category</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[#8888aa] border-b border-[#2a2a3a]">
                  <th className="p-4">Order #</th>
                  <th className="p-4">Product</th>
                  <th className="p-4 hidden md:table-cell">Date</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 hidden sm:table-cell">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a3a]">
                {filtered.map((o) => (
                  <tr key={o.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <span className="font-mono text-[#00d4ff] text-xs">{o.orderNumber}</span>
                      {o.isPreorder && <Badge variant="preorder" className="ml-2">Pre-order</Badge>}
                    </td>
                    <td className="p-4 text-[#f0f0ff] max-w-[180px] truncate">{o.product}</td>
                    <td className="p-4 text-[#8888aa] hidden md:table-cell">{o.date}</td>
                    <td className="p-4 font-medium">${o.amount.toFixed(2)}</td>
                    <td className="p-4"><Badge variant={statusVariant(o.status)}>{o.status}</Badge></td>
                    <td className="p-4 hidden sm:table-cell">
                      <button className="text-xs text-[#00d4ff] hover:underline">
                        {isActive(o.status) ? 'Track Order' : 'View Details'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
