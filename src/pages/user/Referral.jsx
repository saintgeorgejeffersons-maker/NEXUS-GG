import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { generateReferralCode, updateReferralCode, getReferralStats } from '../../lib/db';
import { Share2, Copy, Users, TrendingUp, CheckCircle, Edit3, RefreshCw, AlertCircle } from 'lucide-react';

const inputClass =
  'w-full bg-[#1a1a24] border border-[#2a2a3a] rounded-lg px-4 py-3 text-[#f0f0ff] text-sm placeholder-[#8888aa] focus:outline-none focus:border-[#00d4ff] transition-all';

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
        if (!code) {
          code = await generateReferralCode(profile.id);
        }
        setReferralCode(code);

        const statsData = await getReferralStats(profile.id);
        setStats(statsData);
      } catch (err) {
        // Non-fatal — page still renders without data
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [profile?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSaveCode() {
    setCodeError('');
    setCodeSuccess('');
    setSaving(true);
    const result = await updateReferralCode(profile.id, editingCode.toUpperCase());
    if (result.success) {
      setReferralCode(editingCode.toUpperCase());
      setIsEditing(false);
      setCodeSuccess('Referral code updated.');
      setTimeout(() => setCodeSuccess(''), 3000);
      await refreshProfile();
    } else {
      setCodeError(result.error);
    }
    setSaving(false);
  }

  async function handleGenerateNew() {
    setGenerating(true);
    setCodeError('');
    try {
      const code = await generateReferralCode(profile.id);
      setReferralCode(code);
      await refreshProfile();
    } catch (err) {
      setCodeError('Failed to generate a new code.');
    } finally {
      setGenerating(false);
    }
  }

  async function handleCopyLink() {
    const link = `https://nexusgg.vercel.app/signup?ref=${referralCode}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopying(true);
      setTimeout(() => setCopying(false), 2000);
    } catch (_) {
      // Clipboard not available — fail silently
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-[#8888aa]">Loading...</div>;
  }

  const referralLink = `https://nexusgg.vercel.app/signup?ref=${referralCode}`;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="glass-card p-5" style={{ border: '1px solid rgba(0,212,255,0.2)' }}>
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#00d4ff]/10">
            <Share2 size={20} className="text-[#00d4ff]" />
          </div>
          <div>
            <h1 className="text-xl font-black text-[#f0f0ff]">Referral Program</h1>
            <p className="text-xs text-[#8888aa]">Earn commission on every daily claim your referred users make</p>
          </div>
        </div>
      </div>

      {/* Referral Code Card */}
      <div className="glass-card p-6 space-y-4">
        <p className="text-xs font-semibold text-[#8888aa] uppercase tracking-wide">Your Referral Code</p>

        {isEditing ? (
          <div className="space-y-3">
            <input
              className={inputClass}
              type="text"
              placeholder="Enter new code (4-16 alphanumeric)"
              value={editingCode}
              onChange={(e) => setEditingCode(e.target.value)}
              maxLength={16}
            />
            {codeError && (
              <p className="text-red-400 text-sm bg-red-900/20 rounded-lg px-3 py-2">{codeError}</p>
            )}
            <div className="flex gap-2">
              <button
                onClick={handleSaveCode}
                disabled={saving || !editingCode.trim()}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-[#00d4ff] text-black hover:opacity-90 transition-all disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Code'}
              </button>
              <button
                onClick={() => { setIsEditing(false); setCodeError(''); }}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold border border-[#2a2a3a] text-[#8888aa] hover:text-[#f0f0ff] transition-colors">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-center py-4 rounded-lg bg-[#0a0a0f] border border-[#2a2a3a]">
              <span className="font-mono text-2xl font-bold text-[#00d4ff] tracking-widest">
                {referralCode || '—'}
              </span>
            </div>

            {codeSuccess && (
              <p className="text-[#00ff88] text-sm bg-green-900/20 rounded-lg px-3 py-2">{codeSuccess}</p>
            )}

            <div className="text-xs text-[#8888aa] break-all text-center">{referralLink}</div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => { setIsEditing(true); setEditingCode(referralCode); setCodeError(''); }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-[#2a2a3a] text-[#8888aa] hover:text-[#f0f0ff] hover:bg-white/5 transition-all">
                <Edit3 size={14} /> Edit Code
              </button>

              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-[#00d4ff]/40 text-[#00d4ff] hover:bg-[#00d4ff]/10 transition-all">
                <Copy size={14} /> {copying ? 'Copied!' : 'Copy Referral Link'}
              </button>

              <button
                onClick={handleGenerateNew}
                disabled={generating}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-[#2a2a3a] text-[#8888aa] hover:text-[#f0f0ff] hover:bg-white/5 transition-all disabled:opacity-50">
                <RefreshCw size={14} className={generating ? 'animate-spin' : ''} />
                {generating ? 'Generating...' : 'Generate New Code'}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#00d4ff]/10 flex items-center justify-center flex-shrink-0">
            <Users size={18} className="text-[#00d4ff]" />
          </div>
          <div>
            <p className="text-xs text-[#8888aa]">Total Referrals</p>
            <p className="text-2xl font-bold text-[#f0f0ff]">{stats.referrals.length}</p>
          </div>
        </div>

        <div className="glass-card p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#00ff88]/10 flex items-center justify-center flex-shrink-0">
            <TrendingUp size={18} className="text-[#00ff88]" />
          </div>
          <div>
            <p className="text-xs text-[#8888aa]">Commission Earned</p>
            <p className="text-2xl font-bold text-[#00ff88]">₵{stats.totalEarned.toFixed(2)}</p>
          </div>
        </div>

        <div className="glass-card p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#7c3aed]/10 flex items-center justify-center flex-shrink-0">
            <CheckCircle size={18} className="text-[#7c3aed]" />
          </div>
          <div>
            <p className="text-xs text-[#8888aa]">Active Investors</p>
            <p className="text-2xl font-bold text-[#f0f0ff]">{stats.activeCount}</p>
          </div>
        </div>
      </div>

      {/* Referred Users List */}
      <div className="glass-card p-6">
        <p className="text-xs font-semibold text-[#8888aa] uppercase tracking-wide mb-4">Referred Users</p>

        {stats.referrals.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-8 text-[#8888aa]">
            <AlertCircle size={32} className="opacity-40" />
            <p className="text-sm text-center">No referrals yet. Share your link to start earning!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stats.referrals.map((row) => {
              const ref = row.referred ?? {};
              return (
                <div
                  key={row.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#0a0a0f] border border-[#2a2a3a]">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#f0f0ff] truncate">{ref.full_name || 'User'}</p>
                    <p className="text-xs text-[#8888aa] truncate">{maskEmail(ref.email)}</p>
                    <p className="text-xs text-[#8888aa]">
                      Joined {ref.created_at ? new Date(ref.created_at).toLocaleDateString() : '—'}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0 ml-3 ${
                      row.bonus_paid
                        ? 'bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/20'
                        : 'bg-[#2a2a38] text-[#8888aa] border border-[#2a2a3a]'
                    }`}>
                    {row.bonus_paid ? 'Bonus Paid' : 'Pending'}
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
