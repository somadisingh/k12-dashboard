import { getScoreColor } from '../../utils/formatters.js';

// Small circular score indicator, colored by score value
export default function ScoreRing({ score, max = 4, size = 44, title }) {
  if (score === null || score === undefined) {
    return (
      <div
        className="flex items-center justify-center rounded-full bg-slate-100 text-slate-400 text-xs font-semibold"
        style={{ width: size, height: size }}
        title="Not scored"
      >
        —
      </div>
    );
  }
  const color = getScoreColor(score);
  const pct = Math.min(score / max, 1) * 100;
  return (
    <div
      className="rounded-full flex items-center justify-center"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(${color} ${pct}%, #e2e8f0 ${pct}%)`,
      }}
      title={title || `Score: ${Number(score).toFixed(1)} / ${max}`}
    >
      <div
        className="rounded-full bg-white flex items-center justify-center font-bold"
        style={{ width: size - 8, height: size - 8, color, fontSize: size / 3.2 }}
      >
        {Number.isInteger(score) ? score : Number(score).toFixed(1)}
      </div>
    </div>
  );
}
