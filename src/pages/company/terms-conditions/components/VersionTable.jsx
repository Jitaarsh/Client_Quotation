import React from 'react';
import { Eye, Edit3, Trash2, CheckCircle2, Loader2, FileText } from 'lucide-react';

const VersionTable = ({ terms, isLoading, onView, onEdit, onDelete, onSetActive, isSettingActive }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-[#145be9] animate-spin" />
      </div>
    );
  }

  if (!terms || terms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center">
          <FileText className="w-8 h-8 text-blue-300" />
        </div>
        <p className="text-gray-400 font-bold text-sm">No T&amp;C versions yet.</p>
        <p className="text-gray-300 text-xs font-medium">Click &quot;Add New Version&quot; to get started.</p>
      </div>
    );
  }

  const statusConfig = {
    active:   { dot: 'bg-emerald-500 animate-pulse', text: 'text-emerald-600', label: 'Active'   },
    draft:    { dot: 'bg-amber-400',                 text: 'text-amber-600',   label: 'Draft'    },
    archived: { dot: 'bg-gray-300',                  text: 'text-gray-400',    label: 'Archived' },
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-50">
            {['Version Info', 'Status', 'Created By', 'Date', 'Actions'].map((h, i) => (
              <th
                key={h}
                className={`px-8 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest ${i === 4 ? 'text-right' : ''}`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50/50">
          {terms.map((ver) => {
            const sc = statusConfig[ver.status] || statusConfig.draft;
            return (
              <tr
                key={ver._id}
                onClick={() => onView(ver)}
                className="group hover:bg-[#f8faff] transition-colors cursor-pointer"
              >
                {/* Version Info */}
                <td className="px-8 py-5">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                      ver.status === 'active' ? 'bg-blue-50' : 'bg-gray-50'
                    } group-hover:bg-white`}>
                      <FileText className={`w-5 h-5 ${ver.status === 'active' ? 'text-[#145be9]' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[#1a2b4b] font-bold text-sm">{ver.versionLabel}</span>
                        {ver.isDefault && (
                          <span className="bg-blue-100 text-[#145be9] text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">
                            Default
                          </span>
                        )}
                        {ver.isReadOnly && (
                          <span className="bg-gray-100 text-gray-500 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">
                            Read-Only
                          </span>
                        )}
                      </div>
                      <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                        {ver.versionId}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Status */}
                <td className="px-8 py-5">
                  <div className="inline-flex items-center space-x-1.5">
                    <span className={`w-2 h-2 rounded-full ${sc.dot}`} />
                    <span className={`text-[13px] font-bold ${sc.text}`}>{sc.label}</span>
                  </div>
                </td>

                {/* Created By */}
                <td className="px-8 py-5">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-[10px] font-bold text-[#145be9]">
                      {(ver.createdBy?.ownerName || 'U').charAt(0).toUpperCase()}
                    </div>
                    <span className="text-gray-600 text-sm font-semibold">
                      {ver.createdBy?.ownerName || 'You'}
                    </span>
                  </div>
                </td>

                {/* Date */}
                <td className="px-8 py-5 text-gray-500 text-sm font-medium whitespace-nowrap">
                  {new Date(ver.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })}
                </td>

                {/* Actions */}
                <td className="px-8 py-5 text-right">
                  <div
                    className="flex items-center justify-end space-x-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Set Active */}
                    {ver.status !== 'active' && (
                      <button
                        onClick={() => onSetActive(ver)}
                        disabled={isSettingActive}
                        className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                        title="Set as Active"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onView(ver)}
                      className="p-2 text-gray-400 hover:text-[#145be9] hover:bg-blue-50 rounded-lg transition-all"
                      title="Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {!ver.isReadOnly && (
                      <button
                        onClick={() => onEdit(ver)}
                        className="p-2 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all"
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(ver)}
                      className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default VersionTable;
