import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Briefcase,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileText,
  Layers,
  Loader2,
  Printer,
  RotateCcw,
  Save,
  Upload,
  X,
  ZoomIn,
  ZoomOut,
  ShieldCheck,
  Layout
} from 'lucide-react';
import Simple from '../quotations/components/Simple';
import DualPageFormat from '../quotations/components/DualPageFormat';
import ThreePageDesign from '../quotations/components/3-PageDesign';
import Complete4PageFormat from '../quotations/components/Complete4-PageFormat';
import Creative3PageDesign from '../quotations/components/3-PageDesign-2';
import MinimalistDesign from '../quotations/components/MinimalistDesign-3-page';
import InstitutionalDesign from '../quotations/components/InstitutionalDesign-4-page';
import ElegantDesign from '../quotations/components/ElegantDesign-simple-page';
import quotationApi from '../../../services/quotationApi';
import termsApi from '../../../services/termsApi';

/* ─────────────────────────────────────────────────────────────
   Watermark position grid
──────────────────────────────────────────────────────────── */
const POSITIONS = [
  { id: 'top-left',      label: 'Top Left' },
  { id: 'top-center',    label: 'Top Center' },
  { id: 'top-right',     label: 'Top Right' },
  { id: 'middle-left',   label: 'Middle Left' },
  { id: 'center',        label: 'Center' },
  { id: 'middle-right',  label: 'Middle Right' },
  { id: 'bottom-left',   label: 'Bottom Left' },
  { id: 'bottom-center', label: 'Bottom Center' },
  { id: 'bottom-right',  label: 'Bottom Right' },
];

