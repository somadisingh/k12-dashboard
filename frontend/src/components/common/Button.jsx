const VARIANTS = {
  primary: 'bg-primary hover:bg-primary-dark text-white border-transparent',
  secondary: 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300',
  danger: 'bg-danger hover:bg-red-600 text-white border-transparent',
  ghost: 'bg-transparent hover:bg-slate-100 text-slate-600 border-transparent',
  success: 'bg-success hover:bg-emerald-600 text-white border-transparent',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  disabled,
  loading,
  children,
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 font-medium rounded-lg border transition focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}
