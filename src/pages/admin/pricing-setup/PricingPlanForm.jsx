import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  CheckCircle2,
  ChevronDown,
  Plus,
  Loader2,
} from 'lucide-react';
import adminPlanApi from '../../../services/adminPlanApi';

const limitationFields = [
  { key: 'numberOfQuotations', label: 'Number of Quotations' },
  { key: 'numberOfTemplates', label: 'Number of Templates' },
];

const createDefaultForm = () => ({
  name: '',
  currency: 'USD',
  billingCycle: 'monthly',
  price: '',
  discountPercent: '0',
  shortDescription: '',
  features: [],
  limitations: {
    numberOfQuotations: '',
    numberOfTemplates: '',
  },
  permissions: {
    emailSupport: false,
    pdfExport: false,
    advancedPdfExport: false,
    customBranding: false,
    apiAccess: false,
    prioritySupport: false,
  },
});

const formatPermissionLabel = (key) =>
  key.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/^./, (char) => char.toUpperCase());

const PricingPlanForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [form, setForm] = useState(createDefaultForm());
  const [newFeature, setNewFeature] = useState('');
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const loadPlans = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminPlanApi.getAllPlans();
      setPlans(res.data || []);
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to load plans', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  const populateFormFromPlan = (plan) => {
    if (!plan) return;
    setForm({
      name: plan.name || '',
      currency: plan.currency || 'USD',
      billingCycle: plan.billingCycle || 'monthly',
      price: plan.price ?? '',
      discountPercent: plan.discountPercent ?? '0',
      shortDescription: plan.shortDescription || '',
      features: Array.isArray(plan.features) ? plan.features : [],
      limitations: {
        numberOfQuotations: '',
        numberOfTemplates: '',
        ...(plan.limitations || {}),
      },
      permissions: {
        emailSupport: false,
        pdfExport: false,
        advancedPdfExport: false,
        customBranding: false,
        apiAccess: false,
        prioritySupport: false,
        ...(plan.permissions || {}),
      },
    });
  };

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  useEffect(() => {
    if (!isEditing) return;
    const plan = plans.find((item) => item._id === id);
    if (plan) {
      populateFormFromPlan(plan);
      return;
    }

    const fetchPlan = async () => {
      try {
        setLoading(true);
        const res = await adminPlanApi.getAllPlans();
        const found = (res.data || []).find((item) => item._id === id);
        if (found) {
          populateFormFromPlan(found);
        } else {
          showToast('Plan not found', 'error');
          navigate('/admin/dashboard/pricing-setup');
        }
      } catch (err) {
        showToast(err?.response?.data?.message || 'Failed to load plan', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (!plans.length) {
      fetchPlan();
    }
  }, [id, isEditing, plans, navigate]);

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFeatureChange = (index, value) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features.map((feature, featureIndex) =>
        featureIndex === index ? value : feature
      ),
    }));
  };

  const handleRemoveFeature = (index) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features.filter((_, featureIndex) => featureIndex !== index),
    }));
  };

  const handleLimitationChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      limitations: {
        ...prev.limitations,
        [key]: value,
      },
    }));
  };

  const handlePermissionToggle = (key) => {
    setForm((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [key]: !prev.permissions[key],
      },
    }));
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setForm((prev) => ({
        ...prev,
        features: [...prev.features, newFeature.trim()].filter(Boolean),
      }));
      setNewFeature('');
    }
  };

  const buildPlanPayload = () => ({
    name: form.name.trim(),
    shortDescription: form.shortDescription.trim(),
    currency: form.currency,
    billingCycle: form.billingCycle,
    price: parseFloat(form.price),
    discountPercent: parseFloat(form.discountPercent) || 0,
    features: form.features.filter(Boolean),
    limitations: Object.entries(form.limitations || {}).reduce((acc, [key, value]) => {
      acc[key] = value === '' ? 0 : Number(value);
      return acc;
    }, {}),
    permissions: Object.entries(form.permissions || {}).reduce((acc, [key, value]) => {
      acc[key] = Boolean(value);
      return acc;
    }, {}),
    sortOrder:
      isEditing
        ? plans.find((item) => item._id === id)?.sortOrder ?? plans.length
        : plans.length,
  });

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
      const payload = buildPlanPayload();
      if (isEditing) {
        await adminPlanApi.updatePlan(id, payload);
        showToast(`Plan "${form.name}" updated successfully!`);
      } else {
        await adminPlanApi.createPlan(payload);
        showToast(`Plan "${form.name}" created successfully!`);
      }
      navigate('/admin/dashboard/pricing-setup');
    } catch (err) {
      showToast(
        err?.response?.data?.message || (isEditing ? 'Failed to update plan' : 'Failed to create plan'),
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const computedTotal = () => {
    const p = parseFloat(form.price) || 0;
    const d = parseFloat(form.discountPercent) || 0;
    return (p * (1 - d / 100)).toFixed(2);
  };

  const handleBack = () => {
    navigate('/admin/dashboard/pricing-setup');
  };

  return (
    <div className="min-h-full p-4 lg:p-8 bg-[#f8fafc]">
      <div className="mx-auto max-w-4xl bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#1a2b4b]">
              {isEditing ? 'Edit Plan' : 'Create New Plan'}
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              {isEditing
                ? 'Update the selected plan and keep your pricing tiers in sync.'
                : 'Draft a new subscription tier for your ledger.'}
            </p>
          </div>
          <button
            onClick={handleBack}
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-gray-50 px-5 py-3 text-sm font-bold text-gray-700 hover:bg-gray-100 transition"
          >
            Back
          </button>
        </div>

        <div className="p-8 space-y-6">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Benefits</label>
            </div>
            <div className="space-y-2">
              {form.features.map((feat, fi) => (
                <div key={fi} className="flex items-center bg-[#f1f5f9] rounded-xl px-4 py-3 gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#145be9] shrink-0" />
                  <input
                    type="text"
                    value={feat}
                    onChange={(e) => handleFeatureChange(fi, e.target.value)}
                    className="w-full bg-transparent text-sm font-semibold text-gray-700 focus:outline-none placeholder:font-normal placeholder:text-gray-400"
                    placeholder="Benefit"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(fi)}
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
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                  className="w-full bg-transparent text-sm font-semibold text-gray-700 focus:outline-none placeholder:font-normal placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={handleAddFeature}
                  className="text-[#145be9] hover:text-blue-700 shrink-0"
                  title="Add benefit"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Limitations</label>
            </div>
            <div className="grid gap-3">
              {limitationFields.map(({ key, label }) => (
                <div key={key} className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</label>
                  <input
                    type="number"
                    min="0"
                    value={form.limitations?.[key] ?? ''}
                    onChange={(e) => handleLimitationChange(key, e.target.value)}
                    className="w-full bg-[#f1f5f9] border border-transparent rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 focus:outline-none focus:border-[#145be9]/30 focus:bg-white transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Permissions</label>
            </div>
            <div className="space-y-2">
              {Object.entries(form.permissions || {}).map(([key, value]) => (
                <label key={key} className="flex items-center justify-between rounded-xl border border-gray-100 bg-[#f8fafc] px-4 py-3">
                  <span className="text-sm font-semibold text-gray-700">{formatPermissionLabel(key)}</span>
                  <button
                    type="button"
                    onClick={() => handlePermissionToggle(key)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? 'bg-[#145be9]' : 'bg-gray-200'}`}
                  >
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${value ? 'translate-x-5' : 'translate-x-1'}`} />
                  </button>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 inline-flex items-center justify-center rounded-xl bg-[#0b5cd5] px-5 py-3.5 text-white font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="ml-2">{isEditing ? 'Updating Plan...' : 'Saving Plan...'}</span>
                </>
              ) : (
                isEditing ? 'Update Plan' : 'Add Plan'
              )}
            </button>
            <button
              type="button"
              onClick={() => setForm(createDefaultForm())}
              disabled={submitting}
              className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-5 py-3.5 text-sm font-bold text-gray-700 hover:bg-gray-100 transition"
            >
              Clear Form
            </button>
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl text-white text-sm font-bold shadow-xl bg-emerald-500 animate-in slide-in-from-bottom-4 duration-300">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default PricingPlanForm;
