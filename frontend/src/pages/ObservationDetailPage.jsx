import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import * as obsApi from '../api/observations.js';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';
import Avatar from '../components/common/Avatar.jsx';
import ScoreRing from '../components/common/ScoreRing.jsx';
import StatusStepper from '../components/common/StatusStepper.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ErrorBanner from '../components/common/ErrorBanner.jsx';
import RubricRadarChart from '../components/observations/RubricRadarChart.jsx';
import AISummaryPanel from '../components/observations/AISummaryPanel.jsx';
import { OBSERVATION_STATUSES, RUBRIC_CATEGORIES, SCORE_LABELS } from '../utils/constants.js';
import { formatDate, formatDateTime, humanize } from '../utils/formatters.js';

const NEXT = {
  SCHEDULED: 'IN_PROGRESS',
  IN_PROGRESS: 'DRAFT',
  DRAFT: 'SUBMITTED',
  SUBMITTED: 'TEACHER_ACKNOWLEDGED',
  TEACHER_ACKNOWLEDGED: 'COMPLETED',
};

export default function ObservationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [obs, setObs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [advancing, setAdvancing] = useState(false);

  const load = useCallback(
    () => obsApi.getObservation(id).then(setObs),
    [id]
  );

  useEffect(() => {
    setLoading(true);
    load()
      .catch((err) => setError(err.response?.data?.error || 'Failed to load observation'))
      .finally(() => setLoading(false));
  }, [load]);

  const advance = async () => {
    const next = NEXT[obs.status];
    if (!next) return;
    setAdvancing(true);
    setError('');
    try {
      await obsApi.setObservationStatus(id, next);
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to advance status');
    } finally {
      setAdvancing(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading observation..." />;
  if (error && !obs) return <ErrorBanner message={error} />;
  if (!obs) return null;

  const scoreByCat = {};
  for (const s of obs.rubricScores || []) scoreByCat[s.category] = s;
  const hasScores = (obs.rubricScores || []).length > 0;

  return (
    <div>
      <button
        onClick={() => navigate('/observations')}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4"
      >
        <ArrowLeftIcon className="h-4 w-4" /> Back to Observations
      </button>

      {error && (
        <div className="mb-4">
          <ErrorBanner message={error} onDismiss={() => setError('')} />
        </div>
      )}

      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar firstName={obs.teacher.firstName} lastName={obs.teacher.lastName} size={56} />
            <div>
              <Link to={`/staff/${obs.teacher.id}`} className="text-xl font-bold text-slate-900 hover:text-primary">
                {obs.teacher.firstName} {obs.teacher.lastName}
              </Link>
              <p className="text-sm text-slate-500">
                {obs.subject} · {obs.gradeLevel} · {formatDate(obs.observedDate || obs.scheduledDate)}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Observed by {obs.observer.firstName} {obs.observer.lastName}
              </p>
            </div>
          </div>
          <Badge status={obs.status} />
        </div>

        <div className="mt-6 pt-6 border-t border-slate-100">
          <StatusStepper steps={OBSERVATION_STATUSES} current={obs.status} />
          {NEXT[obs.status] && (
            <div className="flex justify-end mt-2">
              <Button onClick={advance} loading={advancing}>
                Advance to {humanize(NEXT[obs.status])} <ArrowRightIcon className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card title="Rubric Scores" subtitle="Danielson Framework (4-point scale)">
          {hasScores ? (
            <RubricRadarChart scores={obs.rubricScores} />
          ) : (
            <p className="text-sm text-slate-500 text-center py-12">No rubric scores recorded yet.</p>
          )}
        </Card>
        <Card title="Domain Detail">
          <div className="space-y-3">
            {RUBRIC_CATEGORIES.map((c) => {
              const s = scoreByCat[c.key];
              return (
                <div key={c.key} className="flex items-start gap-3">
                  <ScoreRing score={s?.score} size={42} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">{c.label}</p>
                    {s?.score && <p className="text-xs text-slate-400">{SCORE_LABELS[s.score]}</p>}
                    {s?.notes && <p className="text-sm text-slate-600 mt-0.5">{s.notes}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <NarrativeCard title="Strengths" content={obs.strengths} />
        <NarrativeCard title="Areas for Growth" content={obs.areasForGrowth} />
        <NarrativeCard title="Action Items" content={obs.actionItems} />
        <NarrativeCard title="General Notes" content={obs.narrativeNotes} />
      </div>

      <div className="mb-6">
        <AISummaryPanel observation={obs} onUpdated={load} />
      </div>

      <Card title="Activity Log">
        <ul className="space-y-2 text-sm text-slate-600">
          <li>Created on {formatDateTime(obs.createdAt)}</li>
          {obs.observedDate && <li>Observed on {formatDate(obs.observedDate)}</li>}
          <li>Current status: <span className="font-medium">{humanize(obs.status)}</span></li>
          <li>Last updated {formatDateTime(obs.updatedAt)}</li>
          {obs.aiGeneratedAt && <li>AI summary generated {formatDateTime(obs.aiGeneratedAt)}</li>}
        </ul>
      </Card>
    </div>
  );
}

function NarrativeCard({ title, content }) {
  return (
    <Card title={title}>
      <p className="text-sm text-slate-600 whitespace-pre-line leading-relaxed">
        {content || <span className="text-slate-400">No notes recorded.</span>}
      </p>
    </Card>
  );
}
