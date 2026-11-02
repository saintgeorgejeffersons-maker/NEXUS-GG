import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { UserDashboard } from './pages/user/UserDashboard';
import { Catalog } from './pages/user/Catalog';
import { Profile } from './pages/user/Profile';
import { ActiveInvestments } from './pages/user/ActiveInvestments';
import { Referral } from './pages/user/Referral';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { Inventory } from './pages/admin/Inventory';
import { Users } from './pages/admin/Users';
import { Deposits } from './pages/admin/Deposits';
import { Withdrawals } from './pages/admin/Withdrawals';
import { Transactions } from './pages/admin/Transactions';
import { Settings } from './pages/admin/Settings';
import { Layout } from './components/Layout/Layout';
import { UserLayout } from './components/Layout/UserLayout';

function ProtectedRoute({ children, role }) {
  const { isAuthenticated, role: userRole } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to={role === 'admin' ? '/myspot/login' : '/login'} replace />;
  }
  if (role && userRole !== role) {
    return <Navigate to={userRole === 'admin' ? '/myspot/dashboard' : '/user/dashboard'} replace />;
  }
  if (role === 'user') return <UserLayout>{children}</UserLayout>;
  return <Layout>{children}</Layout>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/myspot/login" element={<AdminLoginPage />} />

      {/* User routes */}
      <Route path="/user/dashboard"   element={<ProtectedRoute role="user"><UserDashboard /></ProtectedRoute>} />
      <Route path="/user/catalog"     element={<ProtectedRoute role="user"><Catalog /></ProtectedRoute>} />
      <Route path="/user/investments" element={<ProtectedRoute role="user"><ActiveInvestments /></ProtectedRoute>} />
      <Route path="/user/referrals"   element={<ProtectedRoute role="user"><Referral /></ProtectedRoute>} />
      <Route path="/user/profile"     element={<ProtectedRoute role="user"><Profile /></ProtectedRoute>} />

      {/* Admin routes */}
      <Route path="/myspot/dashboard"    element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/myspot/inventory"    element={<ProtectedRoute role="admin"><Inventory /></ProtectedRoute>} />
      <Route path="/myspot/users"        element={<ProtectedRoute role="admin"><Users /></ProtectedRoute>} />
      <Route path="/myspot/deposits"     element={<ProtectedRoute role="admin"><Deposits /></ProtectedRoute>} />
      <Route path="/myspot/withdrawals"  element={<ProtectedRoute role="admin"><Withdrawals /></ProtectedRoute>} />
      <Route path="/myspot/transactions" element={<ProtectedRoute role="admin"><Transactions /></ProtectedRoute>} />
      <Route path="/myspot/settings"     element={<ProtectedRoute role="admin"><Settings /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
