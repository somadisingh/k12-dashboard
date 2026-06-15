import { useState } from 'react';
import { SparklesIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import * as aiApi from '../../api/ai.js';
import { formatDateTime } from '../../utils/formatters.js';
import { getAiErrorMessage } from '../../utils/aiErrors.js';

export default function AISummaryPanel({ observation, onUpdated }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generate = async () => {
    setLoading(true);
    setError('');
    try {
      await aiApi.generateObservationSummary(observation.id);
      await onUpdated();
    } catch (err) {
      setError(getAiErrorMessage(err, 'Failed to generate summary'));
    } finally {
      setLoading(false);
    }
  };

  if (observation.aiSummary) {
    return (
      <div className="card overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <SparklesIcon className="h-5 w-5" />
            <span className="font-semibold">AI-Generated Summary</span>
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
          <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-line leading-relaxed">
            {observation.aiSummary}
          </div>
          {observation.aiGeneratedAt && (
            <p className="text-xs text-slate-400 mt-4">
              Generated {formatDateTime(observation.aiGeneratedAt)}
            </p>
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
      <h3 className="mt-4 font-semibold text-slate-900">Generate AI Summary</h3>
      <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
        Turn the rubric scores and narrative notes into a polished, professional observation summary.
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
            Generating professional summary...
          </>
        ) : (
          <>
            <SparklesIcon className="h-5 w-5" /> Generate AI Summary
          </>
        )}
      </button>
    </div>
  );
}
