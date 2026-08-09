import React, { useState } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Loader2,
  Mail,
  Pencil,
  Phone,
  Search,
  Send,
  Share2,
  Trash2,
  User,
  X,
  XCircle,
  Download,
  Printer,
  LayoutTemplate,
  Check,
} from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import quotationApi from '../../../services/quotationApi';
import useCurrentUser from '../../../hooks/useCurrentUser';
import useAuthStore from '../../../store/authStore';
import Simple from '../quotations/components/Simple';
import DualPageFormat from '../quotations/components/DualPageFormat';
import ThreePageDesign from '../quotations/components/3-PageDesign';
import Complete4PageFormat from '../quotations/components/Complete4-PageFormat';
import Creative3PageDesign from '../quotations/components/3-PageDesign-2';
import MinimalistDesign from '../quotations/components/MinimalistDesign-3-page';
import InstitutionalDesign from '../quotations/components/InstitutionalDesign-4-page';
import ElegantDesign from '../quotations/components/ElegantDesign-simple-page';
import CustomTemplate from '../quotations/components/CustomTemplate';

const currencySymbols = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

const statusStyles = {
  Draft: 'bg-amber-50 text-amber-600 border-amber-100',
  Sent: 'bg-blue-50 text-blue-600 border-blue-100',
  Paid: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  Cancelled: 'bg-rose-50 text-rose-600 border-rose-100',
};

const responseStyles = {
  Pending: 'bg-slate-50 text-slate-500 border-slate-200',
  Accepted: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  Rejected: 'bg-rose-50 text-rose-700 border-rose-100',
};

const getResponseStatus = (quotation) => quotation?.customerResponse?.status || 'Pending';

const getResponseLabel = (status) => {
  if (status === 'Accepted') return 'Accepted by customer';
  if (status === 'Rejected') return 'Rejected by customer';
  return 'Waiting for customer response';
};

const getResponseCopy = (quotation) => {
  const status = getResponseStatus(quotation);
  if (status === 'Accepted') {
    return 'The customer clicked Accept in the quotation email.';
  }
  if (status === 'Rejected') {
    return 'The customer clicked Reject in the quotation email.';
  }
  return 'No accept or reject action has been recorded from the quotation email yet.';
};

const getQuotationAccentColor = (quotation) => {
  if (quotation?.templateSettings?.templateId !== 'custom') return null;
  if (quotation?.templateSettings?.themeColor) return quotation.templateSettings.themeColor;
  const pages = quotation?.templateSettings?.customConfig || [];
  const coverPage = pages.find((p) => p.type === 'cover');
  return coverPage?.config?.accentColor || null;
};

