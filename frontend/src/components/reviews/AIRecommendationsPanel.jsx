import { useState } from 'react';
import { SparklesIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import * as aiApi from '../../api/ai.js';
import { formatDateTime } from '../../utils/formatters.js';
import { getAiErrorMessage } from '../../utils/aiErrors.js';

function parseRecs(review) {
  if (!review.aiRecommendations) return null;
  try {
    const parsed = JSON.parse(review.aiRecommendations);
    return Array.isArray(parsed) ? parsed : parsed.recommendations || [];
  } catch {
    return null;
  }
}

export default function AIRecommendationsPanel({ review, onUpdated }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const recs = parseRecs(review);

  const generate = async () => {
    setLoading(true);
    setError('');
    try {
      await aiApi.generateReviewRecommendations(review.id);
      await onUpdated();
    } catch (err) {
      setError(getAiErrorMessage(err, 'Failed to generate recommendations'));
    } finally {
      setLoading(false);
    }
  };

  if (recs && recs.length) {
    return (
      <div className="card overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <SparklesIcon className="h-5 w-5" />
            <span className="font-semibold">AI Professional Development Recommendations</span>
          </div>
          <button
            onClick={generate}
            disabled={loading}
            className="flex items-center gap-1 text-xs text-white/90 hover:text-white"
          >
            <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Regenerate
          </button>
        </div>
        <div className="p-5">
          {error && <p className="text-sm text-danger mb-3">{error}</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recs.map((r, i) => (
              <div key={i} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                  <span>🎯</span>
                  {r.area}
                </div>
                <p className="text-sm text-slate-800 mt-2">{r.recommendation}</p>
                {r.rationale && (
                  <p className="text-xs text-slate-500 mt-2">
                    <span className="font-medium">Rationale:</span> {r.rationale}
                  </p>
                )}
                {(r.suggestedTimeline || r.timeline) && (
                  <p className="text-xs text-slate-500 mt-1">
                    <span className="font-medium">Timeline:</span> {r.suggestedTimeline || r.timeline}
                  </p>
                )}
              </div>
            ))}
          </div>
          {review.aiGeneratedAt && (
            <p className="text-xs text-slate-400 mt-4">Generated {formatDateTime(review.aiGeneratedAt)}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="card border-2 border-dashed border-indigo-200 bg-indigo-50/50 p-8 text-center">
      <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center mx-auto animate-pulse">
        <SparklesIcon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="mt-4 font-semibold text-slate-900">Generate AI Recommendations</h3>
      <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
        Produce 4 specific, SMART professional development recommendations based on this review.
      </p>
      {error && <p className="text-sm text-danger mt-3">{error}</p>}
      <button
        onClick={generate}
        disabled={loading}
        className="mt-4 inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-medium px-5 py-2.5 rounded-lg transition disabled:opacity-60"
      >
        {loading ? (
          <>
            <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Generating recommendations...
          </>
        ) : (
          <>
            <SparklesIcon className="h-5 w-5" /> Generate Recommendations
          </>
        )}
      </button>
    </div>
  );
}
