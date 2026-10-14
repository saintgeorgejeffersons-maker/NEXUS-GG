import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Gamepad2, Mail, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const inputClass =
  'w-full bg-[#1a1a24] border border-[#2a2a3a] rounded-lg px-4 py-3 text-[#f0f0ff] text-sm placeholder-[#8888aa] focus:outline-none focus:border-[#00d4ff] transition-all duration-200';

export function LoginPage() {
  const [mode, setMode] = useState('login');
  const [loginMethod, setLoginMethod] = useState('email');
  const [form, setForm] = useState({ name: '', email: '', mobile: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const switchMode = (m) => {
    setMode(m);
    setError('');
    setForm({ name: '', email: '', mobile: '', password: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'register') {
      if (!form.name.trim())   { setError('Full name is required.'); return; }
      if (!form.email.trim())  { setError('Email address is required.'); return; }
      if (!form.mobile.trim()) { setError('Mobile number is required.'); return; }
      if (!form.password)      { setError('Password is required.'); return; }
      const res = register(form.name, form.email, form.mobile, form.password, 'user');
      if (res.success) navigate('/user/dashboard');
      else setError(res.error);
    } else {
      const identifier = loginMethod === 'email' ? form.email : form.mobile;
      if (!identifier.trim()) {
        setError(loginMethod === 'email' ? 'Email address is required.' : 'Mobile number is required.');
        return;
      }
      if (!form.password) { setError('Password is required.'); return; }
      const res = login(identifier, form.password, 'user');
      if (res.success) navigate('/user/dashboard');
      else setError(res.error);
    }
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
          {/* Login / Register toggle */}
          <div className="flex rounded-lg overflow-hidden border border-[#2a2a3a] mb-5">
            {['login', 'register'].map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`flex-1 py-2.5 text-sm font-medium transition-all ${
                  mode === m ? 'bg-[#00d4ff] text-black' : 'text-[#8888aa] hover:text-[#f0f0ff]'
                }`}
              >
                {m === 'login' ? 'Login' : 'Register'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Register fields */}
            {mode === 'register' && (
              <>
                <input className={inputClass} type="text" placeholder="Full name"
                  value={form.name} onChange={(e) => set('name', e.target.value)} />
                <input className={inputClass} type="email" placeholder="Email address"
                  value={form.email} onChange={(e) => set('email', e.target.value)} />
                <input className={inputClass} type="tel" placeholder="Mobile number"
                  value={form.mobile} onChange={(e) => set('mobile', e.target.value)} />
              </>
            )}

            {/* Login: email or mobile toggle */}
            {mode === 'login' && (
              <>
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
              </>
            )}

            {/* Password */}
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

            <button type="submit"
              className="w-full py-3 rounded-lg font-semibold text-sm bg-[#00d4ff] text-black hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
              {mode === 'login' ? 'Login' : 'Create Account'}
            </button>
          </form>

          {mode === 'login' && (
            <div className="mt-4 p-3 rounded-lg bg-white/5 border border-[#2a2a3a]">
              <p className="text-xs text-[#8888aa] font-medium mb-1">Demo Account:</p>
              <p className="text-xs text-[#8888aa]">player@nexus.gg or 0200000002 / player123</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
