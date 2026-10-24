import { TrendingUp } from 'lucide-react';

export function ActiveInvestments() {
  return (
    <div className="space-y-6">
      <div className="glass-card p-8 text-center" style={{ border: '1px solid rgba(0,212,255,0.2)' }}>
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#00d4ff]/10 mb-4">
          <TrendingUp size={28} className="text-[#00d4ff]" />
        </div>
        <h1 className="text-2xl font-black text-[#f0f0ff] mb-2">Active Investments</h1>
        <p className="text-sm text-[#8888aa]">Your active investments will appear here.</p>
      </div>
    </div>
  );
}
