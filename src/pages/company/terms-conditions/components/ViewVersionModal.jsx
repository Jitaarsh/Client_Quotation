import React from 'react';
import { X, Eye, CheckCircle2 } from 'lucide-react';

const statusConfig = {
  active:   { dot: 'bg-emerald-500', text: 'text-emerald-600', label: 'Active'   },
  draft:    { dot: 'bg-amber-400',   text: 'text-amber-600',   label: 'Draft'    },
  archived: { dot: 'bg-gray-300',    text: 'text-gray-400',    label: 'Archived' },
};

const ViewVersionModal = ({ terms, onClose }) => {
  const sc = statusConfig[terms.status] || statusConfig.draft;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0f172a]/60 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative bg-white w-full max-w-4xl rounded-[2.5rem] shadow-[0_24px_80px_-10px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col max-h-[90vh]"
        style={{ animation: 'modalIn 0.2s cubic-bezier(0.16,1,0.3,1)' }}
      >
        <style>{`@keyframes modalIn{from{opacity:0;transform:scale(0.96) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}`}</style>

        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-[#fcfcfd] flex-shrink-0">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
              <Eye className="w-6 h-6 text-[#145be9]" />
            </div>
            <div>
              <div className="flex items-center space-x-3 mb-1">
                <h2 className="text-[#1a2b4b] text-xl font-black tracking-tight leading-none">{terms.versionLabel}</h2>
                {terms.isDefault && (
                  <span className="bg-blue-100 text-[#145be9] text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3" /><span>Default</span>
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">{terms.versionId}</span>
                <div className="flex items-center space-x-1.5">
                  <span className={`w-2 h-2 rounded-full ${sc.dot}`} />
                  <span className={`text-xs font-bold ${sc.text}`}>{sc.label}</span>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <style>{`
            .tc-preview ul { list-style: disc; padding-left: 24px; }
            .tc-preview ol { list-style: decimal; padding-left: 24px; }
            .tc-preview h1 { font-size: 1.5rem; font-weight: 800; color: #1a2b4b; margin: 12px 0 8px; }
            .tc-preview h2 { font-size: 1.2rem; font-weight: 700; color: #1a2b4b; margin: 10px 0 6px; }
            .tc-preview blockquote { border-left: 3px solid #145be9; padding: 4px 14px; background: #eff6ff; border-radius: 0 8px 8px 0; margin: 8px 0; font-style: italic; color: #374151; }
            .tc-preview a { color: #145be9; text-decoration: underline; }
            .tc-preview hr { border: none; border-top: 2px solid #e5e7eb; margin: 1rem 0; }
            .tc-preview li::marker { font-weight: inherit; font-style: inherit; }
            .tc-preview li:has(b), .tc-preview li:has(strong) { font-weight: bold; }
            .tc-preview li:has(i), .tc-preview li:has(em) { font-style: italic; }
          `}</style>
          <div
            className="tc-preview text-sm text-[#1a2b4b] leading-relaxed"
            dangerouslySetInnerHTML={{ __html: terms.content }}
          />
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-gray-100 bg-[#fcfcfd] flex items-center justify-between flex-shrink-0">
          <div className="text-xs text-gray-400 font-medium">
            Created {new Date(terms.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            {terms.isReadOnly && ' · Read-Only'}
          </div>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-100 text-gray-600 font-bold text-sm rounded-xl hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewVersionModal;
