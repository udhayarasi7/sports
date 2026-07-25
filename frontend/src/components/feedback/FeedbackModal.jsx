import React from 'react';
import Modal from '../Modal';

export default function FeedbackModal({ 
  isOpen, 
  onClose, 
  type = 'success', // 'success' or 'failure'
  title = 'Operation Completed', 
  message = 'Your request has been successfully processed by the Sports Hub vetting server.',
  details = null,
  actionLabel = 'Dismiss Desk',
  onAction
}) {
  const isSuccess = type === 'success';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isSuccess ? 'Transaction Success' : 'Transaction Declined'}
    >
      <div className="space-y-6 text-center py-2 select-none">
        {/* Animated Icon Circle */}
        <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
          {isSuccess ? (
            <>
              {/* Success glowing circle */}
              <div className="absolute inset-0 bg-emerald-500/10 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <span className="material-symbols-outlined text-3xl font-black">check_circle</span>
              </div>
            </>
          ) : (
            <>
              {/* Failure glowing circle */}
              <div className="absolute inset-0 bg-red-500/10 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
              <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                <span className="material-symbols-outlined text-3xl font-black">cancel</span>
              </div>
            </>
          )}
        </div>

        {/* Message Content */}
        <div className="space-y-2">
          <h3 className="font-display text-lg font-black text-white tracking-tight">
            {title}
          </h3>
          <p className="text-xs text-on-surface-variant leading-relaxed max-w-xs mx-auto">
            {message}
          </p>
        </div>

        {/* Optional Detail Box */}
        {details && (
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-white/5 text-[10px] font-mono text-left max-w-sm mx-auto space-y-1 text-on-surface-variant overflow-x-auto">
            {Object.entries(details).map(([key, val]) => (
              <div key={key} className="flex justify-between gap-4">
                <span className="uppercase text-slate-500 font-bold">{key}:</span>
                <span className="text-white font-bold truncate max-w-[180px]">{val}</span>
              </div>
            ))}
          </div>
        )}

        {/* Action Button Desk */}
        <div className="pt-2 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all"
          >
            Close
          </button>
          
          {onAction && (
            <button
              type="button"
              onClick={onAction}
              className={`flex-1 font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all ${
                isSuccess
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/15'
                  : 'bg-red-500 hover:bg-red-400 text-white shadow-lg shadow-red-500/15'
              }`}
            >
              {actionLabel}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