const positionStyleMap = {
  'top-left':      { top: '5%',  left: '5%',  transform: 'none' },
  'top-center':    { top: '5%',  left: '50%', transform: 'translateX(-50%)' },
  'top-right':     { top: '5%',  right: '5%', transform: 'none' },
  'middle-left':   { top: '50%', left: '5%',  transform: 'translateY(-50%)' },
  'center':        { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
  'middle-right':  { top: '50%', right: '5%', transform: 'translateY(-50%)' },
  'bottom-left':   { bottom: '5%', left: '5%',  transform: 'none' },
  'bottom-center': { bottom: '5%', left: '50%', transform: 'translateX(-50%)' },
  'bottom-right':  { bottom: '5%', right: '5%', transform: 'none' },
};

/* ─────────────────────────────────────────────────────────────
   Template registry mapping
───────────────────────────────────────────────────────────── */
const renderTemplate = (type, isVertical = false, quotationData = null, settings = {}) => {
  const mergedQuotation = {
    ...quotationData,
    templateSettings: {
       ...(quotationData?.templateSettings || {}),
       ...settings
    }
  };

  const props = { isVertical, quotation: mergedQuotation };
  switch (type) {
    case 'simple': return <Simple {...props} />;
    case 'dual': return <DualPageFormat {...props} />;
    case 'threepage': return <ThreePageDesign {...props} />;
    case 'fourpage': return <Complete4PageFormat {...props} />;
    case 'creative': return <Creative3PageDesign {...props} />;
    case 'minimalist': return <MinimalistDesign {...props} />;
    case 'institutional': return <InstitutionalDesign {...props} />;
    case 'elegant': return <ElegantDesign {...props} />;
    default: return null;
  }
};

/* ─────────────────────────────────────────────────────────────
   Toast component
───────────────────────────────────────────────────────────── */
const Toast = ({ message, type, onClose }) => (
  <div
    className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 rounded-2xl border px-5 py-4 shadow-2xl animate-in slide-in-from-bottom-4 duration-300 ${
      type === 'success'
        ? 'border-emerald-100 bg-white text-emerald-700'
        : 'border-red-100 bg-white text-red-600'
    }`}
  >
    {type === 'success'
      ? <CheckCircle2 className="h-5 w-5 shrink-0" />
      : <X className="h-5 w-5 shrink-0" />}
    <p className="text-sm font-black">{message}</p>
    <button onClick={onClose} className="ml-2 text-slate-300 hover:text-slate-500 transition-colors">
      <X className="h-4 w-4" />
    </button>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   Main Component
═══════════════════════════════════════════════════════════════ */
const EditQuotationTemplate = () => {
  const navigate    = useNavigate();
  const { id }      = useParams();
  const queryClient = useQueryClient();
  const { isSidebarOpen } = useOutletContext();

  /* ── toast ── */
  const [toast, setToast] = useState(null); // { message, type }
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── fetch quotation ── */
  const {
    data: quotationResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['quotation', id],
    queryFn:  () => quotationApi.getQuotationById(id),
    enabled:  Boolean(id),
  });
  const quotation = quotationResponse?.data ?? null;

  /* ── local state ── */
  const [selectedTemplate, setSelectedTemplate] = useState('simple');
  const [bgImage,          setBgImage]          = useState(null);
  const [bgOpacity,        setBgOpacity]        = useState(8);
  const [bgBlur,           setBgBlur]           = useState(0);
  const [bgFit,            setBgFit]            = useState('cover');
  const [bgDragging,       setBgDragging]       = useState(false);
  const [wmImage,          setWmImage]          = useState(null);
  const [wmOpacity,        setWmOpacity]        = useState(15);
  const [wmSize,           setWmSize]           = useState(120);
  const [wmPosition,       setWmPosition]       = useState('center');
  const [isPreviewOpen,    setIsPreviewOpen]    = useState(false);
  const [zoom,             setZoom]             = useState(1);
  const [selectedTermsId,  setSelectedTermsId]  = useState(null);
  const [selectedTermsContent, setSelectedTermsContent] = useState(null);
  const [bgTarget,         setBgTarget]         = useState('all');
  const [wmTarget,         setWmTarget]         = useState('all');
  const [isTermsOpen,      setIsTermsOpen]      = useState(false);

  /* ── cover page details ── */
  const [coverHeader,      setCoverHeader]      = useState('PROJECT PROPOSAL');
  const [coverTitle,       setCoverTitle]       = useState('');
  const [coverDescTitle,   setCoverDescTitle]   = useState('');
  const [coverDesc,        setCoverDesc]        = useState('');
  const [coverFooterAddr,  setCoverFooterAddr]  = useState('');
  const [coverFooterWeb,   setCoverFooterWeb]   = useState('');

  const bgInputRef = useRef(null);
  const wmInputRef = useRef(null);
  const termsRef   = useRef(null);

  /* ── fetch templates ── */
  const { data: templatesResponse } = useQuery({
    queryKey: ['templates'],
    queryFn:  quotationApi.getTemplates,
  });
  
  // Base templates always available
  const DEFAULT_TEMPLATES = [
    { templateId: 'simple', title: 'Simple', description: 'Clean, one-page minimal design.', icon: 'FileText', iconBg: 'bg-blue-50', pages: 1 },
    { templateId: 'dual', title: 'Dual Page', description: 'Sophisticated two-page layout.', icon: 'Layers', iconBg: 'bg-emerald-50', pages: 2 },
    { templateId: 'threepage', title: '3-Page Design', description: 'Complete proposal with T&C.', icon: 'Layout', iconBg: 'bg-amber-50', pages: 3 },
    { templateId: 'fourpage', title: 'Professional 4-Page', description: 'High-fidelity detailed format.', icon: 'ShieldCheck', iconBg: 'bg-indigo-50', pages: 4 },
    { templateId: 'creative', title: 'Creative Emerald 2-Page', description: 'Modern, high-contrast creative design.', icon: 'Briefcase', iconBg: 'bg-emerald-100', pages: 2 },
    { templateId: 'minimalist', title: 'Minimalist Bold', description: 'High-contrast monochrome design.', icon: 'Square', iconBg: 'bg-slate-100', pages: 3 },
    { templateId: 'institutional', title: 'Institutional Emerald', description: 'Premium 4-page corporate design.', icon: 'Briefcase', iconBg: 'bg-[#EBF0FF]', pages: 4 },
    { templateId: 'elegant', title: 'Elegant Serif', description: 'Sophisticated single-page quote.', icon: 'Compass', iconBg: 'bg-stone-100', pages: 1 },
  ];

  const fetchedTemplates = templatesResponse?.data || [];
  
  // Create the final list of templates, ensuring defaults are present and 'creative' is always included
  const TEMPLATES = fetchedTemplates.length > 0 
    ? [...fetchedTemplates] 
    : [...DEFAULT_TEMPLATES];
  
  // Ensure 'creative', 'minimalist', 'institutional' and 'elegant' are always registered in the UI list if not already there
  ['creative', 'minimalist', 'institutional', 'elegant'].forEach(id => {
    if (!TEMPLATES.find(t => (t.templateId || t.id) === id)) {
      TEMPLATES.push(DEFAULT_TEMPLATES.find(t => t.templateId === id));
    }
  });

  /* ── fetch terms & conditions ── */
  const { data: termsResponse } = useQuery({
    queryKey: ['terms'],
    queryFn:  termsApi.getAllTerms,
  });
  const ALL_TERMS = termsResponse?.data || [];
  const ACTIVE_TERMS = ALL_TERMS.filter(t => t.status === 'active' || t.status === 'draft');

  /* ── seed from saved templateSettings when quotation loads ── */
  useEffect(() => {
    if (!quotation?.templateSettings) return;
    const ts = quotation.templateSettings;
    if (ts.templateId)  setSelectedTemplate(ts.templateId);
    if (ts.bgImage)     setBgImage(ts.bgImage);
    if (ts.bgOpacity !== undefined) setBgOpacity(ts.bgOpacity);
    if (ts.bgBlur !== undefined)    setBgBlur(ts.bgBlur);
    if (ts.bgFit !== undefined)     setBgFit(ts.bgFit);
    if (ts.wmImage)     setWmImage(ts.wmImage);
    if (ts.wmOpacity !== undefined) setWmOpacity(ts.wmOpacity);
    if (ts.wmPosition)  setWmPosition(ts.wmPosition);
    if (ts.wmSize !== undefined)    setWmSize(ts.wmSize);
    if (ts.bgTarget)    setBgTarget(ts.bgTarget);
    if (ts.wmTarget)    setWmTarget(ts.wmTarget);
    
    // Cover Details
    if (ts.coverHeader) setCoverHeader(ts.coverHeader);
    if (ts.coverTitle)  setCoverTitle(ts.coverTitle);
    if (ts.coverDescriptionTitle) setCoverDescTitle(ts.coverDescriptionTitle);
    if (ts.coverDescription) setCoverDesc(ts.coverDescription);
    if (ts.coverFooterAddress) setCoverFooterAddr(ts.coverFooterAddress);
    if (ts.coverFooterWebsite) setCoverFooterWeb(ts.coverFooterWebsite);

    // Seed Terms
    if (quotation.termsAndConditions?.sourceRef) {
      setSelectedTermsId(quotation.termsAndConditions.sourceRef);
      setSelectedTermsContent(quotation.termsAndConditions.content);
    }
  }, [quotation]);
  
  const saveMutation = useMutation({
    mutationFn: () =>
      quotationApi.updateTemplateSettings(id, {
        templateId: selectedTemplate,
        bgImage,
        bgOpacity,
        bgBlur,
        bgFit,
        wmImage,
        wmOpacity,
        wmPosition,
        wmSize,
        bgTarget,
        wmTarget,
        coverHeader,
        coverTitle,
        coverDescriptionTitle: coverDescTitle,
        coverDescription: coverDesc,
        coverFooterAddress: coverFooterAddr,
        coverFooterWebsite: coverFooterWeb,
        termsId: selectedTermsId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['quotation', id]);
      showToast('Template settings saved successfully!', 'success');
    },
    onError: (err) => {
      showToast(err?.response?.data?.message || 'Failed to save template settings.', 'error');
    },
  });

  /* ── helpers ── */
  const readFile = (file, setter) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => setter(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleBgDrop = useCallback((e) => {
    e.preventDefault();
    setBgDragging(false);
    readFile(e.dataTransfer.files[0], setBgImage);
  }, []);

  const handleSelectTemplate = (tplId) => {
    setSelectedTemplate(tplId);
  };

  const handleZoomOut  = () => setZoom((z) => Math.max(0.5, parseFloat((z - 0.1).toFixed(1))));
  const handleZoomIn   = () => setZoom((z) => Math.min(2.0, parseFloat((z + 0.1).toFixed(1))));

  const handleResetWatermark = () => {
    setWmImage(null);
    setWmOpacity(15);
    setWmPosition('center');
    setWmSize(120);
  };

  const handleTermsChange = (tcId) => {
    if (tcId === 'none') {
      setSelectedTermsId(null);
      setSelectedTermsContent(null);
      return;
    }
    const found = ALL_TERMS.find(t => t._id === tcId);
    if (found) {
      setSelectedTermsId(found._id);
      setSelectedTermsContent(found.content);
    }
    setIsTermsOpen(false);
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (termsRef.current && !termsRef.current.contains(event.target)) {
        setIsTermsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  React.useEffect(() => {
    document.body.style.overflow = isPreviewOpen ? 'hidden' : '';
    if (isPreviewOpen) setZoom(1);
    return () => { document.body.style.overflow = ''; };
  }, [isPreviewOpen]);

  /* ── loading / error states ── */
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#f3f6fb]">
        <Loader2 className="h-12 w-12 animate-spin text-[#145be9] mb-4" />
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">
          Loading quotation…
        </p>
      </div>
    );
  }

  if (isError || !quotation) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#f3f6fb] p-6">
        <div className="max-w-md w-full rounded-3xl border border-red-50 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <FileText className="h-8 w-8" />
          </div>
          <h2 className="mb-2 text-2xl font-black tracking-tight text-[#1a2b4b]">
            Quotation Not Found
          </h2>
          <p className="mb-8 text-sm font-medium leading-relaxed text-slate-500">
            We couldn't load this quotation. It may have been removed or you don't have access.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="w-full rounded-2xl bg-[#145be9] py-4 font-black text-white transition-all hover:bg-blue-700 active:scale-95"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const qNum        = quotation.quotationNumber;
  const customerName = quotation.customer?.businessName || quotation.customer?.fullName || 'Unknown Customer';
  const isDirty     = true; // always allow save – backend will just overwrite

  /* ════════════════════════════════════════════════════════════
     Render
  ════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-[#f3f6fb] font-sans flex flex-col">

      {/* ── sticky top bar ── */}
      <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 px-6 py-4 backdrop-blur">
        <div className="flex items-center justify-between gap-4">
          {/* left: back + title */}
          <div className="flex items-center gap-4 min-w-0">
            <button
              onClick={() => navigate(`/dashboard/quotation-preview/${id}`)}
              className="rounded-xl border border-transparent p-2.5 text-gray-400 transition-all hover:border-gray-200 hover:bg-gray-50 hover:text-black shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              {/* breadcrumb */}
              <div className="mb-0.5 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 truncate">
                <span>Template Studio</span>
                <span className="h-1 w-1 rounded-full bg-slate-300 shrink-0" />
                <span className="truncate">{qNum}</span>
              </div>
              <h1 className="text-xl lg:text-2xl font-black tracking-tight text-[#1a2b4b] truncate">
                Select Quotation Template
              </h1>
            </div>
          </div>

          {/* right: quotation chip + action buttons */}
          <div className="flex items-center gap-3 shrink-0">
            {/* quotation info chip */}
            <div className="hidden md:flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <Building2 className="h-4 w-4 text-[#145be9] shrink-0" />
              <div className="leading-none">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Customer</p>
                <p className="text-xs font-black text-[#1a2b4b] truncate max-w-[140px]">{customerName}</p>
              </div>
            </div>

            <button
              onClick={() => setIsPreviewOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-slate-600 transition-all hover:bg-slate-50 active:scale-95"
            >
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">Preview</span>
            </button>

            <button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="flex items-center gap-2 rounded-xl bg-[#145be9] px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saveMutation.isPending
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <Save className="h-4 w-4" />}
              <span className="hidden sm:inline">
                {saveMutation.isPending ? 'Saving…' : 'Save Template'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ── page body ── */}
      <div className="flex-1 p-4 lg:p-6 pb-28 lg:pb-32 flex flex-col gap-6">

        {/* subtitle + quotation meta strip */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm font-medium text-slate-500">
            Choose a professional format for your quotes from our architectural collection.
          </p>
          {/* mobile customer chip */}
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 w-fit sm:hidden">
            <Building2 className="h-4 w-4 text-[#145be9]" />
            <span className="text-xs font-black text-[#1a2b4b]">{customerName}</span>
          </div>
        </div>

        {/* existing settings banner (shown if template was previously saved) */}
        {quotation.templateSettings?.templateId && (
          <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 px-5 py-3">
            <CheckCircle2 className="h-4 w-4 text-[#145be9] shrink-0" />
            <p className="text-xs font-black text-[#1a2b4b]">
              Previously saved template:{' '}
              <span className="text-[#145be9]">
                {TEMPLATES.find((t) => (t.templateId || t.id) === quotation.templateSettings.templateId)?.title ?? 'Simple'}
              </span>
              {' '}— loaded automatically.
            </p>
          </div>
        )}

        {/* ── main grid ── */}
        <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-6 flex-1">

          {/* ────── LEFT PANEL ────── */}
          <div className="flex flex-col gap-5">

            {/* Background Image */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#145be9]">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-sm text-[#1a2b4b]">Background Image</h3>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5 leading-tight">
                    Apply a subtle texture or architectural photography to the base of your document.
                  </p>
                </div>
                {bgImage && (
                  <button
                    onClick={() => setBgImage(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all shrink-0"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* drop zone / preview */}
              <div
                onDragOver={(e) => { e.preventDefault(); setBgDragging(true); }}
                onDragLeave={() => setBgDragging(false)}
                onDrop={handleBgDrop}
                className={`group relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-all overflow-hidden p-0 h-40 text-center ${
                  bgDragging
                    ? 'border-[#145be9] bg-blue-50'
                    : bgImage
                    ? 'border-emerald-300 bg-emerald-50/50'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {bgImage ? (
                  <>
                    <img
                      src={bgImage}
                      alt="bg preview"
                      className="h-full w-full object-cover transition-all duration-300 group-hover:scale-105"
                    />
                    {/* hover overlay */}
                    <div className="absolute inset-x-0 bottom-0 top-0 flex items-center justify-center gap-3 bg-[#1a2b4b]/60 opacity-0 transition-opacity group-hover:opacity-100">
                       <button
                         onClick={(e) => { e.stopPropagation(); bgInputRef.current?.click(); }}
                         className="flex h-9 items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-[11px] font-black text-[#1a2b4b] shadow-xl hover:bg-blue-50 transition-all active:scale-95"
                       >
                         <Upload className="h-3.5 w-3.5" />
                         Replace
                       </button>
                       <button
                         onClick={(e) => { e.stopPropagation(); setBgImage(null); }}
                         className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 text-white backdrop-blur hover:bg-red-500 hover:text-white transition-all active:scale-95"
                       >
                         <X className="h-4 w-4" />
                       </button>
                    </div>
                  </>
                ) : (
                  <button
                    onClick={() => bgInputRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-2 p-6"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                      <Upload className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-600">Browse Image</p>
                      <p className="text-[10px] font-medium text-slate-400 mt-0.5">PNG or JPG (Max 5MB)</p>
                    </div>
                  </button>
                )}
                <input
                  ref={bgInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => readFile(e.target.files[0], setBgImage)}
                />
              </div>

              {/* Advanced BG Controls */}
              {bgImage && (
                <div className="mt-5 space-y-4 pt-1">
                  {/* Opacity */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Opacity</p>
                       <span className="text-[10px] font-black text-[#145be9]">{bgOpacity}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={bgOpacity}
                      onChange={(e) => setBgOpacity(Number(e.target.value))}
                      className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-[#145be9] bg-slate-200"
                    />
                  </div>

                  {/* Blur */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Blur</p>
                       <span className="text-[10px] font-black text-[#145be9]">{bgBlur}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={bgBlur}
                      onChange={(e) => setBgBlur(Number(e.target.value))}
                      className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-[#145be9] bg-slate-200"
                    />
                  </div>

                  {/* Fit Toggle */}
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fit Mode</p>
                    <div className="flex items-center rounded-lg bg-slate-100 p-1">
                       <button
                         onClick={() => setBgFit('cover')}
                         className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-md transition-all ${
                           bgFit === 'cover' ? 'bg-white text-[#145be9] shadow-sm' : 'text-slate-500 hover:text-slate-800'
                         }`}
                       >
                         Cover
                       </button>
                       <button
                         onClick={() => setBgFit('contain')}
                         className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-md transition-all ${
                           bgFit === 'contain' ? 'bg-white text-[#145be9] shadow-sm' : 'text-slate-500 hover:text-slate-800'
                         }`}
                       >
                         Contain
                       </button>
                    </div>
                  </div>
                  
                  {/* bg target page toggle */}
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Page</p>
                    <div className="flex items-center rounded-lg bg-slate-100 p-1">
                       <button
                         onClick={() => setBgTarget('cover')}
                         className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-md transition-all ${
                           bgTarget === 'cover' ? 'bg-white text-[#145be9] shadow-sm' : 'text-slate-500 hover:text-slate-800'
                         }`}
                       >
                         Cover
                       </button>
                       <button
                         onClick={() => setBgTarget('all')}
                         className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-md transition-all ${
                           bgTarget === 'all' ? 'bg-white text-[#145be9] shadow-sm' : 'text-slate-500 hover:text-slate-800'
                         }`}
                       >
                         All
                       </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Watermark Settings */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                  <Layers className="h-4 w-4" />
                </div>
                <h3 className="font-black text-sm text-[#1a2b4b]">Watermark Settings</h3>
              </div>

              {/* brand mark upload / preview area */}
              <div className="group relative w-full h-32 flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 overflow-hidden mb-5">
                {wmImage ? (
                  <>
                    <img src={wmImage} alt="wm" className="h-full w-full object-contain p-4" />
                    <div className="absolute inset-0 flex items-center justify-center gap-2 bg-[#1a2b4b]/60 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button
                         onClick={() => wmInputRef.current?.click()}
                         className="flex h-8 items-center gap-2 rounded-lg bg-white px-3 text-[10px] font-black text-[#1a2b4b] shadow-xl hover:bg-blue-50 transition-all"
                       >
                         <Upload className="h-3 w-3" />
                         Replace
                       </button>
                       <button
                         onClick={() => setWmImage(null)}
                         className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-white backdrop-blur hover:bg-red-500 transition-all"
                       >
                         <X className="h-3.5 w-3.5" />
                       </button>
                    </div>
                  </>
                ) : (
                  <button
                    onClick={() => wmInputRef.current?.click()}
                    className="flex flex-col items-center gap-2"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm border border-slate-100 text-[#145be9]">
                      <Upload className="h-4 w-4" />
                    </div>
                    <span className="text-[11px] font-black text-slate-500">Upload Logo</span>
                  </button>
                )}
              </div>
              <input
                ref={wmInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => readFile(e.target.files[0], setWmImage)}
              />

              {/* Adjustments */}
              <div className="space-y-4">
                {/* Opacity */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Opacity</p>
                    <span className="text-[10px] font-black text-[#145be9]">{wmOpacity}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={wmOpacity}
                    onChange={(e) => setWmOpacity(Number(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-[#145be9] bg-slate-200"
                  />
                </div>

                {/* Size */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Size</p>
                    <span className="text-[10px] font-black text-[#145be9]">{wmSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="250"
                    value={wmSize}
                    onChange={(e) => setWmSize(Number(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-[#145be9] bg-slate-200"
                  />
                </div>
              </div>

              {/* position grid */}
              <div className="mt-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                  Positioning
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  {POSITIONS.map((pos) => (
                    <button
                      key={pos.id}
                      onClick={() => setWmPosition(pos.id)}
                      title={pos.label}
                      className={`h-9 w-full rounded-lg border-2 transition-all flex items-center justify-center ${
                        wmPosition === pos.id
                          ? 'border-[#145be9] bg-[#145be9]/5 shadow-[0_0_12px_rgba(20,91,233,0.1)]'
                          : 'border-slate-100 bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      {wmPosition === pos.id && (
                        <div className="h-2.5 w-2.5 rounded-full bg-[#145be9] shadow-[0_0_8px_rgba(20,91,233,0.4)] animate-in zoom-in-50 duration-300" />
                      )}
                    </button>
                  ))}
                </div>

                {/* wm target page toggle */}
                <div className="mt-4 flex items-center justify-between gap-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Page</p>
                  <div className="flex items-center rounded-lg bg-slate-100 p-1">
                     <button
                       onClick={() => setWmTarget('cover')}
                       className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-md transition-all ${
                         wmTarget === 'cover' ? 'bg-white text-[#145be9] shadow-sm' : 'text-slate-500 hover:text-slate-800'
                       }`}
                     >
                       Cover
                     </button>
                     <button
                       onClick={() => setWmTarget('all')}
                       className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-md transition-all ${
                         wmTarget === 'all' ? 'bg-white text-[#145be9] shadow-sm' : 'text-slate-500 hover:text-slate-800'
                       }`}
                     >
                       All
                     </button>
                  </div>
                </div>
              </div>

              {/* reset */}
              {(wmImage || wmOpacity !== 15 || wmPosition !== 'center') && (
                <button
                  onClick={handleResetWatermark}
                  className="mt-3 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-slate-600 transition-all"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset watermark
                </button>
              )}
            </div>

            {/* Cover Page Details (Only for non-simple templates) */}
            {selectedTemplate !== 'simple' && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                    <Layout className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-sm text-[#1a2b4b]">Cover Page Details</h3>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5 leading-tight">
                      Customise text and titles on the cover page.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Header */}
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Header Label</label>
                    <input 
                      type="text"
                      value={coverHeader}
                      onChange={(e) => setCoverHeader(e.target.value)}
                      placeholder="e.g. PROJECT PROPOSAL"
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:bg-white transition-all"
                    />
                  </div>

                  {/* Title */}
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Project Title</label>
                    <input 
                      type="text"
                      value={coverTitle}
                      onChange={(e) => setCoverTitle(e.target.value)}
                      placeholder={quotation?.projectName || "Project Name"}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:bg-white transition-all"
                    />
                  </div>

                  {/* Scope Title */}
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Scope Title (Bold)</label>
                    <textarea 
                      value={coverDescTitle}
                      onChange={(e) => setCoverDescTitle(e.target.value)}
                      placeholder="Provision of comprehensive structural..."
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:bg-white transition-all min-h-[60px]"
                    />
                  </div>

                  {/* Scope Description */}
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Scope Description</label>
                    <textarea 
                      value={coverDesc}
                      onChange={(e) => setCoverDesc(e.target.value)}
                      placeholder="This quotation includes initial feasibility..."
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:bg-white transition-all min-h-[100px]"
                    />
                  </div>

                  {/* Footer Address */}
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Footer Address</label>
                    <input 
                      type="text"
                      value={coverFooterAddr}
                      onChange={(e) => setCoverFooterAddr(e.target.value)}
                      placeholder="102 Innovation Drive, Suite 400..."
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:bg-white transition-all"
                    />
                  </div>

                  {/* Footer Website */}
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Footer Website</label>
                    <input 
                      type="text"
                      value={coverFooterWeb}
                      onChange={(e) => setCoverFooterWeb(e.target.value)}
                      placeholder="www.archledger.com"
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Terms & Conditions Selection (Only for 3-page and 4-page) */}
            {(selectedTemplate === 'threepage' || selectedTemplate === 'fourpage') && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-sm text-[#1a2b4b]">Terms & Conditions</h3>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5 leading-tight">
                      Select legal terms to include on the T&C page.
                    </p>
                  </div>
                </div>

                <div className="relative" ref={termsRef}>
                  <button
                    onClick={() => setIsTermsOpen(!isTermsOpen)}
                    className={`w-full flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold text-[#1a2b4b] transition-all cursor-pointer ${
                      isTermsOpen ? 'ring-2 ring-[#145be9]/10 border-[#145be9]' : 'hover:border-slate-300'
                    }`}
                  >
                    <span className="truncate">
                      {selectedTermsId 
                        ? ACTIVE_TERMS.find(t => t._id === selectedTermsId)?.versionLabel || 'Template Terms'
                        : 'Default Template Terms'}
                    </span>
                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${isTermsOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isTermsOpen && (
                    <div className="absolute left-0 right-0 top-full z-[100] mt-2 max-h-60 overflow-y-auto rounded-xl border border-slate-100 bg-white p-1.5 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 custom-scrollbar">
                      <div 
                        onClick={() => handleTermsChange('none')}
                        className={`group flex items-center justify-between rounded-lg px-3 py-2.5 cursor-pointer transition-all ${
                          !selectedTermsId ? 'bg-blue-50 text-[#145be9]' : 'hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <span className="text-[11px] font-black uppercase tracking-wider">Default Template Terms</span>
                        {!selectedTermsId && <div className="h-1 w-1 rounded-full bg-[#145be9]" />}
                      </div>
                      
                      {ACTIVE_TERMS.map((tc) => (
                        <div 
                          key={tc._id}
                          onClick={() => handleTermsChange(tc._id)}
                          className={`group flex items-center justify-between rounded-lg px-3 py-2.5 cursor-pointer transition-all ${
                            selectedTermsId === tc._id ? 'bg-[#145be9] text-white' : 'hover:bg-slate-50 text-slate-600'
                          }`}
                        >
                          <div className="flex flex-col">
                            <span className="text-[11px] font-black uppercase tracking-wider">{tc.versionLabel}</span>
                            {tc.status === 'draft' && <span className="text-[8px] font-bold opacity-70 tracking-widest uppercase">Draft Snapshot</span>}
                          </div>
                          {selectedTermsId === tc._id && <div className="h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,1)]" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {selectedTermsId && (
                  <div className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                    <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider">
                      Snapshot applied ✓
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ────── RIGHT PANEL ────── */}
          <div className="flex flex-col gap-4">

            {/* Template selector tabs */}
            <div className="flex flex-wrap gap-2">
              {TEMPLATES.map((tpl) => (
                <button
                  key={tpl.templateId || tpl.id}
                  onClick={() => handleSelectTemplate(tpl.templateId || tpl.id)}
                  className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-black transition-all ${
                    selectedTemplate === (tpl.templateId || tpl.id)
                      ? 'border-[#145be9] bg-[#145be9] text-white shadow-lg shadow-blue-500/20'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <FileText className="h-3.5 w-3.5" />
                  {tpl.title}
                </button>
              ))}
            </div>

            {/* description */}
            <p className="text-xs font-medium text-slate-500 -mt-1">
              {TEMPLATES.find((t) => (t.templateId || t.id) === selectedTemplate)?.description}
            </p>

            {/* A4 preview */}
            <div className="relative flex-1 rounded-2xl border border-slate-200 bg-slate-100 flex flex-col items-center justify-start p-2 sm:p-4 overflow-hidden min-h-[480px]">
              <div className="relative w-full max-w-[520px] aspect-[210/297] bg-white border border-slate-200 shadow-2xl overflow-hidden">

                {/* template render */}
                <div className="absolute inset-0 w-full h-full overflow-hidden">
                  {renderTemplate(selectedTemplate, false, quotation, {
                    bgImage, bgOpacity, bgBlur, bgFit, bgTarget,
                    wmImage, wmOpacity, wmPosition, wmSize, wmTarget,
                    coverHeader, coverTitle, coverDescriptionTitle: coverDescTitle, coverDescription: coverDesc,
                    coverFooterAddress: coverFooterAddr, coverFooterWebsite: coverFooterWeb,
                    termsAndConditions: { content: selectedTermsContent }
                  })}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ── Brand Identity Info Card ── */}
        {/* <div className="mb-20 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
             <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#145be9]">
                <Sparkles className="h-6 w-6" />
             </div>
             <div>
                <h2 className="text-lg font-black tracking-tight text-[#1a2b4b]">
                  Invoice Brand Identity
                </h2>
                <p className="text-sm font-medium text-slate-500">
                  Craft a professional aesthetic for your outgoing quotations. Layer textures and brand
                  marks to establish architectural authority.
                </p>
             </div>
          </div>
        </div> */}
      </div>

      {/* ── Fixed Bottom Action Bar (Reference from CreateQuotation) ── */}
      <div 
        className={`fixed bottom-0 right-0 z-50 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 bg-white p-4 transition-all duration-300 lg:px-8 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] ${
          isSidebarOpen ? 'lg:left-64' : 'left-0'
        }`}
      >
        <div className="mb-4 flex items-center gap-4 sm:mb-0">
          <button
            onClick={() => setIsPreviewOpen(true)}
            className="flex items-center gap-2 text-sm font-bold text-[#145be9] transition-colors hover:text-blue-800"
          >
            <Eye className="h-5 w-5" />
            <span>Full Preview</span>
          </button>
          <div className="h-6 w-px bg-gray-300" />
          <button
            onClick={() => navigate(`/dashboard/quotation-preview/${id}`)}
            className="flex items-center gap-2 text-sm font-bold text-gray-400 transition-colors hover:text-gray-600"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Preview</span>
          </button>
        </div>

        <div className="flex w-full items-center gap-4 sm:w-auto">
          <button
            onClick={() => navigate(`/dashboard/quotation-preview/${id}`)}
            className="flex-1 rounded-lg px-6 py-2.5 text-sm font-bold text-gray-500 transition-colors hover:text-gray-800 sm:flex-none uppercase tracking-widest text-[10px]"
          >
            Cancel
          </button>
          <button
            disabled={saveMutation.isPending}
            onClick={() => saveMutation.mutate()}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#145be9] px-8 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-blue-800 active:scale-95 disabled:opacity-50 sm:flex-none"
          >
            {saveMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            <span>{saveMutation.isPending ? 'Syncing...' : 'Save Template'}</span>
          </button>
        </div>
      </div>


      {/* ════════ FULL-SCREEN PREVIEW MODAL ════════ */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-[150] bg-[#323639] flex flex-col animate-in fade-in duration-200">
          <div className="h-[60px] bg-[#323639] border-b border-white/10 flex items-center justify-between px-4 shrink-0 shadow-sm">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <span className="text-white font-medium text-sm truncate">
                {TEMPLATES.find((t) => (t.templateId || t.id) === selectedTemplate)?.title}_Template.pdf
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleZoomOut} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors hidden sm:flex">
                <ZoomOut className="w-5 h-5" />
              </button>
              <span className="text-white/50 text-[10px] font-bold w-10 text-center hidden sm:block">
                {Math.round(zoom * 100)}%
              </span>
              <button onClick={handleZoomIn} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors hidden sm:flex">
                <ZoomIn className="w-5 h-5" />
              </button>
              <div className="w-px h-5 bg-white/20 mx-2 hidden sm:block" />
              <button className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                <Printer className="w-5 h-5" />
              </button>
              <button className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-1.5 sm:p-4 md:p-8 flex items-start justify-center">
            <div
              style={{ transform: `scale(${zoom})`, transition: 'transform 0.2s cubic-bezier(0.4,0,0.2,1)' }}
              className="w-full max-w-[850px] flex flex-col relative origin-top"
            >
              {renderTemplate(selectedTemplate, true, quotation, {
                bgImage, bgOpacity, bgBlur, bgFit, bgTarget,
                wmImage, wmOpacity, wmPosition, wmSize, wmTarget,
                coverHeader, coverTitle, coverDescriptionTitle: coverDescTitle, coverDescription: coverDesc,
                coverFooterAddress: coverFooterAddr, coverFooterWebsite: coverFooterWeb,
                termsAndConditions: { content: selectedTermsContent }
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── toast notification ── */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default EditQuotationTemplate;
