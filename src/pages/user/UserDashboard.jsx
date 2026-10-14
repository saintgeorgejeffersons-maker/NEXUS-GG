import { Link } from 'react-router-dom';
import { Wallet, TrendingUp, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { userMetrics, userInvestments, walletTransactions } from '../../data/mockData';
import { StatCard } from '../../components/ui/StatCard';

export function UserDashboard() {
  const recentTx = [...walletTransactions].slice(0, 4);

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#f0f0ff]">Dashboard</h1>
        <p className="text-sm text-[#8888aa] mt-1">Welcome back. Here's your investment overview.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          icon={Wallet}
          label="Wallet Balance"
          value={`₵${userMetrics.walletBalance.toLocaleString()}`}
          accent="#f59e0b"
        />
        <StatCard
          icon={TrendingUp}
          label="Total Earned"
          value={`₵${userMetrics.totalEarned.toLocaleString()}`}
          accent="#00ff88"
        />
      </div>

      {/* Active Investments */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-[#f0f0ff]">My Active Investments</h2>
          <Link
            to="/user/catalog"
            className="text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors hover:bg-[#00d4ff]/10"
            style={{ borderColor: '#00d4ff', color: '#00d4ff' }}
          >
            Browse Products
          </Link>
        </div>

        {userInvestments.length === 0 ? (
          <p className="text-sm text-[#8888aa] text-center py-4">
            No active investments. Browse the store to get started.
          </p>
        ) : (
          <div className="space-y-4">
            {userInvestments.map((inv) => {
              const daysDone = inv.durationDays - inv.daysRemaining;
              const progress = (daysDone / inv.durationDays) * 100;
              return (
                <div
                  key={inv.id}
                  className="rounded-xl p-4"
                  style={{ background: '#1a1a24', border: '1px solid #2a2a38' }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{inv.image || '🎮'}</span>
                      <span className="font-bold text-[#f0f0ff] text-sm">{inv.productName}</span>
                    </div>
                    <span
                      className="text-xs font-semibold px-2 py-1 rounded-full"
                      style={{ background: '#00ff8820', color: '#00ff88' }}
                    >
                      Daily Return: ₵{inv.dailyReturn}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="rounded-full overflow-hidden mb-1" style={{ background: '#0a0a0f', height: 8 }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${progress}%`,
                        background: 'linear-gradient(to right, #00d4ff, #7c3aed)',
                      }}
                    />
                  </div>
                  <p className="text-xs text-[#8888aa] mb-2">
                    Day {daysDone} of {inv.durationDays}
                  </p>

                  <div className="flex gap-4 text-xs text-[#8888aa]">
                    <span>Earned: <span style={{ color: '#00ff88' }}>₵{inv.totalEarned}</span></span>
                    <span>Days left: <span className="text-[#f0f0ff]">{inv.daysRemaining}</span></span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      <div className="glass-card p-5">
        <h2 className="text-base font-semibold text-[#f0f0ff] mb-4">Recent Transactions</h2>
        <div className="space-y-3">
          {recentTx.map((tx) => {
            const isPositive = tx.amount > 0;
            const Icon = isPositive ? ArrowUpCircle : ArrowDownCircle;
            const iconColor = isPositive ? '#00ff88' : '#ef4444';
            return (
              <div key={tx.id} className="flex items-center gap-3">
                <Icon size={20} style={{ color: iconColor, flexShrink: 0 }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#f0f0ff] truncate">{tx.description}</p>
                  <p className="text-xs text-[#8888aa]">{tx.date}</p>
                </div>
                <span
                  className="text-sm font-semibold"
                  style={{ color: isPositive ? '#00ff88' : '#ef4444' }}
                >
                  {isPositive ? '+' : ''}₵{Math.abs(tx.amount)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
