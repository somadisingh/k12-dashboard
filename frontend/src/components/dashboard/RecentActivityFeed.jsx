import { useNavigate } from 'react-router-dom';
import {
  ClipboardDocumentCheckIcon,
  DocumentChartBarIcon,
  FlagIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';
import { relativeTime } from '../../utils/formatters.js';

const ICONS = {
  OBSERVATION: ClipboardDocumentCheckIcon,
  REVIEW: DocumentChartBarIcon,
  GOAL: FlagIcon,
  NOTE: PencilSquareIcon,
};
const ROUTES = {
  OBSERVATION: '/observations',
  REVIEW: '/reviews',
  GOAL: '/goals',
  NOTE: '/notes',
};
const ACCENT = {
  OBSERVATION: 'bg-indigo-50 text-primary',
  REVIEW: 'bg-blue-50 text-blue-600',
  GOAL: 'bg-emerald-50 text-success',
  NOTE: 'bg-amber-50 text-warning',
};

export default function RecentActivityFeed({ events }) {
  const navigate = useNavigate();
  return (
    <div className="space-y-1 max-h-[360px] overflow-y-auto">
      {events.map((e) => {
        const Icon = ICONS[e.type];
        return (
          <button
            key={`${e.type}-${e.id}`}
            onClick={() => navigate(e.type === 'NOTE' ? ROUTES[e.type] : `${ROUTES[e.type]}/${e.id}`)}
            className="w-full flex items-start gap-3 px-2 py-2.5 rounded-lg hover:bg-slate-50 text-left transition"
          >
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${ACCENT[e.type]}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">{e.title}</p>
              <p className="text-xs text-slate-500 truncate">{e.subtitle}</p>
            </div>
            <span className="text-[11px] text-slate-400 whitespace-nowrap">{relativeTime(e.date)}</span>
          </button>
        );
      })}
    </div>
  );
}
