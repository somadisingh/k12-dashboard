import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

export default function ObservationTrendChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
        <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
        <YAxis
          yAxisId="right"
          orientation="right"
          domain={[0, 4]}
          tick={{ fontSize: 12, fill: '#64748b' }}
        />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="count"
          name="Observations"
          stroke="#4f46e5"
          strokeWidth={2.5}
          dot={{ r: 3 }}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="avgScore"
          name="Avg Score"
          stroke="#10b981"
          strokeWidth={2.5}
          dot={{ r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
