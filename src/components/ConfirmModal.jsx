import React from 'react';
import { AlertTriangle, X, Loader2 } from 'lucide-react';

/**
 * ConfirmModal - A premium confirmation dialog
 * @param {Object} props
 * @param {boolean} props.show - Whether the modal is visible
 * @param {string} props.title - Modal title
 * @param {string} props.message - Descriptive message
 * @param {string} props.confirmText - Label for the action button
 * @param {Function} props.onConfirm - Action when confirmed
 * @param {Function} props.onCancel - Action when cancelled
 * @param {boolean} props.isLoading - Whether the action is in progress
 */
const ConfirmModal = ({ 
    show, 
    title = "Are you sure?", 
    message = "This action cannot be undone.", 
    confirmText = "Confirm", 
    onConfirm, 
    onCancel, 
    isLoading = false 
}) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div 
                className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl border border-slate-50 overflow-hidden animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header/Banner */}
                <div className="h-24 bg-red-50 flex items-center justify-center relative">
                    <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-red-500">
                        <AlertTriangle className="w-8 h-8" />
                    </div>
                    <button 
                        onClick={onCancel}
                        disabled={isLoading}
                        className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-xl transition-all disabled:opacity-50"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 text-center">
                    <h3 className="text-xl font-black text-[#1a2b4b] mb-3">{title}</h3>
                    <p className="text-slate-500 font-medium leading-relaxed mb-8">
                        {message}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-3">
                        <button
                            onClick={onCancel}
                            disabled={isLoading}
                            className="w-full sm:flex-1 py-4 px-6 rounded-2xl border border-slate-200 text-slate-500 font-bold hover:bg-slate-50 transition-all disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className="w-full sm:flex-1 py-4 px-6 rounded-2xl bg-red-500 text-white font-black shadow-xl shadow-red-500/20 hover:bg-red-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                confirmText
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Backdrop click to cancel */}
            <div className="fixed inset-0 z-[-1]" onClick={onCancel} />
        </div>
    );
};

export default ConfirmModal;
