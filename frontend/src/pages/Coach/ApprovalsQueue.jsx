import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Modal from '../../components/Modal';

export default function CoachApprovalsQueue() {
  const { user } = useSelector((state) => state.auth);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);

  // Approval screenshot uploads
  const [vettingApp, setVettingApp] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [screenshotProof, setScreenshotProof] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fallback Mock Candidates using receipt mockup images
  const MOCK_CANDIDATES = [
    {
      _id: 'app_mock_1',
      workflowState: 'pending_coach_proof',
      teamName: 'Thunder Elite',
      captainName: 'Marcus Thorne',
      captainPhone: '+91 94420 10243',
      targetCoachName: 'Sarah Connor',
      targetCoachEmail: user.email,
      teamMembers: [{ name: 'Elena R', phone: '123', email: 'elena@gmail.com' }],
      player: {
        _id: 'p_1',
        name: 'Marcus Thorne',
        email: 'marcus.t@player.io'
      },
      tournament: {
        title: 'Global Champions League',
        sport: 'Soccer'
      }
    }
  ];

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      // 1. TARGETED STREAMING: Fetch applications targeting this Coach's email
      const res = await fetch(`/api/applications/coach-stream?email=${user.email}`);
      const data = await res.json();
      if (data.success && data.applications.length > 0) {
        setCandidates(data.applications);
      } else {
        setCandidates([]);
      }
    } catch (err) {
      setCandidates([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCandidates();
  }, [user.email]);

  const handleDecline = async (appId) => {
    if (!window.confirm('Are you sure you want to decline this team request?')) return;
    try {
      const res = await fetch(`/api/applications/${appId}/coach-approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: false })
      });
      const data = await res.json();
      if (data.success) {
        setCandidates(prev => prev.filter(c => c._id !== appId));
      }
    } catch (err) {
      setCandidates(prev => prev.filter(c => c._id !== appId));
    }
  };

  const handleOpenApproveModal = (app) => {
    setVettingApp(app);
    setScreenshotProof('/payment_receipt_mockup.png'); // Default mockup path for ease of vetting in sandbox
    setIsUploadModalOpen(true);
  };

  const handleUploadScreenshot = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setScreenshotProof(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApproveSubmit = async (e) => {
    e.preventDefault();
    if (!vettingApp) return;

    setSubmitting(true);
    try {
      // 2. SUBMISSION TRANSITION: Send proof and change state
      const res = await fetch(`/api/applications/${vettingApp._id}/coach-submit-proof`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ screenshot: screenshotProof })
      });
      const data = await res.json();
      if (data.success) {
        setIsUploadModalOpen(false);
        setCandidates(prev => prev.filter(c => c._id !== vettingApp._id));
      } else {
        alert(data.message || 'Approval submission failed.');
      }
    } catch (err) {
      // Local fallback removal
      setIsUploadModalOpen(false);
      setCandidates(prev => prev.filter(c => c._id !== vettingApp._id));
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-8">
      {/* Top Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <h1 className="font-display text-4xl font-black text-white tracking-tight">
            Credentials Approvals Desk
          </h1>
          <p className="text-sm text-on-surface-variant mt-2">
            Verify targeted team lists and sign off registrations by attaching payment screenshots.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Coach Details (4 columns) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-6 rounded-2xl space-y-6">
            <div className="w-12 h-12 bg-sky-500/20 rounded-xl flex items-center justify-center border border-sky-500/30">
              <span className="material-symbols-outlined text-sky-400 text-3xl">sports_kabaddi</span>
            </div>
            <h3 className="font-bold text-lg text-white">Active Coach Profile</h3>
            
            <div className="space-y-4 text-xs text-on-surface-variant">
              <div>
                <p className="font-bold text-[10px] uppercase tracking-wider mb-1">Affiliated Academy</p>
                <p className="text-white font-medium text-sm">{user?.coachDetails?.academy || 'Pro Athletics Laboratory'}</p>
              </div>
              <div>
                <p className="font-bold text-[10px] uppercase tracking-wider mb-1">Coach Credentials Email</p>
                <p className="text-sky-400 font-bold text-xs">{user?.email}</p>
              </div>
              <div>
                <p className="font-bold text-[10px] uppercase tracking-wider mb-1">Primary Discipline</p>
                <p className="text-white font-medium text-sm">{user?.coachDetails?.discipline || 'Tactical Playbook Development'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Approvals Queue (8 columns) */}
        <div className="lg:col-span-8 space-y-4">
          <h3 className="font-bold text-lg text-white">Targeted Teams Stream ({candidates.length})</h3>

          {loading ? (
            <div className="text-center py-12 text-on-surface-variant">Querying verification records...</div>
          ) : candidates.length === 0 ? (
            <div className="glass-panel p-12 text-center rounded-2xl border border-white/5 space-y-4">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant">verified_user</span>
              <h4 className="font-bold text-on-surface text-base">Vetting Stream Clear</h4>
              <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
                No team registrations are currently matching your coach credentials stream.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {candidates.map((cand) => (
                <div key={cand._id} className="glass-card rounded-2xl p-5 border border-white/5 space-y-4 hover:border-sky-500/30 transition-all">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                      <span className="text-[10px] bg-sky-500/10 text-sky-400 font-black px-2 py-0.5 rounded border border-sky-500/20">
                        {cand.teamName || 'Individual Entry'}
                      </span>
                      <h4 className="font-bold text-base text-white tracking-tight leading-none mt-2">
                        Captain: {cand.captainName || cand.player?.name} ({cand.captainPhone || 'N/A'})
                      </h4>
                      <p className="text-xs text-on-surface-variant mt-2 font-medium">
                        Targeting Tournament: <span className="text-white">{cand.tournament?.title}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenApproveModal(cand)}
                        className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/15"
                      >
                        <span className="material-symbols-outlined text-xs">done</span>
                        <span>Approve</span>
                      </button>

                      <button
                        onClick={() => handleDecline(cand._id)}
                        className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-xs">close</span>
                        <span>Decline</span>
                      </button>
                    </div>
                  </div>

                  {/* Team Members List */}
                  {cand.teamMembers && cand.teamMembers.length > 0 && (
                    <div className="space-y-2 bg-slate-950/60 p-3.5 rounded-xl border border-white/5">
                      <p className="text-[9px] text-on-surface-variant uppercase tracking-wider font-black">Registered Roster</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-white">
                        {cand.teamMembers.map((m, idx) => (
                          <div key={idx} className="flex flex-col p-1.5 rounded bg-white/5 border border-white/5 min-w-0">
                            <span className="font-bold truncate">{m.name}</span>
                            <span className="text-[10px] text-on-surface-variant truncate">{m.email} • {m.phone}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Approve and Attach Receipt Modal */}
      {vettingApp && (
        <Modal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          title={`Upload Payment Proof: ${vettingApp.teamName}`}
        >
          <form onSubmit={handleApproveSubmit} className="space-y-5">
            <p className="text-xs text-on-surface-variant">
              Confirm your approval sign-off by uploading the payment transaction receipt screenshot proof.
            </p>

            <div className="space-y-2">
              <label className="text-xs text-sky-400 font-bold uppercase tracking-wider">
                Attach Payment Transaction Screenshot Proof
              </label>
              
              <div className="relative border-2 border-dashed border-white/10 rounded-xl bg-slate-950 p-6 text-center hover:border-emerald-500/40 transition-all cursor-pointer min-h-[160px] flex flex-col justify-center items-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadScreenshot}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                
                {screenshotProof ? (
                  <div className="flex flex-col items-center gap-2">
                    <img
                      src={screenshotProof}
                      alt="Uploaded proof preview"
                      className="max-h-24 object-contain rounded border border-white/10"
                    />
                    <span className="text-[10px] text-emerald-400 font-bold">Screenshot Loaded</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <span className="material-symbols-outlined text-4xl text-sky-400 mb-2">cloud_upload</span>
                    <h4 className="text-xs font-bold text-on-surface">Upload Screenshot Proof</h4>
                    <p className="text-[9px] text-on-surface-variant">PNG or JPG formats allowed</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-2.5 px-6 rounded-xl text-xs uppercase tracking-wider transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-2.5 px-6 rounded-xl text-xs uppercase tracking-wider transition-all"
              >
                {submitting ? 'Submitting...' : 'Attach & Approve'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
