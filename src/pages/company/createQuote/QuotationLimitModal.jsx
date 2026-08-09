import React from 'react';
import { AlertCircle, ArrowUpRight, X } from 'lucide-react';

const QuotationLimitModal = ({
  isOpen,
  maxLimit,
  onClose,
  onUpgrade,
  title = 'Quotation Limit Reached',
  message,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-[#1a2b4b]/25 p-4 backdrop-blur-sm animate-in fade-in duration-300 sm:p-6">
      <button
        type="button"
        aria-label="Close quotation limit popup"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white/20 bg-white p-8 text-center shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-500">
        <div className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-red-500 opacity-10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-blue-500 opacity-10 blur-3xl" />

        <button
          type="button"
          onClick={onClose}
          className="absolute right-6 top-6 rounded-xl p-2 text-gray-300 transition-all hover:bg-gray-100 hover:text-gray-500"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative z-10 flex flex-col items-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[2.5rem] border border-red-100 bg-red-50">
            <AlertCircle className="h-10 w-10 text-red-500" />
          </div>
          <h3 className="mb-2 text-2xl font-black tracking-tight text-[#1a2b4b]">
            {title}
          </h3>
          <p className="mx-auto max-w-[310px] text-sm font-medium leading-relaxed text-gray-500">
            {message || `You've used all ${maxLimit} quotations included in your Starter plan. Upgrade to create more.`}
          </p>

          <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-2xl border-2 border-slate-100 bg-white px-5 py-3 text-sm font-black text-slate-500 transition-all hover:bg-slate-50 active:scale-95"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onUpgrade}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#145be9] px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 active:scale-95"
            >
              Upgrade Plan
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationLimitModal;
