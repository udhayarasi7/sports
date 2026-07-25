import React from 'react';

export default function LoadingScreen({ message = 'Syncing event database...' }) {
  return (
    <div className="w-full min-h-[400px] flex flex-col items-center justify-center p-8 space-y-6">
      {/* Spinning Dual Rings */}
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-amber-500/10 rounded-full" />
        <div className="absolute inset-0 border-4 border-t-amber-400 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
        <div className="absolute inset-2 border-4 border-emerald-500/10 rounded-full" />
        <div className="absolute inset-2 border-4 border-b-emerald-400 border-t-transparent border-r-transparent border-l-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }} />
      </div>

      {/* Loading Message */}
      <div className="text-center space-y-2">
        <p className="text-xs font-bold uppercase tracking-widest text-[#cbd5e1]/80 animate-pulse">
          {message}
        </p>
        <p className="text-[10px] text-[#cbd5e1]/40">
          This may take a moment. Please keep your connection active.
        </p>
      </div>

      {/* Reusable Dashboard Skeleton Fallback */}
      <div className="w-full max-w-lg space-y-3 opacity-25 mt-4">
        <div className="flex gap-4">
          <div className="h-16 bg-slate-800 rounded-xl flex-1 animate-pulse" />
          <div className="h-16 bg-slate-800 rounded-xl flex-1 animate-pulse" style={{ animationDelay: '0.15s' }} />
          <div className="h-16 bg-slate-800 rounded-xl flex-1 animate-pulse" style={{ animationDelay: '0.3s' }} />
        </div>
        <div className="h-28 bg-slate-800 rounded-2xl w-full animate-pulse" style={{ animationDelay: '0.45s' }} />
      </div>
    </div>
  );
}
