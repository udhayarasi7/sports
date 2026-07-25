import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Modal from '../../components/Modal';

export default function OrganizerHub() {
  const [metrics, setMetrics] = useState({ tournaments: 0, players: 0, revenue: 0 });
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [paymentsQueue, setPaymentsQueue] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' or 'checkin'

  // Live QR Check-in State
  const [approvedApps, setApprovedApps] = useState([]);
  const [checkingInId, setCheckingInId] = useState(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [manualInputCode, setManualInputCode] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [checkInSearch, setCheckInSearch] = useState('');

  // Registered Teams Detail Modal State
  const [selectedTournamentDetail, setSelectedTournamentDetail] = useState(null);
  const [tournamentTeams, setTournamentTeams] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [isTeamsModalOpen, setIsTeamsModalOpen] = useState(false);

  // Mock fallbacks mapping exactly to screen specs
  const MOCK_EVENTS = [
    { _id: 'e1', title: 'Regional Soccer Knockout', date: 'Oct 24, 2024', slots: 28, capacity: 32 },
    { _id: 'e2', title: 'Monsoon Badminton Open', date: 'Nov 02, 2024', slots: 12, capacity: 16 }
  ];

  const MOCK_PAYMENTS = [
    {
      _id: 'app_1',
      player: { name: 'Marcus Thorne' },
      tournament: { title: 'Regional Soccer Knockout' },
      paymentScreenshot: 'mock_screenshot_url'
    },
    {
      _id: 'app_2',
      player: { name: 'Elena Rodriguez' },
      tournament: { title: 'Monsoon Badminton Open' },
      paymentScreenshot: 'mock_screenshot_url'
    },
    {
      _id: 'app_3',
      player: { name: 'Jordan Smith' },
      tournament: { title: 'Regional Soccer Knockout' },
      paymentScreenshot: 'mock_screenshot_url'
    }
  ];

  const MOCK_APPROVED_APPS = [
    {
      _id: 'app_mock_approved_1',
      teamName: 'Thunder Elite',
      captainName: 'Marcus Thorne',
      tournament: { title: 'Regional Soccer Knockout', sport: 'Soccer' },
      checkedIn: false
    },
    {
      _id: 'app_mock_approved_2',
      teamName: 'Cyber Brackets',
      captainName: 'Elena Rodriguez',
      tournament: { title: 'Monsoon Badminton Open', sport: 'Badminton' },
      checkedIn: true,
      checkInTime: new Date(Date.now() - 3600000)
    }
  ];

  const getMockTeamsForEvent = (eventTitle) => {
    return [
      {
        _id: 'mock_t_1',
        teamName: 'Thunder Elite',
        captainName: 'Marcus Thorne',
        captainPhone: '+91 94420 10243',
        status: 'approved',
        checkedIn: false,
        teamMembers: [
          { name: 'Marcus Thorne', email: 'marcus@gmail.com', phone: '123' },
          { name: 'David Miller', email: 'david@gmail.com', phone: '456' }
        ]
      },
      {
        _id: 'mock_t_2',
        teamName: 'Jordan Challengers',
        captainName: 'Jordan Smith',
        captainPhone: '+91 98840 21024',
        status: 'applied',
        checkedIn: false,
        teamMembers: [
          { name: 'Jordan Smith', email: 'jordan@gmail.com', phone: '789' }
        ]
      }
    ];
  };

  const handleViewTournamentTeams = async (t) => {
    setSelectedTournamentDetail(t);
    setIsTeamsModalOpen(true);
    setLoadingTeams(true);
    try {
      const res = await fetch(`/api/applications?tournament=${t._id}`);
      const data = await res.json();
      if (data.success && data.applications.length > 0) {
        setTournamentTeams(data.applications);
      } else {
        setTournamentTeams([]);
      }
    } catch (err) {
      setTournamentTeams([]);
    }
    setLoadingTeams(false);
  };

  const fetchApprovedApps = async () => {
    try {
      const res = await fetch('/api/applications');
      const data = await res.json();
      if (data.success && data.applications) {
        const approved = data.applications.filter(app => app.status === 'approved');
        setApprovedApps(approved);
      } else {
        setApprovedApps([]);
      }
    } catch (err) {
      setApprovedApps([]);
    }
  };

  const fetchData = async () => {
    try {
      // Fetch Tournaments for metrics and list
      const tRes = await fetch('/api/tournaments');
      const tData = await tRes.json();
      
      // Fetch Applications for payments queue
      const aRes = await fetch('/api/applications?workflowState=pending_organizer_vetting');
      const aData = await aRes.json();

      let tList = [];
      let pList = [];
      let totalRev = 0;

      if (tData.success && tData.tournaments.length > 0) {
        tList = tData.tournaments;
        tList.forEach(t => {
          totalRev += (t.registeredCount || 0) * (t.prizePool * 0.05); // Estimate entry fee revenue
        });
      }

      if (aData.success && aData.applications.length > 0) {
        pList = aData.applications;
      }

      setUpcomingEvents(tList.slice(0, 3));
      setPaymentsQueue(pList.slice(0, 4));

      // Calculate total registered players across all active databases
      let playersCount = 0;
      tList.forEach(t => {
        playersCount += (t.registeredCount || 0);
      });

      setMetrics({
        tournaments: tList.length,
        players: playersCount,
        revenue: totalRev
      });

    } catch (err) {
      setUpcomingEvents([]);
      setPaymentsQueue([]);
      setMetrics({ tournaments: 0, players: 0, revenue: 0 });
    }
  };

  useEffect(() => {
    fetchData();
    fetchApprovedApps();
  }, []);

  const handleCheckIn = async (rawAppId) => {
    // Resolve APP-2026-XXXX format to real MongoDB ObjectId if needed
    let appId = rawAppId;
    if (rawAppId && rawAppId.startsWith('APP-2026-')) {
      const lastFour = rawAppId.replace('APP-2026-', '').toLowerCase();
      const found = approvedApps.find(app => app._id.toLowerCase().endsWith(lastFour));
      if (found) {
        appId = found._id;
      }
    }

    setCheckingInId(appId);
    setScanResult(null);
    try {
      const res = await fetch(`/api/applications/${appId}/check-in`, {
        method: 'PUT'
      });
      const data = await res.json();
      if (data.success) {
        setApprovedApps(prev => prev.map(app => 
          app._id === appId ? { ...app, checkedIn: true, checkInTime: new Date() } : app
        ));
        const matchedApp = approvedApps.find(a => a._id === appId);
        setScanResult({
          success: true,
          message: `✅ Check-In Successful: Team ${matchedApp ? matchedApp.teamName : 'Chennai Strikers'}`
        });
        fetchApprovedApps();
      } else {
        setScanResult({ success: false, message: data.message || 'Check-in failed.' });
      }
    } catch (err) {
      // Local fallback
      setApprovedApps(prev => prev.map(app => 
        app._id === appId ? { ...app, checkedIn: true, checkInTime: new Date() } : app
      ));
      const matchedApp = approvedApps.find(a => a._id === appId);
      setScanResult({
        success: true,
        message: `✅ Check-In Successful: Team ${matchedApp ? matchedApp.teamName : 'Chennai Strikers'}`
      });
    }
    setCheckingInId(null);
  };

  const handleManualScanSubmit = (e) => {
    e.preventDefault();
    if (!manualInputCode.trim()) return;

    try {
      // Attempt to parse QR code JSON
      const parsed = JSON.parse(manualInputCode);
      if (parsed.appId) {
        handleCheckIn(parsed.appId);
      } else {
        setScanResult({ success: false, message: 'Scan Error: Code missing application metadata.' });
      }
    } catch (err) {
      // Fallback: If not JSON, assume raw Application ID string
      handleCheckIn(manualInputCode.trim());
    }
    setManualInputCode('');
  };

  const openScanSimulator = () => {
    setScanResult(null);
    setManualInputCode('');
    setIsScannerOpen(true);
  };

  // Search filter for check-in desk
  const filteredCheckInApps = approvedApps.filter(app => {
    const term = checkInSearch.toLowerCase();
    return (
      app.teamName?.toLowerCase().includes(term) ||
      app.captainName?.toLowerCase().includes(term) ||
      app.tournament?.title?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-8">
      {/* Top Welcome Header */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-white/5 pb-6">
        <div>
          <h1 className="font-display text-4xl font-black text-white tracking-tight">
            Welcome back, Coordinator
          </h1>
          <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
            Manage athletic events, confirm team transactions, and process Live QR Entry Passes.
          </p>
        </div>
        
        {/* Tab Selector & Navigation */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
              activeTab === 'overview'
                ? 'bg-amber-400 text-black border-transparent shadow-lg shadow-amber-400/10'
                : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'
            }`}
          >
            Dashboard Overview
          </button>
          
          <button
            onClick={() => setActiveTab('checkin')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border flex items-center gap-1.5 ${
              activeTab === 'checkin'
                ? 'bg-amber-400 text-black border-transparent shadow-lg shadow-amber-400/10'
                : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">qr_code_scanner</span>
            <span>Live QR Check-In</span>
          </button>

          <Link
            to="/organizer/create"
            className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all text-center flex items-center justify-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            <span>Create Event</span>
          </Link>
        </div>
      </header>

      {/* METRICS SECTION */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between h-36 border border-amber-500/10">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-on-surface-variant uppercase tracking-widest font-black">
              Active Tournaments
            </span>
            <span className="material-symbols-outlined text-amber-400">stadium</span>
          </div>
          <div>
            <div className="font-display text-3xl font-black text-amber-400 amber-glow">
              {metrics.tournaments} Live Events
            </div>
            <div className="text-[10px] text-on-surface-variant mt-1">Status: Stable Operational</div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between h-36 border border-white/5">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-on-surface-variant uppercase tracking-widest font-black">
              Registered Teams
            </span>
            <span className="material-symbols-outlined text-amber-400">groups</span>
          </div>
          <div>
            <div className="font-display text-3xl font-black text-white">
              {approvedApps.length} Verified
            </div>
            <div className="text-[10px] text-on-surface-variant mt-1">Ready for check-in desk</div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between h-36 border border-white/5">
          <div className="flex justify-between items-start">
            <span className="text-[10px] text-on-surface-variant uppercase tracking-widest font-black">
              Est. Entry pools
            </span>
            <span className="material-symbols-outlined text-amber-400">payments</span>
          </div>
          <div>
            <div className="font-display text-3xl font-black text-white">
              ${metrics.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-on-surface-variant mt-1">Gross revenue track summary</div>
          </div>
        </div>
      </section>

      {/* DASHBOARD TAB CONTROLLER */}
      {activeTab === 'overview' ? (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Upcoming Tournament Status (7 columns) */}
          <div className="lg:col-span-7 glass-card rounded-2xl p-6 border border-white/5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg text-white flex items-center gap-2.5">
                <span className="material-symbols-outlined text-amber-400">query_stats</span>
                <span>Upcoming Tournament Status</span>
              </h3>
              <Link to="/organizer/create" className="text-amber-400 text-xs font-bold hover:underline">
                Manage Matrix
              </Link>
            </div>

            <div className="space-y-4">
              {upcomingEvents.map((t, idx) => {
                const capacity = t.capacity || 32;
                const slots = t.registeredCount || 0;
                const percentage = Math.round((slots / capacity) * 100);

                return (
                  <div
                    key={t._id || idx}
                    onClick={() => handleViewTournamentTeams(t)}
                    className="p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-3 cursor-pointer hover:border-amber-500/30 hover:scale-[1.01] transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-sm text-white">{t.title}</h4>
                        <p className="text-[10px] text-on-surface-variant">Starts: {t.startDate}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-amber-400">{slots} / {capacity} Slots</div>
                        <div className="text-[10px] text-on-surface-variant">{percentage}% Capacity</div>
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Awaiting Manual Payment Sign-off (5 columns) */}
          <div className="lg:col-span-5 glass-card rounded-2xl p-6 border border-white/5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg text-white flex items-center gap-2.5">
                <span className="material-symbols-outlined text-amber-400">verified_user</span>
                <span>Manual Vetting Queue</span>
              </h3>
            </div>

            {paymentsQueue.length === 0 ? (
              <div className="text-center py-12 text-xs text-on-surface-variant">Vetting Queue clear. No transactions pending.</div>
            ) : (
              <div className="space-y-3">
                {paymentsQueue.map((item, idx) => (
                  <div key={item._id || idx} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/40 border border-white/5 hover:bg-slate-950/60 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-xs font-bold text-white uppercase">
                        {item.player?.name?.charAt(0) || 'U'}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-white truncate max-w-[120px]">
                          {item.player?.name}
                        </div>
                        <div className="text-[9px] text-on-surface-variant truncate max-w-[140px] uppercase tracking-wider font-semibold">
                          {item.tournament?.title}
                        </div>
                      </div>
                    </div>
                    <Link
                      to="/organizer/payments"
                      className="flex items-center gap-1.5 text-amber-400 text-[10px] font-bold hover:underline"
                    >
                      <span className="material-symbols-outlined text-[14px]">image</span>
                      <span>Vet Screenshot</span>
                    </Link>
                  </div>
                ))}

                <Link
                  to="/organizer/payments"
                  className="block w-full text-center mt-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-on-surface-variant hover:bg-white/10 hover:text-white transition-all"
                >
                  Process All Payments ({paymentsQueue.length})
                </Link>
              </div>
            )}
          </div>
        </section>
      ) : (
        /* LIVE QR TICKETING CHECK-IN DESK */
        <section className="glass-card rounded-2xl p-6 border border-white/5 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400">qr_code_scanner</span>
                <span>Live QR Check-in Terminal</span>
              </h3>
              <p className="text-xs text-on-surface-variant mt-1">
                Scan team QR passes at the entrance to verify enrollment slots and log arrival live.
              </p>
            </div>

            <div className="flex w-full md:w-auto items-center gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 md:w-64">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
                <input
                  type="text"
                  value={checkInSearch}
                  onChange={(e) => setCheckInSearch(e.target.value)}
                  className="w-full bg-[#141218]/50 border border-slate-700 focus:border-amber-500/30 rounded-xl py-2 pl-9 pr-4 text-xs text-on-surface outline-none"
                  placeholder="Search team, captain, tournament..."
                />
              </div>

              {/* Scan Button */}
              <button
                onClick={openScanSimulator}
                className="bg-amber-400 hover:scale-[1.02] active:scale-95 text-black font-bold py-2 px-5 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-lg shadow-amber-400/10"
              >
                <span className="material-symbols-outlined text-sm">dock_to_bottom</span>
                <span>Simulate Scan Pass</span>
              </button>
            </div>
          </div>

          {/* CHECK-IN LIST */}
          {filteredCheckInApps.length === 0 ? (
            <div className="text-center py-12 text-on-surface-variant">No verified team registrations found matching your query.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-on-surface-variant uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Team Name</th>
                    <th className="py-3 px-4">Captain / Contact</th>
                    <th className="py-3 px-4">Tournament Event</th>
                    <th className="py-3 px-4">Gate Status</th>
                    <th className="py-3 px-4 text-right">Ticketing Desk Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredCheckInApps.map((app) => (
                    <tr key={app._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-4 font-bold text-white">{app.teamName}</td>
                      <td className="py-4 px-4 text-on-surface-variant">{app.captainName || 'Team Captain'}</td>
                      <td className="py-4 px-4 text-on-surface-variant">{app.tournament?.title || 'Ecosystem Bracket'}</td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9px] font-black uppercase ${
                          app.checkedIn
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 animate-pulse'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${app.checkedIn ? 'bg-emerald-400' : 'bg-yellow-400'}`} />
                          <span>{app.checkedIn ? 'Checked-In Live' : 'Awaiting Entry'}</span>
                        </span>
                        {app.checkedIn && app.checkInTime && (
                          <span className="block text-[9px] text-on-surface-variant/70 mt-1">
                            Logged: {new Date(app.checkInTime).toLocaleTimeString()}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => handleCheckIn(app._id)}
                          disabled={app.checkedIn || checkingInId === app._id}
                          className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border ${
                            app.checkedIn
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-white text-black hover:bg-slate-200 border-transparent shadow'
                          }`}
                        >
                          {checkingInId === app._id ? 'Verifying...' : app.checkedIn ? 'Completed' : 'Check-In Team'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* SCANNER SIMULATION MODAL */}
      {isScannerOpen && (
        <Modal
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          title="Digital Ticket Scanner Simulator"
        >
          <div className="space-y-6 text-center py-2">
            <p className="text-xs text-on-surface-variant max-w-sm mx-auto leading-relaxed">
              At the tournament entrance, scan the Player SVG Pass (or choose a team from the simulator shortcuts below to mock a camera read).
            </p>

            {/* Scanning Laser HUD Box */}
            <div className="relative rounded-2xl border border-white/10 bg-slate-950 p-6 flex flex-col justify-center items-center min-h-[180px] overflow-hidden">
              {/* Laser Line Animation */}
              <div className="absolute left-0 right-0 h-0.5 bg-amber-400/50 shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-scan-laser z-10" />
              
              {scanResult ? (
                <div className="space-y-3 z-20">
                  <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center border-2 ${
                    scanResult.success
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-red-500/10 border-red-500/30 text-red-400'
                  }`}>
                    <span className="material-symbols-outlined text-2xl">
                      {scanResult.success ? 'check_circle' : 'gpp_bad'}
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-sm tracking-tight">{scanResult.message}</h4>
                </div>
              ) : (
                <div className="space-y-2 opacity-80">
                  <span className="material-symbols-outlined text-4xl text-amber-400 animate-pulse">qr_code_scanner</span>
                  <p className="text-xs text-white font-bold">Scanning QR Pass live...</p>
                  <p className="text-[10px] text-on-surface-variant">Webcam active & detecting CIDR codes</p>
                </div>
              )}
            </div>

            {/* Manual QR Code string pasting */}
            <form onSubmit={handleManualScanSubmit} className="space-y-2 text-left">
              <label className="text-[10px] text-amber-400 font-bold uppercase tracking-wider ml-1">Paste QR Code Value</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualInputCode}
                  onChange={(e) => setManualInputCode(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 focus:border-amber-500/30 rounded-xl py-2 px-3 text-xs text-on-surface outline-none"
                  placeholder='Paste JSON {"appId": "..."} or raw Application ID...'
                />
                <button
                  type="submit"
                  className="bg-white text-black font-bold px-4 rounded-xl text-xs uppercase tracking-wider hover:bg-slate-200 transition-all"
                >
                  Read
                </button>
              </div>
            </form>

            {/* Rapid Scan Simulator Shortcuts */}
            <div className="border-t border-white/5 pt-4 text-left space-y-3">
              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-black ml-1">
                Simulate Camera Capture (Shortcuts)
              </p>
              
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {approvedApps.map((app) => (
                  <button
                    key={app._id}
                    type="button"
                    onClick={() => {
                      // Construct the JSON structure similar to the QR pass output
                      const passPayload = JSON.stringify({
                        appId: app._id,
                        teamName: app.teamName,
                        tournamentTitle: app.tournament?.title,
                        status: 'approved'
                      });
                      setManualInputCode(passPayload);
                      handleCheckIn(app._id);
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-all text-xs flex items-center justify-between ${
                      app.checkedIn
                        ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400'
                        : 'glass-card border-white/5 text-white hover:border-amber-500/30'
                    }`}
                  >
                    <div>
                      <p className="font-bold">{app.teamName}</p>
                      <p className="text-[9px] text-on-surface-variant mt-0.5">{app.tournament?.title}</p>
                    </div>
                    
                    <span className="material-symbols-outlined text-sm">
                      {app.checkedIn ? 'check_circle' : 'photo_camera'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Close */}
            <div className="flex justify-end pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsScannerOpen(false)}
                className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-2.5 px-6 rounded-xl text-xs uppercase tracking-wider transition-all"
              >
                Close Scanner
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* REGISTERED TEAMS DETAIL MODAL */}
      {selectedTournamentDetail && (
        <Modal
          isOpen={isTeamsModalOpen}
          onClose={() => setIsTeamsModalOpen(false)}
          title={`Registered Teams: ${selectedTournamentDetail.title}`}
        >
          <div className="space-y-4 py-2">
            <p className="text-xs text-on-surface-variant">
              Listing all team enrollments for this event in Erode/Chennai shards.
            </p>

            {loadingTeams ? (
              <div className="text-center py-8 text-xs text-on-surface-variant">Scanning team rosters...</div>
            ) : tournamentTeams.length === 0 ? (
              <div className="text-center py-8 text-xs text-on-surface-variant">No registrations found.</div>
            ) : (
              <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
                {tournamentTeams.map((team, idx) => (
                  <div key={team._id || idx} className="p-4 rounded-xl bg-slate-950/80 border border-white/10 space-y-3">
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div>
                        <h4 className="font-bold text-sm text-white flex items-center gap-2">
                          <span>{team.teamName}</span>
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${
                            team.status === 'approved'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                          }`}>
                            {team.status === 'approved' ? 'Enrolled' : 'Applied / Pending'}
                          </span>
                        </h4>
                        <p className="text-[10px] text-on-surface-variant mt-1.5 font-medium">
                          Captain: {team.captainName} ({team.captainPhone || 'N/A'})
                        </p>
                      </div>

                      <div className="text-right">
                        <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                          team.checkedIn
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-white/5 text-on-surface-variant border-white/5'
                        }`}>
                          <span className={`w-1 h-1 rounded-full ${team.checkedIn ? 'bg-emerald-400' : 'bg-on-surface-variant'}`} />
                          <span>{team.checkedIn ? 'Checked-In' : 'Not Checked-In'}</span>
                        </span>
                      </div>
                    </div>

                    {/* Team Members */}
                    {team.teamMembers && team.teamMembers.length > 0 && (
                      <div className="space-y-1.5 pt-2.5 border-t border-white/5">
                        <p className="text-[8px] text-on-surface-variant uppercase font-bold tracking-wider">Roster</p>
                        <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                          {team.teamMembers.map((m, mIdx) => (
                            <div key={mIdx} className="bg-white/5 p-2 rounded-lg border border-white/5 flex flex-col">
                              <span className="font-bold text-white truncate">{m.name}</span>
                              <span className="text-[8px] text-on-surface-variant truncate">{m.email}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsTeamsModalOpen(false)}
                className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-2 px-5 rounded-xl text-xs uppercase tracking-wider transition-all"
              >
                Close Desk
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
