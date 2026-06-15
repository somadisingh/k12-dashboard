import { getStatusColor, humanize } from '../../utils/formatters.js';

export default function Badge({ status, label, color, className = '' }) {
  const classes = color || getStatusColor(status);
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${classes} ${className}`}
    >
      {label || humanize(status)}
    </span>
  );
}
