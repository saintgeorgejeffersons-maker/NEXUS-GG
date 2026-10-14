import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { monthlySpending } from '../../data/mockData';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a24] border border-[#2a2a3a] rounded-lg p-3 text-sm">
      <p className="text-[#8888aa] mb-2">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{color: p.color}}>{p.name}: <span className="font-semibold">${p.value}</span></p>
      ))}
    </div>
  );
};

export function SpendingChart() {
  return (
    <div className="glass-card p-5">
      <h3 className="text-base font-semibold text-[#f0f0ff] mb-4">Monthly Spending Overview</h3>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={monthlySpending} margin={{top: 5, right: 10, left: -10, bottom: 0}}>
          <defs>
            <linearGradient id="colorHardware" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorDigital" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
          <XAxis dataKey="month" tick={{fill: '#8888aa', fontSize: 12}} axisLine={{stroke: '#2a2a3a'}} tickLine={false} />
          <YAxis tick={{fill: '#8888aa', fontSize: 12}} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{color: '#8888aa', fontSize: 12, paddingTop: 12}} />
          <Area type="monotone" dataKey="hardware" name="Hardware" stroke="#00d4ff" strokeWidth={2} fill="url(#colorHardware)" />
          <Area type="monotone" dataKey="digital" name="Digital" stroke="#7c3aed" strokeWidth={2} fill="url(#colorDigital)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
