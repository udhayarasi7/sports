import React from 'react';

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      {/* Backdrop click close */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-xl glass-panel rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 border border-white/10 z-10 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-white/10 bg-slate-950/40">
          <h3 className="text-lg font-bold text-on-surface tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-white/5 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body (scrollable) */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-slate-900/20">
          {children}
        </div>
      </div>
    </div>
  );
}
