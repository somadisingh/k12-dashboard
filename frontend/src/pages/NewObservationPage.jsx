import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import * as obsApi from '../api/observations.js';
import * as staffApi from '../api/staff.js';
import PageHeader from '../components/common/PageHeader.jsx';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import ErrorBanner from '../components/common/ErrorBanner.jsx';
import StepIndicator from '../components/common/StepIndicator.jsx';
import RubricScorer from '../components/observations/RubricScorer.jsx';
import { GRADE_LEVELS, RUBRIC_CATEGORIES, SCORE_LABELS } from '../utils/constants.js';

const STEPS = ['Basic Info', 'Rubric Scoring', 'Narrative', 'Review'];

export default function NewObservationPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [teachers, setTeachers] = useState([]);
  const [scores, setScores] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    teacherId: '',
    scheduledDate: new Date().toISOString().slice(0, 10),
    subject: '',
    gradeLevel: '',
    classPeriod: '',
    studentCount: '',
    duration: '',
    unit: '',
    preObsNotes: '',
    strengths: '',
    areasForGrowth: '',
    actionItems: '',
    narrativeNotes: '',
  });

  useEffect(() => {
    staffApi.listStaff({ isActive: 'true' }).then(setTeachers).catch(() => {});
  }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const teacher = teachers.find((t) => t.id === form.teacherId);

  const canNext = () => {
    if (step === 0) return form.teacherId && form.scheduledDate && form.subject && form.gradeLevel;
    return true;
  };

  const submit = async () => {
    setSaving(true);
    setError('');
    try {
      const created = await obsApi.createObservation({
        ...form,
        studentCount: form.studentCount ? Number(form.studentCount) : null,
        duration: form.duration ? Number(form.duration) : null,
        status: 'DRAFT',
      });
      const scoreArr = Object.entries(scores)
        .filter(([, v]) => v.score)
        .map(([category, v]) => ({ category, score: v.score, notes: v.notes }));
      if (scoreArr.length) {
        await obsApi.setObservationScores(created.id, scoreArr);
      }
      navigate(`/observations/${created.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create observation');
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => navigate('/observations')}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4"
      >
        <ArrowLeftIcon className="h-4 w-4" /> Back to Observations
      </button>
      <PageHeader title="New Observation" subtitle="Record a Danielson Framework classroom observation." />

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
              <label className="label">Teacher *</label>
              <select className="input" value={form.teacherId} onChange={(e) => set('teacherId', e.target.value)}>
                <option value="">Select a teacher...</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.firstName} {t.lastName} — {t.position}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Scheduled Date *</label>
              <input type="date" className="input" value={form.scheduledDate} onChange={(e) => set('scheduledDate', e.target.value)} />
            </div>
            <div>
              <label className="label">Subject *</label>
              <input className="input" value={form.subject} onChange={(e) => set('subject', e.target.value)} placeholder="e.g. Mathematics" />
            </div>
            <div>
              <label className="label">Grade Level *</label>
              <select className="input" value={form.gradeLevel} onChange={(e) => set('gradeLevel', e.target.value)}>
                <option value="">Select...</option>
                {GRADE_LEVELS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Class Period</label>
              <input className="input" value={form.classPeriod} onChange={(e) => set('classPeriod', e.target.value)} placeholder="e.g. Period 2" />
            </div>
            <div>
              <label className="label">Student Count</label>
              <input type="number" className="input" value={form.studentCount} onChange={(e) => set('studentCount', e.target.value)} />
            </div>
            <div>
              <label className="label">Duration (minutes)</label>
              <input type="number" className="input" value={form.duration} onChange={(e) => set('duration', e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Unit / Chapter</label>
              <input className="input" value={form.unit} onChange={(e) => set('unit', e.target.value)} placeholder="e.g. Fraction Operations" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Pre-Observation Notes</label>
              <textarea className="input" rows={3} value={form.preObsNotes} onChange={(e) => set('preObsNotes', e.target.value)} />
            </div>
          </div>
        )}

        {step === 1 && <RubricScorer scores={scores} onChange={setScores} />}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="label">Strengths Observed</label>
              <textarea className="input" rows={3} value={form.strengths} onChange={(e) => set('strengths', e.target.value)} />
            </div>
            <div>
              <label className="label">Areas for Growth</label>
              <textarea className="input" rows={3} value={form.areasForGrowth} onChange={(e) => set('areasForGrowth', e.target.value)} />
            </div>
            <div>
              <label className="label">Action Items</label>
              <textarea className="input" rows={3} value={form.actionItems} onChange={(e) => set('actionItems', e.target.value)} />
            </div>
            <div>
              <label className="label">General Narrative Notes</label>
              <textarea className="input" rows={5} value={form.narrativeNotes} onChange={(e) => set('narrativeNotes', e.target.value)} />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 text-sm">
            <Section title="Basic Info">
              <Row label="Teacher" value={teacher ? `${teacher.firstName} ${teacher.lastName}` : '—'} />
              <Row label="Subject" value={`${form.subject} · ${form.gradeLevel}`} />
              <Row label="Date" value={form.scheduledDate} />
              {form.unit && <Row label="Unit" value={form.unit} />}
            </Section>
            <Section title="Rubric Scores">
              {RUBRIC_CATEGORIES.map((c) => (
                <Row
                  key={c.key}
                  label={c.label}
                  value={scores[c.key]?.score ? `${scores[c.key].score} — ${SCORE_LABELS[scores[c.key].score]}` : 'Not scored'}
                />
              ))}
            </Section>
            <Section title="Narrative">
              <Row label="Strengths" value={form.strengths || '—'} />
              <Row label="Areas for Growth" value={form.areasForGrowth || '—'} />
              <Row label="Action Items" value={form.actionItems || '—'} />
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
              Submit Observation
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
