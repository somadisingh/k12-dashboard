import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function ErrorBanner({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
      <span className="flex-1">{message}</span>
      {onDismiss && (
        <button onClick={onDismiss} className="text-red-400 hover:text-red-600 font-medium">
          Dismiss
        </button>
      )}
    </div>
  );
}
