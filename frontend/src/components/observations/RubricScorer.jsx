import { RUBRIC_CATEGORIES, SCORE_LABELS } from '../../utils/constants.js';
import { getScoreColor } from '../../utils/formatters.js';

// scores: { [category]: { score, notes } }
export default function RubricScorer({ scores, onChange }) {
  const update = (key, patch) => onChange({ ...scores, [key]: { ...scores[key], ...patch } });

  return (
    <div className="space-y-5">
      {RUBRIC_CATEGORIES.map((cat) => {
        const current = scores[cat.key] || {};
        return (
          <div key={cat.key} className="border border-slate-200 rounded-lg p-4">
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-semibold text-primary uppercase">{cat.domain}</span>
              <h4 className="font-semibold text-slate-900">{cat.label}</h4>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">{cat.description}</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
              {[1, 2, 3, 4].map((n) => {
                const selected = current.score === n;
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => update(cat.key, { score: n })}
                    className={`rounded-lg border-2 px-2 py-2.5 text-center transition ${
                      selected ? 'text-white' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                    style={selected ? { backgroundColor: getScoreColor(n), borderColor: getScoreColor(n) } : {}}
                  >
                    <span className="block text-lg font-bold">{n}</span>
                    <span className="block text-[10px] leading-tight">{SCORE_LABELS[n]}</span>
                  </button>
                );
              })}
            </div>

            <textarea
              className="input mt-3"
              rows={2}
              placeholder="What did you observe? (optional)"
              value={current.notes || ''}
              onChange={(e) => update(cat.key, { notes: e.target.value })}
            />
          </div>
        );
      })}
    </div>
  );
}
