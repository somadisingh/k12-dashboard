import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from 'recharts';
import { RUBRIC_CATEGORIES } from '../../utils/constants.js';

export default function RubricRadarChart({ scores, height = 300 }) {
  const byCat = {};
  for (const s of scores || []) byCat[s.category] = s.score;
  const data = RUBRIC_CATEGORIES.map((c) => ({
    domain: c.label,
    score: byCat[c.key] || 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data} outerRadius="70%">
        <PolarGrid stroke="#e2e8f0" />
        <PolarAngleAxis dataKey="domain" tick={{ fontSize: 11, fill: '#475569' }} />
        <PolarRadiusAxis domain={[0, 4]} tick={{ fontSize: 10, fill: '#94a3b8' }} />
        <Radar dataKey="score" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.35} />
        <Tooltip />
      </RadarChart>
    </ResponsiveContainer>
  );
}
