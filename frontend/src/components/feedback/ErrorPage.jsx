import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ErrorPage({ 
  errorCode = '503', 
  errorTitle = 'Connection Shard Broken', 
  errorMessage = 'The server is currently unreachable or database synchronization timed out. Please check your network connectivity and try again.',
  onRetry
}) {
  const navigate = useNavigate();

  const handleReturn = () => {
    navigate('/');
    window.location.reload();
  };

  return (
    <div className="w-full min-h-[550px] flex flex-col items-center justify-center p-6 text-center select-none">
      {/* Background Glowing Orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="space-y-6 max-w-sm relative z-10">
        {/* Warning Indicator */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
          <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 0" }}>
            error
          </span>
        </div>

        {/* Error Code & Details */}
        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-red-400 font-mono">
            Error Code {errorCode}
          </span>
          <h2 className="font-display text-xl font-black text-white tracking-tight">
            {errorTitle}
          </h2>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            {errorMessage}
          </p>
        </div>

        {/* Action Button Desk */}
        <div className="flex flex-col gap-2.5 pt-2">
          {onRetry ? (
            <button
              onClick={onRetry}
              className="w-full bg-white hover:bg-slate-200 text-black font-bold py-2.5 px-6 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">refresh</span>
              <span>Retry Connection</span>
            </button>
          ) : (
            <button
              onClick={handleReturn}
              className="w-full bg-white hover:bg-slate-200 text-black font-bold py-2.5 px-6 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">home</span>
              <span>Reboot Dashboard</span>
            </button>
          )}

          <button
            onClick={() => window.history.back()}
            className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-2.5 px-6 rounded-xl text-xs uppercase tracking-wider transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
