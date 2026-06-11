import { useQuery, useMutation } from '@tanstack/react-query';
import quotationApi from '../../../services/quotationApi';
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Simple from './components/Simple';
import DualPageFormat from './components/DualPageFormat';
import ThreePageDesign from './components/3-PageDesign';
import Complete4PageFormat from './components/Complete4-PageFormat';
import Creative3PageDesign from './components/3-PageDesign-2';
import MinimalistDesign from './components/MinimalistDesign-3-page';
import InstitutionalDesign from './components/InstitutionalDesign-4-page';
import ElegantDesign from './components/ElegantDesign-simple-page';
import { FileText, Compass, Briefcase, Plus, ArrowLeft,ZoomOut, ZoomIn, Printer, Download, Layout, Square } from 'lucide-react';
// Icon Map for dynamic lookup
const ICON_MAP = {
  FileText: <FileText className="w-5 h-5" />,
  Compass: <Compass className="w-5 h-5" />,
  Briefcase: <Briefcase className="w-5 h-5" />,
  Layout: <Layout className="w-5 h-5" />,
  Square: <Square className="w-5 h-5" />,
};

const QuotationFormat = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const quoteId = searchParams.get('quoteId'); // present when changing template on existing quote

  const [selectedFormat, setSelectedFormat] = useState('simple');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [zoom, setZoom] = useState(1);

  // Mutation for change-mode: PATCH only templateSettings.templateId
  const changeTemplateMutation = useMutation({
    mutationFn: () =>
      quotationApi.updateTemplateSettings(quoteId, { templateId: selectedFormat }),
    onSuccess: () => {
      navigate(`/dashboard/quotation-preview/${quoteId}`);
    },
  });

  const handleUseTemplate = () => {
    if (quoteId) {
      // Change-mode: PATCH the existing quotation's template, then go to hub
      changeTemplateMutation.mutate();
    } else {
      // Fresh creation: go to create-quotation with the selected template
      navigate(`/dashboard/create-quotation?template=${selectedFormat}`);
    }
  };

  // Fetch templates from backend
  const { data: templatesResponse, isLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: quotationApi.getTemplates,
  });

  const DEFAULT_FORMATS = [
    { templateId: 'simple', title: 'Simple', description: 'Clean, one-page minimal design.', icon: 'FileText', iconBg: 'bg-blue-50', pages: 1 },
    { templateId: 'dual', title: 'Dual Page', description: 'Sophisticated two-page layout.', icon: 'Compass', iconBg: 'bg-emerald-50', pages: 2 },
    { templateId: 'threepage', title: '3-Page Design', description: 'Complete proposal with T&C.', icon: 'Layout', iconBg: 'bg-amber-50', pages: 3 },
    { templateId: 'fourpage', title: 'Professional 4-Page', description: 'High-fidelity detailed format.', icon: 'Briefcase', iconBg: 'bg-indigo-50', pages: 4 },
    { templateId: 'creative', title: 'Creative Emerald 2-Page', description: 'Modern, high-contrast creative design.', icon: 'Layout', iconBg: 'bg-emerald-100', pages: 2 },
    { templateId: 'minimalist', title: 'Minimalist Bold', description: 'High-contrast monochrome design.', icon: 'Square', iconBg: 'bg-slate-100', pages: 3 },
    { templateId: 'institutional', title: 'Institutional Emerald', description: 'Premium 4-page corporate design.', icon: 'Briefcase', iconBg: 'bg-[#EBF0FF]', pages: 4 },
    { templateId: 'elegant', title: 'Elegant Serif', description: 'Sophisticated single-page quote.', icon: 'Compass', iconBg: 'bg-stone-100', pages: 1 },
  ];

  const fetchedFormats = templatesResponse?.data || [];
  const formats = fetchedFormats.length > 0 ? [...fetchedFormats] : [...DEFAULT_FORMATS];

  // Ensure creative, minimalist, institutional and elegant are always there
  ['creative', 'minimalist', 'institutional', 'elegant'].forEach(id => {
    if (!formats.find(f => (f.templateId || f.id) === id)) {
      formats.push(DEFAULT_FORMATS.find(f => f.templateId === id));
    }
  });

  // Template registry for dynamic rendering
  const MOCK_QUOTATION = {
    quotationNumber: '#STUDIO-2024-PREMIUM',
    createdAt: new Date(),
    customer: {
      fullName: 'Johnathan Wright',
      businessName: 'Global Innovation Labs',
      address: 'San Francisco, CA',
      email: 'john@innovation.lab'
    },
    items: [
      { name: 'Architectural Blueprinting', sku: 'Phase 1: Concepts', qty: 1, price: 4500, total: 4500, productImage: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=400&q=80' },
      { name: '3D Environmental Rendering', sku: 'Photorealistic Set', qty: 4, price: 850, total: 3400, productImage: 'https://images.unsplash.com/photo-1503387762-592dea58ef03?auto=format&fit=crop&w=400&q=80' },
      { name: 'Structural Load Analysis', sku: 'Engineering Certification', qty: 1, price: 1200, total: 1200, productImage: 'https://images.unsplash.com/photo-1590069230002-70cc8386377e?auto=format&fit=crop&w=400&q=80' }
    ],
    subtotal: 9100,
    taxTotal: 910,
    finalTotal: 10010,
    currency: 'USD'
  };

  const renderTemplate = (forceVertical = false) => {
    const props = { isVertical: forceVertical, quotation: MOCK_QUOTATION };
    switch (selectedFormat) {
      case 'simple':    return <Simple {...props} />;
      case 'dual':      return <DualPageFormat {...props} />;
      case 'threepage': return <ThreePageDesign {...props} />;
      case 'fourpage':  return <Complete4PageFormat {...props} />;
      case 'creative':  return <Creative3PageDesign {...props} />;
      case 'minimalist': return <MinimalistDesign {...props} />;
      case 'institutional': return <InstitutionalDesign {...props} />;
      case 'elegant': return <ElegantDesign {...props} />;
      default:          return <Simple {...props} />;
    }
  };

  // Prevent double scrolling when preview is open
  React.useEffect(() => {
    if (isPreviewOpen) {
      document.body.style.overflow = 'hidden';
      setZoom(1); 
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isPreviewOpen]);

  const handleZoomOut = () => setZoom(prev => Math.max(0.6, prev - 0.1));
  const handleZoomIn = () => setZoom(prev => Math.min(1.5, prev + 0.1));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#145be9]"></div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 min-h-screen flex flex-col">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[2rem] font-black tracking-tight text-[#1a2b4b] mb-1">Select Quotation Template</h1>
          <p className="text-gray-500 font-medium text-sm">Choose a professional format for your quotes from our architectural collection.</p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-100 rounded-full">
            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Note: All templates are optimized for standard A4 size</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[300px_1fr] gap-4 lg:gap-6 flex-1 mb-6">
        
        {/* Left Sidebar - Formats List */}
        <div className="bg-[#f8fafc] rounded-2xl p-3 lg:p-4 flex flex-col border border-gray-100">
          <h3 className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-3 px-1">Available Formats</h3>
          
          <div className="grid grid-cols-2 xl:grid-cols-1 gap-2 xl:space-y-0 xl:gap-3">
            {formats.map((format) => (
              <div 
                key={format.templateId}
                onClick={() => setSelectedFormat(format.templateId)}
                className={`relative p-3 xl:p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                  selectedFormat === format.templateId 
                    ? 'bg-white border-[#145be9] shadow-sm shadow-blue-500/10' 
                    : 'bg-transparent border-gray-200 hover:border-gray-300 hover:bg-white/50'
                }`}
              >
                {selectedFormat === format.templateId && (
                  <div className="absolute top-2 right-2 xl:top-3 xl:right-3 bg-[#145be9] text-white text-[7px] font-black uppercase tracking-wider py-0.5 px-1.5 rounded-full">
                    Selected
                  </div>
                )}
                
                <div className={`w-7 h-7 xl:w-8 xl:h-8 ${format.iconBg || 'bg-gray-100'} rounded-lg flex items-center justify-center mb-2 transition-colors`}>
                  {ICON_MAP[format.icon] ? React.cloneElement(ICON_MAP[format.icon], { 
                    className: `w-3.5 h-3.5 xl:w-4 xl:h-4 ${selectedFormat === format.templateId ? 'text-[#145be9]' : 'text-gray-400'}`
                  }) : <FileText className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-gray-400" />}
                </div>
                
                <h4 className={`font-bold text-sm xl:text-base mb-1 ${selectedFormat === format.templateId ? 'text-[#1a2b4b]' : 'text-gray-700'}`}>
                  {format.title}
                </h4>
                <p className="text-gray-500 text-[11px] leading-tight font-medium hidden sm:block">
                  {format.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Area - Document Preview Area */}
        <div className="flex flex-col flex-1 items-center bg-gray-50/30 rounded-2xl p-3 lg:p-6 border border-gray-100 overflow-hidden">
          {/* A4 Paper Container */}
          <div className="bg-white w-full max-w-[450px] sm:max-w-[550px] lg:max-w-[650px] aspect-[210/297] border border-gray-200 shadow-xl flex flex-col relative overflow-hidden origin-top">
            {/* Document Render Layer */}
            {renderTemplate(false)}
          </div>
        </div>
      </div>

      {/* Action Bottom Bar */}
      <div className="flex flex-col sm:flex-row xl:grid xl:grid-cols-[300px_1fr] gap-3 lg:gap-6 mt-auto">
        <button
          onClick={() => navigate(-1)}
          className="bg-white hover:bg-gray-50 text-gray-500 border border-gray-200 w-full py-2.5 lg:py-3 rounded-lg flex items-center justify-center gap-2 font-bold transition-all active:scale-95 text-sm lg:text-base"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go Back</span>
        </button>
        
        <div className="grid grid-cols-2 gap-3 lg:gap-4">
          <button 
            onClick={() => setIsPreviewOpen(true)}
            className="bg-[#0f52ba] hover:bg-blue-800 text-white w-full py-2.5 lg:py-3 rounded-lg font-bold transition-all active:scale-95 text-sm lg:text-base"
          >
            Preview Template
          </button>
          <button
            onClick={handleUseTemplate}
            disabled={changeTemplateMutation.isPending}
            className="bg-[#dce6fa] hover:bg-blue-200 text-[#0f52ba] w-full py-2.5 lg:py-3 rounded-lg font-bold transition-all active:scale-95 text-sm lg:text-base disabled:opacity-60"
          >
            {changeTemplateMutation.isPending ? 'Saving…' : (quoteId ? 'Apply Template' : 'Use This Template')}
          </button>
        </div>
      </div>

      {/* Full Screen Modal Viewer */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-[150] bg-[#323639] flex flex-col animate-in fade-in duration-200">
          {/* Top Toolbar */}
          <div className="h-[60px] bg-[#323639] border-b border-white/10 flex items-center justify-between px-4 flex-shrink-0 shadow-sm">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsPreviewOpen(false)} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <span className="text-white font-medium text-sm">
                {formats.find(f => f.templateId === selectedFormat)?.title}_Template.pdf
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={handleZoomOut} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors flex">
                <ZoomOut className="w-5 h-5" />
              </button>
              <span className="text-white/50 text-[10px] font-bold w-10 text-center block">
                {Math.round(zoom * 100)}%
              </span>
              <button onClick={handleZoomIn} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors flex">
                <ZoomIn className="w-5 h-5" />
              </button>
              <div className="w-px h-5 bg-white/20 mx-2 block"></div>
              <button className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                <Printer className="w-5 h-5" />
              </button>
              <button className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Document Canvas Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 flex items-start justify-center custom-scrollbar">
            <div 
              style={{ transform: `scale(${zoom})`, transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
              className="w-full max-w-[850px] flex flex-col relative my-auto origin-top"
            >
              {/* Document Render Layer */}
              <div className="w-full">
                {renderTemplate(true)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotationFormat;
