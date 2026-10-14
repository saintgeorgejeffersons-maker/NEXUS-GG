import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import { salesByPlatform } from '../../data/mockData';

const CustomBarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a24] border border-[#2a2a3a] rounded-lg p-3 text-sm">
      <p className="text-[#8888aa] mb-1">{label}</p>
      <p style={{color: payload[0]?.fill}}>Units: <span className="font-semibold">{payload[0]?.value}</span></p>
    </div>
  );
};

const CustomPieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a24] border border-[#2a2a3a] rounded-lg p-3 text-sm">
      <p style={{color: payload[0].payload.color}}>{payload[0].name}</p>
      <p className="text-[#f0f0ff] font-semibold">${(payload[0].value / 1000).toFixed(0)}K</p>
    </div>
  );
};

export function SalesChart() {
  return (
    <div className="glass-card p-5">
      <h3 className="text-base font-semibold text-[#f0f0ff] mb-4">Sales by Platform</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-xs text-[#8888aa] mb-3">Units Sold</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={salesByPlatform} margin={{top: 5, right: 10, left: -20, bottom: 0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" vertical={false} />
              <XAxis dataKey="platform" tick={{fill: '#8888aa', fontSize: 11}} axisLine={false} tickLine={false} />
              <YAxis tick={{fill: '#8888aa', fontSize: 11}} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomBarTooltip />} />
              <Bar dataKey="units" radius={[4, 4, 0, 0]}>
                {salesByPlatform.map((entry) => (
                  <Cell key={entry.platform} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div>
          <p className="text-xs text-[#8888aa] mb-3">Revenue Share</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={salesByPlatform} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="revenue" nameKey="platform" paddingAngle={3}>
                {salesByPlatform.map((entry) => (
                  <Cell key={entry.platform} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
              <Legend wrapperStyle={{color: '#8888aa', fontSize: 11}} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
