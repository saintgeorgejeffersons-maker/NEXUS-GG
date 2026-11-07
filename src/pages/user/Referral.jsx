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

            {/* Share buttons */}
            <div className="grid grid-cols-2 gap-2">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Join NEXUS GG and start earning daily returns! Use my referral link: ${referralLink}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 border border-[#25D366]/30 bg-[#25D366]/10 text-[#25D366]"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </a>
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent('Join NEXUS GG and start earning daily returns! Use my referral link:')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 border border-[#2AABEE]/30 bg-[#2AABEE]/10 text-[#2AABEE]"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
                Telegram
              </a>
            </div>

            <div className="grid grid-cols-2 gap-2">
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
