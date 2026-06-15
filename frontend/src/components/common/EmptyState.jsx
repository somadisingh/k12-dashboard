import { InboxIcon } from '@heroicons/react/24/outline';

export default function EmptyState({ icon: Icon = InboxIcon, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center">
        <Icon className="h-7 w-7 text-slate-400" />
      </div>
      <h3 className="mt-4 font-semibold text-slate-700">{title}</h3>
      {message && <p className="mt-1 text-sm text-slate-500 max-w-sm">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
