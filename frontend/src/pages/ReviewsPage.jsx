import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/24/outline';
import * as reviewApi from '../api/reviews.js';
import PageHeader from '../components/common/PageHeader.jsx';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';
import Avatar from '../components/common/Avatar.jsx';
import ScoreRing from '../components/common/ScoreRing.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ErrorBanner from '../components/common/ErrorBanner.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import { REVIEW_STATUSES } from '../utils/constants.js';
import { humanize } from '../utils/formatters.js';

export default function ReviewsPage() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    reviewApi
      .listReviews(status ? { status } : {})
      .then(setReviews)
      .catch((err) => setError(err.response?.data?.error || 'Failed to load reviews'))
      .finally(() => setLoading(false));
  }, [status]);

  const [all, setAll] = useState([]);
  useEffect(() => {
    reviewApi.listReviews().then(setAll).catch(() => {});
  }, []);
  const counts = REVIEW_STATUSES.reduce((acc, s) => {
    acc[s] = all.filter((r) => r.status === s).length;
    return acc;
  }, {});

  return (
    <div>
      <PageHeader
        title="Performance Reviews"
        subtitle="Formal annual and semester staff evaluations."
        action={
          <Button onClick={() => navigate('/reviews/new')}>
            <PlusIcon className="h-4 w-4" /> New Review
          </Button>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {REVIEW_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(status === s ? '' : s)}
            className={`card p-3 text-left transition ${status === s ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
          >
            <p className="text-2xl font-bold text-slate-900">{counts[s] || 0}</p>
            <p className="text-[11px] text-slate-500 leading-tight mt-0.5">{humanize(s)}</p>
          </button>
        ))}
      </div>

      {error && <ErrorBanner message={error} />}

      {loading ? (
        <LoadingSpinner label="Loading reviews..." />
      ) : reviews.length === 0 ? (
        <Card>
          <EmptyState
            title="No reviews"
            message="Create your first performance review to get started."
            action={
              <Button onClick={() => navigate('/reviews/new')}>
                <PlusIcon className="h-4 w-4" /> New Review
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {reviews.map((r) => (
            <Link key={r.id} to={`/reviews/${r.id}`} className="card p-5 hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar firstName={r.reviewee.firstName} lastName={r.reviewee.lastName} size={40} />
                  <div>
                    <p className="font-medium text-slate-900">
                      {r.reviewee.firstName} {r.reviewee.lastName}
                    </p>
                    <p className="text-xs text-slate-500">{r.reviewPeriod}</p>
                  </div>
                </div>
                <ScoreRing score={r.overallRating} max={5} size={40} />
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-slate-600">{humanize(r.reviewType)}</span>
                <Badge status={r.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
