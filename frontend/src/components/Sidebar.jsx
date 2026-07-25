import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';

export default function Sidebar({ isOpen, toggleSidebar }) {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [vettingCount, setVettingCount] = useState(0);

  useEffect(() => {
    if (user && user.role === 'organizer') {
      const fetchVettingCount = async () => {
        try {
          const res = await fetch('/api/applications?workflowState=pending_organizer_vetting');
          const data = await res.json();
          if (data.success && data.applications) {
            setVettingCount(data.applications.length);
          }
        } catch (err) {
          console.error('Error fetching vetting count:', err);
        }
      };
      fetchVettingCount();
      // Poll every 10 seconds to keep badge fresh
      const interval = setInterval(fetchVettingCount, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  if (!user) return null;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login/selection');
  };

  const isActive = (path) => location.pathname === path;

  // Define Navigation Items dynamically based on Role
  const getNavItems = () => {
    switch (user.role) {
      case 'player':
        return [
          { path: '/player/dashboard', label: 'Dashboard', icon: 'dashboard' },
          { path: '/player/tournaments', label: 'Find Tournaments', icon: 'map' },
          { path: '/player/enrollments', label: 'My Enrollments', icon: 'history' }
        ];
      case 'coach':
        return [
          { path: '/coach/dashboard', label: 'Dashboard', icon: 'dashboard' },
          { path: '/coach/approvals', label: 'Credentials Vetting', icon: 'verified_user' }
        ];
      case 'organizer':
        return [
          { path: '/organizer/dashboard', label: 'Organizer Hub', icon: 'dashboard' },
          { path: '/organizer/create', label: 'Manage CRUD Matrix', icon: 'add_circle' },
          { path: '/organizer/payments', label: 'Payments Vetting', icon: 'payments', count: vettingCount }
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  // Role Theme Details
  const getRoleTheme = () => {
    switch (user.role) {
      case 'coach':
        return { label: 'Coach Strategy Blue', border: 'border-sky-500', text: 'text-sky-400', glow: 'blue-glow' };
      case 'player':
        return { label: 'Player Vitality Emerald', border: 'border-emerald-500', text: 'text-emerald-400', glow: 'emerald-glow' };
      case 'organizer':
        return { label: 'Organizer Amber Edition', border: 'border-amber-500', text: 'text-amber-400', glow: 'amber-glow' };
      default:
        return { label: 'Sports Hub', border: 'border-slate-500', text: 'text-slate-400', glow: '' };
    }
  };

  const theme = getRoleTheme();

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 glass-panel border-r border-white/10 flex flex-col py-6 z-50 transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="px-6 mb-10 flex items-center justify-between">
          <div>
            <h1 className={`font-display text-2xl font-bold tracking-tighter ${theme.text} ${theme.glow}`}>
              Sports Hub
            </h1>
            <p className="text-[10px] text-on-surface-variant/60 uppercase tracking-widest mt-1 font-bold">
              {theme.label}
            </p>
          </div>
          <button className="lg:hidden text-on-surface" onClick={toggleSidebar}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Perspective Badge */}
        <div className="px-4 mb-8">
          <div className="bg-slate-900/60 rounded-full p-2.5 flex items-center border border-white/10 justify-center">
            <span className={`text-xs font-bold uppercase tracking-widest ${theme.text}`}>
              {user.role.toUpperCase()} MODE
            </span>
          </div>
        </div>

        {/* Navigation Link Items */}
        <nav className="flex-1 space-y-1 px-2">
          {navItems.map((item, index) => {
            const active = isActive(item.path);
            return (
              <Link
                key={index}
                to={item.path}
                onClick={() => lgWidthCheck() && toggleSidebar()}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg hover:scale-[1.02] transition-all duration-200 relative ${
                  active
                    ? `border-l-4 ${theme.border} bg-white/5 ${theme.text} font-bold`
                    : 'text-on-surface-variant hover:bg-white/5 hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span className="text-[14px]">{item.label}</span>
                {item.count > 0 && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full font-bold">
                    {item.count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer User Section */}
        <div className="px-4 mt-auto border-t border-white/10 pt-6 space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
            <div className={`w-10 h-10 rounded-lg overflow-hidden bg-slate-800 flex items-center justify-center border-2 ${theme.border}`}>
              <span className={`material-symbols-outlined ${theme.text}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                shield
              </span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-on-surface leading-none truncate">{user.name}</span>
              <span className="text-[10px] text-on-surface-variant/60 uppercase font-bold mt-1 tracking-tighter truncate">
                {user.email}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-on-surface-variant hover:bg-red-500/10 hover:text-red-400 transition-all font-bold text-xs border border-transparent hover:border-red-500/20"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span>LOGOUT SESSION</span>
          </button>
        </div>
      </aside>
    </>
  );
}

function lgWidthCheck() {
  if (typeof window !== 'undefined') {
    return window.innerWidth < 1024;
  }
  return false;
}
