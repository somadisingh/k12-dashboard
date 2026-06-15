export default function ProgressBar({ value = 0, className = '', color }) {
  const pct = Math.max(0, Math.min(100, value));
  const barColor = color || (pct >= 100 ? 'bg-success' : pct >= 50 ? 'bg-primary' : 'bg-amber-500');
  return (
    <div className={`w-full bg-slate-100 rounded-full h-2 overflow-hidden ${className}`}>
      <div
        className={`h-full rounded-full transition-all ${barColor}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
