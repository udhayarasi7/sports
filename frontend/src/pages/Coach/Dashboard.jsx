import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

export default function CoachDashboard() {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({ pending: 0, approved: 0 });
  const [hasConfirmedTeam, setHasConfirmedTeam] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`/api/applications?targetCoachEmail=${user.email}`);
        const data = await res.json();
        if (data.success) {
          const pending = data.applications.filter(a => a.workflowState === 'pending_coach_proof').length;
          const approved = data.applications.filter(a => a.workflowState === 'fully_enrolled').length;
          setStats({ pending, approved });
          setHasConfirmedTeam(approved > 0);
        }
      } catch (err) {
        setStats({ pending: 0, approved: 0 });
        setHasConfirmedTeam(false);
      }
    };
    fetchStats();
  }, [user.email]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl font-black text-white tracking-tight">
          Coach Command Center
        </h1>
        <p className="text-sm text-on-surface-variant mt-2">
          Manage your athlete rosters, approve tournament credentials, and build strategy playbooks.
        </p>
      </div>

      {hasConfirmedTeam && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-3 shadow-lg shadow-emerald-500/5 animate-pulse">
          <span className="material-symbols-outlined text-base">verified</span>
          <span>Application Approved! Team Enrollment Confirmed for Tournament Brackets.</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between h-40 border border-sky-500/10">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-sky-400 font-bold uppercase tracking-wider">
              Awaiting Credential Sign-off
            </span>
            <span className="material-symbols-outlined text-sky-400">verified_user</span>
          </div>
          <div>
            <div className="text-3xl font-black text-white blue-glow">{stats.pending} Candidates</div>
            <div className="text-[10px] text-on-surface-variant mt-1">Pending roster evaluations</div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between h-40 border border-white/5">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">
              Total Approved Teams
            </span>
            <span className="material-symbols-outlined text-on-surface-variant">groups</span>
          </div>
          <div>
            <div className="text-3xl font-black text-white">{stats.approved} Active Teams</div>
            <div className="text-[10px] text-on-surface-variant mt-1">Cleared across all sport brackets</div>
          </div>
        </div>
      </div>

      {/* Strategy Links */}
      <div className="glass-panel p-8 rounded-2xl border border-white/10 space-y-4">
        <h3 className="font-bold text-lg text-white">Credentials & Approvals Queue</h3>
        <p className="text-xs text-on-surface-variant leading-relaxed">
          Verify demographic information, check player experience logs, and sign off on registration requests before players can upload their transaction screenshots.
        </p>
        <Link
          to="/coach/approvals"
          className="inline-flex items-center gap-2 bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 border border-sky-500/30 font-bold py-2.5 px-6 rounded-xl text-xs uppercase tracking-wider transition-all"
        >
          <span>Open Approvals Desk</span>
          <span className="material-symbols-outlined text-xs">verified_user</span>
        </Link>
      </div>
    </div>
  );
}
