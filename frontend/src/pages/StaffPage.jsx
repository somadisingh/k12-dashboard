import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import * as staffApi from '../api/staff.js';
import PageHeader from '../components/common/PageHeader.jsx';
import Card from '../components/common/Card.jsx';
import Avatar from '../components/common/Avatar.jsx';
import Badge from '../components/common/Badge.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ErrorBanner from '../components/common/ErrorBanner.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import { useDebounce } from '../hooks/useDebounce.js';
import { relativeTime } from '../utils/formatters.js';

export default function StaffPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [search, setSearch] = useState(params.get('search') || '');
  const [active, setActive] = useState('true');
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const debounced = useDebounce(search, 300);

  useEffect(() => {
    setLoading(true);
    const query = {};
    if (debounced) query.search = debounced;
    if (active !== 'all') query.isActive = active;
    staffApi
      .listStaff(query)
      .then(setStaff)
      .catch((err) => setError(err.response?.data?.error || 'Failed to load staff'))
      .finally(() => setLoading(false));
  }, [debounced, active]);

  return (
    <div>
      <PageHeader title="Staff Directory" subtitle="All faculty and administrators at Lincoln K-12 Academy." />

      <Card className="mb-4" bodyClassName="flex flex-col sm:flex-row gap-3">
        <input
          className="input sm:max-w-xs"
          placeholder="Search by name or position..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="input sm:max-w-[180px]" value={active} onChange={(e) => setActive(e.target.value)}>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
          <option value="all">All</option>
        </select>
      </Card>

      {error && <ErrorBanner message={error} />}

      <Card bodyClassName="p-0">
        {loading ? (
          <LoadingSpinner label="Loading staff..." />
        ) : staff.length === 0 ? (
          <EmptyState title="No staff found" message="Try adjusting your search or filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 uppercase border-b border-slate-100">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Department</th>
                  <th className="px-5 py-3 font-medium">Position</th>
                  <th className="px-5 py-3 font-medium">Last Observed</th>
                  <th className="px-5 py-3 font-medium">Active Goals</th>
                  <th className="px-5 py-3 font-medium">Review Status</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => navigate(`/staff/${s.id}`)}
                    className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar firstName={s.firstName} lastName={s.lastName} size={36} url={s.avatarUrl} />
                        <div>
                          <p className="font-medium text-slate-900">
                            {s.firstName} {s.lastName}
                          </p>
                          <p className="text-xs text-slate-500">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{s.department?.name || '—'}</td>
                    <td className="px-5 py-3 text-slate-600">{s.position}</td>
                    <td className="px-5 py-3">
                      {s.lastObservedDate ? (
                        <span className="text-slate-600">{relativeTime(s.lastObservedDate)}</span>
                      ) : (
                        <span className="text-danger font-medium">Never</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-slate-600">{s.activeGoals}</td>
                    <td className="px-5 py-3">
                      {s.latestReviewStatus ? (
                        <Badge status={s.latestReviewStatus} />
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
