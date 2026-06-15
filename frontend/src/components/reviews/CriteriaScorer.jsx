import { REVIEW_CRITERIA, REVIEW_SCORE_LABELS } from '../../utils/constants.js';
import { getScoreColor } from '../../utils/formatters.js';

export default function CriteriaScorer({ scores, onChange }) {
  const update = (key, patch) => onChange({ ...scores, [key]: { ...scores[key], ...patch } });

  return (
    <div className="space-y-5">
      {REVIEW_CRITERIA.map((crit) => {
        const current = scores[crit.key] || {};
        return (
          <div key={crit.key} className="border border-slate-200 rounded-lg p-4">
            <h4 className="font-semibold text-slate-900">{crit.label}</h4>
            <p className="text-sm text-slate-500 mt-0.5">{crit.description}</p>

            <div className="grid grid-cols-5 gap-2 mt-3">
              {[1, 2, 3, 4, 5].map((n) => {
                const selected = current.score === n;
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => update(crit.key, { score: n })}
                    className={`rounded-lg border-2 px-1 py-2 text-center transition ${
                      selected ? 'text-white' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                    style={selected ? { backgroundColor: getScoreColor(n), borderColor: getScoreColor(n) } : {}}
                  >
                    <span className="block text-lg font-bold">{n}</span>
                    <span className="block text-[9px] leading-tight">{REVIEW_SCORE_LABELS[n]}</span>
                  </button>
                );
              })}
            </div>

            <textarea
              className="input mt-3"
              rows={2}
              placeholder="Comments (optional)"
              value={current.comments || ''}
              onChange={(e) => update(crit.key, { comments: e.target.value })}
            />
          </div>
        );
      })}
    </div>
  );
}
