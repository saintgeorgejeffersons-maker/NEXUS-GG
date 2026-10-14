import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const MOCK_USERS = [
  { id: 1, name: 'Admin Nexus', email: 'admin@nexus.gg', password: 'admin123', role: 'admin' },
  { id: 2, name: 'Player One', email: 'player@nexus.gg', password: 'player123', role: 'user' },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('nexus_user');
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed);
      setIsAuthenticated(true);
    }
  }, []);

  const login = (email, password, role) => {
    const found = MOCK_USERS.find(
      (u) => u.email === email && u.password === password && u.role === role
    );
    if (found) {
      const { password: _, ...safeUser } = found;
      setUser(safeUser);
      setIsAuthenticated(true);
      localStorage.setItem('nexus_user', JSON.stringify(safeUser));
      return { success: true, role: safeUser.role };
    }
    return { success: false, error: 'Invalid credentials or wrong role selected.' };
  };

  const register = (name, email, password, role) => {
    const existing = MOCK_USERS.find((u) => u.email === email);
    if (existing) return { success: false, error: 'Email already registered.' };
    const newUser = { id: Date.now(), name, email, role: 'user' };
    setUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem('nexus_user', JSON.stringify(newUser));
    return { success: true, role: 'user' };
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('nexus_user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, role: user?.role, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
