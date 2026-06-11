import React from 'react';
import { X, AlertTriangle, Trash2, Loader2 } from 'lucide-react';

const DeleteRuleModal = ({ isOpen, onClose, onConfirm, isDeleting, ruleName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#0f172a]/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />
      
      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-8">
          {/* Header & Icon */}
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-rose-50 rounded-3xl flex items-center justify-center animate-bounce-subtle">
              <AlertTriangle className="w-8 h-8 text-rose-500" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-[#1a2b4b] font-black text-xl">Delete Rule?</h3>
              <p className="text-gray-500 text-sm font-medium leading-relaxed">
                Are you sure you want to delete <span className="text-[#1a2b4b] font-bold">"{ruleName}"</span>? This action cannot be undone and may affect how T&Cs are applied to new quotes.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col space-y-3">
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="w-full bg-rose-500 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-rose-500/20 hover:bg-rose-600 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              <span>Delete Permanently</span>
            </button>
            
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="w-full py-4 rounded-2xl text-gray-400 font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all active:scale-95"
            >
              Keep Rule
            </button>
          </div>
        </div>

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-gray-400 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default DeleteRuleModal;
