import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { UserDashboard } from './pages/user/UserDashboard';
import { Catalog } from './pages/user/Catalog';
import { Wallet } from './pages/user/Wallet';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { Inventory } from './pages/admin/Inventory';
import { Users } from './pages/admin/Users';
import { Layout } from './components/Layout/Layout';

function ProtectedRoute({ children, role }) {
  const { isAuthenticated, role: userRole } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to={role === 'admin' ? '/admin/login' : '/login'} replace />;
  }
  if (role && userRole !== role) {
    return <Navigate to={userRole === 'admin' ? '/admin/dashboard' : '/user/dashboard'} replace />;
  }
  return <Layout>{children}</Layout>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* User routes */}
      <Route path="/user/dashboard" element={<ProtectedRoute role="user"><UserDashboard /></ProtectedRoute>} />
      <Route path="/user/catalog"   element={<ProtectedRoute role="user"><Catalog /></ProtectedRoute>} />
      <Route path="/user/wallet"    element={<ProtectedRoute role="user"><Wallet /></ProtectedRoute>} />

      {/* Admin routes */}
      <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/inventory" element={<ProtectedRoute role="admin"><Inventory /></ProtectedRoute>} />
      <Route path="/admin/users"     element={<ProtectedRoute role="admin"><Users /></ProtectedRoute>} />

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
