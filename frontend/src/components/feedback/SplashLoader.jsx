import React, { useState, useEffect } from 'react';

export default function SplashLoader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('Initializing Arena Shards...');

  const messages = [
    'Initializing Arena Shards...',
    'Loading Tournament Brackets...',
    'Syncing Player Profiles...',
    'Connecting Vetting Desk...',
    'Establishing Secure Node Connection...'
  ];

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          if (onComplete) onComplete();
          return 100;
        }
        const step = Math.floor(Math.random() * 15) + 5;
        return Math.min(prev + step, 100);
      });
    }, 200);

    return () => clearInterval(progressInterval);
  }, [onComplete]);

  useEffect(() => {
    const msgIdx = Math.min(Math.floor((progress / 100) * messages.length), messages.length - 1);
    setMessage(messages[msgIdx]);
  }, [progress]);

  return (
    <div className="fixed inset-0 z-50 bg-[#020617] flex flex-col items-center justify-center p-6 select-none">
      {/* Background Glowing Ambient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="space-y-8 w-full max-w-sm text-center relative z-10">
        {/* Pulsing Glowing Shield Logo */}
        <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-500 to-emerald-500 rounded-2xl rotate-45 opacity-20 blur-xl animate-pulse" />
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-500 to-emerald-500 rounded-3xl rotate-45 animate-spin" style={{ animationDuration: '6s' }} />
          <div className="absolute inset-1.5 bg-[#020617] rounded-3xl rotate-45 flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl text-amber-400 rotate-[-45deg] animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>
              shield
            </span>
          </div>
        </div>

        {/* Brand Header */}
        <div>
          <h1 className="font-display text-3xl font-black tracking-tighter bg-gradient-to-r from-amber-400 to-emerald-400 bg-clip-text text-transparent">
            Sports Hub
          </h1>
          <p className="text-[10px] text-[#cbd5e1]/40 uppercase tracking-widest mt-1.5 font-bold">
            Dynamic Athletic Portal
          </p>
        </div>

        {/* Loading Progress Desk */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-[10px] font-bold tracking-wider text-[#cbd5e1]/60">
            <span className="uppercase">{message}</span>
            <span className="font-mono">{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/5 p-[1px]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-300 shadow-[0_0_8px_rgba(251,191,36,0.3)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
