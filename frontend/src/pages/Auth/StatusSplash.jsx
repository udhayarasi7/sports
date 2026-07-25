import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateUserStatus, logout } from '../../store/authSlice';

export default function StatusSplash() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);

  if (!user) {
    return <div className="min-h-screen bg-[#020617] flex items-center justify-center text-on-surface">Redirecting...</div>;
  }

  const handleRefreshStatus = async () => {
    setChecking(true);
    try {
      const response = await fetch(`/api/auth/users`);
      const data = await response.json();
      if (data.success) {
        const found = data.users.find(u => u.email === user.email);
        if (found) {
          dispatch(updateUserStatus(found.status));
          if (found.status === 'approved') {
            navigateToDashboard(user.role);
          }
        }
      }
    } catch (e) {
      console.log("Health check connection offline");
    }
    setTimeout(() => setChecking(false), 800);
  };

  const handleAutoApprove = async () => {
    // Developers helper to quickly test dynamic gated routes without database setup
    try {
      await fetch(`/api/auth/users/${user.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' })
      });
    } catch (e) {
      console.log("API offline, triggering mock local state approval");
    }
    dispatch(updateUserStatus('approved'));
    navigateToDashboard(user.role);
  };

  const navigateToDashboard = (role) => {
    if (role === 'player') navigate('/player/dashboard');
    else if (role === 'coach') navigate('/coach/dashboard');
    else navigate('/organizer/dashboard');
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login/selection');
  };

  const isPending = user.status === 'pending';

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#020617] relative overflow-hidden">
      {/* Dynamic ambient color based on state */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[140px] pointer-events-none opacity-20 ${
        isPending ? 'bg-yellow-500' : 'bg-red-500'
      }`} />

      <div className="w-full max-w-lg z-10 text-center space-y-8">
        {/* Warning Icon */}
        <div className="flex justify-center">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center border-2 animate-pulse-slow ${
            isPending ? 'border-yellow-500/40 bg-yellow-500/10 text-yellow-400' : 'border-red-500/40 bg-red-500/10 text-red-400'
          }`}>
            <span className="material-symbols-outlined text-4xl">
              {isPending ? 'pending_actions' : 'gpp_bad'}
            </span>
          </div>
        </div>

        {/* Messaging */}
        <div className="space-y-3">
          <h1 className="font-display text-2xl font-black uppercase tracking-tight text-white">
            {isPending ? 'Credentials Verification Awaiting Sign-off' : 'Credential Validation Suspended'}
          </h1>
          <p className="text-sm text-on-surface-variant max-w-md mx-auto leading-relaxed">
            {isPending
              ? `Your application details as a ${user.role.toUpperCase()} are currently queued in our review backlog. You will receive dynamic access credentials once verified.`
              : 'Our administration board has flagged your registration profile. Please verify your coaching certifications are up to date or upload a valid ID.'}
          </p>
        </div>

        {/* Current status display card */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 inline-flex items-center gap-3">
          <span className="text-xs text-on-surface-variant uppercase font-bold">Profile Status:</span>
          <span className={`text-xs font-black uppercase px-3 py-1 rounded-full border ${
            isPending ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
          }`}>
            {user.status.toUpperCase()}
          </span>
        </div>

        {/* Control options */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 max-w-sm mx-auto pt-4">
          <button
            onClick={handleRefreshStatus}
            disabled={checking}
            className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-3 px-6 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
          >
            <span className={`material-symbols-outlined text-sm ${checking ? 'animate-spin' : ''}`}>sync</span>
            <span>{checking ? 'Querying Backlog...' : 'Query Current Status'}</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full bg-red-500/15 border border-red-500/20 hover:bg-red-500/25 text-red-400 font-bold py-3 px-6 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            <span>Exit Session</span>
          </button>
        </div>

        {/* FAST-TRACK APPROVAL FOR TESTING */}
        <div className="pt-8 border-t border-white/5 max-w-sm mx-auto">
          <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-black mb-3">
            🔧 Quick Sandbox Verification Gate
          </p>
          <button
            onClick={handleAutoApprove}
            className="w-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 font-bold py-3 px-6 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">check_circle</span>
            <span>Fast-Track Status to Approved</span>
          </button>
        </div>
      </div>
    </div>
  );
}
