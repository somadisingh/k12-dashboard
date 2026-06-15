import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeftIcon, PhoneIcon, EnvelopeIcon, CalendarIcon } from '@heroicons/react/24/outline';
import * as staffApi from '../api/staff.js';
import * as notesApi from '../api/notes.js';
import Card from '../components/common/Card.jsx';
import Avatar from '../components/common/Avatar.jsx';
import Badge from '../components/common/Badge.jsx';
import ScoreRing from '../components/common/ScoreRing.jsx';
import ProgressBar from '../components/common/ProgressBar.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ErrorBanner from '../components/common/ErrorBanner.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import RubricRadarChart from '../components/observations/RubricRadarChart.jsx';
import { formatDate, formatScore, humanize } from '../utils/formatters.js';

const TABS = ['Overview', 'Observations', 'Reviews', 'Goals', 'Notes'];

function avgScores(observations) {
  const all = [];
  for (const o of observations) for (const s of o.rubricScores || []) all.push(s);
  return all;
}

export default function StaffDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [staff, setStaff] = useState(null);
  const [summary, setSummary] = useState(null);
  const [notes, setNotes] = useState([]);
  const [tab, setTab] = useState('Overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      staffApi.getStaff(id),
      staffApi.getStaffSummary(id),
      notesApi.listNotes({ subjectType: 'STAFF', subjectId: id }),
    ])
      .then(([s, sum, n]) => {
        setStaff(s);
        setSummary(sum);
        setNotes(n);
      })
      .catch((err) => setError(err.response?.data?.error || 'Failed to load staff profile'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner label="Loading profile..." />;
  if (error) return <ErrorBanner message={error} />;
  if (!staff) return null;

  const observations = staff.observationsAsTeacher || [];
  const reviews = staff.reviewsAsReviewee || [];
  const goals = staff.goals || [];

  return (
    <div>
      <button
        onClick={() => navigate('/staff')}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4"
      >
        <ArrowLeftIcon className="h-4 w-4" /> Back to Staff
      </button>

      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row gap-5">
          <Avatar firstName={staff.firstName} lastName={staff.lastName} size={88} url={staff.avatarUrl} />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900">
              {staff.firstName} {staff.lastName}
            </h1>
            <p className="text-slate-600">{staff.position}</p>
            <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3 text-sm text-slate-500">
              {staff.department && <span>{staff.department.name}</span>}
              {staff.user?.email && (
                <span className="flex items-center gap-1">
                  <EnvelopeIcon className="h-4 w-4" /> {staff.user.email}
                </span>
              )}
              {staff.phone && (
                <span className="flex items-center gap-1">
                  <PhoneIcon className="h-4 w-4" /> {staff.phone}
                </span>
              )}
              {staff.hireDate && (
                <span className="flex items-center gap-1">
                  <CalendarIcon className="h-4 w-4" /> Hired {formatDate(staff.hireDate)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
          <Stat label="Observations" value={summary.observationCount} />
          <Stat label="Avg Obs Score" value={`${formatScore(summary.avgObservationScore)} / 4`} />
          <Stat label="Goals Completed" value={`${summary.goalsCompleted} / ${summary.goalsTotal}`} />
          <Stat
            label="Latest Review"
            value={summary.latestReviewStatus ? humanize(summary.latestReviewStatus) : '—'}
          />
        </div>
      </Card>

      <div className="flex gap-1 border-b border-slate-200 mb-5">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition ${
              tab === t
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Rubric Performance" subtitle="Average across all observations">
            {avgScores(observations).length ? (
              <RubricRadarChart scores={aggregateRadar(observations)} />
            ) : (
              <EmptyState title="No observation scores yet" />
            )}
          </Card>
          <Card title="Bio">
            <p className="text-sm text-slate-600 leading-relaxed">
              {staff.bio || 'No bio provided.'}
            </p>
            {staff.subjects?.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-medium text-slate-500 uppercase mb-2">Subjects</p>
                <div className="flex flex-wrap gap-2">
                  {staff.subjects.map((s) => (
                    <Badge key={s} label={s} color="bg-slate-100 text-slate-700" />
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {tab === 'Observations' && (
        <Card bodyClassName="p-0">
          {observations.length ? (
            <div className="divide-y divide-slate-50">
              {observations.map((o) => (
                <Link
                  key={o.id}
                  to={`/observations/${o.id}`}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition"
                >
                  <ScoreRing score={obsAvg(o)} />
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">
                      {o.subject} · {o.gradeLevel}
                    </p>
                    <p className="text-sm text-slate-500">{formatDate(o.observedDate || o.scheduledDate)}</p>
                  </div>
                  <Badge status={o.status} />
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState title="No observations" message="This teacher has no observations yet." />
          )}
        </Card>
      )}

      {tab === 'Reviews' && (
        <Card bodyClassName="p-0">
          {reviews.length ? (
            <div className="divide-y divide-slate-50">
              {reviews.map((r) => (
                <Link
                  key={r.id}
                  to={`/reviews/${r.id}`}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition"
                >
                  <ScoreRing score={r.overallRating} max={5} />
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{r.reviewPeriod}</p>
                    <p className="text-sm text-slate-500">{humanize(r.reviewType)}</p>
                  </div>
                  <Badge status={r.status} />
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState title="No reviews" message="This teacher has no performance reviews yet." />
          )}
        </Card>
      )}

      {tab === 'Goals' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.length ? (
            goals.map((g) => {
              const total = g.milestones?.length || 0;
              const done = g.milestones?.filter((m) => m.status === 'COMPLETED').length || 0;
              const pct = total ? Math.round((done / total) * 100) : 0;
              return (
                <Link key={g.id} to={`/goals/${g.id}`} className="card p-5 hover:shadow-md transition">
                  <div className="flex justify-between items-start gap-2">
                    <p className="font-medium text-slate-900">{g.title}</p>
                    <Badge status={g.status} />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Target {formatDate(g.targetDate)}</p>
                  <div className="mt-3">
                    <ProgressBar value={pct} />
                    <p className="text-xs text-slate-400 mt-1">
                      {done} of {total} milestones
                    </p>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="md:col-span-2">
              <Card>
                <EmptyState title="No goals" message="This teacher has no goals yet." />
              </Card>
            </div>
          )}
        </div>
      )}

      {tab === 'Notes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notes.length ? (
            notes.map((n) => (
              <Card key={n.id}>
                <p className="font-medium text-slate-900">{n.title}</p>
                <p className="text-sm text-slate-600 mt-1 line-clamp-3">{n.content}</p>
                <p className="text-xs text-slate-400 mt-3">{formatDate(n.createdAt)}</p>
              </Card>
            ))
          ) : (
            <div className="md:col-span-2">
              <Card>
                <EmptyState title="No notes" message="No notes tagged to this staff member." />
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-lg font-bold text-slate-900 mt-0.5">{value}</p>
    </div>
  );
}

function obsAvg(o) {
  const s = o.rubricScores || [];
  if (!s.length) return null;
  return s.reduce((a, b) => a + b.score, 0) / s.length;
}

// Aggregate average score per category across observations for the radar
function aggregateRadar(observations) {
  const byCat = {};
  for (const o of observations) {
    for (const s of o.rubricScores || []) {
      byCat[s.category] = byCat[s.category] || { total: 0, count: 0 };
      byCat[s.category].total += s.score;
      byCat[s.category].count += 1;
    }
  }
  return Object.entries(byCat).map(([category, v]) => ({
    category,
    score: Math.round((v.total / v.count) * 10) / 10,
  }));
}
