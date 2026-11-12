import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/hmalm01.svg';
import { supabase } from '../lib/supabase';
import { TERMS_CONTENT } from './TermsOfService';
import { PRIVACY_CONTENT } from './PrivacyPolicy';

const inputClass =
  'w-full bg-[#1a1a24] border border-[#2a2a3a] rounded-xl px-4 py-3.5 text-[#f0f0ff] text-sm placeholder-[#555570] focus:outline-none focus:border-[#00d4ff] transition-all duration-200';

const labelClass = 'block text-sm font-semibold text-[#f0f0ff] mb-1.5';

// ── Inline document modal ─────────────────────────────────────────────────────
function DocModal({ title, children, btnLabel, onAccept }) {
  const bodyRef = useRef(null);
  const [atBottom, setAtBottom] = useState(false);

  function handleScroll() {
    const el = bodyRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    if (nearBottom) setAtBottom(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-md bg-[#111118] border border-[#2a2a3a] rounded-t-2xl sm:rounded-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#2a2a3a] flex-shrink-0">
          <p className="text-base font-black text-[#f0f0ff]">{title}</p>
          <p className="text-xs text-[#8888aa] mt-0.5">Scroll to the bottom to continue</p>
        </div>

        {/* Scrollable content */}
        <div
          ref={bodyRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-5 py-4 space-y-4 text-sm text-[#c0c0d0] leading-relaxed"
        >
          {children}
          {/* Invisible sentinel so user must scroll all the way */}
          <div className="h-4" />
        </div>

        {/* Accept button */}
        <div className="px-5 py-4 border-t border-[#2a2a3a] flex-shrink-0">
          {!atBottom && (
            <p className="text-xs text-[#8888aa] text-center mb-3">
              Keep scrolling to enable the button
            </p>
          )}
          <button
            onClick={onAccept}
            disabled={!atBottom}
            className="w-full py-3.5 rounded-xl font-bold text-sm bg-[#00d4ff] text-black disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            {btnLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export function RegisterPage() {
  const [form, setForm] = useState({
    name: '', mobile: '', email: '', password: '', confirmPassword: '', referralCode: '',
  });
  const [showPw, setShowPw]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [isFirstUser, setIsFirstUser] = useState(false);

  // Legal flow: 'none' | 'terms' | 'privacy' | 'submitting'
  const [legalStep, setLegalStep] = useState('none');

  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.from('profiles').select('id', { count: 'exact', head: true }).then(({ count }) => {
      if (count === 0) setIsFirstUser(true);
    });
  }, []);

  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get('ref');
    if (ref) setForm((f) => ({ ...f, referralCode: ref }));
  }, []);

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  // ── Validate form, then kick off legal flow ───────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.name.trim())     { setError('Full name is required.'); return; }
    if (!form.mobile.trim())   { setError('Phone number is required.'); return; }
    if (!form.password)        { setError('Password is required.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
    if (!form.referralCode.trim()) { setError('A referral code is required to register.'); return; }

    // Verify referral code
    setLoading(true);
    const { data: refCheck } = await supabase
      .from('profiles')
      .select('id')
      .eq('referral_code', form.referralCode.trim().toUpperCase())
      .maybeSingle();
    setLoading(false);
    if (!refCheck) { setError('Invalid referral code. Please check and try again.'); return; }

    // Open Terms modal
    setLegalStep('terms');
  }

  // ── After both docs accepted, do the actual registration ──────────────────
  async function doRegister() {
    setLegalStep('none');
    setLoading(true);
    const email = form.email.trim()
      ? form.email.trim()
      : `${form.mobile.replace(/\D/g, '')}@nexusgg.app`;
    const res = await register(form.name, email, `+233${form.mobile.replace(/^0/, '')}`, form.password, form.referralCode);
    setLoading(false);
    if (res.success) navigate('/user/dashboard');
    else setError(res.error);
  }

  return (
    <>
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
                <input className={inputClass} type="text" placeholder="Enter your full name"
                  value={form.name} onChange={(e) => set('name', e.target.value)} />
              </div>

              {/* Phone Number */}
              <div>
                <label className={labelClass}>Phone Number</label>
                <div className="flex gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-3.5 rounded-xl bg-[#1a1a24] border border-[#2a2a3a] text-sm text-[#f0f0ff] flex-shrink-0 cursor-default select-none">
                    <span>GH</span>
                    <span className="font-medium">+233</span>
                    <ChevronDown size={13} className="text-[#8888aa]" />
                  </div>
                  <input className={inputClass} type="tel" placeholder="Enter phone number" maxLength={9}
                    value={form.mobile} onChange={(e) => set('mobile', e.target.value.replace(/\D/g, '').slice(0, 9))} />
                </div>
              </div>

              {/* Email (optional) */}
              <div>
                <label className={labelClass}>Email Address <span className="text-[#8888aa] font-normal text-xs">(Optional)</span></label>
                <input className={inputClass} type="email" placeholder="Enter your email address (optional)"
                  value={form.email} onChange={(e) => set('email', e.target.value)} />
              </div>

              {/* Password */}
              <div>
                <label className={labelClass}>Login Password</label>
                <div className="relative">
                  <input className={inputClass} type={showPw ? 'text' : 'password'}
                    placeholder="6-16 characters, letters and numbers"
                    value={form.password} onChange={(e) => set('password', e.target.value)} maxLength={16} />
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
                  <input className={inputClass} type={showConfirm ? 'text' : 'password'}
                    placeholder="Please re-enter password"
                    value={form.confirmPassword} onChange={(e) => set('confirmPassword', e.target.value)} />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8888aa] hover:text-[#f0f0ff]">
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Referral Code */}
              <div>
                <label className={labelClass}>Referral Code</label>
                <input className={inputClass} type="text" placeholder="Enter referral code"
                  value={form.referralCode} onChange={(e) => set('referralCode', e.target.value)} />
              </div>

              {error && (
                <p className="text-red-400 text-sm bg-red-900/20 rounded-xl px-3 py-2">{error}</p>
              )}

              <button type="submit" disabled={loading}
                className="w-full py-3.5 rounded-xl font-bold text-sm bg-[#00d4ff] text-black hover:opacity-90 active:scale-[0.98] transition-all duration-200 disabled:opacity-60 mt-2">
                {loading ? 'Verifying...' : 'Register Now'}
              </button>
            </form>

            <p className="text-center text-sm text-[#8888aa]">
              Already have an account?{' '}
              <Link to="/login" className="text-[#00d4ff] font-semibold hover:underline">Login</Link>
            </p>
          </div>
        </div>
      </div>

      {/* ── Terms of Service Modal ── */}
      {legalStep === 'terms' && (
        <DocModal
          title="Terms of Service"
          btnLabel="Accept & Continue to Privacy Policy"
          onAccept={() => setLegalStep('privacy')}
        >
          <TERMS_CONTENT />
        </DocModal>
      )}

      {/* ── Privacy Policy Modal ── */}
      {legalStep === 'privacy' && (
        <DocModal
          title="Privacy Policy"
          btnLabel="I have read this document — Complete Registration"
          onAccept={doRegister}
        >
          <PRIVACY_CONTENT />
        </DocModal>
      )}
    </>
  );
}
