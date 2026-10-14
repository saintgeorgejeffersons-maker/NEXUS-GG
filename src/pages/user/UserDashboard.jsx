import { ShoppingCart, Clock, Star, Wallet } from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';
import { SpendingChart } from '../../components/charts/SpendingChart';
import { userMetrics, userOrders } from '../../data/mockData';
import { useNavigate } from 'react-router-dom';

function statusVariant(s) {
  return s.toLowerCase().replace(' ', '') || 'default';
}

export function UserDashboard() {
  const navigate = useNavigate();
  const recent = userOrders.slice(0, 4);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={ShoppingCart} label="Total Orders" value={userMetrics.totalOrders} accent="#00d4ff" trend={12} />
        <StatCard icon={Clock} label="Active Pre-orders" value={userMetrics.activePreorders} accent="#7c3aed" trend={0} />
        <StatCard icon={Star} label="Loyalty Points" value={userMetrics.loyaltyPoints.toLocaleString()} accent="#00ff88" trend={8} />
        <StatCard icon={Wallet} label="Wallet Balance" value={`$${userMetrics.walletBalance.toFixed(2)}`} accent="#ff6b35" trend={-5} />
      </div>

      <SpendingChart />

      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-[#f0f0ff]">Recent Orders</h3>
          <button onClick={() => navigate('/user/orders')} className="text-sm text-[#00d4ff] hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#8888aa] border-b border-[#2a2a3a]">
                <th className="pb-3 pr-4">Order #</th>
                <th className="pb-3 pr-4">Product</th>
                <th className="pb-3 pr-4 hidden sm:table-cell">Date</th>
                <th className="pb-3 pr-4">Amount</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a3a]">
              {recent.map((order) => (
                <tr key={order.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 pr-4 font-mono text-[#00d4ff] text-xs">{order.orderNumber}</td>
                  <td className="py-3 pr-4 text-[#f0f0ff] max-w-[160px] truncate">{order.product}</td>
                  <td className="py-3 pr-4 text-[#8888aa] hidden sm:table-cell">{order.date}</td>
                  <td className="py-3 pr-4 font-medium">${order.amount.toFixed(2)}</td>
                  <td className="py-3"><Badge variant={statusVariant(order.status)}>{order.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => navigate('/user/catalog')}
          className="px-6 py-2.5 rounded-lg text-sm font-medium bg-[#00d4ff] text-black hover:shadow-[0_0_20px_rgba(0,212,255,0.4)] transition-all"
        >Browse Catalog</button>
        <button
          onClick={() => navigate('/user/wallet')}
          className="px-6 py-2.5 rounded-lg text-sm font-medium border border-[#00d4ff] text-[#00d4ff] hover:bg-[#00d4ff]/10 transition-all"
        >Add Funds</button>
      </div>
    </div>
  );
}
