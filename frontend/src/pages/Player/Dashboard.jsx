import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

export default function PlayerDashboard() {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({ applied: 0, approved: 0, pendingPayment: 0 });
  const [hasConfirmedTeam, setHasConfirmedTeam] = useState(false);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const res = await fetch(`/api/applications/my-applications?player=${user.id}`);
        const data = await res.json();
        if (data.success) {
          const applied = data.applications.filter(a => a.workflowState === 'pending_coach_proof').length;
          const approved = data.applications.filter(a => a.workflowState === 'fully_enrolled').length;
          const pendingPayment = data.applications.filter(a => a.workflowState === 'pending_organizer_vetting').length;
          setStats({ applied, approved, pendingPayment });
          setHasConfirmedTeam(approved > 0);
        }
      } catch (err) {
        setStats({ applied: 0, approved: 0, pendingPayment: 0 });
        setHasConfirmedTeam(false);
      }
    };
    fetchApps();
  }, [user.id]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl font-black text-white tracking-tight">
          Welcome back, {user?.name}
        </h1>
        <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
          Stay on top of your game. Browse upcoming local tournaments, track validation approvals, and connect with team coaches.
        </p>
      </div>

      {hasConfirmedTeam && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-3 shadow-lg shadow-emerald-500/5 animate-pulse">
          <span className="material-symbols-outlined text-base">verified</span>
          <span>Application Approved! Team Enrollment Confirmed for Tournament Brackets.</span>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between h-40 border border-emerald-500/10">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
              Approved Team Entries
            </span>
            <span className="material-symbols-outlined text-emerald-400">emoji_events</span>
          </div>
          <div>
            <div className="text-3xl font-black text-white emerald-glow">{stats.approved} Teams</div>
            <div className="text-[10px] text-on-surface-variant mt-1">Ready for match start</div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between h-40 border border-yellow-500/10">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-yellow-400 font-bold uppercase tracking-wider">
              Pending Vetting
            </span>
            <span className="material-symbols-outlined text-yellow-400">payments</span>
          </div>
          <div>
            <div className="text-3xl font-black text-white">{stats.pendingPayment} Proofs</div>
            <div className="text-[10px] text-on-surface-variant mt-1">Under organizer review</div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between h-40 border border-white/5">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">
              Awaiting Coach Proof
            </span>
            <span className="material-symbols-outlined text-on-surface-variant">hourglass_empty</span>
          </div>
          <div>
            <div className="text-3xl font-black text-white">{stats.applied} Approvals</div>
            <div className="text-[10px] text-on-surface-variant mt-1">Coach action pending</div>
          </div>
        </div>
      </div>

      {/* Useful Pathways */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
          <h3 className="font-bold text-lg text-white">Find Competition Shards</h3>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Search for live basketball matches, soccer brackets, or tennis events happening near your geographic coordinates. Filter by skill levels and prize money.
          </p>
          <Link
            to="/player/tournaments"
            className="inline-flex items-center gap-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 font-bold py-2.5 px-6 rounded-xl text-xs uppercase tracking-wider transition-all"
          >
            <span>Explore Map Matrix</span>
            <span className="material-symbols-outlined text-xs">arrow_forward</span>
          </Link>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
          <h3 className="font-bold text-lg text-white">Enrollment Logs</h3>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Submit transaction screenshot proofs for your pending registrations to request manual sign-offs from event organizers.
          </p>
          <Link
            to="/player/applications"
            className="inline-flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-2.5 px-6 rounded-xl text-xs uppercase tracking-wider transition-all"
          >
            <span>Verify Payments</span>
            <span className="material-symbols-outlined text-xs">payments</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
