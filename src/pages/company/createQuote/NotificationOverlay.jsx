import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X, Loader2 } from 'lucide-react';

const NotificationOverlay = ({ isOpen, onClose, type = 'success', title, message, isLoading = false }) => {
  useEffect(() => {
    if (isOpen && !isLoading && type === 'success') {
      const timer = setTimeout(() => {
        onClose();
      }, 5000); // Auto close success after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [isOpen, type, onClose, isLoading]);

  if (!isOpen) return null;

  const isSuccess = type === 'success';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-[#1a2b4b]/20 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className={`w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in-95 slide-in-from-bottom-4 duration-500`}
      >
        <div className={`p-8 text-center relative`}>
          {/* Decorative background elements */}
          <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-20 ${isSuccess ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
          <div className={`absolute -bottom-24 -left-24 w-48 h-48 rounded-full blur-3xl opacity-10 ${isSuccess ? 'bg-blue-500' : 'bg-orange-500'}`}></div>

          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-gray-300 hover:text-gray-500 hover:bg-gray-100 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative z-10 flex flex-col items-center">
            {isLoading ? (
                <div className="w-20 h-20 bg-blue-50 rounded-[2.5rem] flex items-center justify-center mb-6 border border-blue-100/50">
                    <Loader2 className="w-10 h-10 text-[#145be9] animate-spin" />
                </div>
            ) : (
                <div className={`w-20 h-20 ${isSuccess ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'} rounded-[2.5rem] flex items-center justify-center mb-6 border animate-in zoom-in duration-700`}>
                    {isSuccess ? (
                        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                    ) : (
                        <AlertCircle className="w-10 h-10 text-red-500" />
                    )}
                </div>
            )}

            <h3 className="text-2xl font-black text-[#1a2b4b] tracking-tight mb-2">
              {title}
            </h3>
            <p className="text-gray-500 font-medium text-sm leading-relaxed max-w-[280px] mx-auto">
              {message}
            </p>

            {!isLoading && (
                <button 
                onClick={onClose}
                className={`mt-8 w-full py-4 rounded-2xl font-black text-sm tracking-wide transition-all shadow-lg active:scale-95 ${
                    isSuccess 
                    ? 'bg-[#145be9] hover:bg-blue-700 text-white shadow-blue-200' 
                    : 'bg-white border-2 border-red-50 text-red-500 hover:bg-red-50 shadow-none'
                }`}
                >
                {isSuccess ? 'View Quotation' : 'Continue Editing'}
                </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationOverlay;
