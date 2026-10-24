import { useState, useEffect, useRef } from 'react';
import { Bell, Menu, X, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getAllDepositRequests, getUserDepositRequests, getAllWithdrawalRequests, getUserWithdrawalRequests } from '../../lib/db';

// Note: read state is tracked locally via readIds. For persistence across
// sessions, a DB notifications table with is_read is required (see supabase-schema.sql).

function NotificationItem({ id, icon: Icon, iconColor, title, subtitle, isRead, onMarkRead }) {
  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 transition-colors cursor-pointer ${
        isRead ? 'opacity-50 hover:bg-white/3' : 'hover:bg-white/5'
      }`}
      onClick={() => !isRead && onMarkRead(id)}
    >
      <Icon size={16} style={{ color: iconColor }} className="flex-shrink-0 mt-0.5" />
      <div className="min-w-0 flex-1">
        <p className="text-sm text-[#f0f0ff] leading-snug">{title}</p>
        <p className="text-xs text-[#8888aa] mt-0.5">{subtitle}</p>
      </div>
      {!isRead && (
        <span className="flex-shrink-0 w-2 h-2 rounded-full bg-[#00d4ff] mt-1.5" aria-label="Unread" />
      )}
    </div>
  );
}

export function Header({ title, onMenuToggle, menuOpen }) {
  const { user, profile, role } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  // Track read notification IDs locally. For DB persistence see markNotificationRead / markAllNotificationsRead in db.js.
  const [readIds, setReadIds] = useState(() => new Set());
  const ref = useRef(null);

  useEffect(() => {
    if (!profile?.id) return;

    async function loadNotifications() {
      try {
        if (role === 'admin') {
          const [deposits, withdrawals] = await Promise.all([
            getAllDepositRequests(),
            getAllWithdrawalRequests(),
          ]);
          const pendingDeposits = deposits.filter((r) => r.status === 'pending');
          const pendingWithdrawals = withdrawals.filter((r) => r.status === 'pending');
          setNotifications([
            ...pendingDeposits.map((r) => ({
              id: `d-${r.id}`,
              icon: Clock,
              iconColor: '#facc15',
              title: `Deposit request — ₵${Number(r.amount).toFixed(2)}`,
              subtitle: `${r.profiles?.full_name ?? 'User'} · ${new Date(r.created_at).toLocaleDateString()}`,
            })),
            ...pendingWithdrawals.map((r) => ({
              id: `w-${r.id}`,
              icon: Clock,
              iconColor: '#fb923c',
              title: `Withdrawal request — ₵${Number(r.amount).toFixed(2)}`,
              subtitle: `${r.profiles?.full_name ?? 'User'} · ${new Date(r.created_at).toLocaleDateString()}`,
            })),
          ]);
        } else {
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
        }
      } catch (e) {
        console.error('Failed to load notifications:', e);
        setNotifications([]);
      }
    }

    loadNotifications();
  }, [profile?.id, role]);

  // Reset read state when new notifications load
  useEffect(() => {
    setReadIds(new Set());
  }, [notifications]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleMarkRead(id) {
    setReadIds((prev) => new Set([...prev, id]));
  }

  function handleMarkAllRead() {
    setReadIds(new Set(notifications.map((n) => n.id)));
  }

  const unread = notifications.filter((n) => !readIds.has(n.id)).length;

  return (
    <header className="h-16 bg-[#111118] border-b border-[#2a2a3a] flex items-center justify-between px-4 lg:px-6 sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden text-[#8888aa] hover:text-[#f0f0ff] transition-colors"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <h1 className="text-lg font-semibold text-[#f0f0ff]">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen((o) => !o)}
            className="relative text-[#8888aa] hover:text-[#f0f0ff] transition-colors"
          >
            <Bell size={20} />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#00d4ff] rounded-full text-xs text-black font-bold flex items-center justify-center">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 top-10 w-80 bg-[#1a1a24] border border-[#2a2a3a] rounded-xl shadow-2xl overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-[#2a2a3a] flex items-center justify-between">
                <p className="text-sm font-semibold text-[#f0f0ff]">Notifications</p>
                <div className="flex items-center gap-3">
                  {unread > 0 && (
                    <>
                      <span className="text-xs text-[#8888aa]">{unread} new</span>
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs text-[#8888aa] hover:text-[#00d4ff] transition-colors"
                      >
                        Mark all as read
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-sm text-[#8888aa] text-center py-8">No notifications</p>
                ) : (
                  notifications.map((n) => (
                    <NotificationItem
                      key={n.id}
                      {...n}
                      isRead={readIds.has(n.id)}
                      onMarkRead={handleMarkRead}
                    />
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#7c3aed]/30 flex items-center justify-center text-xs font-bold text-[#7c3aed]">
            {(profile?.full_name ?? user?.email ?? '?').charAt(0).toUpperCase()}
          </div>
          <span className="hidden sm:block text-sm text-[#f0f0ff]">
            {profile?.full_name ?? user?.email}
          </span>
        </div>
      </div>
    </header>
  );
}
