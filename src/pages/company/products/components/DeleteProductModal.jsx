import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

const DeleteProductModal = ({ product, onClose, onConfirm, isDeleting }) => {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 border border-white/20 p-10 text-center">
        <div className="mx-auto w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mb-8 shadow-sm">
          <AlertTriangle className="w-10 h-10 text-rose-500" />
        </div>
        
        <h3 className="text-[#1a2b4b] text-2xl font-black tracking-tight mb-4">Confirm Deletion</h3>
        <p className="text-gray-500 text-sm font-medium leading-relaxed mb-10 px-4">
          Are you sure you want to remove <span className="text-[#1a2b4b] font-bold">"{product.name}"</span>? 
          All inventory data and pricing rules for this item will be permanently erased.
        </p>

        <div className="flex flex-col space-y-4">
          <button 
            onClick={onConfirm}
            disabled={isDeleting}
            className="w-full bg-rose-500 text-white font-bold text-sm py-4 rounded-2xl hover:bg-rose-600 transition-all shadow-xl shadow-rose-200 active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Deleting Item...</span>
              </>
            ) : (
              <span>Confirm & Delete</span>
            )}
          </button>
          <button 
            onClick={onClose}
            disabled={isDeleting}
            className="w-full text-gray-400 font-bold text-xs uppercase tracking-widest py-2 hover:text-[#1a2b4b] transition-colors active:scale-95"
          >
            Cancel Action
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteProductModal;
