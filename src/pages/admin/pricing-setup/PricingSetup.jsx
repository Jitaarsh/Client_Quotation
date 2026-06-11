import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  Rocket,
  Building2,
  Eye,
  Trash2,
  CheckCircle2,
  ChevronDown,
  Plus,
  Loader2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import adminPlanApi from '../../../services/adminPlanApi';

// ── Icon map: picks an icon based on sort order / index ──────
const PLAN_ICONS = [Sparkles, Rocket, Building2];

// ── Simple toast notification ─────────────────────────────────
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors =
    type === 'error'
      ? 'bg-red-500'
      : type === 'warning'
      ? 'bg-amber-500'
      : 'bg-emerald-500';

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl text-white text-sm font-bold shadow-xl ${colors} animate-in slide-in-from-bottom-4 duration-300`}
    >
      {type === 'error' ? (
        <AlertCircle className="w-4 h-4 shrink-0" />
      ) : (
        <CheckCircle2 className="w-4 h-4 shrink-0" />
      )}
      {message}
    </div>
  );
};

// ── Plan Card Skeleton ────────────────────────────────────────
const PlanSkeleton = () => (
  <div className="bg-white p-5 lg:p-6 rounded-2xl border border-gray-100 shadow-sm animate-pulse">
    <div className="flex items-center gap-6">
      <div className="w-14 h-14 rounded-xl bg-gray-100 shrink-0" />
      <div className="flex-1">
        <div className="h-4 bg-gray-100 rounded w-24 mb-3" />
        <div className="h-6 bg-gray-100 rounded w-16" />
      </div>
      <div className="flex gap-2 ml-auto">
        <div className="w-8 h-8 bg-gray-100 rounded-lg" />
        <div className="w-8 h-8 bg-gray-100 rounded-lg" />
      </div>
    </div>
  </div>
);

// ── Default form state ────────────────────────────────────────
const DEFAULT_FORM = {
  name: '',
  currency: 'USD',
  billingCycle: 'monthly',
  price: '',
  discountPercent: '0',
  shortDescription: '',
  features: ['', ''],
};

const PricingSetup = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [newFeature, setNewFeature] = useState('');

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // ── Fetch Plans ───────────────────────────────────────────
  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminPlanApi.getAllPlans();
      setPlans(res.data || []);
    } catch (err) {
      showToast(
        err?.response?.data?.message || 'Failed to load plans',
        'error'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  // ── Delete Plan ───────────────────────────────────────────
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete plan "${name}"? This cannot be undone.`)) return;
    try {
      await adminPlanApi.deletePlan(id);
      setPlans((prev) => prev.filter((p) => p._id !== id));
      showToast(`Plan "${name}" deleted`);
    } catch (err) {
      showToast(
        err?.response?.data?.message || 'Failed to delete plan',
        'error'
      );
    }
  };

  // ── Toggle Plan Status ────────────────────────────────────
  const handleToggle = async (id) => {
    try {
      const res = await adminPlanApi.togglePlanStatus(id);
      setPlans((prev) =>
        prev.map((p) => (p._id === id ? res.data : p))
      );
      showToast(res.message);
    } catch (err) {
      showToast(
        err?.response?.data?.message || 'Failed to toggle status',
        'error'
      );
    }
  };

  // ── Form Handlers ─────────────────────────────────────────
  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setForm((prev) => ({
        ...prev,
        features: [...prev.features.filter(Boolean), newFeature.trim()],
      }));
      setNewFeature('');
    }
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      showToast('Plan name is required', 'error');
      return;
    }
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 0) {
      showToast('Please enter a valid price', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        shortDescription: form.shortDescription.trim(),
        currency: form.currency,
        billingCycle: form.billingCycle,
        price: parseFloat(form.price),
        discountPercent: parseFloat(form.discountPercent) || 0,
        features: form.features.filter(Boolean),
        sortOrder: plans.length,
      };

      const res = await adminPlanApi.createPlan(payload);
      setPlans((prev) => [...prev, res.data]);
      setForm(DEFAULT_FORM);
      setNewFeature('');
      showToast(`Plan "${res.data.name}" created successfully!`);
    } catch (err) {
      showToast(
        err?.response?.data?.message || 'Failed to create plan',
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ── Computed: estimated total ─────────────────────────────
  const computedTotal = () => {
    const p = parseFloat(form.price) || 0;
    const d = parseFloat(form.discountPercent) || 0;
    return (p * (1 - d / 100)).toFixed(2);
  };

  return (
    <div className="p-4 lg:p-8 bg-[#f8fafc] min-h-full">
      <div className="w-full flex flex-col lg:flex-row gap-8 items-stretch">

        {/* ── Left Column: Active Tiers ── */}
        <div className="flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-[#1a2b4b]">Active Tiers</h1>
              <p className="text-gray-500 mt-1">Configure and manage your global product offerings.</p>
            </div>
            <button className="px-5 py-2.5 bg-blue-50 text-[#145be9] font-bold rounded-xl text-sm hover:bg-blue-100 transition-colors">
              Export PDF
            </button>
          </div>

          <div className="flex flex-col gap-4 flex-1">
            {/* Loading Skeletons */}
            {loading && (
              <>
                <PlanSkeleton />
                <PlanSkeleton />
                <PlanSkeleton />
              </>
            )}

            {/* Empty State */}
            {!loading && plans.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-[#145be9] mb-4">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-[#1a2b4b] mb-2">No plans yet</h3>
                <p className="text-gray-500 text-sm">Create your first pricing tier using the form on the right.</p>
              </div>
            )}

            {/* Plan Cards */}
            {!loading && plans.map((plan, idx) => {
              const Icon = PLAN_ICONS[idx % PLAN_ICONS.length];
              const isPopular = idx === 1;
              return (
                <div
                  key={plan._id}
                  className={`bg-white p-5 lg:p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 group transition-colors relative ${
                    isPopular
                      ? 'border-2 border-[#145be9] shadow-md'
                      : 'border border-gray-100 hover:border-[#145be9]/30'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 right-4 lg:right-6 bg-[#145be9] text-white text-[9px] lg:text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      Popular Choice
                    </div>
                  )}

                  <div className="flex items-center gap-4 lg:gap-6">
                    <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-xl flex items-center justify-center shrink-0 ${isPopular ? 'bg-blue-100 text-[#145be9]' : 'bg-blue-50 text-[#145be9]'}`}>
                      <Icon className="w-5 h-5 lg:w-6 lg:h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg lg:text-xl font-bold text-[#1a2b4b]">{plan.name}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-xl lg:text-2xl font-black text-[#1a2b4b]">
                          {plan.currency === 'USD' ? '$' : plan.currency === 'EUR' ? '€' : plan.currency === 'GBP' ? '£' : '₹'}
                          {plan.discountedPrice ?? plan.price}
                        </span>
                        <span className="text-gray-400 font-medium text-sm">/{plan.billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                        <button
                          onClick={() => handleToggle(plan._id)}
                          title="Click to toggle active status"
                          className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                            plan.isActive
                              ? 'bg-teal-100 text-teal-600 hover:bg-teal-200'
                              : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                          }`}
                        >
                          {plan.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </div>
                      {plan.shortDescription && (
                        <p className="text-xs text-gray-500 mt-1 max-w-xs">{plan.shortDescription}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-row items-center justify-between sm:justify-start gap-4 lg:gap-8 border-t sm:border-t-0 pt-4 sm:pt-0">
                    {plan.features.length > 0 && (
                      <div className="grid grid-cols-1 gap-x-6 gap-y-1">
                        {plan.features.slice(0, 2).map((feat, fi) => (
                          <div key={fi} className="flex items-center gap-2 text-xs lg:text-sm text-gray-600 font-medium">
                            <CheckCircle2 className={`w-3.5 h-3.5 ${isPopular ? 'text-[#145be9]' : 'text-gray-400'}`} />
                            <span className="whitespace-nowrap">{feat}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-1 lg:gap-2">
                      <button
                        onClick={() => handleToggle(plan._id)}
                        className="p-2 text-gray-400 hover:text-[#145be9] transition-colors"
                        title={plan.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {plan.isActive
                          ? <ToggleRight className="w-5 h-5 text-[#145be9]" />
                          : <ToggleLeft className="w-5 h-5" />
                        }
                      </button>
                      <button
                        onClick={() => handleDelete(plan._id, plan.name)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete plan"
                      >
                        <Trash2 className="w-4 h-4 lg:w-5 lg:h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Insights Row — only shown when plans exist */}
            {!loading && plans.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-auto pt-4">
                <div className="bg-[#0b5cd5] p-5 lg:p-6 rounded-2xl text-white relative overflow-hidden">
                  <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                  <p className="text-[10px] font-bold text-white/80 uppercase tracking-widest mb-2">Active Plans</p>
                  <h3 className="text-3xl lg:text-4xl font-black mb-4">{plans.filter(p => p.isActive).length}</h3>
                  <p className="text-[11px] lg:text-xs text-white/90 leading-relaxed font-medium">
                    {plans.filter(p => p.isActive).length} of {plans.length} total plans are currently active.
                  </p>
                </div>
                <div className="bg-[#e0eafb] p-5 lg:p-6 rounded-2xl">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Price Range</p>
                  <h3 className="text-xl lg:text-2xl font-black text-[#1a2b4b] mb-3">
                    ${Math.min(...plans.map(p => p.price))} — ${Math.max(...plans.map(p => p.price))}
                  </h3>
                  <p className="text-xs lg:text-sm text-gray-600 font-medium leading-relaxed">
                    Across all {plans.length} configured subscription tiers.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Right Column: Create New Plan ── */}
        <div className="w-full lg:w-[400px] xl:w-[450px] relative">
          <div className="lg:absolute lg:inset-0 bg-white rounded-3xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
            <div className="p-8 border-b border-gray-50 shrink-0">
              <h2 className="text-2xl font-bold text-[#1a2b4b]">Create New Plan</h2>
              <p className="text-sm text-gray-500 mt-2">Draft a new subscription tier for your ledger.</p>
            </div>

            <div className="p-8 overflow-y-auto flex-1 custom-scrollbar space-y-6">

              {/* Plan Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Plan Name</label>
                <input
                  type="text"
                  placeholder="e.g. Agency Pro"
                  value={form.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  className="w-full bg-[#f1f5f9] border border-transparent rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 focus:outline-none focus:border-[#145be9]/30 focus:bg-white transition-colors placeholder:font-normal placeholder:text-gray-400"
                />
              </div>

              {/* Currency + Billing */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Currency</label>
                  <div className="relative">
                    <select
                      value={form.currency}
                      onChange={(e) => handleFormChange('currency', e.target.value)}
                      className="w-full bg-[#f1f5f9] border border-transparent rounded-xl px-4 py-3 text-sm font-bold text-[#1a2b4b] appearance-none focus:outline-none focus:border-[#145be9]/30 focus:bg-white transition-colors cursor-pointer"
                    >
                      <option value="USD">($) USD</option>
                      <option value="EUR">(€) EUR</option>
                      <option value="GBP">(£) GBP</option>
                      <option value="INR">(₹) INR</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Billing</label>
                  <div className="relative">
                    <select
                      value={form.billingCycle}
                      onChange={(e) => handleFormChange('billingCycle', e.target.value)}
                      className="w-full bg-[#f1f5f9] border border-transparent rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 appearance-none focus:outline-none focus:border-[#145be9]/30 focus:bg-white transition-colors cursor-pointer"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Base Price + Discount */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Base Price</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0.00"
                    value={form.price}
                    onChange={(e) => handleFormChange('price', e.target.value)}
                    className="w-full bg-[#f1f5f9] border border-transparent rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 focus:outline-none focus:border-[#145be9]/30 focus:bg-white transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Discount</label>
                  <div className="relative">
                    <select
                      value={form.discountPercent}
                      onChange={(e) => handleFormChange('discountPercent', e.target.value)}
                      className="w-full bg-[#f1f5f9] border border-transparent rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 appearance-none focus:outline-none focus:border-[#145be9]/30 focus:bg-white transition-colors cursor-pointer"
                    >
                      <option value="0">0%</option>
                      <option value="10">10%</option>
                      <option value="15">15%</option>
                      <option value="20">20%</option>
                      <option value="25">25%</option>
                      <option value="30">30%</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Total Amount (computed) */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total Amount</label>
                <input
                  type="text"
                  readOnly
                  value={form.price ? computedTotal() : ''}
                  placeholder="Calculated automatically"
                  className="w-full bg-[#f1f5f9] border border-transparent rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 focus:outline-none cursor-not-allowed opacity-80"
                />
                <p className="text-[9px] text-gray-400 font-bold">*After discount applied</p>
              </div>

              {/* Short Description */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Short Description</label>
                <textarea
                  rows="3"
                  placeholder="Briefly explain the plan's focus..."
                  value={form.shortDescription}
                  onChange={(e) => handleFormChange('shortDescription', e.target.value)}
                  className="w-full bg-[#f1f5f9] border border-transparent rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 focus:outline-none focus:border-[#145be9]/30 focus:bg-white transition-colors resize-none placeholder:font-normal placeholder:text-gray-400"
                />
              </div>

              {/* Benefits & Limits */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Benefits & Limits</label>
                </div>
                <div className="space-y-2">
                  {form.features.filter(Boolean).map((feat, fi) => (
                    <div key={fi} className="flex items-center bg-[#f1f5f9] rounded-xl px-4 py-3">
                      <CheckCircle2 className="w-4 h-4 text-[#145be9] mr-3 shrink-0" />
                      <span className="text-sm font-semibold text-gray-700 flex-1">{feat}</span>
                      <button
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            features: prev.features.filter((_, i) => i !== fi),
                          }))
                        }
                        className="text-gray-300 hover:text-red-400 transition-colors ml-2 text-xs font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <div className="flex items-center bg-white border border-gray-200 border-dashed rounded-xl px-4 py-3 gap-3">
                    <input
                      type="text"
                      placeholder="Add a benefit..."
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddFeature()}
                      className="w-full bg-transparent text-sm font-semibold text-gray-700 focus:outline-none placeholder:font-normal placeholder:text-gray-400"
                    />
                    <button
                      onClick={handleAddFeature}
                      className="text-[#145be9] hover:text-blue-700 shrink-0"
                      title="Add benefit"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-8 border-t border-gray-50 shrink-0 space-y-3 bg-white">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full py-3.5 bg-[#0b5cd5] text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving Plan...
                  </>
                ) : (
                  'Add Plan'
                )}
              </button>
              <button
                onClick={() => { setForm(DEFAULT_FORM); setNewFeature(''); }}
                disabled={submitting}
                className="w-full py-3.5 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Clear Form
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
      `}} />
    </div>
  );
};

export default PricingSetup;
