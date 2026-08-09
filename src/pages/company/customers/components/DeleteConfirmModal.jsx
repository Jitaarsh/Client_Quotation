import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

const DeleteConfirmModal = ({ customer, onClose, onConfirm, isDeleting }) => {
  if (!customer) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 border border-white/20 p-10 text-center">
        <div className="mx-auto w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mb-8 shadow-sm">
          <AlertTriangle className="w-10 h-10 text-rose-500" />
        </div>
        
        <h3 className="text-black text-2xl font-medium tracking-tighter mb-4">Confirm Deletion</h3>
        <p className="text-slate-500 text-sm font-medium leading-relaxed mb-10 px-4">
          Are you certain you want to remove <span className="text-black font-semibold text-sm">"{customer.businessName}"</span> from your registry? This action cannot be reversed.
        </p>

        <div className="flex flex-col space-y-4">
          <button 
            onClick={onConfirm}
            disabled={isDeleting}
            className="w-full bg-black text-white font-bold text-xs uppercase tracking-[0.2em] py-4 rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <span>Confirm & Delete</span>
            )}
          </button>
          <button 
            onClick={onClose}
            disabled={isDeleting}
            className="w-full text-slate-400 font-bold text-[10px] uppercase tracking-widest py-2 hover:text-black transition-colors"
          >
            Cancel Action
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
