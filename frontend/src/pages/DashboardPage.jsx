import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UsersIcon,
  ClipboardDocumentCheckIcon,
  DocumentChartBarIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import * as dashboardApi from '../api/dashboard.js';
import PageHeader from '../components/common/PageHeader.jsx';
import StatCard from '../components/common/StatCard.jsx';
import Card from '../components/common/Card.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ErrorBanner from '../components/common/ErrorBanner.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ObservationTrendChart from '../components/dashboard/ObservationTrendChart.jsx';
import ReviewStatusPie from '../components/dashboard/ReviewStatusPie.jsx';
import RecentActivityFeed from '../components/dashboard/RecentActivityFeed.jsx';
import { formatDate, formatScore, relativeTime } from '../utils/formatters.js';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      dashboardApi.getKpis(),
      dashboardApi.getTrend(),
      dashboardApi.getPerformance(),
      dashboardApi.getActivity(),
      dashboardApi.getUpcoming(),
    ])
      .then(([kpis, trend, performance, activity, upcoming]) =>
        setData({ kpis, trend, performance, activity, upcoming })
      )
      .catch((err) => setError(err.response?.data?.error || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner label="Loading dashboard..." />;
  if (error) return <ErrorBanner message={error} />;

  const { kpis, trend, performance, activity, upcoming } = data;
  const change = kpis.observationChange;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="A bird's-eye view of staff performance across Lincoln K-12 Academy."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Active Staff" value={kpis.totalStaff} icon={UsersIcon} accent="primary" />
        <StatCard
          label="Observations This Month"
          value={kpis.observationsThisMonth}
          icon={ClipboardDocumentCheckIcon}
          accent="success"
          hint={change >= 0 ? `+${change} vs last month` : `${change} vs last month`}
        />
        <StatCard
          label="Pending Reviews"
          value={kpis.pendingReviews}
          icon={DocumentChartBarIcon}
          accent="warning"
          onClick={() => navigate('/reviews')}
        />
        <StatCard
          label="Goals At Risk"
          value={kpis.goalsAtRisk}
          icon={ExclamationTriangleIcon}
          accent={kpis.goalsAtRisk > 0 ? 'danger' : 'success'}
          onClick={() => navigate('/goals?status=AT_RISK')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
        <Card
          title="Observation Activity"
          subtitle="Count & average score over the last 6 months"
          className="lg:col-span-3"
        >
          <ObservationTrendChart data={trend} />
        </Card>
        <Card title="Review Status" subtitle="Distribution by stage" className="lg:col-span-2">
          {performance.reviewStatusDistribution.length ? (
            <ReviewStatusPie data={performance.reviewStatusDistribution} />
          ) : (
            <EmptyState title="No reviews yet" />
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Recent Activity" subtitle="Latest events across all modules">
          {activity.length ? (
            <RecentActivityFeed events={activity} />
          ) : (
            <EmptyState title="No recent activity" />
          )}
        </Card>
        <Card title="Upcoming" subtitle="Scheduled observations & review meetings (next 14 days)">
          {upcoming.length ? (
            <div className="space-y-2">
              {upcoming.map((u) => (
                <button
                  key={`${u.type}-${u.id}`}
                  onClick={() =>
                    navigate(`${u.type === 'OBSERVATION' ? '/observations' : '/reviews'}/${u.id}`)
                  }
                  className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-slate-50 text-left transition"
                >
                  <div className="h-9 w-9 rounded-lg bg-indigo-50 text-primary flex items-center justify-center flex-shrink-0">
                    <CalendarDaysIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{u.title}</p>
                    <p className="text-xs text-slate-500">{formatDate(u.date)}</p>
                  </div>
                  <span className="text-[11px] text-slate-400">{relativeTime(u.date)}</span>
                </button>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={CalendarDaysIcon}
              title="Nothing upcoming"
              message="No observations or review meetings in the next 14 days."
            />
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card title="Average Score by Domain" subtitle="Danielson Framework rubric domains">
          <div className="space-y-3">
            {performance.categories.map((c) => (
              <div key={c.category}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">{c.category.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase())}</span>
                  <span className="font-semibold text-slate-900">{formatScore(c.avgScore)} / 4</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{ width: `${(c.avgScore / 4) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Average Score by Department">
          <div className="space-y-3">
            {performance.departments.map((d) => (
              <div key={d.department}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">{d.department}</span>
                  <span className="font-semibold text-slate-900">{formatScore(d.avgScore)} / 4</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-success"
                    style={{ width: `${(d.avgScore / 4) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
