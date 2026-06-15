export default function StatCard({ label, value, icon: Icon, accent = 'primary', hint, onClick }) {
  const accents = {
    primary: 'bg-indigo-50 text-primary',
    success: 'bg-emerald-50 text-success',
    warning: 'bg-amber-50 text-warning',
    danger: 'bg-red-50 text-danger',
  };
  return (
    <div
      onClick={onClick}
      className={`card p-5 flex items-start justify-between ${
        onClick ? 'cursor-pointer hover:shadow-md transition' : ''
      }`}
    >
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
        {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
      </div>
      {Icon && (
        <div className={`h-11 w-11 rounded-lg flex items-center justify-center ${accents[accent]}`}>
          <Icon className="h-6 w-6" />
        </div>
      )}
    </div>
  );
}
