import { TrendingUp, Package, Users, AlertTriangle } from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';
import { SalesChart } from '../../components/charts/SalesChart';
import { adminMetrics, adminOrders, consoles } from '../../data/mockData';

function statusVariant(s) { return s.toLowerCase().replace(' ', ''); }

export function AdminDashboard() {
  const recent = adminOrders.slice(0, 5);
  const lowStock = consoles.filter((c) => c.stockCount < 10 && c.stockStatus !== 'Out of Stock');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={TrendingUp} label="Total Revenue" value={`$${(adminMetrics.totalRevenue / 1000).toFixed(0)}K`} accent="#00ff88" trend={18} />
        <StatCard icon={Package} label="Consoles Sold" value={adminMetrics.totalSold.toLocaleString()} accent="#00d4ff" trend={11} />
        <StatCard icon={Users} label="Active Users" value={adminMetrics.activeUsers.toLocaleString()} accent="#7c3aed" trend={24} />
        <StatCard icon={AlertTriangle} label="Low Stock Alerts" value={adminMetrics.lowStockAlerts} accent="#ff6b35" trend={-2} />
      </div>

      <SalesChart />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="glass-card p-5">
          <h3 className="text-base font-semibold text-[#f0f0ff] mb-4">Recent Orders</h3>
          <div className="space-y-3">
            {recent.map((o) => (
              <div key={o.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div>
                  <p className="text-sm font-medium text-[#f0f0ff]">{o.customer}</p>
                  <p className="text-xs text-[#8888aa]">{o.product}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-[#f0f0ff]">${o.amount.toFixed(2)}</p>
                  <Badge variant={statusVariant(o.status)}>{o.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-5">
          <h3 className="text-base font-semibold text-[#f0f0ff] mb-4">
            <span className="text-[#ff6b35]">⚠</span> Low Stock Alerts
          </h3>
          <div className="space-y-3">
            {lowStock.length === 0 && <p className="text-[#8888aa] text-sm">No low stock items.</p>}
            {lowStock.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-yellow-900/10 border border-yellow-600/20">
                <div>
                  <p className="text-sm font-medium text-[#f0f0ff]">{c.name}</p>
                  <p className="text-xs text-yellow-400">{c.stockCount} units remaining</p>
                </div>
                <button className="text-xs px-3 py-1.5 rounded border border-[#00d4ff] text-[#00d4ff] hover:bg-[#00d4ff]/10 transition-all">Restock</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
