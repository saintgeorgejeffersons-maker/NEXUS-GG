import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch profile from DB
  async function fetchProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (!error && data) {
      setProfile(data);
      return data;
    }
    return null;
  }

  // Listen to Supabase auth state
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
        setIsAuthenticated(true);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setProfile(null);
        setIsAuthenticated(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Register new user (players only)
  async function register(fullName, email, mobile, password) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, mobile, role: 'user' },
      },
    });
    if (error) return { success: false, error: error.message };

    // If email confirmation is off, signUp returns a session immediately
    if (data.session) {
      setUser(data.session.user);
      await fetchProfile(data.session.user.id);
      setIsAuthenticated(true);
    }

    return { success: true, role: 'user' };
  }

  // Login with email OR mobile
  async function login(identifier, password, role) {
    // If identifier looks like a phone number, look up the email first
    let email = identifier;

    if (!identifier.includes('@')) {
      // It's a mobile number — find the matching email in profiles
      const { data, error } = await supabase
        .from('profiles')
        .select('email')
        .eq('mobile', identifier)
        .single();
      if (error || !data) return { success: false, error: 'No account found with that mobile number.' };
      email = data.email;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: 'Invalid credentials.' };

    // Verify the role matches
    const prof = await fetchProfile(data.user.id);
    if (prof?.role !== role) {
      await supabase.auth.signOut();
      setUser(null); setProfile(null); setIsAuthenticated(false);
      return { success: false, error: `This account is not a ${role} account.` };
    }

    return { success: true, role: prof.role };
  }

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setIsAuthenticated(false);
  }

  // Refresh profile (e.g. after wallet update)
  async function refreshProfile() {
    if (user?.id) await fetchProfile(user.id);
  }

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      isAuthenticated,
      loading,
      role: profile?.role,
      login,
      logout,
      register,
      refreshProfile,
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
