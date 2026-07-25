import React from 'react';

export default function ProfileDrawer({ isOpen, onClose, user }) {
  if (!isOpen || !user) return null;

  const getInstitutionDetails = () => {
    if (user.role === 'coach') {
      return user.coachDetails?.academy || 'Not Provided';
    }
    if (user.role === 'organizer') {
      return user.organizerDetails?.organizationName || 'Not Provided';
    }
    if (user.role === 'player') {
      return user.playerDetails?.institution || 'Not Provided';
    }
    return 'Not Provided';
  };

  const getRoleColor = () => {
    if (user.role === 'coach') return 'text-sky-400 border-sky-500/20 bg-sky-500/10';
    if (user.role === 'player') return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10';
    return 'text-amber-400 border-amber-500/20 bg-amber-500/10';
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-80 bg-[#141218] border-l border-white/10 shadow-2xl z-50 p-6 flex flex-col justify-between animate-in slide-in-from-right duration-300">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center pb-4 border-b border-white/10">
            <h3 className="text-base font-bold text-white uppercase tracking-wider">User Profile</h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/5 rounded-lg text-on-surface-variant hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* User Details */}
          <div className="space-y-5">
            <div className="flex flex-col items-center text-center py-4">
              <span className="material-symbols-outlined text-6xl text-on-surface-variant">account_circle</span>
              <h4 className="text-lg font-bold text-white mt-3 leading-none">{user.name || 'Not Provided'}</h4>
              <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border mt-2 tracking-wider ${getRoleColor()}`}>
                {user.role}
              </span>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Email Address</span>
                <p className="text-white font-medium text-[13px]">{user.email || 'Not Provided'}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Phone Number</span>
                <p className="text-white font-medium text-[13px]">{user.phone || 'Not Provided'}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Institution / Academy</span>
                <p className="text-white font-medium text-[13px]">{getInstitutionDetails()}</p>
              </div>

              {user.role === 'player' && user.playerDetails && (
                <>
                  <div className="space-y-1">
                    <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Discipline</span>
                    <p className="text-white font-medium text-[13px]">{user.playerDetails.discipline || 'Not Provided'}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Skill Tier</span>
                    <p className="text-emerald-400 font-bold text-[13px]">{user.playerDetails.skillLevel || 'Not Provided'}</p>
                  </div>
                </>
              )}

              {user.role === 'coach' && user.coachDetails && (
                <>
                  <div className="space-y-1">
                    <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Coaching Area</span>
                    <p className="text-white font-medium text-[13px]">{user.coachDetails.discipline || 'Not Provided'}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Experience Logs</span>
                    <p className="text-sky-400 font-bold text-[13px]">{user.coachDetails.experience || 'Not Provided'}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-white/5 text-center text-[10px] text-on-surface-variant/40">
          Sports Hub Network • Version 4.2.1
        </div>
      </div>
    </>
  );
}
