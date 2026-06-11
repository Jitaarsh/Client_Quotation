import React from 'react';
import { X, Zap, ArrowRight, FileText, Info } from 'lucide-react';

const LogicExplanationModal = ({ isOpen, onClose, rule }) => {
  if (!isOpen || !rule) return null;

  const getTriggerText = () => {
    switch (rule.triggerType) {
      case 'product_category':
        return `any product in the category "${rule.triggerValue}"`;
      case 'quantity':
        return `the total items in the quotation are ${rule.triggerValue} or more`;
      case 'region':
        return `the customer's location is in "${rule.triggerValue}"`;
      default:
        return rule.triggerValue;
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0f172a]/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#145be9]" />
            </div>
            <div>
              <h3 className="text-[#1a2b4b] font-black text-lg">Automation Logic</h3>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Rule Explanation</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="bg-[#f8fafc] rounded-3xl p-6 border border-gray-100 italic text-[#1a2b4b]/80 font-medium leading-relaxed">
            "If <span className="text-[#145be9] font-black">{getTriggerText()}</span>, then automatically apply the <span className="text-indigo-600 font-black">{rule.tcVersion?.versionLabel}</span> version."
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-[10px] font-black text-[#145be9]">IF</span>
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Trigger Condition</p>
                <p className="text-[#1a2b4b] font-bold text-sm">{rule.triggerType.replace('_', ' ').toUpperCase()}: {rule.triggerValue}</p>
              </div>
            </div>

            <div className="flex justify-center py-2">
              <ArrowRight className="w-5 h-5 text-gray-200" />
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-[10px] font-black text-indigo-600">THEN</span>
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Applied Action</p>
                <p className="text-[#1a2b4b] font-bold text-sm">Attach Content from {rule.tcVersion?.versionLabel} ({rule.tcVersion?.versionId})</p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400">
             <div className="flex items-center space-x-2">
                <Info className="w-4 h-4" />
                <span>Priority Level: {rule.priority || 0}</span>
             </div>
             <span>Status: <span className={rule.status === 'Active' ? 'text-emerald-500' : 'text-rose-400'}>{rule.status}</span></span>
          </div>
        </div>

        <div className="p-8 pt-0">
          <button
            onClick={onClose}
            className="w-full bg-[#1a2b4b] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#0f172a] transition-all"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogicExplanationModal;
