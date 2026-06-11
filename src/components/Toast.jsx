import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

/**
 * Toast Notification Component
 * @param {Object} props
 * @param {boolean} props.show - Whether to show the toast
 * @param {'success' | 'error'} props.type - Type of toast
 * @param {string} props.message - Message to display
 * @param {Function} props.onClose - Function to call when toast is closed or auto-dismissed
 */
const Toast = ({ show, type = "success", message, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000); // Auto-dismiss after 4 seconds
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  const isSuccess = type === "success";

  return (
    <div className="fixed top-8 right-8 z-[100] animate-in slide-in-from-right-10 fade-in duration-500">
      <div
        className={`flex items-center gap-4 min-w-[320px] max-w-md p-4 bg-white/80 backdrop-blur-xl border ${
          isSuccess ? "border-emerald-100 shadow-emerald-100/20" : "border-red-100 shadow-red-100/20"
        } shadow-2xl rounded-2xl overflow-hidden group`}
      >
        {/* Progress Bar background tracking */}
        <div className={`absolute bottom-0 left-0 h-1 ${isSuccess ? 'bg-emerald-500' : 'bg-red-500'} animate-out fade-out slide-out-to-left fill-mode-forwards duration-[4000ms] w-full origin-left`}></div>

        <div
          className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
            isSuccess ? "bg-emerald-50 text-emerald-500" : "bg-red-50 text-red-500"
          }`}
        >
          {isSuccess ? (
            <CheckCircle2 className="w-6 h-6" />
          ) : (
            <AlertCircle className="w-6 h-6" />
          )}
        </div>

        <div className="flex-1">
          <p className="text-sm font-bold text-[#1a2b4b]">
            {isSuccess ? "Success" : "Error Occurred"}
          </p>
          <p className="text-[12px] text-slate-500 font-medium leading-snug mt-0.5">
            {message}
          </p>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-300 hover:text-slate-500 transition-all opacity-0 group-hover:opacity-100"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
