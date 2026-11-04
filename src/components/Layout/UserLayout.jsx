import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingBag, TrendingUp, Share2, UserCircle,
  LogOut, Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const TAB_NAV = [
  { to: '/user/dashboard',    icon: LayoutDashboard, label: 'Home'      },
  { to: '/user/catalog',      icon: ShoppingBag,     label: 'Store'     },
  { to: '/user/investments',  icon: TrendingUp,      label: 'Invest'    },
  { to: '/user/referrals',    icon: Share2,          label: 'Referrals' },
  { to: '/user/profile',      icon: UserCircle,      label: 'Profile'   },
];

const PAGE_TITLES = {
  '/user/dashboard':    'Home',
  '/user/catalog':      'Store',
  '/user/investments':  'Investments',
  '/user/referrals':    'Referrals',
  '/user/profile':      'Profile',
  '/user/transactions': 'Transactions',
};

export function UserLayout({ children }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || 'NEXUS GG';

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0f] overflow-hidden max-w-md mx-auto">
      {/* Top Header */}
      <header className="flex items-center justify-between px-4 pt-safe-top py-3 bg-[#111118] border-b border-[#2a2a3a] flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#00d4ff]/20 flex items-center justify-center">
            <Zap size={15} className="text-[#00d4ff]" />
          </div>
          <span className="text-base font-black tracking-wider text-[#f0f0ff]">
            NEXUS<span className="text-[#00d4ff]">GG</span>
          </span>
        </div>

        <p className="absolute left-1/2 -translate-x-1/2 text-sm font-semibold text-[#f0f0ff]">{title}</p>

        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="text-[#8888aa]"
          aria-label="Logout"
        >
          <LogOut size={18} />
        </button>
      </header>

      {/* Page content */}
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
    </div>
  );
}
