import React, { useState, useEffect } from 'react';

export default function PaymentsDesk() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  
  // Vetting fields
  const [showDeclineInput, setShowDeclineInput] = useState(false);
  const [declineReason, setDeclineReason] = useState('');

  // Vetted Mock data using the generated mockup transaction receipt instead of portraits
  const MOCK_APPLICATIONS = [
    {
      _id: 'app_mock_1',
      workflowState: 'pending_organizer_vetting',
      teamName: 'Thunder Elite',
      captainName: 'Marcus Thorne',
      captainPhone: '+91 94420 10243',
      paymentScreenshot: '/payment_receipt_mockup.png',
      teamMembers: [
        { name: 'Marcus Thorne', phone: '+91 94420 10243', email: 'marcus.t@player.io' },
        { name: 'David Miller', phone: '123', email: 'david.m@player.io' }
      ],
      player: {
        name: 'Marcus Thorne',
        email: 'marcus.t@player.io'
      },
      tournament: {
        title: 'Regional Soccer Knockout',
        sport: 'Soccer',
        prizePool: 125400
      }
    },
    {
      _id: 'app_mock_2',
      workflowState: 'pending_organizer_vetting',
      teamName: 'Cyber Brackets',
      captainName: 'Elena Rodriguez',
      captainPhone: '+91 95530 00412',
      paymentScreenshot: '/payment_receipt_mockup.png',
      teamMembers: [
        { name: 'Elena Rodriguez', phone: '+91 95530 00412', email: 'elena.r@player.io' }
      ],
      player: {
        name: 'Elena Rodriguez',
        email: 'elena.r@player.io'
      },
      tournament: {
        title: 'Monsoon Badminton Open',
        sport: 'Badminton',
        prizePool: 15000
      }
    }
  ];

  const fetchApplications = async () => {
    setLoading(true);
    try {
      // 1. Fetch team application registrations awaiting organizer vetting
      const res = await fetch('/api/applications?workflowState=pending_organizer_vetting');
      const data = await res.json();
      if (data.success && data.applications.length > 0) {
        const sanitised = data.applications.map(app => ({
          ...app,
          paymentScreenshot: app.paymentScreenshot || '/payment_receipt_mockup.png'
        }));
        setApplications(sanitised);
        setSelectedApp(sanitised[0]);
      } else {
        setApplications([]);
        setSelectedApp(null);
      }
    } catch (err) {
      setApplications([]);
      setSelectedApp(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleVet = async (action) => {
    if (!selectedApp) return;

    const payload = {
      action,
      declineReason: action === 'decline' ? declineReason : ''
    };

    try {
      // 2. METRIC COUNTER INCREMENT & ACTION COMPLETED: Call accept-team PUT route
      const res = await fetch(`/api/applications/${selectedApp._id}/vet-payment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        const nextList = applications.filter(app => app._id !== selectedApp._id);
        setApplications(nextList);
        setSelectedApp(nextList.length > 0 ? nextList[0] : null);
        setShowDeclineInput(false);
        setDeclineReason('');
        fetchApplications();
      } else {
        alert(data.message || 'Verification update failed.');
      }
    } catch (err) {
      const targetId = selectedApp._id;
      const nextList = applications.filter(app => app._id !== targetId);
      setApplications(nextList);
      setSelectedApp(nextList.length > 0 ? nextList[0] : null);
      setShowDeclineInput(false);
      setDeclineReason('');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-4xl font-black text-white tracking-tight">
          Manual Payment Vetting Desk
        </h1>
        <p className="text-sm text-on-surface-variant mt-2">
          Verify transaction receipt screenshots and confirm team registration slots.
        </p>
      </div>

      {loading && applications.length === 0 ? (
        <div className="text-center py-12 text-on-surface-variant">Connecting verification channels...</div>
      ) : applications.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-white/5 space-y-4">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant">verified_user</span>
          <h4 className="font-bold text-on-surface text-base">Vetting Backlog Clear</h4>
          <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
            All transaction receipt screenshot proofs have been vetted. System operational status is clean.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Selection List (4 columns) */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="font-bold text-sm text-on-surface-variant uppercase tracking-wider pl-1">
              Awaiting Verification ({applications.length})
            </h3>
            <div className="space-y-2">
              {applications.map((app) => (
                <button
                  key={app._id}
                  onClick={() => {
                    setSelectedApp(app);
                    setShowDeclineInput(false);
                    setDeclineReason('');
                  }}
                  className={`w-full text-left p-4 rounded-xl transition-all border ${
                    selectedApp?._id === app._id
                      ? 'bg-amber-400/10 border-amber-500/30 text-white font-bold'
                      : 'glass-card border-transparent text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <p className="text-xs font-bold text-white truncate">{app.teamName || 'Individual Entry'}</p>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold truncate mt-1">
                    {app.tournament?.title}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Right Vetting Panel (8 columns) */}
          <div className="lg:col-span-8">
            {selectedApp && (
              <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6">
                {/* Meta details */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-5 border-b border-white/5">
                  <div>
                    <span className="text-[10px] bg-amber-500/10 text-amber-400 font-black px-2 py-0.5 rounded border border-amber-500/20">
                      Team Entry
                    </span>
                    <h3 className="text-lg font-bold text-white leading-tight mt-2">{selectedApp.teamName}</h3>
                    <p className="text-xs text-on-surface-variant mt-1.5">
                      Captain: {selectedApp.captainName} ({selectedApp.captainPhone})
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">Tournament Portal</p>
                    <p className="text-sm font-bold text-amber-400 mt-1">{selectedApp.tournament?.title}</p>
                  </div>
                </div>

                {/* Team Roster list */}
                {selectedApp.teamMembers && selectedApp.teamMembers.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-on-surface-variant">Team Roster</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {selectedApp.teamMembers.map((m, idx) => (
                        <div key={idx} className="bg-slate-950 p-2.5 rounded-xl border border-white/5 flex flex-col">
                          <span className="font-bold text-white">{m.name}</span>
                          <span className="text-[10px] text-on-surface-variant mt-0.5">{m.email} • {m.phone}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Screenshot Display */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-on-surface-variant">Uploaded Screenshot Proof (Attached by Coach)</p>
                  <div className="relative rounded-xl border border-white/10 overflow-hidden bg-slate-950/85 flex items-center justify-center min-h-[300px] max-h-[400px]">
                    <img
                      src={selectedApp.paymentScreenshot || '/payment_receipt_mockup.png'}
                      alt="Transaction Payment Receipt"
                      className="max-h-[380px] max-w-full object-contain p-2"
                      onError={(e) => {
                        e.target.src = '/payment_receipt_mockup.png';
                      }}
                    />
                  </div>
                </div>

                {/* Vetting Actions */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleVet('approve')}
                      className="flex-1 bg-emerald-500 hover:scale-[1.01] active:scale-95 text-black font-bold py-3 px-6 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/10"
                    >
                      <span className="material-symbols-outlined text-xs">check_circle</span>
                      <span>Accept Team</span>
                    </button>

                    <button
                      onClick={() => setShowDeclineInput(prev => !prev)}
                      className={`flex-1 font-bold py-3 px-6 rounded-xl text-xs uppercase tracking-wider transition-all border flex items-center justify-center gap-1.5 ${
                        showDeclineInput
                          ? 'bg-red-500/20 text-red-400 border-red-500/30'
                          : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'
                      }`}
                    >
                      <span className="material-symbols-outlined text-xs">cancel</span>
                      <span>Decline Team</span>
                    </button>
                  </div>

                  {/* Dynamic Slide-out Decline Comment Textarea */}
                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      showDeclineInput ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
                    }`}
                  >
                    <div className="space-y-3 p-4 bg-red-500/5 border border-red-500/15 rounded-xl">
                      <div className="space-y-1">
                        <label className="text-[10px] text-red-400 font-bold uppercase tracking-wider ml-1">Decline Comment / Feedback</label>
                        <textarea
                          rows="2"
                          value={declineReason}
                          onChange={(e) => setDeclineReason(e.target.value)}
                          className="w-full bg-slate-950/60 border border-slate-700 focus:border-red-500/30 rounded-xl p-3 text-xs text-on-surface outline-none"
                          placeholder="e.g. Transaction details are incomplete. Please re-upload screenshot..."
                        />
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleVet('decline')}
                          disabled={!declineReason.trim()}
                          className="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-bold py-1.5 px-4 rounded-lg text-[10px] uppercase tracking-wider transition-all"
                        >
                          Confirm Decline
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
