import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useLocation } from 'react-router-dom';

const PAGE_TITLES = {
  '/user/dashboard': 'Dashboard',
  '/user/catalog': 'Gaming Catalog',
  '/user/wallet': 'Wallet',
  '/admin/dashboard': 'Admin Dashboard',
  '/admin/inventory': 'Products',
  '/admin/users': 'Users',
  '/admin/deposits': 'Deposit Requests',
};

export function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || 'NEXUS GG';

  return (
    <div className="flex h-screen bg-[#0a0a0f] overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col lg:ml-60 overflow-hidden">
        <Header title={title} onMenuToggle={() => setSidebarOpen(!sidebarOpen)} menuOpen={sidebarOpen} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
