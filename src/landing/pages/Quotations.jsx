import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Briefcase,
  Compass,
  Download,
  FileText,
  Layers,
  Layout,
  Printer,
  ShieldCheck,
  Square,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import Footer from '../components/Footer';
import Simple from '../../pages/company/quotations/components/Simple';
import DualPageFormat from '../../pages/company/quotations/components/DualPageFormat';
import ThreePageDesign from '../../pages/company/quotations/components/3-PageDesign';
import Complete4PageFormat from '../../pages/company/quotations/components/Complete4-PageFormat';
import Creative3PageDesign from '../../pages/company/quotations/components/3-PageDesign-2';
import MinimalistDesign from '../../pages/company/quotations/components/MinimalistDesign-3-page';
import InstitutionalDesign from '../../pages/company/quotations/components/InstitutionalDesign-4-page';
import ElegantDesign from '../../pages/company/quotations/components/ElegantDesign-simple-page';

const iconMap = {
  FileText,
  Layers,
  Layout,
  ShieldCheck,
  Briefcase,
  Square,
  Compass,
};

const templates = [
  { templateId: 'simple', title: 'Simple', description: 'Clean, one-page minimal design.', icon: 'FileText', iconBg: 'bg-blue-50', pages: 1 },
  { templateId: 'dual', title: 'Dual Page', description: 'Sophisticated two-page layout.', icon: 'Layers', iconBg: 'bg-emerald-50', pages: 2 },
  { templateId: 'threepage', title: '3-Page Design', description: 'Complete proposal with T&C.', icon: 'Layout', iconBg: 'bg-amber-50', pages: 3 },
  { templateId: 'fourpage', title: 'Professional 4-Page', description: 'High-fidelity detailed format.', icon: 'ShieldCheck', iconBg: 'bg-indigo-50', pages: 4 },
  { templateId: 'creative', title: 'Creative Emerald 2-Page', description: 'Modern, high-contrast creative design.', icon: 'Briefcase', iconBg: 'bg-emerald-100', pages: 2 },
  { templateId: 'minimalist', title: 'Minimalist Bold', description: 'High-contrast monochrome design.', icon: 'Square', iconBg: 'bg-slate-100', pages: 3 },
  { templateId: 'institutional', title: 'Institutional Emerald', description: 'Premium 4-page corporate design.', icon: 'Briefcase', iconBg: 'bg-[#EBF0FF]', pages: 4 },
  { templateId: 'elegant', title: 'Elegant Serif', description: 'Sophisticated single-page quote.', icon: 'Compass', iconBg: 'bg-stone-100', pages: 1 },
];

