import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import * as reviewApi from '../api/reviews.js';
import * as staffApi from '../api/staff.js';
import PageHeader from '../components/common/PageHeader.jsx';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import ErrorBanner from '../components/common/ErrorBanner.jsx';
import StepIndicator from '../components/common/StepIndicator.jsx';
import CriteriaScorer from '../components/reviews/CriteriaScorer.jsx';
import { REVIEW_TYPES, REVIEW_CRITERIA, REVIEW_SCORE_LABELS } from '../utils/constants.js';
import { humanize } from '../utils/formatters.js';

const STEPS = ['Setup', 'Criteria', 'Narrative', 'Review'];

export default function NewReviewPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [staff, setStaff] = useState([]);
  const [scores, setScores] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    revieweeId: '',
    reviewPeriod: '2024-2025 Annual',
    reviewType: 'ANNUAL',
    summaryComments: '',
    strengthsNarrative: '',
    growthNarrative: '',
    adminPrivateNotes: '',
  });

  useEffect(() => {
    staffApi.listStaff({ isActive: 'true' }).then(setStaff).catch(() => {});
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const reviewee = staff.find((s) => s.id === form.revieweeId);
  const canNext = () => (step === 0 ? form.revieweeId && form.reviewPeriod : true);

  const submit = async () => {
    setSaving(true);
    setError('');
    try {
      const created = await reviewApi.createReview({
        revieweeId: form.revieweeId,
        reviewPeriod: form.reviewPeriod,
        reviewType: form.reviewType,
      });
      const scoreArr = Object.entries(scores)
        .filter(([, v]) => v.score)
        .map(([criterion, v]) => ({ criterion, score: v.score, comments: v.comments }));
      if (scoreArr.length) await reviewApi.setReviewCriteria(created.id, scoreArr);
      await reviewApi.updateReview(created.id, {
        summaryComments: form.summaryComments,
        strengthsNarrative: form.strengthsNarrative,
        growthNarrative: form.growthNarrative,
        adminPrivateNotes: form.adminPrivateNotes,
      });
      navigate(`/reviews/${created.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create review');
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => navigate('/reviews')}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4"
      >
        <ArrowLeftIcon className="h-4 w-4" /> Back to Reviews
      </button>
      <PageHeader title="New Performance Review" subtitle="Conduct a formal staff evaluation." />

      <Card>
        <StepIndicator steps={STEPS} current={step} />
        {error && (
          <div className="mb-4">
            <ErrorBanner message={error} />
          </div>
        )}

        {step === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Staff Member *</label>
              <select className="input" value={form.revieweeId} onChange={(e) => set('revieweeId', e.target.value)}>
                <option value="">Select a staff member...</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.firstName} {s.lastName} — {s.position}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Review Period *</label>
              <input className="input" value={form.reviewPeriod} onChange={(e) => set('reviewPeriod', e.target.value)} placeholder="e.g. 2024-2025 Annual" />
            </div>
            <div>
              <label className="label">Review Type</label>
              <select className="input" value={form.reviewType} onChange={(e) => set('reviewType', e.target.value)}>
                {REVIEW_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {humanize(t)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {step === 1 && <CriteriaScorer scores={scores} onChange={setScores} />}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="label">Summary Comments</label>
              <textarea className="input" rows={3} value={form.summaryComments} onChange={(e) => set('summaryComments', e.target.value)} />
            </div>
            <div>
              <label className="label">Strengths Narrative</label>
              <textarea className="input" rows={3} value={form.strengthsNarrative} onChange={(e) => set('strengthsNarrative', e.target.value)} />
            </div>
            <div>
              <label className="label">Growth Areas Narrative</label>
              <textarea className="input" rows={3} value={form.growthNarrative} onChange={(e) => set('growthNarrative', e.target.value)} />
            </div>
            <div>
              <label className="label flex items-center gap-2">
                Private Admin Notes
                <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
                  Private — not shared with teacher
                </span>
              </label>
              <textarea className="input" rows={3} value={form.adminPrivateNotes} onChange={(e) => set('adminPrivateNotes', e.target.value)} />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 text-sm">
            <Section title="Setup">
              <Row label="Staff" value={reviewee ? `${reviewee.firstName} ${reviewee.lastName}` : '—'} />
              <Row label="Period" value={form.reviewPeriod} />
              <Row label="Type" value={humanize(form.reviewType)} />
            </Section>
            <Section title="Criteria Scores">
              {REVIEW_CRITERIA.map((c) => (
                <Row
                  key={c.key}
                  label={c.label}
                  value={scores[c.key]?.score ? `${scores[c.key].score} — ${REVIEW_SCORE_LABELS[scores[c.key].score]}` : 'Not scored'}
                />
              ))}
            </Section>
            <Section title="Narrative">
              <Row label="Summary" value={form.summaryComments || '—'} />
              <Row label="Strengths" value={form.strengthsNarrative || '—'} />
              <Row label="Growth" value={form.growthNarrative || '—'} />
            </Section>
          </div>
        )}

        <div className="flex justify-between mt-8 pt-5 border-t border-slate-100">
          <Button variant="secondary" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
            Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext()}>
              Next
            </Button>
          ) : (
            <Button onClick={submit} loading={saving}>
              Submit Review
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="border border-slate-200 rounded-lg p-4">
      <h4 className="font-semibold text-slate-900 mb-2">{title}</h4>
      <div className="space-y-1">{children}</div>
    </div>
  );
}
function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-800 text-right">{value}</span>
    </div>
  );
}
