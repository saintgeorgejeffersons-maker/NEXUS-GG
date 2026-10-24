import { useEffect, useState, useCallback } from 'react';
import { TrendingUp, ShoppingCart, CheckCircle, Coins, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getUserInvestments, claimDailyReturn } from '../../lib/db';

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

function getClaimStatus(lastClaimedAt) {
  if (!lastClaimedAt) return { canClaim: true, countdown: null };
  const msElapsed = Date.now() - new Date(lastClaimedAt).getTime();
  if (msElapsed >= TWENTY_FOUR_HOURS_MS) return { canClaim: true, countdown: null };
  const msLeft = TWENTY_FOUR_HOURS_MS - msElapsed;
  const hoursLeft = Math.floor(msLeft / (60 * 60 * 1000));
  const minutesLeft = Math.floor((msLeft % (60 * 60 * 1000)) / (60 * 1000));
  return { canClaim: false, countdown: `Available in ${hoursLeft}h ${minutesLeft}m` };
}

export function ActiveInvestments() {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState({});
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
  }, [fetchInvestments]);

  // Re-render every minute so countdown timers stay accurate
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  async function handleClaim(investment) {
    setClaiming((prev) => ({ ...prev, [investment.id]: true }));
    setError(null);
    try {
      await claimDailyReturn(investment, profile.id);
      await fetchInvestments();
      if (refreshProfile) await refreshProfile();
    } catch (err) {
      setError(err.message);
    } finally {
      setClaiming((prev) => ({ ...prev, [investment.id]: false }));
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-[#8888aa]">Loading...</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-5" style={{ border: '1px solid rgba(0,212,255,0.2)' }}>
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#00d4ff]/10">
            <TrendingUp size={20} className="text-[#00d4ff]" />
          </div>
          <div>
            <h1 className="text-xl font-black text-[#f0f0ff]">Active Investments</h1>
            <p className="text-xs text-[#8888aa]">Claim your daily earnings once every 24 hours</p>
          </div>
        </div>
      </div>

      {/* Global error */}
      {error && (
        <div className="glass-card p-4 border border-red-500/30 bg-red-500/10 text-red-400 text-sm rounded-xl">
          {error}
        </div>
      )}

      {/* Empty state */}
      {investments.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <ShoppingCart size={40} className="mx-auto mb-3 text-[#8888aa] opacity-40" />
          <p className="text-[#8888aa] text-sm mb-4">No active investments yet.</p>
          <button
            onClick={() => navigate('/user/catalog')}
            className="px-5 py-2 rounded-lg text-sm font-medium bg-[#00d4ff] text-black hover:opacity-90 transition-all"
          >
            Browse Products
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {investments.map((inv) => {
            const elapsed = inv.duration_days - inv.days_remaining;
            const progress = Math.round((elapsed / inv.duration_days) * 100);
            const { canClaim, countdown } = getClaimStatus(inv.last_claimed_at);
            const isClaiming = claiming[inv.id] === true;
            const isComplete = inv.days_remaining === 0;

            return (
              <div
                key={inv.id}
                className="glass-card p-5"
                style={{ border: '1px solid rgba(42,42,58,0.8)' }}
              >
                {/* Top row */}
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold text-[#f0f0ff]">{inv.product_name}</p>
                  <span className="text-xs px-2 py-1 rounded-full bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/20">
                    +₵{Number(inv.daily_return).toFixed(2)}/day
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-[#2a2a3a] rounded-full h-1.5 mb-2">
                  <div
                    className="h-1.5 rounded-full bg-gradient-to-r from-[#00d4ff] to-[#00ff88] transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-[#8888aa] mb-3">
                  <span>Day {elapsed} of {inv.duration_days}</span>
                  <span>{inv.days_remaining} days remaining</span>
                </div>

                {/* Stats row */}
                <div className="flex justify-between text-xs mb-4">
                  <span className="text-[#8888aa]">
                    Invested: <span className="text-[#f0f0ff]">₵{Number(inv.price).toFixed(2)}</span>
                  </span>
                  <span className="text-[#8888aa]">
                    Total earned: <span className="text-[#00ff88]">₵{Number(inv.total_earned).toFixed(2)}</span>
                  </span>
                </div>

                {/* Claim button / complete badge */}
                {isComplete ? (
                  <div className="flex items-center gap-2 justify-center py-2 rounded-lg bg-[#00ff88]/10 border border-[#00ff88]/20">
                    <CheckCircle size={16} className="text-[#00ff88]" />
                    <span className="text-sm font-semibold text-[#00ff88]">Investment Complete</span>
                  </div>
                ) : canClaim ? (
                  <button
                    onClick={() => handleClaim(inv)}
                    disabled={isClaiming}
                    className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all
                      bg-gradient-to-r from-[#00d4ff] to-[#00ff88] text-black
                      hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isClaiming ? 'Claiming…' : <><Coins size={15} className="inline mr-1.5 -mt-0.5" />Claim Daily Earnings</>}
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full py-2.5 rounded-lg text-sm font-medium transition-all
                      bg-[#2a2a3a] text-[#8888aa] border border-[#2a2a3a] cursor-not-allowed"
                  >
                    <Clock size={14} className="inline mr-1.5 -mt-0.5" />{countdown}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
