import { Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function Header({ title, onMenuToggle, menuOpen }) {
  const { user, profile } = useAuth();

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

      {/* User Avatar */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-[#7c3aed]/30 flex items-center justify-center text-xs font-bold text-[#7c3aed]">
          {(profile?.full_name ?? user?.email ?? '?').charAt(0).toUpperCase()}
        </div>
        <span className="hidden sm:block text-sm text-[#f0f0ff]">
          {profile?.full_name ?? user?.email}
        </span>
      </div>
    </header>
  );
}
