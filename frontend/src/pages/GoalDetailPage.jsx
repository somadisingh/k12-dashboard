import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, PlusIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import * as goalApi from '../api/goals.js';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';
import Avatar from '../components/common/Avatar.jsx';
import ProgressBar from '../components/common/ProgressBar.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ErrorBanner from '../components/common/ErrorBanner.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import { GOAL_STATUSES } from '../utils/constants.js';
import { formatDate, formatDateTime, humanize, getCategoryColor } from '../utils/formatters.js';

export default function GoalDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [mForm, setMForm] = useState({ title: '', dueDate: '' });
  const [update, setUpdate] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => goalApi.getGoal(id).then(setGoal), [id]);

  useEffect(() => {
    setLoading(true);
    load()
      .catch((err) => setError(err.response?.data?.error || 'Failed to load goal'))
      .finally(() => setLoading(false));
  }, [load]);

  const toggleMilestone = async (m) => {
    const next = m.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    await goalApi.setMilestoneStatus(id, m.id, next);
    await load();
  };

  const addMilestone = async () => {
    if (!mForm.title || !mForm.dueDate) return;
    setBusy(true);
    try {
      await goalApi.addMilestone(id, mForm);
      setMForm({ title: '', dueDate: '' });
      setShowMilestoneForm(false);
      await load();
    } finally {
      setBusy(false);
    }
  };

  const addUpdate = async () => {
    if (!update.trim()) return;
    setBusy(true);
    try {
      await goalApi.addGoalUpdate(id, update.trim());
      setUpdate('');
      await load();
    } finally {
      setBusy(false);
    }
  };

  const changeStatus = async (status) => {
    await goalApi.setGoalStatus(id, status);
    await load();
  };

  if (loading) return <LoadingSpinner label="Loading goal..." />;
  if (error && !goal) return <ErrorBanner message={error} />;
  if (!goal) return null;

  const owner = goal.staff?.[0];

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/goals')}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4"
      >
        <ArrowLeftIcon className="h-4 w-4" /> Back to Goals
      </button>

      <Card className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Badge label={humanize(goal.category)} color={getCategoryColor(goal.category)} />
            <h1 className="text-2xl font-bold text-slate-900 mt-2">{goal.title}</h1>
            {goal.description && <p className="text-slate-600 mt-1">{goal.description}</p>}
            <div className="flex items-center gap-3 mt-3 text-sm text-slate-500">
              {owner && (
                <span className="flex items-center gap-1.5">
                  <Avatar firstName={owner.firstName} lastName={owner.lastName} size={24} />
                  {owner.firstName} {owner.lastName}
                </span>
              )}
              <span>Target {formatDate(goal.targetDate)}</span>
            </div>
          </div>
          <select
            className="input max-w-[160px]"
            value={goal.status}
            onChange={(e) => changeStatus(e.target.value)}
          >
            {GOAL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {humanize(s)}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-5">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-600">Progress</span>
            <span className="font-medium">
              {goal.milestonesCompleted} of {goal.milestonesTotal} milestones ({goal.progress}%)
            </span>
          </div>
          <ProgressBar value={goal.progress} />
        </div>
      </Card>

      {error && (
        <div className="mb-4">
          <ErrorBanner message={error} onDismiss={() => setError('')} />
        </div>
      )}

      <Card
        title="Milestones"
        className="mb-6"
        action={
          <Button size="sm" variant="secondary" onClick={() => setShowMilestoneForm((s) => !s)}>
            <PlusIcon className="h-4 w-4" /> Add Milestone
          </Button>
        }
      >
        {showMilestoneForm && (
          <div className="flex flex-col sm:flex-row gap-2 mb-4 pb-4 border-b border-slate-100">
            <input
              className="input flex-1"
              placeholder="Milestone title"
              value={mForm.title}
              onChange={(e) => setMForm((f) => ({ ...f, title: e.target.value }))}
            />
            <input
              type="date"
              className="input sm:max-w-[170px]"
              value={mForm.dueDate}
              onChange={(e) => setMForm((f) => ({ ...f, dueDate: e.target.value }))}
            />
            <Button onClick={addMilestone} loading={busy}>
              Add
            </Button>
          </div>
        )}
        {goal.milestones.length === 0 ? (
          <EmptyState title="No milestones" message="Break this goal into milestones to track progress." />
        ) : (
          <ul className="space-y-2">
            {goal.milestones.map((m) => (
              <li key={m.id} className="flex items-center gap-3 py-2">
                <button onClick={() => toggleMilestone(m)} className="flex-shrink-0">
                  {m.status === 'COMPLETED' ? (
                    <CheckCircleSolid className="h-6 w-6 text-success" />
                  ) : (
                    <CheckCircleIcon className="h-6 w-6 text-slate-300 hover:text-slate-400" />
                  )}
                </button>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${m.status === 'COMPLETED' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                    {m.title}
                  </p>
                  <p className="text-xs text-slate-400">Due {formatDate(m.dueDate)}</p>
                </div>
                <Badge status={m.status} />
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Progress Updates">
        <div className="flex gap-2 mb-5">
          <textarea
            className="input flex-1"
            rows={2}
            placeholder="Add a progress update..."
            value={update}
            onChange={(e) => setUpdate(e.target.value)}
          />
          <Button onClick={addUpdate} loading={busy} disabled={!update.trim()}>
            Post
          </Button>
        </div>
        {goal.updates.length === 0 ? (
          <EmptyState title="No updates yet" message="Post the first progress update." />
        ) : (
          <ul className="space-y-4">
            {goal.updates.map((u) => (
              <li key={u.id} className="flex gap-3">
                <Avatar firstName={u.author?.firstName || '?'} lastName={u.author?.lastName || ''} size={36} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-800">
                      {u.author ? `${u.author.firstName} ${u.author.lastName}` : 'Unknown'}
                    </p>
                    <span className="text-xs text-slate-400">{formatDateTime(u.createdAt)}</span>
                  </div>
                  <p className="text-sm text-slate-600 mt-0.5">{u.content}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
