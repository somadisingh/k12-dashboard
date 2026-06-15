export default function LoadingSpinner({ label = 'Loading...', className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 text-slate-400 ${className}`}>
      <span className="h-8 w-8 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
      {label && <p className="mt-3 text-sm">{label}</p>}
    </div>
  );
}