const renderTemplate = (type, isVertical = false, quotationData = null, settings = {}) => {
  const hasSettings = Object.keys(settings).length > 0;
  const mergedQuotation = quotationData || hasSettings
    ? {
        ...quotationData,
        templateSettings: {
          ...(quotationData?.templateSettings || {}),
          ...settings,
        },
      }
    : null;

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

const Quotations = () => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTemplateId, setPreviewTemplateId] = useState(null);
  const [zoom, setZoom] = useState(0.9);

  const selectedTemplate = templates.find((template) => template.templateId === previewTemplateId);

  const handleOpenPreview = (templateId) => {
    setPreviewTemplateId(templateId);
    setZoom(0.9);
    setPreviewOpen(true);
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.1, 1.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.1, 0.5));

  return (
    <div className="min-h-screen bg-[#fafcff] font-sans overflow-x-hidden flex flex-col">
      <main className="flex-1">
        <section className="px-6 py-16 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-3xl">
              <span className="text-xs font-black uppercase tracking-widest text-[#145be9]">
                Digital Quotations
              </span>
              <h1 className="mt-5 text-4xl font-black leading-tight text-[#1a2b4b] sm:text-5xl lg:text-6xl">
                Create professional quotations clients can review with confidence.
              </h1>
              <p className="mt-6 max-w-2xl text-base font-medium leading-8 text-slate-500 sm:text-lg">
                A quotation is a clear price proposal for products or services. Quick Quote lets companies create, send, and track digital quotations to clients.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center rounded-lg bg-[#145be9] px-6 py-3 text-sm font-bold text-white shadow-md shadow-blue-500/20 transition-all hover:scale-105 hover:bg-blue-700"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-gray-100 bg-white px-6 py-14 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-[#145be9]">
                  Templates
                </span>
                <h2 className="mt-3 text-3xl font-black text-[#1a2b4b]">
                  Pick a format for every client conversation.
                </h2>
              </div>
              <p className="max-w-md text-sm font-medium leading-6 text-slate-500">
                From a concise one-page quote to detailed multi-page proposals with terms and conditions.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {templates.map((template) => {
                const Icon = iconMap[template.icon];

                return (
                  <article
                    key={template.templateId}
                    onClick={() => handleOpenPreview(template.templateId)}
                    className="cursor-pointer rounded-lg border border-slate-100 bg-[#fafcff] p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-blue-100 hover:shadow-md"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        handleOpenPreview(template.templateId);
                      }
                    }}
                  >
                    <div className="mb-5 flex items-start justify-between gap-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${template.iconBg} text-[#145be9]`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="shrink-0 rounded-lg bg-white px-3 py-1 text-[11px] font-black uppercase tracking-wider text-[#1a2b4b] ring-1 ring-slate-100">
                        {template.pages} {template.pages === 1 ? 'page' : 'pages'}
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-[#1a2b4b]">
                      {template.title}
                    </h3>
                    <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
                      {template.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-6 py-14 lg:px-8">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 rounded-lg bg-[#1a2b4b] p-8 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-black text-white">
                Ready to send sharper quotations?
              </h2>
              <p className="mt-2 text-sm font-medium leading-6 text-blue-100">
                Start with a template, add your details, and keep every client quote organized.
              </p>
            </div>
            <Link
              to="/register"
              className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[#145be9] px-6 py-3 text-sm font-bold text-white shadow-md shadow-blue-500/20 transition-all hover:scale-105 hover:bg-blue-700"
            >
              Get Started
            </Link>
          </div>
        </section>
      </main>

      {previewOpen && (
        <div className="fixed inset-0 z-[150] bg-[#323639] flex flex-col animate-in fade-in duration-200">
          <div className="h-[60px] bg-[#323639] border-b border-white/10 flex items-center justify-between px-4 shrink-0 shadow-sm">
            <div className="flex items-center gap-4 min-w-0">
              <button
                onClick={() => setPreviewOpen(false)}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                aria-label="Close preview"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <span className="text-white font-medium text-sm truncate">
                {selectedTemplate?.title || 'Template'}_Template.pdf
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleZoomOut} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors hidden sm:flex" aria-label="Zoom out">
                <ZoomOut className="w-5 h-5" />
              </button>
              <span className="text-white/50 text-[10px] font-bold w-10 text-center hidden sm:block">
                {Math.round(zoom * 100)}%
              </span>
              <button onClick={handleZoomIn} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors hidden sm:flex" aria-label="Zoom in">
                <ZoomIn className="w-5 h-5" />
              </button>
              <div className="w-px h-5 bg-white/20 mx-2 hidden sm:block" />
              <button className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors" aria-label="Print preview">
                <Printer className="w-5 h-5" />
              </button>
              <button className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors" aria-label="Download preview">
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-1.5 sm:p-4 md:p-8 flex items-start justify-center">
            <div
              style={{ transform: `scale(${zoom})`, transition: 'transform 0.2s cubic-bezier(0.4,0,0.2,1)' }}
              className="w-full max-w-[850px] flex flex-col relative origin-top"
            >
              {renderTemplate(previewTemplateId, true, null, {})}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Quotations;
