import { useEffect, useState, useCallback } from 'react';
import { TrendingUp, ShoppingCart, CheckCircle, Coins, Clock, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getUserInvestments, claimDailyReturn, payReferralCommission,
  claimMissedEarnings, getMissedDays, getSettings,
} from '../../lib/db';

function getClaimStatus(lastClaimedAt) {
  const now = new Date();
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

  if (!lastClaimedAt) return { canClaim: true, countdown: null };

  const lastClaimed = new Date(lastClaimedAt);
  if (lastClaimed < todayMidnight) return { canClaim: true, countdown: null };

  const nextMidnight = new Date(todayMidnight.getTime() + 24 * 60 * 60 * 1000);
  const msLeft = nextMidnight.getTime() - now.getTime();
  const hoursLeft = Math.floor(msLeft / (60 * 60 * 1000));
  const minutesLeft = Math.floor((msLeft % (60 * 60 * 1000)) / (60 * 1000));
  return { canClaim: false, countdown: `${hoursLeft}h ${minutesLeft}m` };
}

export function ActiveInvestments() {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState({});
  const [claimingMissed, setClaimingMissed] = useState({});
  const [missedEarningsPct, setMissedEarningsPct] = useState(50);
  const [error, setError] = useState(null);
  const [, setTick] = useState(0);

  const fetchInvestments = useCallback(async () => {
    if (!profile?.id) return;
    try {
      const data = await getUserInvestments(profile.id);
      setInvestments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    fetchInvestments();
    getSettings().then((s) => setMissedEarningsPct(Number(s.missed_earnings_pct ?? 50)));
  }, [fetchInvestments]);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  async function handleClaim(investment) {
    setClaiming((prev) => ({ ...prev, [investment.id]: true }));
    setError(null);
    try {
      await claimDailyReturn(investment, profile.id);
      try { await payReferralCommission(profile.id, investment.daily_return); } catch (commErr) { console.error('payReferralCommission error:', commErr); }
      await fetchInvestments();
      if (refreshProfile) await refreshProfile();
    } catch (err) {
      setError(err.message);
    } finally {
      setClaiming((prev) => ({ ...prev, [investment.id]: false }));
    }
  }

  async function handleClaimMissed(investment) {
    setClaimingMissed((prev) => ({ ...prev, [investment.id]: true }));
    setError(null);
    try {
      await claimMissedEarnings(investment, profile.id);
      await fetchInvestments();
      if (refreshProfile) await refreshProfile();
    } catch (err) {
      setError(err.message);
    } finally {
      setClaimingMissed((prev) => ({ ...prev, [investment.id]: false }));
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-[#8888aa]">Loading...</div>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <p className="text-lg font-black text-[#f0f0ff]">Active Investments</p>
        <p className="text-xs text-[#8888aa]">Claim your daily earnings every day by midnight</p>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Empty */}
      {investments.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#2a2a3a] flex items-center justify-center">
            <ShoppingCart size={26} className="text-[#8888aa]" />
          </div>
          <p className="text-sm text-[#8888aa] text-center">No active investments yet.</p>
          <button
            onClick={() => navigate('/user/catalog')}
            className="px-6 py-2.5 rounded-xl bg-[#00d4ff] text-black text-sm font-bold"
          >
            Browse Products
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {investments.map((inv) => {
            const elapsed = inv.duration_days - inv.days_remaining;
            const progress = Math.round((elapsed / inv.duration_days) * 100);
            const { canClaim, countdown } = getClaimStatus(inv.last_claimed_at);
            const isClaiming = claiming[inv.id] === true;
            const isClaimingMissed = claimingMissed[inv.id] === true;
            const isComplete = inv.days_remaining === 0;
            const missedDays = getMissedDays(inv);

            return (
              <div
                key={inv.id}
                className="rounded-2xl overflow-hidden"
                style={{ background: '#1a1a24', border: '1px solid #2a2a3a' }}
              >
                {/* Progress bar top */}
                <div className="h-1 w-full bg-[#2a2a3a]">
                  <div
                    className="h-1 bg-gradient-to-r from-[#00d4ff] to-[#00ff88] transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="p-4 space-y-3">
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold text-[#f0f0ff] flex-1">{inv.product_name}</p>
                    <span className="text-xs font-bold px-2 py-1 rounded-full bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/20 flex-shrink-0">
                      +₵{Number(inv.daily_return).toFixed(2)}/day
                    </span>
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-[#0a0a0f] rounded-xl p-2.5">
                      <p className="text-xs text-[#8888aa]">Invested</p>
                      <p className="text-sm font-bold text-[#f0f0ff]">₵{Number(inv.price).toFixed(2)}</p>
                    </div>
                    <div className="bg-[#0a0a0f] rounded-xl p-2.5">
                      <p className="text-xs text-[#8888aa]">Total Earned</p>
                      <p className="text-sm font-bold text-[#00ff88]">₵{Number(inv.total_earned).toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Days info */}
                  <div className="flex justify-between text-xs text-[#8888aa]">
                    <span>Day {elapsed} of {inv.duration_days}</span>
                    <span>{inv.days_remaining} days remaining</span>
                  </div>

                  {/* Claim area */}
                  {isComplete ? (
                    <div className="flex items-center gap-2 justify-center py-3 rounded-xl bg-[#00ff88]/10 border border-[#00ff88]/20">
                      <CheckCircle size={16} className="text-[#00ff88]" />
                      <span className="text-sm font-bold text-[#00ff88]">Investment Complete</span>
                    </div>
                  ) : canClaim ? (
                    <button
                      onClick={() => handleClaim(inv)}
                      disabled={isClaiming}
                      className="w-full py-3 rounded-xl text-sm font-bold transition-all active:scale-[0.98]
                        bg-gradient-to-r from-[#00d4ff] to-[#00ff88] text-black
                        disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isClaiming
                        ? 'Claiming…'
                        : <><Coins size={15} className="inline mr-1.5 -mt-0.5" />Claim Daily Earnings</>
                      }
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 justify-center py-3 rounded-xl bg-[#2a2a3a] border border-[#2a2a3a]">
                      <Clock size={14} className="text-[#8888aa]" />
                      <span className="text-sm text-[#8888aa]">Available in {countdown}</span>
                    </div>
                  )}

                  {/* Missed earnings button */}
                  {!isComplete && missedDays > 0 && (
                    <button
                      onClick={() => handleClaimMissed(inv)}
                      disabled={isClaimingMissed}
                      className="w-full py-3 rounded-xl text-sm font-bold transition-all active:scale-[0.98]
                        bg-[#ff9900]/10 border border-[#ff9900]/30 text-[#ff9900]
                        hover:bg-[#ff9900]/20 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isClaimingMissed
                        ? 'Claiming…'
                        : <><AlertTriangle size={14} className="inline mr-1.5 -mt-0.5" />
                            Claim Missed ({missedDays}d × {missedEarningsPct}%)
                          </>
                      }
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
