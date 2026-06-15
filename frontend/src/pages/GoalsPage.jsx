import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/24/outline';
import * as goalApi from '../api/goals.js';
import * as staffApi from '../api/staff.js';
import PageHeader from '../components/common/PageHeader.jsx';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';
import Modal from '../components/common/Modal.jsx';
import ProgressBar from '../components/common/ProgressBar.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ErrorBanner from '../components/common/ErrorBanner.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import { GOAL_STATUSES, GOAL_CATEGORIES } from '../utils/constants.js';
import { formatDate, humanize, daysRemaining, getCategoryColor } from '../utils/formatters.js';

export default function GoalsPage() {
  const [params] = useSearchParams();
  const [goals, setGoals] = useState([]);
  const [staff, setStaff] = useState([]);
  const [status, setStatus] = useState(params.get('status') || '');
  const [category, setCategory] = useState('');
  const [staffId, setStaffId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const load = () => {
    setLoading(true);
    const q = {};
    if (status) q.status = status;
    if (category) q.category = category;
    if (staffId) q.staffId = staffId;
    goalApi
      .listGoals(q)
      .then(setGoals)
      .catch((err) => setError(err.response?.data?.error || 'Failed to load goals'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [status, category, staffId]);
  useEffect(() => {
    staffApi.listStaff({ isActive: 'true' }).then(setStaff).catch(() => {});
  }, []);

  return (
    <div>
      <PageHeader
        title="Goals"
        subtitle="SMART goals with milestones and progress tracking."
        action={
          <Button onClick={() => setModalOpen(true)}>
            <PlusIcon className="h-4 w-4" /> New Goal
          </Button>
        }
      />

      <Card className="mb-4" bodyClassName="flex flex-col sm:flex-row gap-3">
        <select className="input sm:max-w-[180px]" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {GOAL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {humanize(s)}
            </option>
          ))}
        </select>
        <select className="input sm:max-w-[220px]" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          {GOAL_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {humanize(c)}
            </option>
          ))}
        </select>
        <select className="input sm:max-w-[200px]" value={staffId} onChange={(e) => setStaffId(e.target.value)}>
          <option value="">All Staff</option>
          {staff.map((s) => (
            <option key={s.id} value={s.id}>
              {s.firstName} {s.lastName}
            </option>
          ))}
        </select>
      </Card>

      {error && <ErrorBanner message={error} />}

      {loading ? (
        <LoadingSpinner label="Loading goals..." />
      ) : goals.length === 0 ? (
        <Card>
          <EmptyState
            title="No goals"
            message="Create your first goal to start tracking progress."
            action={
              <Button onClick={() => setModalOpen(true)}>
                <PlusIcon className="h-4 w-4" /> New Goal
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((g) => {
            const days = daysRemaining(g.targetDate);
            const owner = g.staff?.[0];
            return (
              <Link key={g.id} to={`/goals/${g.id}`} className="card p-5 hover:shadow-md transition">
                <div className="flex items-start justify-between gap-2">
                  <Badge label={humanize(g.category)} color={getCategoryColor(g.category)} />
                  <Badge status={g.status} />
                </div>
                <h3 className="font-semibold text-slate-900 mt-3">{g.title}</h3>
                {owner && (
                  <p className="text-sm text-slate-500 mt-0.5">
                    {owner.firstName} {owner.lastName}
                  </p>
                )}
                <div className="flex items-center justify-between text-xs mt-3">
                  <span className="text-slate-400">Target {formatDate(g.targetDate)}</span>
                  {g.status !== 'COMPLETED' && g.status !== 'ARCHIVED' && days !== null && (
                    <span className={days < 7 ? 'text-danger font-medium' : 'text-slate-400'}>
                      {days < 0 ? `${Math.abs(days)} days overdue` : `${days} days left`}
                    </span>
                  )}
                </div>
                <div className="mt-3">
                  <ProgressBar value={g.progress} />
                  <p className="text-xs text-slate-400 mt-1">
                    {g.milestonesCompleted} of {g.milestonesTotal} milestones · {g.progress}%
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <NewGoalModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        staff={staff}
        onCreated={() => {
          setModalOpen(false);
          load();
        }}
      />
    </div>
  );
}

function NewGoalModal({ open, onClose, staff, onCreated }) {
  const [form, setForm] = useState({
    staffId: '',
    title: '',
    description: '',
    category: 'INSTRUCTIONAL_PRACTICE',
    targetDate: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    setSaving(true);
    setError('');
    try {
      await goalApi.createGoal(form);
      setForm({ staffId: '', title: '', description: '', category: 'INSTRUCTIONAL_PRACTICE', targetDate: '' });
      onCreated();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create goal');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New Goal"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} loading={saving} disabled={!form.staffId || !form.title || !form.targetDate}>
            Create Goal
          </Button>
        </>
      }
    >
      {error && (
        <div className="mb-4">
          <ErrorBanner message={error} />
        </div>
      )}
      <div className="space-y-4">
        <div>
          <label className="label">Staff Member *</label>
          <select className="input" value={form.staffId} onChange={(e) => set('staffId', e.target.value)}>
            <option value="">Select...</option>
            {staff.map((s) => (
              <option key={s.id} value={s.id}>
                {s.firstName} {s.lastName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Title *</label>
          <input className="input" value={form.title} onChange={(e) => set('title', e.target.value)} />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea className="input" rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Category</label>
            <select className="input" value={form.category} onChange={(e) => set('category', e.target.value)}>
              {GOAL_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {humanize(c)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Target Date *</label>
            <input type="date" className="input" value={form.targetDate} onChange={(e) => set('targetDate', e.target.value)} />
          </div>
        </div>
      </div>
    </Modal>
  );
}
