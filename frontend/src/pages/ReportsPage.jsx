import { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import * as staffApi from '../api/staff.js';
import * as goalApi from '../api/goals.js';
import * as obsApi from '../api/observations.js';
import * as dashboardApi from '../api/dashboard.js';
import PageHeader from '../components/common/PageHeader.jsx';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ErrorBanner from '../components/common/ErrorBanner.jsx';
import { formatScore, humanize } from '../utils/formatters.js';

const REPORTS = [
  { id: 'staff', label: 'Staff Performance Summary' },
  { id: 'observation', label: 'Observation Activity' },
  { id: 'goals', label: 'Goal Progress' },
  { id: 'departments', label: 'Department Comparison' },
];

export default function ReportsPage() {
  const [active, setActive] = useState('staff');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      staffApi.listStaff({ isActive: 'true' }),
      goalApi.listGoals(),
      obsApi.listObservations(),
      dashboardApi.getPerformance(),
    ])
      .then(([staff, goals, observations, performance]) =>
        setData({ staff, goals, observations, performance })
      )
      .catch((err) => setError(err.response?.data?.error || 'Failed to load reports'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner label="Loading reports..." />;
  if (error) return <ErrorBanner message={error} />;

  return (
    <div>
      <PageHeader title="Reports" subtitle="Aggregated insights across the school." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {REPORTS.map((r) => (
          <button
            key={r.id}
            onClick={() => setActive(r.id)}
            className={`card p-4 text-left transition ${active === r.id ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
          >
            <p className="font-medium text-slate-900 text-sm">{r.label}</p>
          </button>
        ))}
      </div>

      <Card
        title={REPORTS.find((r) => r.id === active).label}
        action={
          <Button variant="secondary" size="sm" disabled title="Coming soon">
            PDF Export — Coming Soon
          </Button>
        }
      >
        {active === 'staff' && <StaffReport staff={data.staff} />}
        {active === 'observation' && <ObservationReport observations={data.observations} />}
        {active === 'goals' && <GoalReport goals={data.goals} />}
        {active === 'departments' && <DepartmentReport performance={data.performance} />}
      </Card>
    </div>
  );
}

function StaffReport({ staff }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-slate-500 uppercase border-b border-slate-100">
            <th className="py-2 pr-4 font-medium">Name</th>
            <th className="py-2 pr-4 font-medium">Department</th>
            <th className="py-2 pr-4 font-medium">Avg Obs Score</th>
            <th className="py-2 pr-4 font-medium">Active Goals</th>
            <th className="py-2 font-medium">Review Status</th>
          </tr>
        </thead>
        <tbody>
          {staff.map((s) => (
            <tr key={s.id} className="border-b border-slate-50">
              <td className="py-2 pr-4 font-medium text-slate-800">
                {s.firstName} {s.lastName}
              </td>
              <td className="py-2 pr-4 text-slate-600">{s.department?.name || '—'}</td>
              <td className="py-2 pr-4 text-slate-600">{formatScore(s.avgObservationScore)} / 4</td>
              <td className="py-2 pr-4 text-slate-600">{s.activeGoals}</td>
              <td className="py-2">{s.latestReviewStatus ? <Badge status={s.latestReviewStatus} /> : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ObservationReport({ observations }) {
  const byStatus = {};
  const byObserver = {};
  for (const o of observations) {
    byStatus[o.status] = (byStatus[o.status] || 0) + 1;
    const name = `${o.observer.firstName} ${o.observer.lastName}`;
    byObserver[name] = (byObserver[name] || 0) + 1;
  }
  const statusData = Object.entries(byStatus).map(([k, v]) => ({ name: humanize(k), count: v }));

  return (
    <div>
      <p className="text-sm text-slate-600 mb-4">
        Total observations: <span className="font-semibold">{observations.length}</span>
      </p>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={statusData} margin={{ left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} interval={0} angle={-15} textAnchor="end" height={60} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
          <Tooltip />
          <Bar dataKey="count" name="Observations" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-4">
        <h4 className="font-medium text-slate-700 text-sm mb-2">By Observer</h4>
        <ul className="text-sm text-slate-600 space-y-1">
          {Object.entries(byObserver).map(([name, count]) => (
            <li key={name} className="flex justify-between">
              <span>{name}</span>
              <span className="font-medium">{count}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function GoalReport({ goals }) {
  const byCategory = {};
  for (const g of goals) {
    byCategory[g.category] = byCategory[g.category] || { total: 0, completed: 0 };
    byCategory[g.category].total += 1;
    if (g.status === 'COMPLETED') byCategory[g.category].completed += 1;
  }
  const data = Object.entries(byCategory).map(([k, v]) => ({
    name: humanize(k),
    completion: Math.round((v.completed / v.total) * 100),
    total: v.total,
  }));
  const atRisk = goals.filter((g) => g.status === 'AT_RISK');

  return (
    <div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12, fill: '#64748b' }} unit="%" />
          <YAxis type="category" dataKey="name" width={160} tick={{ fontSize: 11, fill: '#475569' }} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="completion" name="% Complete" fill="#10b981" radius={[0, 4, 4, 0]} barSize={18} />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-4">
        <h4 className="font-medium text-slate-700 text-sm mb-2">At-Risk Goals ({atRisk.length})</h4>
        {atRisk.length ? (
          <ul className="text-sm text-slate-600 space-y-1">
            {atRisk.map((g) => (
              <li key={g.id} className="flex justify-between gap-4">
                <span>{g.title}</span>
                <Badge status={g.status} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-400">No goals are currently at risk.</p>
        )}
      </div>
    </div>
  );
}

function DepartmentReport({ performance }) {
  const data = performance.departments.map((d) => ({ name: d.department, avgScore: d.avgScore }));
  return (
    <div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
          <YAxis domain={[0, 4]} tick={{ fontSize: 12, fill: '#64748b' }} />
          <Tooltip />
          <Bar dataKey="avgScore" name="Avg Rubric Score" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={60} />
        </BarChart>
      </ResponsiveContainer>
      <p className="text-xs text-slate-400 mt-2 text-center">Average Danielson rubric score by department (out of 4)</p>
    </div>
  );
}
