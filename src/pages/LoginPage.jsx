import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Eye, EyeOff, Gamepad2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const [mode, setMode] = useState('login');
  const [role, setRole] = useState('user');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }
    if (mode === 'register') {
      if (!form.name) { setError('Name is required.'); return; }
      const res = register(form.name, form.email, form.password, role);
      if (res.success) { navigate('/user/dashboard'); }
      else setError(res.error);
    } else {
      const res = login(form.email, form.password, role);
      if (res.success) { navigate(res.role === 'admin' ? '/admin/dashboard' : '/user/dashboard'); }
      else setError(res.error);
    }
  };

  const inputClass = 'w-full bg-[#1a1a24] border border-[#2a2a3a] rounded-lg px-4 py-3 text-[#f0f0ff] text-sm placeholder-[#8888aa] focus:outline-none focus:border-[#00d4ff] focus:shadow-[0_0_10px_rgba(0,212,255,0.2)] transition-all duration-200';

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00d4ff]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#7c3aed]/5 rounded-full blur-3xl" />
      </div>
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#00d4ff]/10 border border-[#00d4ff]/30 mb-4">
            <Gamepad2 size={32} className="text-[#00d4ff]" />
          </div>
          <h1 className="text-3xl font-black tracking-wider text-[#f0f0ff]">NEXUS<span className="text-[#00d4ff]">GG</span></h1>
          <p className="text-[#8888aa] text-sm mt-1">Your Ultimate Gaming Hub</p>
        </div>
        <div className="glass-card p-6">
          <div className="flex rounded-lg overflow-hidden border border-[#2a2a3a] mb-5">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2.5 text-sm font-medium transition-all ${
                mode === 'login' ? 'bg-[#00d4ff] text-black' : 'text-[#8888aa] hover:text-[#f0f0ff]'
              }`}
            >Login</button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2.5 text-sm font-medium transition-all ${
                mode === 'register' ? 'bg-[#00d4ff] text-black' : 'text-[#8888aa] hover:text-[#f0f0ff]'
              }`}
            >Register</button>
          </div>
          <div className="flex gap-2 mb-5">
            <button
              onClick={() => setRole('user')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm border transition-all ${
                role === 'user' ? 'border-[#00d4ff] bg-[#00d4ff]/10 text-[#00d4ff]' : 'border-[#2a2a3a] text-[#8888aa] hover:text-[#f0f0ff]'
              }`}
            ><Gamepad2 size={15} /> Player</button>
            <button
              onClick={() => setRole('admin')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm border transition-all ${
                role === 'admin' ? 'border-[#7c3aed] bg-[#7c3aed]/10 text-[#7c3aed]' : 'border-[#2a2a3a] text-[#8888aa] hover:text-[#f0f0ff]'
              }`}
            ><Zap size={15} /> Admin</button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <input className={inputClass} type="text" placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            )}
            <input className={inputClass} type="email" placeholder="Email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <div className="relative">
              <input className={inputClass} type={showPw ? 'text' : 'password'} placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8888aa] hover:text-[#f0f0ff]">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {error && <p className="text-red-400 text-sm bg-red-900/20 rounded-lg px-3 py-2">{error}</p>}
            <button
              type="submit"
              className="w-full py-3 rounded-lg font-semibold text-sm transition-all duration-200 bg-[#00d4ff] text-black hover:shadow-[0_0_20px_rgba(0,212,255,0.4)] hover:scale-[1.02] active:scale-[0.98]"
            >
              {mode === 'login' ? 'Login' : 'Create Account'}
            </button>
          </form>
          {mode === 'login' && (
            <div className="mt-4 p-3 rounded-lg bg-white/5 border border-[#2a2a3a]">
              <p className="text-xs text-[#8888aa] font-medium mb-1">Demo Accounts:</p>
              <p className="text-xs text-[#8888aa]">Player: player@nexus.gg / player123</p>
              <p className="text-xs text-[#8888aa]">Admin: admin@nexus.gg / admin123</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
