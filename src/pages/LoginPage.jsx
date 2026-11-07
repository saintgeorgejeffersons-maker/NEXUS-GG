import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/hmalm01.svg';

const inputClass =
  'w-full bg-[#1a1a24] border border-[#2a2a3a] rounded-lg px-4 py-3 text-[#f0f0ff] text-sm placeholder-[#8888aa] focus:outline-none focus:border-[#00d4ff] transition-all duration-200';

export function LoginPage() {
  const [loginMethod, setLoginMethod] = useState('email');
  const [form, setForm] = useState({ email: '', mobile: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const identifier = loginMethod === 'email' ? form.email : form.mobile;
    if (!identifier.trim()) {
      setError(loginMethod === 'email' ? 'Email address is required.' : 'Mobile number is required.');
      return;
    }
    if (!form.password) { setError('Password is required.'); return; }
    setLoading(true);
    const res = await login(identifier, form.password, 'user');
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
          <img src={logo} alt="NEXUS GG" className="w-20 h-20 mx-auto mb-4 invert" />
          <h1 className="text-3xl font-black tracking-wider text-[#f0f0ff]">
            NEXUS<span className="text-[#00d4ff]">GG</span>
          </h1>
          <p className="text-[#8888aa] text-sm mt-1">Game. Invest. Earn.</p>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-lg font-bold text-[#f0f0ff] mb-5">Login to your account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email / Mobile toggle */}
            <div className="flex gap-2">
              <button type="button"
                onClick={() => { setLoginMethod('email'); set('mobile', ''); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm border transition-all ${
                  loginMethod === 'email'
                    ? 'border-[#00d4ff] bg-[#00d4ff]/10 text-[#00d4ff]'
                    : 'border-[#2a2a3a] text-[#8888aa] hover:text-[#f0f0ff]'
                }`}>
                <Mail size={14} /> Email
              </button>
              <button type="button"
                onClick={() => { setLoginMethod('mobile'); set('email', ''); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm border transition-all ${
                  loginMethod === 'mobile'
                    ? 'border-[#00d4ff] bg-[#00d4ff]/10 text-[#00d4ff]'
                    : 'border-[#2a2a3a] text-[#8888aa] hover:text-[#f0f0ff]'
                }`}>
                <Phone size={14} /> Mobile
              </button>
            </div>

            {loginMethod === 'email' ? (
              <input className={inputClass} type="email" placeholder="Email address"
                value={form.email} onChange={(e) => set('email', e.target.value)} />
            ) : (
              <input className={inputClass} type="tel" placeholder="Mobile number"
                value={form.mobile} onChange={(e) => set('mobile', e.target.value)} />
            )}

            <div className="relative">
              <input className={inputClass} type={showPw ? 'text' : 'password'} placeholder="Password"
                value={form.password} onChange={(e) => set('password', e.target.value)} />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8888aa] hover:text-[#f0f0ff]">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-900/20 rounded-lg px-3 py-2">{error}</p>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-lg font-semibold text-sm bg-[#00d4ff] text-black hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-60">
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="text-center text-sm text-[#8888aa] mt-5">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#00d4ff] font-semibold hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
