import React from 'react';
import { X, Trash2, AlertTriangle, Loader2 } from 'lucide-react';

const DeleteConfirmModal = ({ terms, onClose, onConfirm, isDeleting }) => {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0f172a]/60 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative bg-white w-full max-w-md rounded-[2rem] shadow-[0_24px_60px_-10px_rgba(0,0,0,0.3)] overflow-hidden"
        style={{ animation: 'modalIn 0.18s cubic-bezier(0.16,1,0.3,1)' }}
      >
        <style>{`@keyframes modalIn{from{opacity:0;transform:scale(0.94)}to{opacity:1;transform:scale(1)}}`}</style>

        <div className="p-8">
          {/* Icon */}
          <div className="w-16 h-16 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-rose-500" />
          </div>

          {/* Text */}
          <div className="text-center mb-8">
            <h2 className="text-[#1a2b4b] text-xl font-black mb-2">Delete Version?</h2>
            <p className="text-gray-500 text-sm font-medium leading-relaxed">
              You are about to permanently delete{' '}
              <span className="font-bold text-[#1a2b4b]">&ldquo;{terms.versionLabel}&rdquo;</span>{' '}
              ({terms.versionId}). This action cannot be undone.
            </p>
            {terms.status === 'active' && (
              <div className="mt-4 bg-rose-50 border border-rose-100 rounded-2xl px-4 py-3">
                <p className="text-rose-600 text-xs font-bold">
                  ⚠️ This is currently the Active version. Deleting it will leave no active terms.
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3.5 rounded-2xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 flex items-center justify-center space-x-2 px-6 py-3.5 rounded-2xl bg-rose-500 text-white font-bold text-sm hover:bg-rose-600 transition-all shadow-[0_4px_14px_0_rgba(239,68,68,0.35)] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isDeleting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /><span>Deleting...</span></>
              ) : (
                <><Trash2 className="w-4 h-4" /><span>Yes, Delete</span></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
