import React from 'react';
import { useSelector } from 'react-redux';

export default function Navbar({ onMenuClick, searchVal, setSearchVal, onProfileClick }) {
  const { user } = useSelector((state) => state.auth);

  const getRoleColor = () => {
    if (!user) return 'text-slate-400';
    if (user.role === 'coach') return 'text-sky-400';
    if (user.role === 'player') return 'text-emerald-400';
    return 'text-amber-400';
  };

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 bg-[#141218]/40 backdrop-blur-md border-b border-white/10 z-40 flex justify-between items-center px-6 shadow-sm">
      {/* Mobile Toggle & Search */}
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-on-surface hover:bg-white/5 rounded-lg transition-colors"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>

        <div className="relative w-full max-w-md group hidden md:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl group-focus-within:text-primary transition-colors">
            search
          </span>
          <input
            type="text"
            value={searchVal || ''}
            onChange={(e) => setSearchVal && setSearchVal(e.target.value)}
            className="w-full bg-[#0f0d13]/50 border border-slate-700 rounded-full py-1.5 pl-10 pr-4 text-xs focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/20 transition-all text-on-surface"
            placeholder="Search tournaments, venues, or participants..."
          />
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-6">
        {/* System Status */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
            Operational
          </span>
        </div>

        {/* User Info Button (Clickable Avatar -> Profile Drawer) */}
        <button
          onClick={onProfileClick}
          className="flex items-center gap-2.5 text-left hover:scale-105 active:scale-95 transition-all outline-none"
        >
          <div className="text-right hidden xs:block">
            <p className="text-xs font-bold text-on-surface leading-none">{user?.name}</p>
            <p className={`text-[9px] font-black uppercase mt-1 tracking-wider ${getRoleColor()}`}>
              {user?.role}
            </p>
          </div>
          <span className={`material-symbols-outlined text-3xl ${getRoleColor()}`} style={{ fontVariationSettings: "'FILL' 1" }}>
            account_circle
          </span>
        </button>
      </div>
    </header>
  );
}
