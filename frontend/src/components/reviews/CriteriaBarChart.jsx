import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import { REVIEW_CRITERIA } from '../../utils/constants.js';
import { getScoreColor } from '../../utils/formatters.js';

export default function CriteriaBarChart({ scores, height = 320 }) {
  const byCrit = {};
  for (const s of scores || []) byCrit[s.criterion] = s.score;
  const data = REVIEW_CRITERIA.map((c) => ({
    name: c.label,
    score: byCrit[c.key] || 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
        <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 11, fill: '#64748b' }} />
        <YAxis
          type="category"
          dataKey="name"
          width={150}
          tick={{ fontSize: 11, fill: '#475569' }}
        />
        <Tooltip />
        <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={18}>
          {data.map((d, i) => (
            <Cell key={i} fill={getScoreColor(d.score)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
