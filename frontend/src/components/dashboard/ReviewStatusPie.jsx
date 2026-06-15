import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { humanize } from '../../utils/formatters.js';

const COLORS = ['#94a3b8', '#f59e0b', '#3b82f6', '#4f46e5', '#a855f7', '#10b981'];

export default function ReviewStatusPie({ data }) {
  const chartData = data.map((d) => ({ name: humanize(d.status), value: d.count }));
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={90}
          innerRadius={50}
          paddingAngle={2}
        >
          {chartData.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
