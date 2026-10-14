import { TrendingUp, Users, Package, DollarSign } from 'lucide-react';
import { adminMetrics, products } from '../../data/mockData';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';

export function AdminDashboard() {
  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#f0f0ff]">Admin Dashboard</h1>
        <p className="text-sm text-[#8888aa] mt-1">Platform overview and product management.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          label="Total Deposits"
          value={`₵${adminMetrics.totalDeposits.toLocaleString()}`}
          accent="#00ff88"
        />
        <StatCard
          icon={Users}
          label="Total Users"
          value={adminMetrics.totalUsers.toLocaleString()}
          accent="#00d4ff"
        />
        <StatCard
          icon={Package}
          label="Active Investments"
          value={adminMetrics.activeInvestments.toLocaleString()}
          accent="#7c3aed"
        />
        <StatCard
          icon={TrendingUp}
          label="Total Paid Out"
          value={`₵${adminMetrics.totalPaidOut.toLocaleString()}`}
          accent="#f59e0b"
        />
      </div>

      {/* Products Overview */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-4 border-b border-[#2a2a38]">
          <h2 className="text-base font-semibold text-[#f0f0ff]">Products Overview</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead style={{ background: '#0a0a0f' }}>
              <tr>
                {['Product', 'Price', 'Daily Return', 'Duration', 'Total Return', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#8888aa] uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} style={{ borderBottom: '1px solid #2a2a38' }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{product.image}</span>
                      <span className="font-medium text-[#f0f0ff]">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#f0f0ff]">₵{product.price}</td>
                  <td className="px-4 py-3" style={{ color: '#00ff88' }}>+₵{product.dailyReturn}/day</td>
                  <td className="px-4 py-3 text-[#8888aa]">{product.durationDays} days</td>
                  <td className="px-4 py-3" style={{ color: '#00ff88' }}>₵{product.dailyReturn * product.durationDays}</td>
                  <td className="px-4 py-3">
                    {product.active ? (
                      <Badge variant="delivered">Active</Badge>
                    ) : (
                      <Badge variant="default">Inactive</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href="/admin/inventory"
                      className="text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors hover:bg-[#00d4ff]/10"
                      style={{ borderColor: '#00d4ff', color: '#00d4ff' }}
                    >
                      Edit
                    </a>
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
