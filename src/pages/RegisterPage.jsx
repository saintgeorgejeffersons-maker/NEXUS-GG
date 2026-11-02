import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Gamepad2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const inputClass =
  'w-full bg-[#1a1a24] border border-[#2a2a3a] rounded-lg px-4 py-3 text-[#f0f0ff] text-sm placeholder-[#8888aa] focus:outline-none focus:border-[#00d4ff] transition-all duration-200';

export function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', mobile: '', password: '', referralCode: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  // Pre-fill referral code from URL param
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get('ref');
    if (ref) set('referralCode', ref);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim())   { setError('Full name is required.'); return; }
    if (!form.email.trim())  { setError('Email address is required.'); return; }
    if (!form.mobile.trim()) { setError('Mobile number is required.'); return; }
    if (!form.password)      { setError('Password is required.'); return; }
    setLoading(true);
    const res = await register(form.name, form.email, form.mobile, form.password, form.referralCode);
    setLoading(false);
    if (res.success) navigate('/user/dashboard');
    else setError(res.error);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00d4ff]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#7c3aed]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#00d4ff]/10 border border-[#00d4ff]/30 mb-4">
            <Gamepad2 size={32} className="text-[#00d4ff]" />
          </div>
          <h1 className="text-3xl font-black tracking-wider text-[#f0f0ff]">
            NEXUS<span className="text-[#00d4ff]">GG</span>
          </h1>
          <p className="text-[#8888aa] text-sm mt-1">Game. Invest. Earn.</p>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-lg font-bold text-[#f0f0ff] mb-5">Create an account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input className={inputClass} type="text" placeholder="Full name"
              value={form.name} onChange={(e) => set('name', e.target.value)} />

            <input className={inputClass} type="email" placeholder="Email address"
              value={form.email} onChange={(e) => set('email', e.target.value)} />

            <input className={inputClass} type="tel" placeholder="Mobile number"
              value={form.mobile} onChange={(e) => set('mobile', e.target.value)} />

            <div className="relative">
              <input className={inputClass} type={showPw ? 'text' : 'password'} placeholder="Password"
                value={form.password} onChange={(e) => set('password', e.target.value)} />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8888aa] hover:text-[#f0f0ff]">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <input className={inputClass} type="text" placeholder="Referral code (optional)"
              value={form.referralCode} onChange={(e) => set('referralCode', e.target.value)} />

            {error && (
              <p className="text-red-400 text-sm bg-red-900/20 rounded-lg px-3 py-2">{error}</p>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-lg font-semibold text-sm bg-[#00d4ff] text-black hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-60">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-[#8888aa] mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-[#00d4ff] font-semibold hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
