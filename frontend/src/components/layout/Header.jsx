import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth.js';
import Avatar from '../common/Avatar.jsx';
import { humanize } from '../../utils/formatters.js';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const staff = user?.staff;

  const onSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/staff?search=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
      <form onSubmit={onSearch} className="relative w-80 max-w-full">
        <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search staff by name..."
          className="w-full pl-10 pr-3 py-2 text-sm rounded-lg bg-slate-50 border border-slate-200 outline-none focus:border-primary focus:bg-white transition"
        />
      </form>

      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-slate-50 transition"
        >
          <Avatar firstName={staff?.firstName} lastName={staff?.lastName} size={34} />
          <div className="text-left leading-tight hidden sm:block">
            <p className="text-sm font-medium text-slate-900">
              {staff ? `${staff.firstName} ${staff.lastName}` : user?.email}
            </p>
            <p className="text-[11px] text-slate-500">{humanize(user?.role)}</p>
          </div>
          <ChevronDownIcon className="h-4 w-4 text-slate-400" />
        </button>
        {open && (
          <div className="absolute right-0 mt-2 w-48 card py-1 z-20 fade-in">
            <div className="px-4 py-2 border-b border-slate-100">
              <p className="text-sm font-medium text-slate-900">{staff?.position || 'Staff'}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