const formatMoney = (amount = 0, currency = 'INR') => {
  const symbol = currencySymbols[currency] || currencySymbols.INR;
  return `${symbol}${Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (value, options) =>
  new Date(value).toLocaleDateString(
    'en-US',
    options || { day: '2-digit', month: 'short', year: 'numeric' }
  );

const QuotationDetailsModal = ({ quotation, onClose }) => {
  if (!quotation) return null;

  const responseStatus = getResponseStatus(quotation);
  const accentColor = getQuotationAccentColor(quotation);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 lg:p-6">
      <div
        className="absolute inset-0 bg-[#0f172a]/45 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />

      <div className="relative z-10 max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-[2rem] bg-[#f8fafc] shadow-[0_30px_90px_rgba(15,23,42,0.28)] animate-in zoom-in-95 fade-in duration-300">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 lg:px-8" style={accentColor ? { backgroundColor: `${accentColor}10` } : undefined}>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg shadow-slate-900/10" style={accentColor ? { backgroundColor: accentColor } : { backgroundColor: '#1a2b4b' }}>
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                Quotation Viewer
              </p>
              <h2 className="text-xl font-black tracking-tight" style={accentColor ? { color: accentColor } : { color: '#1a2b4b' }}>
                  {quotation.quotationNumber}
                </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-400 transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[calc(92vh-84px)] overflow-y-auto p-2 sm:p-4 lg:p-8">
          <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-4">
            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
              <p className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                Customer
              </p>
              <p className="text-lg font-black text-[#1a2b4b]">{quotation.customer?.fullName}</p>
              <p className="mt-1 text-sm font-bold text-slate-500">
                {quotation.customer?.businessName}
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
              <p className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                Created
              </p>
              <p className="text-lg font-black text-[#1a2b4b]">{formatDate(quotation.createdAt)}</p>
              <p className="mt-1 text-sm font-bold text-slate-500">{quotation.currency} billing</p>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
              <p className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                Status
              </p>
              <span
                className={`inline-flex rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wider ${statusStyles[quotation.status] || 'bg-slate-50 text-slate-600 border-slate-100'
                  }`}
              >
                {quotation.status}
              </span>
              <p className="mt-2 text-sm font-bold text-slate-500">
                Customer reply: {responseStatus}
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200 bg-[#1a2b4b] p-5 text-white shadow-xl shadow-slate-900/10">
              <p className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-white/60">
                Total
              </p>
              <p className="text-2xl font-black tracking-tight">
                {formatMoney(quotation.finalTotal, quotation.currency)}
              </p>
              <p className="mt-1 text-sm font-bold text-white/60">Tax included estimate</p>
            </div>
          </div>

          <div className="relative flex flex-col overflow-hidden rounded-[2rem] border border-gray-200/60 bg-white p-4 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.05)] lg:p-12">
            <div className="mb-12 flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1a2b4b] text-2xl font-black tracking-tighter text-white">
                  UQ
                </div>
                <div>
                  <div className="text-2xl font-black leading-none tracking-tight text-[#1a2b4b]">
                    UNICROP
                  </div>
                  <div className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#145be9]">
                    Architecture & Design
                  </div>
                </div>
              </div>

              <div className="text-left lg:text-right">
                <div className="mb-2 text-3xl font-black leading-none text-[#1a2b4b]/10 lg:text-[40px]">
                  QUOTATION
                </div>
                <div className="space-y-1">
                  <div className="flex gap-3 text-[11px] font-bold lg:justify-end">
                    <span className="uppercase tracking-widest text-gray-400">Date:</span>
                    <span className="text-[#1a2b4b]">{formatDate(quotation.createdAt)}</span>
                  </div>
                  <div className="flex gap-3 text-[11px] font-bold lg:justify-end">
                    <span className="uppercase tracking-widest text-gray-400">Reference:</span>
                    <span className="text-[#1a2b4b]">{quotation.quotationNumber}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-12 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-20">
              <div>
                <h4 className="mb-4 flex items-center gap-2 border-b-2 border-blue-50 pb-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#145be9]">
                  <User className="h-3 w-3" />
                  Bill To
                </h4>
                <div className="mb-1 text-xl font-black text-[#1a2b4b]">
                  {quotation.customer?.fullName}
                </div>
                <div className="mb-4 text-sm font-bold text-gray-600">
                  {quotation.customer?.businessName}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-xs font-medium text-gray-500">
                    <Mail className="h-3.5 w-3.5" />
                    {quotation.customer?.email || 'No email available'}
                  </div>
                  {quotation.customer?.phone ? (
                    <div className="flex items-center gap-3 text-xs font-medium text-gray-500">
                      <Phone className="h-3.5 w-3.5" />
                      {quotation.customer.phone}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="text-left lg:text-right">
                <h4 className="mb-4 flex items-center gap-2 border-b-2 border-blue-50 pb-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#145be9] lg:justify-end">
                  Issued From
                  <Building2 className="h-3 w-3" />
                </h4>
                <div className="mb-1 text-sm font-black text-[#1a2b4b]">Corporate Headquarters</div>
                <div className="text-xs font-medium leading-relaxed text-gray-500">
                  123 Architectural Way, Design District
                  <br />
                  Mumbai, MH 400001, India
                </div>
              </div>
            </div>

            <div className="mb-12 overflow-hidden rounded-[1.5rem] border border-slate-100">
              <div className="hidden grid-cols-[1fr_80px_120px_80px_120px] gap-4 border-b-2 border-[#1a2b4b] bg-slate-50 px-4 py-4 md:grid">
                <div className="text-[10px] font-black uppercase tracking-widest text-[#1a2b4b]">
                  Product / Description
                </div>
                <div className="text-center text-[10px] font-black uppercase tracking-widest text-[#1a2b4b]">
                  Qty
                </div>
                <div className="text-right text-[10px] font-black uppercase tracking-widest text-[#1a2b4b]">
                  Unit Price
                </div>
                <div className="text-center text-[10px] font-black uppercase tracking-widest text-[#1a2b4b]">
                  Disc%
                </div>
                <div className="text-right text-[10px] font-black uppercase tracking-widest text-[#1a2b4b]">
                  Total
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {quotation.items?.map((item, idx) => (
                  <div
                    key={`${item.product || item.sku}-${idx}`}
                    className="grid gap-3 px-4 py-5 md:grid-cols-[1fr_80px_120px_80px_120px] md:items-center md:gap-4"
                  >
                    <div>
                      <div className="mb-0.5 text-sm font-black text-[#1a2b4b]">{item.name}</div>
                      <div className="text-[10px] font-bold uppercase tracking-tight text-gray-400">
                        {item.sku}
                      </div>
                    </div>
                    <div className="text-sm font-bold text-gray-700 md:text-center">
                      Qty: {item.qty}
                    </div>
                    <div className="text-sm font-bold text-gray-700 md:text-right">
                      {formatMoney(item.price, quotation.currency)}
                    </div>
                    <div className="text-sm font-bold text-gray-500 md:text-center">
                      {item.discount || 0}%
                    </div>
                    <div className="text-sm font-black text-[#1a2b4b] md:text-right">
                      {formatMoney(item.total, quotation.currency)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end border-t border-gray-100 pt-10">
              <div className="w-full max-w-[320px] space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    Subtotal:
                  </span>
                  <span className="font-black text-[#1a2b4b]">
                    {formatMoney(quotation.subtotal, quotation.currency)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    Discount Total:
                  </span>
                  <span className="font-black text-emerald-500">
                    -{formatMoney(quotation.discountTotal, quotation.currency)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    Tax Estimate:
                  </span>
                  <span className="font-black text-[#1a2b4b]">
                    {formatMoney(quotation.taxTotal, quotation.currency)}
                  </span>
                </div>

                <div className="my-2 h-px bg-[#1a2b4b]/10" />

                <div className="flex items-end justify-between rounded-2xl bg-[#1a2b4b] p-6 text-white shadow-xl shadow-blue-900/10">
                  <div>
                    <div className="mb-1 text-[10px] font-bold uppercase tracking-widest opacity-60">
                      Total Amount Payable
                    </div>
                    <div className="text-xs font-bold opacity-40">{quotation.currency} Currency</div>
                  </div>
                  <div className="text-2xl font-black tracking-tight">
                    {formatMoney(quotation.finalTotal, quotation.currency)}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-16 border-t border-gray-50 pt-10">
              <div className="mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <h5 className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Validity & Notes
                </h5>
              </div>
              <p className="max-w-2xl text-xs font-medium leading-relaxed text-gray-600">
                {quotation.internalNotes ||
                  'Price quoted is valid for 30 days from the date of issue. Terms and conditions as per UniCrop standard policy apply to all material procurement and design services.'}
              </p>

              <div className="mt-10 flex flex-col gap-3 border-t border-gray-100 pt-8 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 sm:flex-row sm:items-end sm:justify-between">
                <div>© 2024 UNICROP DESIGN LABS</div>
                <div className="text-left sm:text-right">ARCHITECTURAL SPECIFICATION</div>
              </div>
            </div>

            <div className="absolute right-12 top-0 h-full w-[1px] bg-gray-50" />
            <div className="absolute right-14 top-0 h-full w-[1px] bg-gray-50/50" />
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   Share Records Modal — shows list of quotations to share
═══════════════════════════════════════════════════════════ */
const ShareRecordsModal = ({ isOpen, quotations, onClose, onShared }) => {
  const [selectedIds, setSelectedIds] = useState([]);
  const [isSharing, setIsSharing] = useState(false);

  if (!isOpen) return null;

  const handleSelectAll = () => {
    if (selectedIds.length === quotations.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(quotations.map(q => q._id));
    }
  };

  const handleSelectQuotation = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(qId => qId !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (selectedIds.length === 0) {
      alert('Please select at least one quotation');
      return;
    }

    setIsSharing(true);
    try {
      const response = await quotationApi.shareQuotations(selectedIds);
      alert(response.message || `Shared ${selectedIds.length} quotation(s)`);
      onShared?.();
      onClose();
      setSelectedIds([]);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to share selected quotation(s)');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 lg:p-6">
      <div
        className="absolute inset-0 bg-[#0f172a]/45 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />

      <div className="relative z-10 max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-[2rem] bg-white shadow-[0_30px_90px_rgba(15,23,42,0.28)] animate-in zoom-in-95 fade-in duration-300">
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1a2b4b] text-white shadow-lg shadow-slate-900/10">
              <Share2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                Share Quotations
              </p>
              <h2 className="text-xl font-black tracking-tight text-[#1a2b4b]">
                Select Records to Share
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-400 transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[calc(92vh-180px)] overflow-y-auto p-6">
          {quotations.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No quotations available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Select All */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <input
                  type="checkbox"
                  id="select-all"
                  checked={selectedIds.length === quotations.length && quotations.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded border-slate-300 text-[#145be9] cursor-pointer"
                />
                <label htmlFor="select-all" className="flex-1 text-sm font-black text-[#1a2b4b] cursor-pointer">
                  Select All ({selectedIds.length}/{quotations.length})
                </label>
              </div>

              {/* Quotation List */}
              {quotations.map((quotation) => (
                <div
                  key={quotation._id}
                  className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-[#145be9] hover:bg-blue-50/30 transition-all cursor-pointer"
                  style={getQuotationAccentColor(quotation) ? { borderLeft: `4px solid ${getQuotationAccentColor(quotation)}` } : undefined}
                  onClick={() => handleSelectQuotation(quotation._id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(quotation._id)}
                    onClick={(event) => event.stopPropagation()}
                    onChange={() => handleSelectQuotation(quotation._id)}
                    className="w-4 h-4 rounded border-slate-300 text-[#145be9] cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    {(() => {
                const accentColor = getQuotationAccentColor(quotation);
                const templateId = quotation.templateSettings?.templateId || 'simple';
                const isCustom = templateId === 'custom';
                const pillBg = isCustom && accentColor ? `${accentColor}22` : '#dce9fe';
                const pillColor = isCustom && accentColor ? accentColor : '#145be9';
                const pillBorder = isCustom && accentColor ? `1px solid ${accentColor}44` : '1px solid rgba(20, 91, 233, 0.27)';

                return (
                  <>
                    <div
                      className="flex items-center gap-2 mb-1"
                      style={accentColor ? { borderLeft: `4px solid ${accentColor}`, paddingLeft: '0.5rem' } : undefined}
                    >
                      <span
                        className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400"
                        style={accentColor ? { backgroundColor: accentColor, color: 'white', padding: '0 0.4rem', borderRadius: '9999px' } : undefined}
                      >
                        {quotation.quotationNumber}
                      </span>
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${statusStyles[quotation.status] ||
                          'bg-slate-50 text-slate-600 border-slate-100'
                          }`}
                      >
                        {quotation.status}
                      </span>
                    </div>
                    <h4 className="text-sm font-black text-[#1a2b4b] truncate">
                      {quotation.customer?.businessName || quotation.customer?.fullName || 'Untitled'}
                    </h4>
                    <div className="mt-2">
                      <span
                        style={{
                          backgroundColor: pillBg,
                          color: pillColor,
                          border: pillBorder,
                        }}
                        className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider"
                      >
                        {isCustom ? 'Custom' : templateId.charAt(0).toUpperCase() + templateId.slice(1)}
                      </span>
                    </div>
                  </>
                );
              })()}
                    <div className="text-xs text-slate-500 mt-1">
                      {quotation.customer?.email} • {quotation.items?.length || 0} items • {formatMoney(quotation.finalTotal, quotation.currency)}
                    </div>
                  </div>
                  {selectedIds.includes(quotation._id) && (
                    <Check className="h-5 w-5 text-[#145be9] flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with Submit Button */}
        <div className="border-t border-slate-200 bg-white px-6 py-4 flex items-center justify-between">
          <p className="text-sm font-medium text-slate-600">
            {selectedIds.length} selected
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-black text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={selectedIds.length === 0 || isSharing}
              className="px-5 py-2.5 rounded-xl text-sm font-black text-white bg-[#145be9] hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSharing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
              {isSharing ? 'Sending...' : 'Share Selected'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   Quotation Hub View — full-page view with real template
   Renders when URL has :id
═══════════════════════════════════════════════════════════ */
const renderTemplateById = (templateId, quotation) => {
  const props = { isVertical: true, quotation };
  switch (templateId) {
    case 'simple':        return <Simple {...props} />;
    case 'dual':          return <DualPageFormat {...props} />;
    case 'threepage':     return <ThreePageDesign {...props} />;
    case 'fourpage':      return <Complete4PageFormat {...props} />;
    case 'creative':      return <Creative3PageDesign {...props} />;
    case 'minimalist':    return <MinimalistDesign {...props} />;
    case 'institutional': return <InstitutionalDesign {...props} />;
    case 'elegant':       return <ElegantDesign {...props} />;
    case 'custom':        return <CustomTemplate {...props} />;
    default:              return <Simple {...props} />;
  }
};

const QuotationHubView = ({ quotation, onBack, navigate }) => {
  const templateId = quotation.templateSettings?.templateId || 'simple';
  const responseStatus = getResponseStatus(quotation);
  const printRef = React.useRef(null);

  const handleExportPdf = useReactToPrint({
    contentRef: printRef,
    documentTitle: `${quotation.quotationNumber || 'Quotation'}_Export`,
    pageStyle: `
      @page {
        size: A4 portrait;
        margin: 0;
      }
      @media print {
        html, body {
          width: 210mm !important;
          height: auto !important;
          margin: 0 !important;
          padding: 0 !important;
          background-color: white !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        /* Disable artificial CSS scaling and rigidly force ALL template wrappers to snap strictly to child heights */
        .group\\/container, div[style*="transform"], div[style*="overflow"] {
          transform: none !important;
          box-shadow: none !important;
          margin: 0 auto !important;
          height: auto !important;
          overflow: visible !important;
        }
        /* Hide visual gap spacers that mathematically add phantom height */
        div[class*="h-[8px]"] {
          display: none !important;
        }
      }
    `,
  });

  return (
    <div className="min-h-screen bg-[#f3f6fb] font-sans">
      {/* Top Bar */}
      <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 px-4 sm:px-6 py-4 backdrop-blur">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {(() => {
            const accentColor = getQuotationAccentColor(quotation);
            return (
              <div className="flex items-center gap-4">
                <button
                  onClick={onBack}
                  className="rounded-xl border border-transparent p-2.5 text-gray-400 transition-all hover:border-gray-200 hover:bg-gray-50 hover:text-black shrink-0"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                  <div className="mb-0.5 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    <span>Quotation Hub</span>
                    <span className="h-1 w-1 rounded-full bg-slate-200" />
                    <span>{quotation.quotationNumber}</span>
                  </div>
                  <h1 className="text-xl font-black tracking-tight text-[#1a2b4b] truncate max-w-[200px] sm:max-w-md">
                    {quotation.customer?.businessName || quotation.customer?.fullName || 'Quotation Preview'}
                  </h1>
                  {accentColor ? (
                    <div
                      className="mt-2 inline-flex items-center rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider"
                      style={{ backgroundColor: `${accentColor}15`, color: accentColor, border: `1px solid ${accentColor}44` }}
                    >
                      Custom template
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })()}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
            <button
              onClick={() => navigate(`/dashboard/edit-quotation/${quotation._id}`)}
              className="px-4 py-2 rounded-xl text-[11px] font-black text-[#145be9] bg-[#dce9fe] hover:bg-[#cde0fe] transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit Data
            </button>
            <button
              onClick={() => navigate(`/dashboard/edit-template/${quotation._id}`)}
              className="px-4 py-2 rounded-xl text-[11px] font-black text-[#145be9] bg-[#dce9fe] hover:bg-[#cde0fe] transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <LayoutTemplate className="h-3.5 w-3.5" />
              Edit Template
            </button>
            <button
              onClick={() => navigate(`/dashboard/quotation-format?quoteId=${quotation._id}`)}
              className="px-4 py-2 rounded-xl text-[11px] font-black text-[#145be9] bg-[#dce9fe] hover:bg-[#cde0fe] transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <LayoutTemplate className="h-3.5 w-3.5" />
              Change Template
            </button>
            <button
              onClick={() => handleExportPdf()}
              className="px-5 py-2 rounded-xl text-[11px] font-black text-white bg-[#0557cc] hover:bg-[#0449ad] shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 active:scale-95 whitespace-nowrap"
            >
              <Download className="h-3.5 w-3.5" />
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Status Strip */}
      <div className="border-b border-slate-100 bg-white px-6 py-3">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <span className={`inline-flex rounded-full border px-3 py-1 font-black uppercase tracking-wider ${statusStyles[quotation.status] || 'bg-slate-50 text-slate-600 border-slate-100'
            }`}>
            {quotation.status}
          </span>
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-black uppercase tracking-wider ${responseStyles[responseStatus] || responseStyles.Pending
            }`}>
            {responseStatus === 'Accepted' ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
            {responseStatus === 'Rejected' ? <XCircle className="h-3.5 w-3.5" /> : null}
            Customer {responseStatus}
          </span>
          {quotation.customerResponse?.respondedAt ? (
            <span className="font-medium text-slate-400">
              Responded {formatDate(quotation.customerResponse.respondedAt)}
            </span>
          ) : null}
          <span className="font-medium text-slate-400">
            Created {formatDate(quotation.createdAt)}
          </span>
          <span className="font-medium text-slate-400">
            {quotation.items?.length || 0} items &nbsp;·&nbsp; {quotation.currency}
          </span>
          <span className="ml-auto font-black text-[#1a2b4b]">
            Total: {formatMoney(quotation.finalTotal, quotation.currency)}
          </span>
        </div>
      </div>

      <div className="border-b border-slate-100 bg-white px-4 py-4 sm:px-6">
        <div
          className={`rounded-2xl border p-4 ${responseStyles[responseStatus] || responseStyles.Pending
            }`}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">
                Customer Reply Section
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                {responseStatus === 'Accepted' ? <CheckCircle2 className="h-5 w-5" /> : null}
                {responseStatus === 'Rejected' ? <XCircle className="h-5 w-5" /> : null}
                <h2 className="text-lg font-black tracking-tight">
                  {getResponseLabel(responseStatus)}
                </h2>
              </div>
              <p className="mt-1 text-sm font-bold opacity-80">
                {getResponseCopy(quotation)}
              </p>
            </div>
            <div className="text-left text-xs font-black uppercase tracking-wider opacity-80 sm:text-right">
              {quotation.customerResponse?.respondedAt ? (
                <>
                  <div>Responded {formatDate(quotation.customerResponse.respondedAt)}</div>
                  {quotation.customerResponse?.respondedByEmail ? (
                    <div className="mt-1 normal-case tracking-normal">
                      {quotation.customerResponse.respondedByEmail}
                    </div>
                  ) : null}
                </>
              ) : (
                <div>Pending email response</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Template Render Area */}
      <div className="p-4 lg:p-8 flex justify-center overflow-hidden">
        <div className="w-full max-w-[860px]" ref={printRef}>
          {renderTemplateById(templateId, quotation)}
        </div>
      </div>
    </div>
  );
};

const QuotationPreviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  useOutletContext();
  const { user } = useAuthStore();
  useCurrentUser();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [sendingId, setSendingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const handleSendSingle = async (quotationId) => {
    setSendingId(quotationId);
    try {
      const response = await quotationApi.shareQuotations([quotationId]);
      alert(response.message || 'Shared 1 quotation');
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to share selected quotation(s)');
    } finally {
      setSendingId(null);
    }
  };

  const handleDeleteQuotation = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this quotation? This action cannot be undone.'
    );
    if (!confirmed) return;

    setDeletingId(id);
    try {
      await quotationApi.deleteQuotation(id);
      alert('Quotation deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete quotation');
    } finally {
      setDeletingId(null);
    }
  };

  const {
    data: quotationsResponse,
    isLoading: isListLoading,
    error: listError,
  } = useQuery({
    queryKey: ['quotations'],
    queryFn: quotationApi.getQuotations,
    refetchInterval: 15000,
    refetchIntervalInBackground: true,
  });

  const quotations = quotationsResponse?.data || [];
  const activeQuotationId = id || null;

  const {
    data: selectedQuotationResponse,
    isLoading: isSelectedLoading,
    error: selectedError,
  } = useQuery({
    queryKey: ['quotation', activeQuotationId],
    queryFn: () => quotationApi.getQuotationById(activeQuotationId),
    enabled: Boolean(activeQuotationId),
    refetchInterval: activeQuotationId ? 15000 : false,
    refetchIntervalInBackground: true,
  });

  const selectedQuotation = selectedQuotationResponse?.data || null;

  const selectedPlan = user?.selectedPlan;
  const isPlanObject = typeof selectedPlan === 'object' && selectedPlan !== null;
  const planName = isPlanObject ? selectedPlan.name : null;
  const maxLimit = isPlanObject
    ? Number(selectedPlan.limitations?.numberOfQuotations)
    : Number.NaN;
  const currentCount = quotations.length;
  const shouldShowQuotationLimit =
    planName === 'Starter' && Number.isFinite(maxLimit) && maxLimit !== -1;
  const isQuotationLimitReached = shouldShowQuotationLimit && currentCount >= maxLimit;
  const draftCount = quotations.filter((quotation) => quotation.status === 'Draft').length;
  const sentCount = quotations.filter((quotation) => quotation.status === 'Sent').length;
  const totalValue = quotations.reduce(
    (sum, quotation) => sum + Number(quotation.finalTotal || 0),
    0
  );

  // ── HUB VIEW: When :id is in URL and the quota has loaded ──
  if (activeQuotationId && selectedQuotation) {
    return (
      <QuotationHubView
        quotation={selectedQuotation}
        onBack={() => navigate('/dashboard/quotation-preview')}
        navigate={navigate}
      />
    );
  }

  // ── Loading spinner for hub fetch ──
  if (activeQuotationId && isSelectedLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50/50">
        <Loader2 className="mb-4 h-12 w-12 animate-spin text-[#145be9]" />
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Loading quotation...</p>
      </div>
    );
  }

  if (isListLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50/50">
        <Loader2 className="mb-4 h-12 w-12 animate-spin text-[#145be9]" />
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
          Loading quotations...
        </p>
      </div>
    );
  }

  if (listError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50/50 p-6">
        <div className="max-w-md rounded-3xl border border-red-50 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <FileText className="h-8 w-8" />
          </div>
          <h2 className="mb-2 text-2xl font-black tracking-tight text-[#1a2b4b]">
            Unable to Load Quotations
          </h2>
          <p className="mb-8 text-sm font-medium leading-relaxed text-gray-500">
            We could not fetch your quotation records right now. Please try again in a moment.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full rounded-2xl bg-[#145be9] py-4 font-black text-white transition-all hover:bg-blue-700 active:scale-95"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f6fb] font-sans">
      <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 px-4 sm:px-6 py-4 backdrop-blur">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="rounded-xl border border-transparent p-2.5 text-gray-400 transition-all hover:border-gray-200 hover:bg-gray-50 hover:text-black shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <div className="mb-0.5 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                <span>Quotation Center</span>
                <span className="h-1 w-1 rounded-full bg-slate-200" />
                <span>{quotations.length} Records</span>
              </div>
              <h1 className="text-xl font-black tracking-tight text-[#1a2b4b]">
                Quotation Preview
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard/create-quotation')}
              className="px-5 py-2.5 rounded-xl text-xs font-black text-[#145be9] bg-[#dce9fe] hover:bg-[#cde0fe] transition-colors whitespace-nowrap"
            >
              Create New
            </button>
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="px-5 py-2.5 rounded-xl text-xs font-black text-white bg-[#0557cc] hover:bg-[#0449ad] shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 active:scale-95 whitespace-nowrap">
              <Share2 className="h-4 w-4" />
              <span>Share Records</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 lg:p-6">
        <div className="mb-6 rounded-[2rem] border border-blue-100/70 bg-gradient-to-br from-[#eef4ff] via-white to-[#f9fbff] p-6 shadow-sm lg:p-8">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_0.9fr]">
            <div>
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.25em] text-[#145be9]">
                Current Created Quotations
              </p>
              <h2 className="max-w-2xl text-3xl font-black tracking-tight text-[#1a2b4b] lg:text-4xl">
                Review every saved quotation from one place and open any record in a full popup view.
              </h2>
              <p className="mt-3 max-w-2xl text-sm font-medium leading-relaxed text-slate-500">
                Select a quotation from the list below to inspect customer details, line items,
                totals, and notes without leaving the page.
              </p>
              {shouldShowQuotationLimit ? (
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div
                    className={`inline-flex w-fit items-center gap-3 rounded-2xl border px-5 py-3 shadow-sm ${isQuotationLimitReached
                        ? 'border-red-200 bg-red-50 text-red-600 shadow-red-100/70'
                        : 'border-green-200 bg-green-50 text-green-600 shadow-green-100/70'
                      }`}
                  >
                    <FileText className="h-5 w-5" />
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black tracking-tight">
                        {currentCount}/{maxLimit}
                      </span>
                      <span className="text-xs font-black uppercase tracking-[0.18em]">
                        Quotations Used
                      </span>
                    </div>
                  </div>
                  {isQuotationLimitReached ? (
                    <p className="max-w-md rounded-2xl border border-red-100 bg-white/70 px-4 py-2 text-sm font-bold text-red-600 shadow-sm">
                      You've reached your plan's quotation limit. Upgrade to create more.
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>


            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 xl:grid-cols-1">
              <div className="rounded-[1.5rem] border border-white/80 bg-white p-5 shadow-sm">
                <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  <FileText className="h-3.5 w-3.5 text-[#145be9]" />
                  Total Quotations
                </div>
                <div className="text-3xl font-black tracking-tight text-[#1a2b4b]">
                  {quotations.length}
                </div>
              </div>
              <div className="rounded-[1.5rem] border border-white/80 bg-white p-5 shadow-sm">
                <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  <Clock className="h-3.5 w-3.5 text-amber-500" />
                  Draft + Sent
                </div>
                <div className="text-3xl font-black tracking-tight text-[#1a2b4b]">
                  {draftCount + sentCount}
                </div>
              </div>
              <div className="rounded-[1.5rem] border border-white/80 bg-[#1a2b4b] p-5 shadow-xl shadow-slate-900/10">
                <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/60">
                  <Calendar className="h-3.5 w-3.5 text-white/60" />
                  Portfolio Value
                </div>
                <div className="text-3xl font-black tracking-tight text-white">
                  {formatMoney(totalValue, 'INR')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {quotations.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-[#145be9]">
              <Search className="h-7 w-7" />
            </div>
            <h3 className="text-2xl font-black tracking-tight text-[#1a2b4b]">
              No quotations created yet
            </h3>
            <p className="mx-auto mt-3 max-w-md text-sm font-medium leading-relaxed text-slate-500">
              Your saved quotations will appear here as a list. Create one quotation to start
              previewing records in the popup viewer.
            </p>
            <button
              onClick={() => navigate('/dashboard/create-quotation')}
              className="mt-8 rounded-2xl bg-[#145be9] px-6 py-3 text-sm font-black text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-700"
            >
              Create Quotation
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {quotations.map((quotation) => {
              const isActive = activeQuotationId === quotation._id;
              const responseStatus = getResponseStatus(quotation);

              return (
                <div
                  key={quotation._id}
                  className={`group rounded-[1.75rem] border p-5 text-left transition-all ${isActive
                      ? 'border-blue-200 bg-blue-50/80 shadow-[0_15px_35px_rgba(20,91,233,0.12)]'
                      : 'border-white bg-white shadow-sm hover:-translate-y-0.5 hover:border-slate-200 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)]'
                    }`}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex min-w-0 items-start gap-4">
                      <div
                        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-black ${isActive
                            ? 'bg-[#145be9] text-white shadow-lg shadow-blue-500/20'
                            : 'bg-[#eef2fa] text-[#1a2b4b]'
                          }`}
                      >
                        {quotation.customer?.businessName
                          ?.split(' ')
                          .map((part) => part[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase() || 'QT'}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                            {quotation.quotationNumber}
                          </span>
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${statusStyles[quotation.status] ||
                              'bg-slate-50 text-slate-600 border-slate-100'
                              }`}
                          >
                            {quotation.status}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${responseStyles[responseStatus] || responseStyles.Pending
                              }`}
                          >
                            {responseStatus === 'Accepted' ? <CheckCircle2 className="h-3 w-3" /> : null}
                            {responseStatus === 'Rejected' ? <XCircle className="h-3 w-3" /> : null}
                            {responseStatus}
                          </span>
                        </div>

                        <h3 className="truncate text-xl font-black tracking-tight text-[#1a2b4b]">
                          {quotation.customer?.businessName || 'Untitled Customer'}
                        </h3>
                        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium text-slate-500">
                          <span>{quotation.customer?.fullName}</span>
                          <span>{quotation.customer?.email}</span>
                          <span>{quotation.items?.length || 0} items</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4 lg:items-end">
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:min-w-[460px]">
                        <div>
                          <p className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                            Created
                          </p>
                          <p className="text-sm font-black text-[#1a2b4b]">
                            {formatDate(quotation.createdAt)}
                          </p>
                        </div>
                        <div>
                          <p className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                            Subtotal
                          </p>
                          <p className="text-sm font-black text-[#1a2b4b]">
                            {formatMoney(quotation.subtotal, quotation.currency)}
                          </p>
                        </div>
                        <div>
                          <p className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                            Final Total
                          </p>
                          <p className="text-sm font-black text-[#1a2b4b]">
                            {formatMoney(quotation.finalTotal, quotation.currency)}
                          </p>
                        </div>
                        <div>
                          <p className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                            Customer Reply
                          </p>
                          <p
                            className={`text-sm font-black ${responseStatus === 'Accepted'
                                ? 'text-emerald-600'
                                : responseStatus === 'Rejected'
                                  ? 'text-rose-600'
                                  : 'text-slate-500'
                              }`}
                          >
                            {responseStatus}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-start gap-2 lg:justify-end">
                        <button
                          type="button"
                          onClick={() => navigate(`/dashboard/edit-quotation/${quotation._id}`)}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-600 transition-all hover:border-[#145be9] hover:text-[#145be9]"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate(`/dashboard/edit-template/${quotation._id}`)}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-600 transition-all hover:border-[#145be9] hover:text-[#145be9]"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit Template
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate(`/dashboard/quotation-preview/${quotation._id}`)}
                          className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-600 transition-all group-hover:bg-[#145be9] group-hover:text-white"
                        >
                          <Eye className="h-4 w-4" />
                          View Quote
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSendSingle(quotation._id)}
                          disabled={sendingId === quotation._id}
                          className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-600 transition-all group-hover:bg-[#145be9] group-hover:text-white"
                        >
                          {sendingId === quotation._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                          {sendingId === quotation._id ? 'Sending...' : 'Send Quotation'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteQuotation(quotation._id)}
                          disabled={deletingId === quotation._id}
                          className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-600 transition-all group-hover:bg-red-500 group-hover:text-white"
                        >
                          {deletingId === quotation._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                          {deletingId === quotation._id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {activeQuotationId && selectedError ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0f172a]/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-8 text-center shadow-2xl">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-black tracking-tight text-[#1a2b4b]">
              Quotation not found
            </h3>
            <p className="mt-3 text-sm font-medium leading-relaxed text-slate-500">
              This record could not be opened. It may have been removed or is no longer available.
            </p>
            <button
              onClick={() => navigate('/dashboard/quotation-preview')}
              className="mt-8 rounded-2xl bg-[#145be9] px-6 py-3 text-sm font-black text-white transition-all hover:bg-blue-700"
            >
              Back to list
            </button>
          </div>
        </div>
      ) : null}

      {/* Share Records Modal */}
      <ShareRecordsModal
        isOpen={isShareModalOpen}
        quotations={quotations}
        onClose={() => setIsShareModalOpen(false)}
        onShared={() => {
          queryClient.invalidateQueries({ queryKey: ['quotations'] });
          if (activeQuotationId) {
            queryClient.invalidateQueries({ queryKey: ['quotation', activeQuotationId] });
          }
        }}
      />
    </div>
  );
};

export default QuotationPreviewPage;
