import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingBag, TrendingUp, Share2, Wallet,
  Bell, LogOut, CheckCircle, Clock, XCircle, Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getUserDepositRequests,
  getUserWithdrawalRequests,
} from '../../lib/db';

const TAB_NAV = [
  { to: '/user/dashboard',    icon: LayoutDashboard, label: 'Home'        },
  { to: '/user/catalog',      icon: ShoppingBag,     label: 'Store'       },
  { to: '/user/investments',  icon: TrendingUp,      label: 'Invest'      },
  { to: '/user/referrals',    icon: Share2,          label: 'Referrals'   },
  { to: '/user/wallet',       icon: Wallet,          label: 'Wallet'      },
];

const PAGE_TITLES = {
  '/user/dashboard':   'Home',
  '/user/catalog':     'Store',
  '/user/investments': 'Investments',
  '/user/referrals':   'Referrals',
  '/user/wallet':      'Wallet',
};

function NotificationPanel({ notifications, readIds, onMarkRead, onMarkAll, onClose }) {
  const unread = notifications.filter((n) => !readIds.has(n.id)).length;
  return (
    <div className="fixed inset-0 z-50 flex flex-col" onClick={onClose}>
      <div className="flex-1" />
      <div
        className="bg-[#1a1a24] rounded-t-2xl border-t border-[#2a2a3a] max-h-[70vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-[#2a2a3a]" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#2a2a3a]">
          <p className="text-base font-bold text-[#f0f0ff]">
            Notifications {unread > 0 && <span className="text-[#00d4ff] text-sm">({unread})</span>}
          </p>
          {unread > 0 && (
            <button onClick={onMarkAll} className="text-xs text-[#00d4ff]">
              Mark all read
            </button>
          )}
        </div>
        <div className="overflow-y-auto flex-1">
          {notifications.length === 0 ? (
            <p className="text-sm text-[#8888aa] text-center py-10">No notifications</p>
          ) : (
            notifications.map((n) => {
              const Icon = n.icon;
              const isRead = readIds.has(n.id);
              return (
                <div
                  key={n.id}
                  onClick={() => !isRead && onMarkRead(n.id)}
                  className={`flex items-start gap-3 px-5 py-4 border-b border-[#2a2a3a]/50 ${isRead ? 'opacity-40' : ''}`}
                >
                  <Icon size={18} style={{ color: n.iconColor }} className="mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#f0f0ff]">{n.title}</p>
                    <p className="text-xs text-[#8888aa] mt-0.5">{n.subtitle}</p>
                  </div>
                  {!isRead && <div className="w-2 h-2 rounded-full bg-[#00d4ff] mt-1.5 flex-shrink-0" />}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export function UserLayout({ children }) {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || 'NEXUS GG';

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [readIds, setReadIds] = useState(() => new Set());

  useEffect(() => {
    if (!profile?.id) return;
    async function load() {
      try {
        const [deposits, withdrawals] = await Promise.all([
          getUserDepositRequests(profile.id),
          getUserWithdrawalRequests(profile.id),
        ]);
        setNotifications([
          ...deposits.slice(0, 5).map((r) => ({
            id: `d-${r.id}`,
            icon: r.status === 'approved' ? CheckCircle : r.status === 'rejected' ? XCircle : Clock,
            iconColor: r.status === 'approved' ? '#00ff88' : r.status === 'rejected' ? '#ef4444' : '#facc15',
            title: `Deposit ₵${Number(r.amount).toFixed(2)} — ${r.status}`,
            subtitle: new Date(r.created_at).toLocaleDateString(),
          })),
          ...withdrawals.slice(0, 5).map((r) => ({
            id: `w-${r.id}`,
            icon: r.status === 'approved' ? CheckCircle : r.status === 'rejected' ? XCircle : Clock,
            iconColor: r.status === 'approved' ? '#00ff88' : r.status === 'rejected' ? '#ef4444' : '#fb923c',
            title: `Withdrawal ₵${Number(r.amount).toFixed(2)} — ${r.status}`,
            subtitle: new Date(r.created_at).toLocaleDateString(),
          })),
        ]);
      } catch (_) {}
    }
    load();
  }, [profile?.id]);

  useEffect(() => { setReadIds(new Set()); }, [notifications]);

  const unread = notifications.filter((n) => !readIds.has(n.id)).length;
  const initials = (profile?.full_name ?? user?.email ?? '?').charAt(0).toUpperCase();

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0f] overflow-hidden max-w-md mx-auto">
      {/* Top Header */}
      <header className="flex items-center justify-between px-4 pt-safe-top py-3 bg-[#111118] border-b border-[#2a2a3a] flex-shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#00d4ff]/20 flex items-center justify-center">
            <Zap size={15} className="text-[#00d4ff]" />
          </div>
          <span className="text-base font-black tracking-wider text-[#f0f0ff]">
            NEXUS<span className="text-[#00d4ff]">GG</span>
          </span>
        </div>

        {/* Page Title — center */}
        <p className="absolute left-1/2 -translate-x-1/2 text-sm font-semibold text-[#f0f0ff]">{title}</p>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setNotifOpen(true)}
            className="relative text-[#8888aa]"
            aria-label="Notifications"
          >
            <Bell size={20} />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#00d4ff] rounded-full text-[10px] text-black font-bold flex items-center justify-center">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="text-[#8888aa]"
            aria-label="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Scrollable page content */}
      <main className="flex-1 overflow-y-auto">
        <div className="px-4 py-4 pb-24">
          {children}
        </div>
      </main>

      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-[#111118] border-t border-[#2a2a3a] flex items-center justify-around px-2 pb-safe-bottom pt-2 z-40">
        {TAB_NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
                isActive ? 'text-[#00d4ff]' : 'text-[#8888aa]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-[#00d4ff]/10' : ''}`}>
                  <Icon size={20} />
                </div>
                <span className="text-[10px] font-semibold">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Notification panel */}
      {notifOpen && (
        <NotificationPanel
          notifications={notifications}
          readIds={readIds}
          onMarkRead={(id) => setReadIds((prev) => new Set([...prev, id]))}
          onMarkAll={() => setReadIds(new Set(notifications.map((n) => n.id)))}
          onClose={() => setNotifOpen(false)}
        />
      )}
    </div>
  );
}
