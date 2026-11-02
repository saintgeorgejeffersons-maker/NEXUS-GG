import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { generateReferralCode, updateReferralCode, getReferralStats } from '../../lib/db';
import { Copy, Check, Users, TrendingUp, CheckCircle, Edit3, RefreshCw, AlertCircle, Share2 } from 'lucide-react';

const inputClass =
  'w-full bg-[#0a0a0f] border border-[#2a2a3a] rounded-xl px-4 py-3 text-[#f0f0ff] text-sm placeholder-[#8888aa] focus:outline-none focus:border-[#00d4ff] transition-all';

function maskEmail(email) {
  if (!email) return '';
  const [local, domain] = email.split('@');
  if (!domain) return email;
  return local.slice(0, 2) + '***@' + domain;
}

export function Referral() {
  const { profile, refreshProfile } = useAuth();
  const [referralCode, setReferralCode] = useState('');
  const [editingCode, setEditingCode] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [stats, setStats] = useState({ referrals: [], totalEarned: 0, activeCount: 0 });
  const [loading, setLoading] = useState(true);
  const [copying, setCopying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [codeError, setCodeError] = useState('');
  const [codeSuccess, setCodeSuccess] = useState('');

  useEffect(() => {
    if (!profile?.id) return;
    async function init() {
      try {
        let code = profile.referral_code;
        if (!code) code = await generateReferralCode(profile.id);
        setReferralCode(code);
        const statsData = await getReferralStats(profile.id);
        setStats(statsData);
      } catch (_) {}
      finally { setLoading(false); }
    }
    init();
  }, [profile?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSaveCode() {
    setCodeError(''); setCodeSuccess(''); setSaving(true);
    const result = await updateReferralCode(profile.id, editingCode.toUpperCase());
    if (result.success) {
      setReferralCode(editingCode.toUpperCase());
      setIsEditing(false);
      setCodeSuccess('Code updated!');
      setTimeout(() => setCodeSuccess(''), 3000);
      await refreshProfile();
    } else {
      setCodeError(result.error);
    }
    setSaving(false);
  }

  async function handleGenerateNew() {
    setGenerating(true); setCodeError('');
    try {
      const code = await generateReferralCode(profile.id);
      setReferralCode(code);
      await refreshProfile();
    } catch (_) { setCodeError('Failed to generate code.'); }
    finally { setGenerating(false); }
  }

  async function handleCopyLink() {
    const link = `https://nexus-gg.ciscoivf.online/signup?ref=${referralCode}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopying(true);
      setTimeout(() => setCopying(false), 2000);
    } catch (_) {}
  }

  const referralLink = `https://nexus-gg.ciscoivf.online/signup?ref=${referralCode}`;

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-[#8888aa]">Loading...</div>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <p className="text-lg font-black text-[#f0f0ff]">Referral Program</p>
        <p className="text-xs text-[#8888aa]">Earn commission on every daily claim your referrals make</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: Users,       color: '#00d4ff', label: 'Referred',    value: stats.referrals.length },
          { icon: TrendingUp,  color: '#00ff88', label: 'Earned',      value: `₵${stats.totalEarned.toFixed(2)}` },
          { icon: CheckCircle, color: '#7c3aed', label: 'Active',      value: stats.activeCount },
        ].map(({ icon: Icon, color, label, value }) => (
          <div key={label} className="glass-card rounded-2xl p-3 text-center">
            <Icon size={18} style={{ color }} className="mx-auto mb-1" />
            <p className="text-base font-black" style={{ color }}>{value}</p>
            <p className="text-xs text-[#8888aa]">{label}</p>
          </div>
        ))}
      </div>

      {/* Referral code card */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <p className="text-xs font-bold text-[#8888aa] uppercase tracking-wide">Your Referral Code</p>

        {isEditing ? (
          <div className="space-y-3">
            <input
              className={inputClass}
              type="text"
              placeholder="4–16 alphanumeric characters"
              value={editingCode}
              onChange={(e) => setEditingCode(e.target.value)}
              maxLength={16}
            />
            {codeError && (
              <p className="text-red-400 text-sm bg-red-900/20 rounded-xl px-3 py-2">{codeError}</p>
            )}
            <div className="flex gap-2">
              <button
                onClick={handleSaveCode}
                disabled={saving || !editingCode.trim()}
                className="flex-1 py-3 rounded-xl text-sm font-bold bg-[#00d4ff] text-black disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => { setIsEditing(false); setCodeError(''); }}
                className="flex-1 py-3 rounded-xl text-sm font-bold border border-[#2a2a3a] text-[#8888aa]"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Code display */}
            <div className="flex items-center justify-center py-5 rounded-2xl bg-[#0a0a0f] border border-[#2a2a3a]">
              <span className="font-mono text-3xl font-black text-[#00d4ff] tracking-widest">
                {referralCode || '—'}
              </span>
            </div>

            {codeSuccess && (
              <p className="text-[#00ff88] text-sm bg-green-900/20 rounded-xl px-3 py-2">{codeSuccess}</p>
            )}

            {/* Link */}
            <p className="text-xs text-[#8888aa] break-all text-center">{referralLink}</p>

            {/* Actions */}
            <button
              onClick={handleCopyLink}
              className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 bg-[#00d4ff] text-black"
            >
              {copying ? <><Check size={15} /> Copied!</> : <><Copy size={15} /> Copy Referral Link</>}
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { setIsEditing(true); setEditingCode(referralCode); setCodeError(''); }}
                className="py-2.5 rounded-xl text-sm font-semibold border border-[#2a2a3a] text-[#8888aa] flex items-center justify-center gap-1.5"
              >
                <Edit3 size={13} /> Edit Code
              </button>
              <button
                onClick={handleGenerateNew}
                disabled={generating}
                className="py-2.5 rounded-xl text-sm font-semibold border border-[#2a2a3a] text-[#8888aa] flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw size={13} className={generating ? 'animate-spin' : ''} />
                {generating ? 'Generating...' : 'New Code'}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Referred Users */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="px-4 pt-4 pb-2">
          <p className="text-sm font-bold text-[#f0f0ff]">Referred Users</p>
        </div>

        {stats.referrals.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-8 px-4">
            <AlertCircle size={28} className="text-[#8888aa] opacity-40" />
            <p className="text-sm text-[#8888aa] text-center">No referrals yet. Share your link to start earning!</p>
          </div>
        ) : (
          <div className="divide-y divide-[#2a2a3a]/50">
            {stats.referrals.map((row) => {
              const ref = row.referred ?? {};
              return (
                <div key={row.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-9 h-9 rounded-full bg-[#7c3aed]/20 flex items-center justify-center flex-shrink-0 text-sm font-bold text-[#7c3aed]">
                    {(ref.full_name ?? 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#f0f0ff] truncate">{ref.full_name || 'User'}</p>
                    <p className="text-xs text-[#8888aa]">{maskEmail(ref.email)}</p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0 ${
                      row.bonus_paid
                        ? 'bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/20'
                        : 'bg-[#2a2a3a] text-[#8888aa]'
                    }`}
                  >
                    {row.bonus_paid ? 'Active' : 'Pending'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
