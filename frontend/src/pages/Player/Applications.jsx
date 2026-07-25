import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { QRCodeSVG } from 'qrcode.react';
import Modal from '../../components/Modal';

export default function PlayerApplications() {
  const { user } = useSelector((state) => state.auth);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingId, setUploadingId] = useState(null);

  // Digital Ticket/Pass Modal state
  const [selectedApp, setSelectedApp] = useState(null);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);

  const openPassModal = (app) => {
    setSelectedApp(app);
    setIsPassModalOpen(true);
  };

  const fetchApplications = async () => {
    setLoading(true);
    try {
      // Direct call to the custom GET my-applications endpoint with strict db query
      const res = await fetch(`/api/applications/my-applications?player=${user.id}`);
      const data = await res.json();
      if (data.success && data.applications) {
        setApplications(data.applications);
      } else {
        setApplications([]);
      }
    } catch (err) {
      setApplications([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchApplications();
  }, [user.id]);

  const handleScreenshotUpload = (appId, e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingId(appId);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Screenshot = event.target.result;

      try {
        const res = await fetch(`/api/applications/${appId}/upload-screenshot`, {
          // Keep PATCH format since it is a minor resource upload operation
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ screenshot: base64Screenshot })
        });
        const data = await res.json();
        if (data.success) {
          fetchApplications();
        } else {
          alert('Failed to upload proof.');
        }
      } catch (err) {
        // Fallback local update
        setApplications(prev =>
          prev.map(app =>
            app._id === appId ? { ...app, status: 'vetting', paymentScreenshot: base64Screenshot } : app
          )
        );
      }
      setUploadingId(null);
    };
    reader.readAsDataURL(file);
  };

  // Status Styles mapping
  const getStatusBadge = (status) => {
    switch (status) {
      case 'applied':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'awaiting_payment':
        return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
      case 'vetting':
        return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
      case 'approved':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'rejected':
        return 'bg-red-500/10 text-red-400 border border-red-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'applied': return 'Awaiting Coach Approval';
      case 'awaiting_payment': return 'Awaiting Payment Screenshot';
      case 'vetting': return 'Screenshot Pending Vetting';
      case 'approved': return 'Enrollment Approved';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-4xl font-black text-white tracking-tight">
          My Tournament Enrollments
        </h1>
        <p className="text-sm text-on-surface-variant mt-2">
          Track registration status phases and upload transaction receipt details.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-on-surface-variant">Querying enrollment records...</div>
      ) : applications.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-white/5 space-y-4">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant">history</span>
          <h4 className="font-bold text-on-surface text-base">No Applications Found</h4>
          <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
            You haven't applied to any sports tournament brackets yet. Go to Find Tournaments to start registering.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {applications.map((app) => (
            <div key={app._id} className="glass-card rounded-2xl p-6 border border-white/5 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="font-bold text-lg text-white leading-tight">{app.tournament?.title}</h3>
                  <p className="text-xs text-on-surface-variant mt-1.5 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">sports_soccer</span>
                    <span>{app.tournament?.sport} • {app.tournament?.locationName}</span>
                  </p>
                </div>

                <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusBadge(app.status)}`}>
                  {getStatusLabel(app.status)}
                </div>
              </div>

              {/* Decline Reason Alert */}
              {app.declineReason && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold flex gap-2">
                  <span className="material-symbols-outlined text-base">warning</span>
                  <div>
                    <p className="font-black">Payment Receipt Rejected</p>
                    <p className="font-normal mt-1 opacity-90">{app.declineReason}</p>
                  </div>
                </div>
              )}

              {/* Workflow Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5 items-center">
                {/* Status Milestones Checkbox Layout */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      app.status !== 'rejected' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-900 border border-slate-700 text-slate-500'
                    }`}>
                      <span className="material-symbols-outlined text-xs font-bold">done</span>
                    </div>
                    <span className="text-xs text-on-surface font-semibold">1. Registration Applied</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      app.coachApproved ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-900 border border-slate-700 text-slate-500'
                    }`}>
                      <span className="material-symbols-outlined text-xs font-bold">
                        {app.requiresCoachApproval ? 'done' : 'check_circle'}
                      </span>
                    </div>
                    <span className="text-xs text-on-surface font-semibold">
                      2. Coach Approvals Gate {app.requiresCoachApproval ? '' : '(Skipped)'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      ['vetting', 'approved'].includes(app.status)
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : app.status === 'awaiting_payment'
                        ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 animate-pulse'
                        : 'bg-slate-900 border border-slate-700 text-slate-500'
                    }`}>
                      <span className="material-symbols-outlined text-xs font-bold">
                        {['vetting', 'approved'].includes(app.status) ? 'done' : 'payments'}
                      </span>
                    </div>
                    <span className="text-xs text-on-surface font-semibold">3. Transaction Receipt Submitted</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      app.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-900 border border-slate-700 text-slate-500'
                    }`}>
                      <span className="material-symbols-outlined text-xs font-bold">done</span>
                    </div>
                    <span className="text-xs text-on-surface font-semibold">4. Entry Status Confirmed</span>
                  </div>
                </div>

                {/* Interactive Receipt Upload Portal */}
                <div className="flex justify-end">
                  {app.status === 'awaiting_payment' ? (
                    <div className="relative group w-full max-w-sm">
                      <div className="border border-dashed border-white/20 group-hover:border-yellow-500/40 rounded-xl bg-slate-950/40 p-5 text-center transition-all cursor-pointer">
                        <span className="material-symbols-outlined text-3xl text-yellow-400 mb-1.5">add_photo_alternate</span>
                        <p className="text-xs font-bold text-on-surface">
                          {uploadingId === app._id ? 'Uploading screenshot...' : 'Submit Transaction Receipt'}
                        </p>
                        <p className="text-[10px] text-on-surface-variant mt-1">Upload screenshots (PNG, JPG) proof</p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingId === app._id}
                        onChange={(e) => handleScreenshotUpload(app._id, e)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                  ) : app.status === 'vetting' ? (
                    <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/10 text-xs text-purple-400 font-semibold flex items-center gap-2">
                      <span className="material-symbols-outlined">hourglass_empty</span>
                      <span>Organizer manually reviewing uploaded transaction screenshot proof.</span>
                    </div>
                  ) : app.status === 'approved' ? (
                    <div className="flex flex-col gap-3 w-full max-w-sm">
                      <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-xs text-emerald-400 font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined flex-shrink-0">check_circle</span>
                        <span>Ecosystem slot confirmed.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => openPassModal(app)}
                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/15"
                      >
                        <span className="material-symbols-outlined text-sm">qr_code</span>
                        <span>Show Digital Pass</span>
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DIGITAL TICKET / PASS MODAL */}
      {selectedApp && (
        <Modal
          isOpen={isPassModalOpen}
          onClose={() => setIsPassModalOpen(false)}
          title="Digital Athletic Pass"
        >
          <div className="space-y-6 text-center py-2">
            {/* Ticket Card */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950 p-6 space-y-6 shadow-2xl">
              {/* Glowing Ambient Light */}
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              
              {/* Header */}
              <div className="border-b border-white/10 pb-4">
                <h3 className="font-display text-base font-black text-white tracking-tight uppercase">
                  {selectedApp.tournament?.title || 'Sports Hub Tournament'}
                </h3>
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mt-1">
                  Official Entry Pass
                </p>
              </div>

              {/* Roster / Team Details */}
              <div className="grid grid-cols-2 gap-4 text-left text-xs">
                <div>
                  <p className="text-[9px] text-on-surface-variant uppercase font-bold">Application ID</p>
                  <p className="text-emerald-400 font-mono font-bold mt-0.5">
                    APP-2026-{selectedApp._id.slice(-4).toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] text-on-surface-variant uppercase font-bold">Team Name</p>
                  <p className="text-white font-bold truncate mt-0.5">{selectedApp.teamName}</p>
                </div>
                <div>
                  <p className="text-[9px] text-on-surface-variant uppercase font-bold">Player/Coach Name</p>
                  <p className="text-white font-bold truncate mt-0.5">{selectedApp.captainName || user.name}</p>
                </div>
                <div>
                  <p className="text-[9px] text-on-surface-variant uppercase font-bold">Tournament</p>
                  <p className="text-white font-bold truncate mt-0.5">{selectedApp.tournament?.title}</p>
                </div>
                <div>
                  <p className="text-[9px] text-on-surface-variant uppercase font-bold">Match Time</p>
                  <p className="text-white font-bold truncate mt-0.5">
                    {selectedApp.tournament?.startDate ? selectedApp.tournament.startDate.slice(0, 10) : '2026-07-25'} at 09:00 AM
                  </p>
                </div>
                <div>
                  <p className="text-[9px] text-on-surface-variant uppercase font-bold">Venue Details</p>
                  <p className="text-white font-bold truncate mt-0.5">
                    {selectedApp.tournament?.locationName} ({selectedApp.tournament?.city} District)
                  </p>
                </div>
              </div>

              {/* QR Code Container */}
              <div className="bg-white p-3 rounded-2xl inline-block shadow-inner mx-auto">
                <QRCodeSVG
                  value={JSON.stringify({
                    appId: `APP-2026-${selectedApp._id.slice(-4).toUpperCase()}`,
                    teamName: selectedApp.teamName,
                    playerName: selectedApp.captainName || user.name,
                    tournamentName: selectedApp.tournament?.title,
                    status: 'Verified & Enrolled'
                  })}
                  size={150}
                  level="H"
                />
              </div>

              {/* Venue Locator Map */}
              <div className="space-y-1 text-left pt-2 border-t border-white/5">
                <p className="text-[9px] text-on-surface-variant uppercase font-bold">Venue Locator Map</p>
                <div className="w-full h-32 rounded-xl overflow-hidden border border-white/5 bg-slate-900 mt-1">
                  <iframe
                    title="Pass Map Locator"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    marginHeight="0"
                    marginWidth="0"
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(
                      `${selectedApp.tournament?.locationName}, ${selectedApp.tournament?.city}, ${selectedApp.tournament?.state}`
                    )}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                    className="grayscale opacity-80 invert contrast-100"
                  />
                </div>
              </div>

              {/* Checked-In Status Badge */}
              <div className="pt-2">
                <div className={`p-3 rounded-xl border flex items-center justify-center gap-2 ${
                  selectedApp.checkedIn
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                }`}>
                  <span className="material-symbols-outlined text-sm">
                    {selectedApp.checkedIn ? 'how_to_reg' : 'hourglass_empty'}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Status: {selectedApp.checkedIn ? 'Approved (Checked-In Live)' : 'Approved (Unchecked)'}
                  </span>
                </div>
                {selectedApp.checkedIn && selectedApp.checkInTime && (
                  <p className="text-[9px] text-on-surface-variant mt-1.5 font-bold">
                    Checked In: {new Date(selectedApp.checkInTime).toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={() => setIsPassModalOpen(false)}
                className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-2.5 px-8 rounded-xl text-xs uppercase tracking-wider transition-all"
              >
                Close Pass
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
