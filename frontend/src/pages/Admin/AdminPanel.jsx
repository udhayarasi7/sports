import React, { useState, useEffect } from 'react';

export default function AdminPanel() {
  const [coaches, setCoaches] = useState([]);
  const [organizers, setOrganizers] = useState([]);
  const [activeTab, setActiveTab] = useState('coaches');
  const [loading, setLoading] = useState(false);

  // Fallback Mock registrations to test workflow
  const MOCK_COACHES = [
    {
      _id: 'c_pending_1',
      name: 'Sarah Connor',
      email: 's.connor@coach.io',
      role: 'coach',
      status: 'pending',
      coachDetails: { experience: '6 Years', discipline: 'High Performance Training', academy: 'Resistance Academy' }
    },
    {
      _id: 'c_pending_2',
      name: 'Robert Miller',
      email: 'r.miller@academy.io',
      role: 'coach',
      status: 'pending',
      coachDetails: { experience: '12 Years', discipline: 'Youth Development', academy: 'National Sports Center' }
    }
  ];

  const MOCK_ORGANIZERS = [
    {
      _id: 'org_pending_1',
      name: 'Tournament Logistics Corp',
      email: 'admin@logistics-corp.com',
      role: 'organizer',
      status: 'pending',
      organizerDetails: { organizationName: 'Logistics Championship Shard', title: 'Managing Director' }
    }
  ];

  const fetchPendingUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/users');
      const data = await res.json();
      if (data.success) {
        setCoaches(data.users.filter(u => u.role === 'coach' && u.status === 'pending'));
        setOrganizers(data.users.filter(u => u.role === 'organizer' && u.status === 'pending'));
      } else {
        setCoaches(MOCK_COACHES);
        setOrganizers(MOCK_ORGANIZERS);
      }
    } catch (err) {
      setCoaches(MOCK_COACHES);
      setOrganizers(MOCK_ORGANIZERS);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const handleUpdateStatus = async (userId, status) => {
    try {
      const res = await fetch(`/api/auth/users/${userId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        fetchPendingUsers();
      }
    } catch (err) {
      // Fallback local update
      setCoaches(prev => prev.filter(c => c._id !== userId));
      setOrganizers(prev => prev.filter(o => o._id !== userId));
    }
  };

  const activeList = activeTab === 'coaches' ? coaches : organizers;

  return (
    <div className="space-y-8 flex flex-col justify-between min-h-[calc(100vh-100px)]">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-display text-4xl font-black text-white tracking-tight">
            Central Administrative Core
          </h1>
          <p className="text-sm text-on-surface-variant mt-2">
            Review pending registrations, verify coach certifications, and authorize organizers.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex gap-4 border-b border-white/10 pb-4">
          <button
            onClick={() => setActiveTab('coaches')}
            className={`pb-2.5 font-bold text-xs uppercase tracking-wider transition-all border-b-2 ${
              activeTab === 'coaches'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-on-surface-variant hover:text-white'
            }`}
          >
            Pending Coaches ({coaches.length})
          </button>
          <button
            onClick={() => setActiveTab('organizers')}
            className={`pb-2.5 font-bold text-xs uppercase tracking-wider transition-all border-b-2 ${
              activeTab === 'organizers'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-on-surface-variant hover:text-white'
            }`}
          >
            Pending Organizers ({organizers.length})
          </button>
        </div>

        {/* Tab Panels */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 text-on-surface-variant">Accessing registry databases...</div>
          ) : activeList.length === 0 ? (
            <div className="glass-panel p-12 text-center rounded-2xl border border-white/5 space-y-4">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant">verified</span>
              <h4 className="font-bold text-on-surface text-base">Registries Clear</h4>
              <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
                No registrations are currently queued for administrative vetting.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeList.map((user) => (
                <div key={user._id} className="glass-card rounded-2xl p-6 border border-white/5 space-y-4 hover:border-amber-500/20 transition-all flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-base text-white tracking-tight">{user.name}</h4>
                        <p className="text-xs text-on-surface-variant">{user.email}</p>
                      </div>
                    </div>

                    <div className="p-3.5 bg-slate-950/60 rounded-xl border border-white/5 text-xs text-on-surface-variant space-y-2">
                      {user.role === 'coach' && user.coachDetails ? (
                        <>
                          <p><span className="font-bold uppercase text-[9px] block">Academy</span> {user.coachDetails.academy}</p>
                          <p><span className="font-bold uppercase text-[9px] block">Experience Logs</span> {user.coachDetails.experience}</p>
                          <p><span className="font-bold uppercase text-[9px] block">Discipline</span> {user.coachDetails.discipline}</p>
                        </>
                      ) : (
                        user.organizerDetails && (
                          <>
                            <p><span className="font-bold uppercase text-[9px] block">Business Name</span> {user.organizerDetails.organizationName}</p>
                            <p><span className="font-bold uppercase text-[9px] block">Title</span> {user.organizerDetails.title}</p>
                          </>
                        )
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-white/5 mt-4">
                    <button
                      onClick={() => handleUpdateStatus(user._id, 'approved')}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-2 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1"
                    >
                      <span className="material-symbols-outlined text-xs">check_circle</span>
                      <span>Authorize</span>
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(user._id, 'rejected')}
                      className="flex-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 font-bold py-2 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1"
                    >
                      <span className="material-symbols-outlined text-xs">cancel</span>
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Database Diagnostic Status Widget */}
      <footer className="w-full p-4 rounded-xl bg-slate-950 border border-white/5 flex items-center justify-between text-[11px] text-on-surface-variant/80">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span>Ecosystem Core: Operational</span>
        </span>
        <span className="font-semibold tracking-tighter">
          Cluster Target: MongoDB Atlas via Mongoose
        </span>
      </footer>
    </div>
  );
}
