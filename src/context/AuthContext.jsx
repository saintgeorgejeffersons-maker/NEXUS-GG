import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

// ThemeContext loader — injected from App to avoid circular deps
let _loadThemeFromProfile = null;
export function setThemeLoader(fn) { _loadThemeFromProfile = fn; }

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
      // Apply saved theme whenever profile is loaded
      if (_loadThemeFromProfile) _loadThemeFromProfile(data.theme);
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
  async function register(fullName, email, mobile, password, referralCode = '') {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, mobile, role: 'user' },
      },
    });
    if (error) return { success: false, error: error.message };

    const newUserId = data.session?.user?.id ?? data.user?.id;

    // If email confirmation is off, signUp returns a session immediately
    if (data.session) {
      setUser(data.session.user);
      await fetchProfile(data.session.user.id);
      setIsAuthenticated(true);

      // Auto-generate referral code for every new user
      try {
        const code = data.session.user.id.replace(/-/g, '').slice(0, 8).toUpperCase();
        await supabase.from('profiles').update({ referral_code: code }).eq('id', data.session.user.id);
      } catch (_) {}

      // Link referral — runs inside session so RLS allows it
      if (referralCode && referralCode.trim() && newUserId) {
        try {
          console.log('[Referral] Starting referral link. code:', referralCode, 'newUserId:', newUserId);

          // Wait for the DB trigger to create the new user's profile row.
          let newUserProfile = null;
          for (let attempt = 0; attempt < 10; attempt++) {
            await new Promise((r) => setTimeout(r, 500));
            const { data, error } = await supabase
              .from('profiles')
              .select('id')
              .eq('id', newUserId)
              .maybeSingle();
            console.log(`[Referral] Profile poll attempt ${attempt + 1}:`, data, error);
            if (data?.id) { newUserProfile = data; break; }
          }

          console.log('[Referral] newUserProfile found:', newUserProfile);

          if (newUserProfile) {
            const { data: refData, error: refLookupError } = await supabase
              .from('profiles')
              .select('id')
              .eq('referral_code', referralCode.trim().toUpperCase())
              .maybeSingle();

            console.log('[Referral] Referrer lookup result:', refData, 'error:', refLookupError);

            if (refData?.id) {
              const { error: updateErr } = await supabase
                .from('profiles')
                .update({ referred_by: refData.id })
                .eq('id', newUserId);
              console.log('[Referral] referred_by update error:', updateErr);

              const { error: upsertErr } = await supabase
                .from('referrals')
                .upsert(
                  { referrer_id: refData.id, referred_id: newUserId, bonus_paid: false },
                  { onConflict: 'referred_id', ignoreDuplicates: true }
                );
              console.log('[Referral] referrals upsert error:', upsertErr);
            } else {
              console.log('[Referral] No referrer found for code:', referralCode.trim().toUpperCase());
            }
          } else {
            console.log('[Referral] New user profile never appeared after 10 attempts.');
          }
        } catch (err) {
          console.error('[Referral] Unexpected error:', err);
        }
      }
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
