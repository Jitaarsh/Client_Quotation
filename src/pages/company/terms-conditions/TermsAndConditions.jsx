import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, History, FileText, AlertCircle, Loader2 } from 'lucide-react';
import termsApi from '../../../services/termsApi';

import VersionTable from './components/VersionTable';
import AutomationSetup from './components/AutomationSetup';
import AddVersionModal from './components/AddVersionModal';
import EditVersionModal from './components/EditVersionModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import ViewVersionModal from './components/ViewVersionModal';

const TermsAndConditions = () => {
  const [activeTab, setActiveTab] = useState('versions');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);

  const queryClient = useQueryClient();

  // ── Fetch all versions ──────────────────────────────────────
  const { data: response, isLoading } = useQuery({
    queryKey: ['terms'],
    queryFn: termsApi.getAllTerms,
  });

  const terms = response?.data || [];
  const activeVersion = terms.find((t) => t.status === 'active');

  // ── Delete mutation ──────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: termsApi.deleteTerms,
    onSuccess: () => {
      queryClient.invalidateQueries(['terms']);
      setDeleteTarget(null);
    },
    onError: (err) => alert(err.response?.data?.message || 'Delete failed'),
  });

  // ── Set Active mutation ──────────────────────────────────────
  const setActiveMutation = useMutation({
    mutationFn: termsApi.setActiveTerms,
    onSuccess: () => queryClient.invalidateQueries(['terms']),
    onError: (err) => alert(err.response?.data?.message || 'Action failed'),
  });

  return (
    <div className="p-4 lg:p-8 min-h-screen bg-[#fcfcfd]">
      {/* Modals */}
      {isAddModalOpen && (
        <AddVersionModal onClose={() => setIsAddModalOpen(false)} />
      )}
      {editTarget && (
        <EditVersionModal terms={editTarget} onClose={() => setEditTarget(null)} />
      )}
      {viewTarget && (
        <ViewVersionModal terms={viewTarget} onClose={() => setViewTarget(null)} />
      )}
      {deleteTarget && (
        <DeleteConfirmModal
          terms={deleteTarget}
          isDeleting={deleteMutation.isPending}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => deleteMutation.mutate(deleteTarget._id)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>

          <h1 className="text-[2rem] font-black tracking-tight text-[#1a2b4b]">Terms &amp; Conditions</h1>
          <p className="text-gray-500 text-sm font-medium mt-1">
            Manage quotation legal terms, versions, and automated application rules.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#0557cc] hover:bg-[#0449ad] shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          <span>Add New Version</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon={<History className="w-6 h-6 text-[#145be9]" />}
          iconBg="bg-blue-50"
          label="Total Versions"
          value={isLoading ? '—' : terms.length}
        />
        <StatCard
          icon={<FileText className="w-6 h-6 text-emerald-500" />}
          iconBg="bg-emerald-50"
          label="Active Version"
          value={isLoading ? '—' : activeVersion ? activeVersion.versionId : 'None'}
        />
        <StatCard
          icon={<AlertCircle className="w-6 h-6 text-amber-500" />}
          iconBg="bg-amber-50"
          label="Draft Versions"
          value={isLoading ? '—' : terms.filter((t) => t.status === 'draft').length}
        />
      </div>

      {/* Main Card */}
      <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm shadow-blue-500/5">
        {/* Tabs */}
        <div className="flex border-b border-gray-50 px-8 pt-6">
          {['versions', 'automation'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-4 text-sm font-bold transition-all relative capitalize ${
                activeTab === tab ? 'text-[#145be9]' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab === 'versions' ? 'Version History' : 'Automation Setup'}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#145be9] rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'versions' ? (
          <VersionTable
            terms={terms}
            isLoading={isLoading}
            onView={setViewTarget}
            onEdit={setEditTarget}
            onDelete={setDeleteTarget}
            onSetActive={(t) => setActiveMutation.mutate(t._id)}
            isSettingActive={setActiveMutation.isPending}
          />
        ) : (
          <AutomationSetup />
        )}
      </div>
    </div>
  );
};

// ── Reusable Stat Card ───────────────────────────────────────────
const StatCard = ({ icon, iconBg, label, value }) => (
  <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm shadow-blue-500/5">
    <div className="flex items-center space-x-4">
      <div className={`w-12 h-12 ${iconBg} rounded-2xl flex items-center justify-center`}>{icon}</div>
      <div>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">{label}</p>
        <h3 className="text-[#1a2b4b] text-2xl font-black">{value}</h3>
      </div>
    </div>
  </div>
);

export default TermsAndConditions;
