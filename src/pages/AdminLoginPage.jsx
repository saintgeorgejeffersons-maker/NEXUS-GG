import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const inputClass =
  'w-full bg-[#1a1a24] border border-[#2a2a3a] rounded-lg px-4 py-3 text-[#f0f0ff] text-sm placeholder-[#8888aa] focus:outline-none focus:border-[#7c3aed] transition-all duration-200';

export function AdminLoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email.trim()) { setError('Email address is required.'); return; }
    if (!form.password)     { setError('Password is required.'); return; }
    const res = await login(form.email, form.password, 'admin');
    if (res.success) navigate('/myspot/dashboard');
    else setError(res.error || 'Invalid admin credentials.');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#7c3aed]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-[#00d4ff]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#7c3aed]/10 border border-[#7c3aed]/30 mb-4">
            <ShieldCheck size={32} className="text-[#7c3aed]" />
          </div>
          <h1 className="text-3xl font-black tracking-wider text-[#f0f0ff]">
            NEXUS<span className="text-[#7c3aed]">GG</span>
          </h1>
          <p className="text-[#8888aa] text-sm mt-1">Admin Portal</p>
        </div>

        <div className="glass-card p-6" style={{ borderColor: 'rgba(124,58,237,0.2)' }}>
          <h2 className="text-lg font-bold text-[#f0f0ff] mb-5">Administrator Login</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              className={inputClass}
              type="email"
              placeholder="Admin email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
            />

            <div className="relative">
              <input
                className={inputClass}
                type={showPw ? 'text' : 'password'}
                placeholder="Password"
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
              />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8888aa] hover:text-[#f0f0ff]">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-900/20 rounded-lg px-3 py-2">{error}</p>
            )}

            <button type="submit"
              className="w-full py-3 rounded-lg font-semibold text-sm bg-[#7c3aed] text-white hover:bg-[#6d28d9] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
              Login as Admin
            </button>
          </form>

          <p className="text-center text-xs text-[#8888aa] mt-4">
            Not an admin?{' '}
            <Link to="/login" className="text-[#00d4ff] hover:underline">Go to Player Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
