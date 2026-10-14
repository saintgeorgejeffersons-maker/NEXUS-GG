export function StatCard({ icon: Icon, label, value, accent = '#00d4ff', trend, trendLabel }) {
  const isPositive = trend >= 0;
  return (
    <div className="glass-card p-5 flex flex-col gap-3 hover:border-[#2a2a3a] transition-all duration-200" style={{ borderColor: `${accent}22` }}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-[#8888aa]">{label}</span>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${accent}18` }}>
          <Icon size={18} style={{color: accent}} />
        </div>
      </div>
      <div className="text-2xl font-bold text-[#f0f0ff]">{value}</div>
      {trend !== undefined && (
        <div className={`text-xs flex items-center gap-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          <span>{isPositive ? '▲' : '▼'}</span>
          <span>{Math.abs(trend)}% {trendLabel || 'vs last month'}</span>
        </div>
      )}
    </div>
  );
}
