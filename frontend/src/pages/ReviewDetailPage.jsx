import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import * as reviewApi from '../api/reviews.js';
import { useAuth } from '../hooks/useAuth.js';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';
import Avatar from '../components/common/Avatar.jsx';
import ScoreRing from '../components/common/ScoreRing.jsx';
import StatusStepper from '../components/common/StatusStepper.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ErrorBanner from '../components/common/ErrorBanner.jsx';
import CriteriaBarChart from '../components/reviews/CriteriaBarChart.jsx';
import AIRecommendationsPanel from '../components/reviews/AIRecommendationsPanel.jsx';
import { REVIEW_STATUSES } from '../utils/constants.js';
import { formatDate, formatDateTime, humanize } from '../utils/formatters.js';

const NEXT = {
  DRAFT: 'UNDER_REVIEW',
  SELF_ASSESSMENT_PENDING: 'UNDER_REVIEW',
  UNDER_REVIEW: 'FEEDBACK_SHARED',
  FEEDBACK_SHARED: 'COMPLETED',
  MEETING_SCHEDULED: 'COMPLETED',
};

export default function ReviewDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [advancing, setAdvancing] = useState(false);
  const [selfText, setSelfText] = useState('');
  const [submittingSelf, setSubmittingSelf] = useState(false);

  const load = useCallback(() => reviewApi.getReview(id).then(setReview), [id]);

  useEffect(() => {
    setLoading(true);
    load()
      .catch((err) => setError(err.response?.data?.error || 'Failed to load review'))
      .finally(() => setLoading(false));
  }, [load]);

  const advance = async () => {
    const next = NEXT[review.status];
    if (!next) return;
    setAdvancing(true);
    setError('');
    try {
      await reviewApi.setReviewStatus(id, next);
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to advance status');
    } finally {
      setAdvancing(false);
    }
  };

  const submitSelfAssessment = async () => {
    if (!selfText.trim()) return;
    setSubmittingSelf(true);
    setError('');
    try {
      await reviewApi.selfAssess(id, selfText.trim());
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit self-assessment');
    } finally {
      setSubmittingSelf(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading review..." />;
  if (error && !review) return <ErrorBanner message={error} />;
  if (!review) return null;

  const hasScores = (review.criteriaScores || []).length > 0;
  const isReviewee = user?.staff?.id === review.revieweeId;
  const canSubmitSelf =
    isReviewee && review.status === 'SELF_ASSESSMENT_PENDING' && !review.selfAssessmentText;
  const canAdvance = NEXT[review.status] && !canSubmitSelf;

  return (
    <div>
      <button
        onClick={() => navigate('/reviews')}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4"
      >
        <ArrowLeftIcon className="h-4 w-4" /> Back to Reviews
      </button>

      {error && (
        <div className="mb-4">
          <ErrorBanner message={error} onDismiss={() => setError('')} />
        </div>
      )}

      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar firstName={review.reviewee.firstName} lastName={review.reviewee.lastName} size={56} />
            <div>
              <Link to={`/staff/${review.reviewee.id}`} className="text-xl font-bold text-slate-900 hover:text-primary">
                {review.reviewee.firstName} {review.reviewee.lastName}
              </Link>
              <p className="text-sm text-slate-500">
                {review.reviewPeriod} · {humanize(review.reviewType)}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Reviewer: {review.reviewer.firstName} {review.reviewer.lastName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <ScoreRing score={review.overallRating} max={5} size={56} />
              <p className="text-[10px] text-slate-400 mt-1">Overall / 5</p>
            </div>
            <Badge status={review.status} />
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-100">
          <StatusStepper steps={REVIEW_STATUSES} current={review.status} />
          {canAdvance && (
            <div className="flex justify-end mt-2">
              <Button onClick={advance} loading={advancing}>
                Advance to {humanize(NEXT[review.status])} <ArrowRightIcon className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </Card>

      <Card title="Criteria Scores" subtitle="6 performance criteria (5-point scale)" className="mb-6">
        {hasScores ? (
          <CriteriaBarChart scores={review.criteriaScores} />
        ) : (
          <p className="text-sm text-slate-500 text-center py-12">No criteria scores recorded yet.</p>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <NarrativeCard title="Summary Comments" content={review.summaryComments} />
        {canSubmitSelf ? (
          <Card title="Self-Assessment">
            <p className="text-sm text-slate-500 mb-3">
              Share your reflection on your performance this review period. This will be visible to your reviewer.
            </p>
            <textarea
              className="input"
              rows={5}
              placeholder="Describe your strengths, growth areas, and goals for the coming period..."
              value={selfText}
              onChange={(e) => setSelfText(e.target.value)}
            />
            <div className="flex justify-end mt-3">
              <Button onClick={submitSelfAssessment} loading={submittingSelf} disabled={!selfText.trim()}>
                Submit Self-Assessment
              </Button>
            </div>
          </Card>
        ) : (
          <NarrativeCard
            title="Self-Assessment"
            content={review.selfAssessmentText}
            fallback={
              review.status === 'SELF_ASSESSMENT_PENDING'
                ? 'Pending — waiting for the teacher to submit their self-assessment.'
                : 'Pending — teacher has not submitted a self-assessment.'
            }
          />
        )}
        <NarrativeCard title="Strengths" content={review.strengthsNarrative} />
        <NarrativeCard title="Growth Areas" content={review.growthNarrative} />
      </div>

      {review.adminPrivateNotes && (
        <Card title="Private Admin Notes" subtitle="Not shared with the teacher" className="mb-6">
          <p className="text-sm text-slate-600 whitespace-pre-line">{review.adminPrivateNotes}</p>
        </Card>
      )}

      <div className="mb-6">
        <AIRecommendationsPanel review={review} onUpdated={load} />
      </div>

      <Card title="Activity Log">
        <ul className="space-y-2 text-sm text-slate-600">
          <li>Created on {formatDateTime(review.createdAt)}</li>
          {review.selfSubmittedAt && <li>Self-assessment submitted {formatDate(review.selfSubmittedAt)}</li>}
          {review.meetingDate && <li>Meeting scheduled for {formatDate(review.meetingDate)}</li>}
          {review.completedAt && <li>Completed on {formatDate(review.completedAt)}</li>}
          <li>Current status: <span className="font-medium">{humanize(review.status)}</span></li>
        </ul>
      </Card>
    </div>
  );
}

function NarrativeCard({ title, content, fallback }) {
  return (
    <Card title={title}>
      <p className="text-sm text-slate-600 whitespace-pre-line leading-relaxed">
        {content || <span className="text-slate-400">{fallback || 'No notes recorded.'}</span>}
      </p>
    </Card>
  );
}
