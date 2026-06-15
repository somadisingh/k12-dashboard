import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/24/outline';
import * as obsApi from '../api/observations.js';
import * as staffApi from '../api/staff.js';
import PageHeader from '../components/common/PageHeader.jsx';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';
import Avatar from '../components/common/Avatar.jsx';
import ScoreRing from '../components/common/ScoreRing.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ErrorBanner from '../components/common/ErrorBanner.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import { OBSERVATION_STATUSES } from '../utils/constants.js';
import { formatDate, humanize } from '../utils/formatters.js';

function avg(o) {
  const s = o.rubricScores || [];
  if (!s.length) return null;
  return s.reduce((a, b) => a + b.score, 0) / s.length;
}

export default function ObservationsPage() {
  const navigate = useNavigate();
  const [observations, setObservations] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [status, setStatus] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    const query = {};
    if (status) query.status = status;
    if (teacherId) query.teacherId = teacherId;
    obsApi
      .listObservations(query)
      .then(setObservations)
      .catch((err) => setError(err.response?.data?.error || 'Failed to load observations'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [status, teacherId]);
  useEffect(() => {
    staffApi.listStaff({ isActive: 'true' }).then(setTeachers).catch(() => {});
  }, []);

  // Pipeline counts (unfiltered by status — load all for counts)
  const [allObs, setAllObs] = useState([]);
  useEffect(() => {
    obsApi.listObservations(teacherId ? { teacherId } : {}).then(setAllObs).catch(() => {});
  }, [teacherId]);
  const counts = OBSERVATION_STATUSES.reduce((acc, s) => {
    acc[s] = allObs.filter((o) => o.status === s).length;
    return acc;
  }, {});

  return (
    <div>
      <PageHeader
        title="Classroom Observations"
        subtitle="Danielson Framework observations across all teachers."
        action={
          <Button onClick={() => navigate('/observations/new')}>
            <PlusIcon className="h-4 w-4" /> New Observation
          </Button>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {OBSERVATION_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(status === s ? '' : s)}
            className={`card p-3 text-left transition ${
              status === s ? 'ring-2 ring-primary' : 'hover:shadow-md'
            }`}
          >
            <p className="text-2xl font-bold text-slate-900">{counts[s] || 0}</p>
            <p className="text-[11px] text-slate-500 leading-tight mt-0.5">{humanize(s)}</p>
          </button>
        ))}
      </div>

      <Card className="mb-4" bodyClassName="flex flex-col sm:flex-row gap-3">
        <select className="input sm:max-w-[200px]" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {OBSERVATION_STATUSES.map((s) => (
            <option key={s} value={s}>
              {humanize(s)}
            </option>
          ))}
        </select>
        <select className="input sm:max-w-[220px]" value={teacherId} onChange={(e) => setTeacherId(e.target.value)}>
          <option value="">All Teachers</option>
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.firstName} {t.lastName}
            </option>
          ))}
        </select>
      </Card>

      {error && <ErrorBanner message={error} />}

      {loading ? (
        <LoadingSpinner label="Loading observations..." />
      ) : observations.length === 0 ? (
        <Card>
          <EmptyState
            title="No observations"
            message="Create your first observation to get started."
            action={
              <Button onClick={() => navigate('/observations/new')}>
                <PlusIcon className="h-4 w-4" /> New Observation
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {observations.map((o) => (
            <Link key={o.id} to={`/observations/${o.id}`} className="card p-5 hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar firstName={o.teacher.firstName} lastName={o.teacher.lastName} size={40} />
                  <div>
                    <p className="font-medium text-slate-900">
                      {o.teacher.firstName} {o.teacher.lastName}
                    </p>
                    <p className="text-xs text-slate-500">{o.teacher.position}</p>
                  </div>
                </div>
                <ScoreRing score={avg(o)} size={40} />
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-700">
                    {o.subject} · {o.gradeLevel}
                  </p>
                  <p className="text-xs text-slate-400">{formatDate(o.observedDate || o.scheduledDate)}</p>
                </div>
                <Badge status={o.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
