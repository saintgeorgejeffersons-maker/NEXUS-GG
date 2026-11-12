import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/hmalm01.svg';
import { supabase } from '../lib/supabase';

const inputClass =
  'w-full bg-[#1a1a24] border border-[#2a2a3a] rounded-xl px-4 py-3.5 text-[#f0f0ff] text-sm placeholder-[#555570] focus:outline-none focus:border-[#00d4ff] transition-all duration-200';

const labelClass = 'block text-sm font-semibold text-[#f0f0ff] mb-1.5';

export function RegisterPage() {
  const [form, setForm] = useState({
    name: '', mobile: '', email: '', password: '', confirmPassword: '', referralCode: '',
  });
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFirstUser, setIsFirstUser] = useState(false);

  // Legal acceptance
  const [termsRead, setTermsRead] = useState(false);
  const [privacyRead, setPrivacyRead] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  // Check if this is the very first user (no profiles exist yet)
  useEffect(() => {
    supabase.from('profiles').select('id', { count: 'exact', head: true }).then(({ count }) => {
      if (count === 0) setIsFirstUser(true);
    });
  }, []);

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get('ref');
    if (ref) set('referralCode', ref);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim())     { setError('Full name is required.'); return; }
    if (!form.mobile.trim())   { setError('Phone number is required.'); return; }
    if (!form.password)        { setError('Password is required.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
    if (!form.referralCode.trim()) { setError('A referral code is required to register.'); return; }
    if (!accepted) { setError('Please read and accept the Terms of Service and Privacy Policy to continue.'); return; }

    // Verify the referral code exists in the DB
    setLoading(true);
    const { data: refCheck } = await supabase
      .from('profiles')
      .select('id')
      .eq('referral_code', form.referralCode.trim().toUpperCase())
      .maybeSingle();
    if (!refCheck) {
      setError('Invalid referral code. Please check and try again.');
      setLoading(false);
      return;
    }

    // Use provided email or generate a placeholder from phone number
    const email = form.email.trim()
      ? form.email.trim()
      : `${form.mobile.replace(/\D/g, '')}@nexusgg.app`;

    const res = await register(form.name, email, `+233${form.mobile.replace(/^0/, '')}`, form.password, form.referralCode);
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

      <div className="relative z-10 w-full max-w-md py-8">
        {/* Brand */}
        <div className="text-center mb-6">
          <img src={logo} alt="NEXUS GG" className="w-[72px] h-[72px] mx-auto mb-3 invert" />
          <h1 className="text-2xl font-black tracking-wider text-[#f0f0ff]">
            NEXUS<span className="text-[#00d4ff]">GG</span>
          </h1>
          <p className="text-[#8888aa] text-xs mt-1">Game. Invest. Earn.</p>
        </div>

        <div className="glass-card p-6 space-y-4">
          <h2 className="text-base font-bold text-[#f0f0ff]">Create Account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Full Name */}
            <div>
              <label className={labelClass}>Full Name</label>
              <input
                className={inputClass}
                type="text"
                placeholder="Enter your full name"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className={labelClass}>Phone Number</label>
              <div className="flex gap-2">
                {/* Country prefix — hardcoded Ghana */}
                <div className="flex items-center gap-1.5 px-3 py-3.5 rounded-xl bg-[#1a1a24] border border-[#2a2a3a] text-sm text-[#f0f0ff] flex-shrink-0 cursor-default select-none">
                  <span>GH</span>
                  <span className="font-medium">+233</span>
                  <ChevronDown size={13} className="text-[#8888aa]" />
                </div>
                <input
                  className={inputClass}
                  type="tel"
                  placeholder="Enter phone number"
                  value={form.mobile}
                  onChange={(e) => set('mobile', e.target.value)}
                />
              </div>
            </div>

            {/* Email (optional) */}
            <div>
              <label className={labelClass}>Email Address <span className="text-[#8888aa] font-normal text-xs">(Optional)</span></label>
              <input
                className={inputClass}
                type="email"
                placeholder="Enter your email address (optional)"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
              />
            </div>

            {/* Password */}
            <div>
              <label className={labelClass}>Login Password</label>
              <div className="relative">
                <input
                  className={inputClass}
                  type={showPw ? 'text' : 'password'}
                  placeholder="6-16 characters, letters and numbers"
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                  maxLength={16}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8888aa] hover:text-[#f0f0ff]">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className={labelClass}>Confirm Password</label>
              <div className="relative">
                <input
                  className={inputClass}
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Please re-enter password"
                  value={form.confirmPassword}
                  onChange={(e) => set('confirmPassword', e.target.value)}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8888aa] hover:text-[#f0f0ff]">
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Referral Code */}
            <div>
              <label className={labelClass}>Referral Code</label>
              <input
                className={inputClass}
                type="text"
                placeholder="Enter referral code"
                value={form.referralCode}
                onChange={(e) => set('referralCode', e.target.value)}
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-900/20 rounded-xl px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-sm bg-[#00d4ff] text-black hover:opacity-90 active:scale-[0.98] transition-all duration-200 disabled:opacity-60 mt-2"
            >
              {loading ? 'Creating account...' : 'Register Now'}
            </button>

            <p className="text-center text-xs text-[#8888aa]">
              By registering you agree to our{' '}
              <Link to="/terms" className="text-[#00d4ff] hover:underline">Terms of Service</Link>
              {' '}and{' '}
              <Link to="/privacy" className="text-[#00d4ff] hover:underline">Privacy Policy</Link>
            </p>
            {/* Legal acceptance */}
            <div className="space-y-2 pt-1">
              {/* Terms link */}
              <div className="flex items-center justify-between py-2.5 border border-[#2a2a3a] rounded-xl px-3">
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full flex-shrink-0 border-2 flex items-center justify-center ${termsRead ? 'border-[#00ff88] bg-[#00ff88]/20' : 'border-[#2a2a3a]'}`}>
                    {termsRead && <div className="w-2 h-2 rounded-full bg-[#00ff88]" />}
                  </div>
                  <span className="text-xs text-[#8888aa]">Read Terms of Service</span>
                </div>
                <Link
                  to="/terms" target="_blank"
                  onClick={() => setTermsRead(true)}
                  className="text-xs text-[#00d4ff] font-semibold hover:underline flex-shrink-0"
                >
                  Read
                </Link>
              </div>

              {/* Privacy link */}
              <div className="flex items-center justify-between py-2.5 border border-[#2a2a3a] rounded-xl px-3">
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full flex-shrink-0 border-2 flex items-center justify-center ${privacyRead ? 'border-[#00ff88] bg-[#00ff88]/20' : 'border-[#2a2a3a]'}`}>
                    {privacyRead && <div className="w-2 h-2 rounded-full bg-[#00ff88]" />}
                  </div>
                  <span className="text-xs text-[#8888aa]">Read Privacy Policy</span>
                </div>
                <Link
                  to="/privacy" target="_blank"
                  onClick={() => setPrivacyRead(true)}
                  className="text-xs text-[#00d4ff] font-semibold hover:underline flex-shrink-0"
                >
                  Read
                </Link>
              </div>

              {/* Accept checkbox — only enabled after both are read */}
              <label className={`flex items-start gap-3 cursor-pointer ${!termsRead || !privacyRead ? 'opacity-40 pointer-events-none' : ''}`}>
                <div
                  onClick={() => { if (termsRead && privacyRead) setAccepted((v) => !v); }}
                  className={`mt-0.5 w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                    accepted ? 'border-[#00d4ff] bg-[#00d4ff]' : 'border-[#2a2a3a] bg-transparent'
                  }`}
                >
                  {accepted && (
                    <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
                      <path d="M1 4L4 7L10 1" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <span className="text-xs text-[#8888aa] leading-relaxed">
                  I have read and agree to the Terms of Service and Privacy Policy
                </span>
              </label>
            </div>

          </form>

          <p className="text-center text-sm text-[#8888aa]">
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
