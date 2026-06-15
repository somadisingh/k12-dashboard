import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  UsersIcon,
  ClipboardDocumentCheckIcon,
  DocumentChartBarIcon,
  FlagIcon,
  PencilSquareIcon,
  ChartPieIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';

const NAV = [
  { to: '/', label: 'Dashboard', icon: HomeIcon, end: true },
  { to: '/staff', label: 'Staff', icon: UsersIcon },
  { to: '/observations', label: 'Observations', icon: ClipboardDocumentCheckIcon },
  { to: '/reviews', label: 'Reviews', icon: DocumentChartBarIcon },
  { to: '/goals', label: 'Goals', icon: FlagIcon },
  { to: '/notes', label: 'Notes', icon: PencilSquareIcon },
  { to: '/reports', label: 'Reports', icon: ChartPieIcon },
];

export default function Sidebar() {
  return (
    <aside className="w-60 bg-sidebar text-slate-300 flex flex-col flex-shrink-0">
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-white/10">
        <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
          <AcademicCapIcon className="h-5 w-5 text-white" />
        </div>
        <div className="leading-tight">
          <p className="text-white font-semibold text-sm">Lincoln K-12</p>
          <p className="text-[11px] text-slate-400">Academy</p>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                isActive
                  ? 'bg-primary text-white'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="px-5 py-4 border-t border-white/10 text-[11px] text-slate-500">
        Staff Performance Platform
      </div>
    </aside>
  );
}
