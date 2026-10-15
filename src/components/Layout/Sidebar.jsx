import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Wallet, BarChart3, Package, Users, ArrowDownCircle, LogOut, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const userNav = [
  { to: '/user/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/user/catalog', icon: ShoppingBag, label: 'Store' },
  { to: '/user/wallet', icon: Wallet, label: 'Wallet' },
];

const adminNav = [
  { to: '/admin/dashboard', icon: BarChart3, label: 'Dashboard' },
  { to: '/admin/inventory', icon: Package, label: 'Products' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/deposits', icon: ArrowDownCircle, label: 'Deposits' },
];

export function Sidebar({ isOpen, onClose }) {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const nav = role === 'admin' ? adminNav : userNav;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-20 bg-black/60 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed top-0 left-0 z-30 h-full w-60 bg-[#111118] border-r border-[#2a2a3a] flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="p-5 border-b border-[#2a2a3a]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#00d4ff]/20 flex items-center justify-center">
              <Zap size={18} className="text-[#00d4ff]" />
            </div>
            <span className="text-xl font-black tracking-wider text-[#f0f0ff]">
              NEXUS<span className="text-[#00d4ff]">GG</span>
            </span>
          </div>
          <p className="text-xs text-[#8888aa] mt-1 ml-10">Game. Invest. Earn.</p>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-[#00d4ff]/10 text-[#00d4ff] border-l-2 border-[#00d4ff]'
                    : 'text-[#8888aa] hover:text-[#f0f0ff] hover:bg-white/5'
                }`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-[#2a2a3a]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-[#7c3aed]/30 flex items-center justify-center text-xs font-bold text-[#7c3aed]">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#f0f0ff] truncate">{user?.name}</p>
              <p className="text-xs text-[#8888aa] capitalize">{role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#8888aa] hover:text-red-400 hover:bg-red-900/20 transition-all"
          >
            <LogOut size={15} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}
