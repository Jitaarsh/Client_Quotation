import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { X, Save, Zap, Info, Box, Layers, Globe, ChevronDown, Loader2 } from 'lucide-react';
import automationApi from '../../../../services/automationApi';
import termsApi from '../../../../services/termsApi';

const AddRuleModal = ({ onClose }) => {
  const queryClient = useQueryClient();
  const [error, setError] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    triggerType: 'product_category',
    triggerValue: '',
    tcVersion: '',
    priority: 0,
    status: 'Active'
  });

  // Fetch available T&C versions for selection
  // The API returns { success, count, data: [...] } — extract the array
  const { data: terms = [], isLoading: loadingTerms } = useQuery({
    queryKey: ['terms'],
    queryFn: termsApi.getAllTerms,
    select: (res) => (Array.isArray(res?.data) ? res.data : []),
  });


  const createMutation = useMutation({
    mutationFn: automationApi.createRule,
    onSuccess: () => {
      queryClient.invalidateQueries(['automation-rules']);
      onClose();
    },
    onError: (err) => setError(err.response?.data?.message || 'Failed to create rule')
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.triggerValue || !formData.tcVersion) {
      setError('Please fill in all required fields');
      return;
    }
    createMutation.mutate(formData);
  };

  const triggers = [
    { id: 'product_category', label: 'Product Category', icon: Box, desc: 'Apply based on item category' },
    { id: 'quantity', label: 'Quantity', icon: Layers, desc: 'Apply based on total items' },
    { id: 'region', label: 'Region', icon: Globe, desc: 'Apply based on customer location' }
  ];

  const categories = ["Materials", "Services", "Consulting"];

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0f172a]/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#145be9]" />
            </div>
            <div>
              <h3 className="text-[#1a2b4b] font-black text-lg">New Automation Rule</h3>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Selection logic</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center space-x-3 text-rose-600 animate-shake">
              <Info className="w-5 h-5 flex-shrink-0" />
              <p className="text-xs font-bold">{error}</p>
            </div>
          )}

          {/* Trigger Selection */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">1. Choose Trigger</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {triggers.map((t) => {
                const Icon = t.icon;
                const isSelected = formData.triggerType === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, triggerType: t.id, triggerValue: '' })}
                    className={`flex flex-col items-center p-4 rounded-3xl border-2 transition-all ${
                      isSelected ? 'border-[#145be9] bg-blue-50/50' : 'border-gray-100 hover:border-blue-200'
                    }`}
                  >
                    <Icon className={`w-6 h-6 mb-2 ${isSelected ? 'text-[#145be9]' : 'text-gray-400'}`} />
                    <span className={`text-[11px] font-black uppercase tracking-tight ${isSelected ? 'text-[#145be9]' : 'text-gray-500'}`}>
                      {t.id.split('_').join(' ')}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Condition Value */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">2. Define Condition</label>
            
            {formData.triggerType === 'product_category' ? (
              <div className="relative group">
                <select
                  value={formData.triggerValue}
                  onChange={(e) => setFormData({ ...formData, triggerValue: e.target.value })}
                  className="w-full bg-[#f8fafc] border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold text-[#1a2b4b] appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
                >
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none transition-transform group-hover:translate-y-[-40%]" />
              </div>
            ) : formData.triggerType === 'quantity' ? (
              <div className="relative">
                <label className="absolute left-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Qty ≥</label>
                <input
                  type="number"
                  placeholder="e.g. 50"
                  value={formData.triggerValue}
                  onChange={(e) => setFormData({ ...formData, triggerValue: e.target.value })}
                  className="w-full bg-[#f8fafc] border border-gray-100 rounded-2xl pl-24 pr-5 py-4 text-sm font-bold text-[#1a2b4b] focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            ) : (
              <input
                type="text"
                placeholder="Enter country or state name (e.g. India)"
                value={formData.triggerValue}
                onChange={(e) => setFormData({ ...formData, triggerValue: e.target.value })}
                className="w-full bg-[#f8fafc] border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold text-[#1a2b4b] focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            )}
          </div>

          {/* T&C Version Link */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">3. Apply Version</label>
            <div className="relative group">
              <select
                value={formData.tcVersion}
                onChange={(e) => setFormData({ ...formData, tcVersion: e.target.value })}
                disabled={loadingTerms}
                className="w-full bg-[#f8fafc] border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold text-[#1a2b4b] appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <option value="">Select T&C Version</option>
                {terms.map(t => (
                  <option key={t._id} value={t._id}>{t.versionLabel} ({t.versionId})</option>
                ))}
              </select>
              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            {terms.length === 0 && !loadingTerms && (
              <p className="text-[10px] text-rose-500 font-bold uppercase tracking-widest ml-1">No active versions found. Create one first!</p>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-4 flex items-center space-x-3">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="flex-1 bg-[#145be9] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Create Rule</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-4 rounded-2xl text-gray-400 font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRuleModal;
