import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Sparkles, ArrowRight, Zap, Target, Box, Layers, Globe, Trash2, Plus, Loader2, AlertCircle } from 'lucide-react';
import automationApi from '../../../../services/automationApi';
import AddRuleModal from './AddRuleModal';
import DeleteRuleModal from './DeleteRuleModal';
import LogicExplanationModal from './LogicExplanationModal';

const AutomationSetup = () => {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, ruleId: null, ruleName: '' });
  const [logicModal, setLogicModal] = useState({ isOpen: false, rule: null });


  // Fetch Rules
  const { data: rules = [], isLoading, isError } = useQuery({
    queryKey: ['automation-rules'],
    queryFn: automationApi.getRules
  });

  // Delete Rule
  const deleteMutation = useMutation({
    mutationFn: automationApi.deleteRule,
    onSuccess: () => {
      queryClient.invalidateQueries(['automation-rules']);
      setDeleteModal({ isOpen: false, ruleId: null, ruleName: '' });
    }
  });

  const handleDeleteClick = (id, triggerType, triggerValue) => {
    const formattedName = `${triggerType.split('_').join(' ').toUpperCase()}: ${triggerValue}`;
    setDeleteModal({
      isOpen: true,
      ruleId: id,
      ruleName: formattedName
    });
  };

  const confirmDelete = () => {
    if (deleteModal.ruleId) {
      deleteMutation.mutate(deleteModal.ruleId);
    }
  };


  const getIcon = (trigger) => {
    switch (trigger) {
      case 'product_category': return Box;
      case 'quantity': return Layers;
      default: return Globe;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="w-10 h-10 text-[#145be9] animate-spin" />
        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Gathering Rules...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Feature Intro */}
      <div className="mb-8 lg:mb-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 p-6 sm:p-8 rounded-[2rem] border border-blue-100/50">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-[#145be9]" />
            <h3 className="text-[#1a2b4b] font-black text-lg">Smart T&C Application</h3>
          </div>
          <p className="text-gray-500 text-sm font-medium leading-relaxed max-w-2xl">
            Automatically link specific Terms & Conditions to quotations based on product types, quantities, or customer regions. This reduces manual errors and ensures legal compliance.
          </p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="whitespace-nowrap flex items-center justify-center space-x-2 bg-[#145be9] text-white px-6 py-3.5 rounded-xl font-bold hover:scale-[1.02] transition-all active:scale-95 group sm:w-auto shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
          <span>New Automation Rule</span>
        </button>
      </div>

      {isError && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center space-x-3 text-rose-600">
          <AlertCircle className="w-5 h-5" />
          <p className="text-xs font-bold">Failed to load rules. Please refresh the page.</p>
        </div>
      )}

      {/* Rules Grid */}
      <div className="space-y-4">
        {/* Header - Hidden on Mobile */}
        <div className="hidden lg:flex items-center px-8 py-3 bg-[#fcfcfd] rounded-xl border border-gray-100">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest w-[5%]">#</span>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest w-[25%] px-4">Trigger Condition</span>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest w-[10%] text-center">Logic</span>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest w-[30%]">Applied Version</span>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest w-[20%] text-center">Status</span>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest w-[10%] text-right">Action</span>
        </div>

        {rules.map((rule, index) => {
          const Icon = getIcon(rule.triggerType);
          return (
            <div 
              key={rule._id}
              className="relative flex flex-col lg:flex-row lg:items-center px-6 py-6 lg:px-8 bg-white border border-gray-100 rounded-[2rem] lg:rounded-3xl hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all group cursor-pointer space-y-4 lg:space-y-0"
            >
              {/* Rule Counter Badge (Floating on Mobile, Column on Desktop) */}
              <div className="absolute top-6 left-6 lg:static lg:w-[5%] flex items-center">
                <div className="w-6 h-6 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center text-[10px] font-black text-gray-400 group-hover:bg-blue-50 group-hover:border-blue-100 group-hover:text-blue-500 transition-colors">
                  {index + 1}
                </div>
              </div>

              {/* Condition */}
              <div 
                onClick={() => setLogicModal({ isOpen: true, rule })}
                className="w-full lg:w-[25%] flex items-center space-x-4 pl-0 lg:px-4 cursor-pointer hover:opacity-80 transition-opacity active:scale-95 lg:active:scale-100"
              >
                <div className={`w-12 h-12 lg:w-10 lg:h-10 rounded-2xl flex items-center justify-center transition-colors flex-shrink-0 ${
                  rule.status === 'Active' ? 'bg-indigo-50 text-indigo-500' : 'bg-gray-100 text-gray-400'
                }`}>
                  <Icon className="w-5 h-5 lg:w-4 lg:h-4" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-[#1a2b4b] font-bold text-sm lg:text-[13px] tracking-tight truncate">
                    {rule.triggerType.split('_').join(' ').toUpperCase()}
                  </p>
                  <div className="flex items-center space-x-1">
                    <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">Match:</span>
                    <p className="text-gray-400 text-[11px] font-semibold uppercase tracking-wider truncate">
                      {rule.triggerType === 'quantity' ? `QTY ≥ ${rule.triggerValue}` : rule.triggerValue}
                    </p>
                  </div>
                </div>
              </div>

              {/* Logic Icon */}
              <div className="hidden lg:flex w-[10%] justify-center">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setLogicModal({ isOpen: true, rule });
                  }}
                  className="w-9 h-9 bg-blue-50/50 rounded-full flex items-center justify-center hover:bg-blue-100 transition-colors group/arrow outline-none"
                >
                  <ArrowRight className="w-4 h-4 text-[#145be9] group-hover/arrow:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Version Result */}
              <div className="w-full lg:w-[30%] flex flex-col lg:flex-row lg:items-center lg:space-x-3">
                <label className="lg:hidden text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Applied Version</label>
                <div className="flex items-center space-x-2 bg-blue-50/30 lg:bg-transparent p-3 lg:p-0 rounded-xl overflow-hidden">
                  <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                  <span className="text-[#1a2b4b] font-black text-sm lg:text-[13px] truncate">
                    {rule.tcVersion?.versionLabel || 'Version Deleted'}
                    <span className="text-gray-400 ml-2 font-medium">({rule.tcVersion?.versionId || '???'})</span>
                  </span>
                </div>
              </div>

              {/* Status & Actions Container for Mobile */}
              <div className="flex items-center justify-between w-full lg:w-auto lg:flex-1">
                 {/* Status */}
                <div className="lg:w-[60%] lg:flex lg:justify-center">
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                    rule.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-gray-50 text-gray-400 border-gray-100'
                  }`}>
                    {rule.status}
                  </div>
                </div>

                {/* Actions */}
                <div className="lg:w-[40%] flex justify-end">
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      handleDeleteClick(rule._id, rule.triggerType, rule.triggerValue); 
                    }}
                    className="p-3 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all active:scale-90"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}


        {/* Empty State / Add Pointer */}
        {rules.length === 0 && (
          <div 
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center py-16 border-2 border-dashed border-gray-100 rounded-[2.5rem] bg-gray-50/30 group hover:border-[#145be9]/30 hover:bg-blue-50/30 transition-all cursor-pointer"
          >
            <div className="flex flex-col items-center space-y-3">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 text-gray-300 group-hover:text-[#145be9] group-hover:scale-110 transition-all">
                <Plus className="w-8 h-8" />
              </div>
              <div className="text-center">
                <p className="text-gray-400 font-bold text-sm uppercase tracking-widest px-4 group-hover:text-[#145be9]">No rules created yet</p>
                <p className="text-gray-300 text-[10px] font-bold uppercase tracking-widest">Click to link your first T&C version</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {showAddModal && <AddRuleModal onClose={() => setShowAddModal(false)} />}
      
      <DeleteRuleModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={confirmDelete}
        isDeleting={deleteMutation.isPending}
        ruleName={deleteModal.ruleName}
      />

      <LogicExplanationModal 
        isOpen={logicModal.isOpen}
        onClose={() => setLogicModal({ isOpen: false, rule: null })}
        rule={logicModal.rule}
      />
    </div>
  );
};

export default AutomationSetup;



