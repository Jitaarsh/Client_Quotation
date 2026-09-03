import DesignLayer from './DesignLayer';
import { Calendar, Clock, CheckSquare, MapPin, Globe, BadgeCheck, Briefcase, Building2 } from 'lucide-react';
import { chunkHtmlElements, plainTextToHtml } from '../../../../utils/pdfTextExtractor';

const currencySymbols = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

export const formatMoney = (amount = 0, currency = 'USD') => {
  const symbol = currencySymbols[currency] || currencySymbols.USD;
  return `${symbol}${Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatDate = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const splitArray = (list, chunkSize) => {
  if (!Array.isArray(list) || list.length === 0) return [[]];
  const result = [];
  for (let i = 0; i < list.length; i += chunkSize) {
    result.push(list.slice(i, i + chunkSize));
  }
  return result;
};

const getTermsTextPages = (config, data, linesPerPage = 24) => {
  const source = config.termsSource || 'custom';
  let rawText = '';

  if (source === 'pdf') {
    rawText = String(config.termsPdfText || '');
  } else if (source === 'saved') {
    rawText = String(data?.termsAndConditions?.content || config.termsText || '');
  } else {
    rawText = String(config.termsText || '');
  }

  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (source === 'saved' || lines.length === 0) {
    return [rawText];
  }

  const chunks = splitArray(lines, linesPerPage);
  return chunks.map((chunk) => chunk.join('\n'));
};

export const expandCustomPages = (pages = [], data = {}) => {
  const expanded = [];

  pages.forEach((page) => {
    if (page.type === 'items') {
      const items = Array.isArray(data.items) ? data.items : [];
      const itemChunks = splitArray(items, 4);
      itemChunks.forEach((itemChunk, index) => {
        expanded.push({
          ...page,
          itemsChunk: itemChunk,
          pageSegmentIndex: index,
        });
      });
    } else if (page.type === 'terms') {
      const textPages = getTermsTextPages(page.config, data, 26);
      textPages.forEach((pageText, index) => {
        expanded.push({
          ...page,
          termsPageText: pageText,
          pageSegmentIndex: index,
        });
      });
    } else {
      expanded.push(page);
    }
  });

  return expanded;
};

const normalizeQuotationData = (quotation = {}, companyInfo = {}) => {
  const normalized = {
    ...quotation,
    companyName: quotation.companyName || companyInfo.companyName || '',
    customer: {
      ...(quotation.customer || {}),
      businessName: quotation.customer?.businessName || quotation.customer?.fullName || '',
      address: quotation.customer?.address || '',
      email: quotation.customer?.email || '',
      fullName: quotation.customer?.fullName || quotation.customer?.businessName || '',
    },
    createdAt: quotation.createdAt || new Date(),
    quotationNumber: quotation.quotationNumber || 'QTN-0000',
    projectName: quotation.projectName || quotation.customer?.businessName || companyInfo.companyName || 'Project Title',
    currency: quotation.currency || 'USD',
    termsAndConditions: quotation.termsAndConditions || {},
  };
  return normalized;
};

const DualCoverOnly = ({ quotation, companyInfo }) => {
  const ts = quotation?.templateSettings || {};
  const data = normalizeQuotationData(quotation, companyInfo);

  return (
    <div className="relative bg-white text-[#111827] flex flex-col p-[48px] shrink-0 overflow-hidden w-[794px] h-[1123px] min-w-[794px] min-h-[1123px] border border-gray-100 select-none">
      <DesignLayer settings={ts} shouldShowBg={true} shouldShowWm={ts.showWatermark !== false} />
      <div className="flex-1 flex flex-col p-12 pb-16 relative z-10">
        <div className="relative mb-14">
          <div className="absolute -left-12 -top-12 -right-12 bottom-0 w-[calc(100%+96px)] h-full bg-[#E8EDF2] z-0">
            <div className="absolute inset-0 opacity-[0.1]" style={{ backgroundImage: 'linear-gradient(#1a2b4b 1px, transparent 1px), linear-gradient(90deg, #1a2b4b 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
          </div>

          <div className="relative z-10 pt-4 pb-0 w-[95%]">
            <h4 className="text-[12px] font-black uppercase tracking-[0.15em] text-[#145be9] mb-4">
              {ts.coverHeader || 'PROJECT PROPOSAL'}
            </h4>
            <h1 className="text-[52px] font-bold text-[#111827] leading-[1.05] tracking-tight mb-8">
              {ts.coverTitle || data.projectName || 'Modern Residential Complex'}
            </h1>

            <div className="flex items-center">
              <div className="bg-[#E5F0FF] text-[#145be9] px-4 py-1.5 rounded text-[12px] font-black uppercase tracking-widest">
                REF: {data.quotationNumber}
              </div>
              <div className="w-12 h-[1px] bg-gray-300 mx-4" />
              <div className="text-[14px] text-[#4b5563] font-medium">
                Issue Date: {formatDate(data.createdAt)}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-10 w-full relative z-10">
          <h4 className="text-[11px] font-black uppercase tracking-[0.15em] text-[#145be9] mb-3">
            CLIENT INFORMATION
          </h4>
          <div className="bg-[#f3f7fb] border-l-[4px] border-[#145be9] rounded-r-xl p-6">
            <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">TO:</div>
            <h3 className="text-[22px] font-bold text-[#111827] mb-2">{data.customer?.businessName || 'Sterling Miller Architects'}</h3>
            <div className="text-[#4b5563] text-[14px] leading-relaxed">
              {(data.customer?.address || '452 Skyline Blvd, CA\nSan Francisco, 94105\nUnited States').split('\n').map((line, i) => <div key={i}>{line}</div>)}
            </div>
          </div>
        </div>

        <div className="mb-12 relative z-10">
          <h4 className="text-[11px] font-black uppercase tracking-[0.15em] text-[#145be9] mb-3">
            SCOPE OF WORK
          </h4>
          <p className="text-[16px] font-bold text-[#111827] leading-[1.5] mb-4 w-[95%]">
            {ts.coverDescriptionTitle || 'Provision of comprehensive structural consultancy and civil engineering designs for the proposed multi-story residential building.'}
          </p>
          <p className="text-[13px] text-[#4b5563] leading-[1.7] w-[95%]">
            {ts.coverDescription || 'This quotation includes initial feasibility analysis, schematic design development, structural load calculations, and construction documentation required for city permit approval. Our approach leverages high-precision BIM modeling to ensure structural integrity and architectural alignment throughout the project lifecycle.'}
          </p>
        </div>

        <div className="mb-auto w-full relative z-10">
          <div className="border border-[#aac2f2] rounded-[14px] flex w-full">
            <div className="flex-1 p-5 border-r border-[#aac2f2]">
              <div className="text-[10px] font-black uppercase tracking-[0.15em] text-[#145be9] mb-1.5">VALIDITY</div>
              <div className="text-[#111827] font-semibold text-[14px]">30 Days from Issue</div>
            </div>
            <div className="flex-1 p-5 border-r border-[#aac2f2]">
              <div className="text-[10px] font-black uppercase tracking-[0.15em] text-[#145be9] mb-1.5">PRIORITY</div>
              <div className="text-[#111827] font-semibold text-[14px]">Standard Delivery</div>
            </div>
            <div className="flex-1 p-5">
              <div className="text-[10px] font-black uppercase tracking-[0.15em] text-[#145be9] mb-1.5">STATUS</div>
              <div className="text-[#059669] font-bold text-[14px] flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#059669]" />
                Draft Proposal
              </div>
            </div>
          </div>
        </div>

        <div className="w-full mt-10">
          <div className="flex justify-between items-end w-full border-t border-gray-200 pt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-[#145be9]" />
                <span className="text-[#4b5563] text-[11px] font-medium uppercase tracking-widest">{ts.coverFooterAddress || '102 INNOVATION DRIVE, SUITE 400, NY'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-[#145be9]" />
                <span className="text-[#4b5563] text-[11px] font-bold uppercase tracking-widest border-b border-[#4b5563] pb-0.5 mt-1">{ts.coverFooterWebsite || 'WWW.ARCHITECTURALLEDGER.COM'}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[#111827] font-bold text-[14px] mb-2">contact@archledger.com</div>
              <div className="text-[#9ca3af] text-[10px] font-black uppercase tracking-widest">© 2024 ARCHITECTURAL LEDGER</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InstCoverOnly = ({ quotation, companyInfo }) => {
  const ts = quotation?.templateSettings || {};
  const data = normalizeQuotationData(quotation, companyInfo);

  return (
    <div className="relative bg-white text-[#111827] flex flex-col p-[48px] shrink-0 overflow-hidden w-[794px] h-[1123px] min-w-[794px] min-h-[1123px] border border-gray-100 select-none">
      <DesignLayer settings={ts} shouldShowBg={ts.bgTarget === 'all' || ts.bgTarget === 'cover'} shouldShowWm={ts.showWatermark !== false} />
      <div className="flex h-full w-full relative z-10">
        <div className="w-[280px] bg-[#131B2A] text-white flex flex-col px-10 py-16 shrink-0 relative overflow-hidden">
          <div className="absolute -right-20 top-40 w-40 h-40 border-[20px] border-[#00A98F]/10 rounded-full" />
          <div className="flex items-center gap-4 mb-32 relative z-10">
            <div className="w-12 h-12 bg-[#00A98F] flex items-center justify-center shrink-0 shadow-lg">
              <Briefcase size={22} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-[1.05rem] leading-tight tracking-wide uppercase">
              {ts.coverHeader || data.companyName || 'QUICK QUOTE SOLUTIONS'}
            </span>
          </div>
          <div className="mb-12 relative z-10">
            <h4 className="text-[#00A98F] text-[10px] font-black tracking-[0.2em] uppercase mb-4">Prepared For</h4>
            <h2 className="text-[2.1rem] font-bold leading-[1.1] tracking-tight text-white mb-2">
              {data.customer?.businessName || data.customer?.fullName || 'Client Name'}
            </h2>
            <div className="w-12 h-1 bg-[#00A98F] mt-4" />
          </div>
          <div className="relative z-10">
            <h4 className="text-[#00A98F] text-[10px] font-black tracking-[0.2em] uppercase mb-3">Quotation Reference</h4>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">#{data.quotationNumber}</p>
          </div>
          <div className="mt-auto relative z-10">
            <div className="w-full h-px bg-slate-700/50 mb-8" />
            <div className="mb-6">
              <h4 className="text-[#00A98F] text-[10px] font-black tracking-[0.2em] uppercase mb-2">Date Of Issue</h4>
              <p className="text-white text-sm font-bold uppercase">{formatDate(data.createdAt)}</p>
            </div>
            <div>
              <h4 className="text-[#00A98F] text-[10px] font-black tracking-[0.2em] uppercase mb-2">Valid Until</h4>
              <p className="text-white text-sm font-bold uppercase">{ts.validityDays || '30 Days'} Validity</p>
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col">
          <div className="flex-1 bg-white px-14 pt-16 pb-12">
            <div className="mb-14">
              <h1 className="text-6xl font-black text-slate-900 inline-block border-b-[8px] border-[#00A98F] pb-2 tracking-tighter uppercase">
                Quotation
              </h1>
            </div>
            <p className="text-xl text-slate-600 font-medium leading-relaxed max-w-md mb-12">
              {ts.coverTitle || data.projectName || 'Institutional Service Proposal'}
            </p>
            <div className="bg-[#F8F9FA] border-l-[4px] border-[#00A98F] p-8 flex gap-5 shadow-sm">
              <div className="shrink-0 pt-0.5">
                <BadgeCheck size={26} className="text-[#00A98F]" strokeWidth={2} />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 tracking-[0.2em] mb-4 uppercase">EXECUTIVE SUMMARY</h4>
                <p className="text-slate-600 leading-relaxed text-[15px] font-medium italic">
                  {ts.coverDescription || 'Provision of comprehensive consultancy and engineering designs tailored for institutional requirements.'}
                </p>
              </div>
            </div>
          </div>
          <div className="h-[35%] bg-[#EBF0FF] px-14 py-12 flex items-end relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00A98F]/5 rounded-bl-full" />
            <div className="flex justify-between w-full items-end pb-4 relative z-10">
              <div>
                <h4 className="text-[10px] font-black text-slate-500 tracking-[0.2em] mb-3 uppercase">PREPARED BY</h4>
                <h3 className="text-2xl font-black text-slate-900 mb-1">Architecture Hub</h3>
                <p className="text-slate-500 text-sm font-bold uppercase">Senior Solutions Architect</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-[4.5rem] h-[4.5rem] bg-[#333C4A] flex items-center justify-center mb-3 shadow-lg transform -rotate-3">
                  <span className="text-white text-3xl opacity-80 font-serif italic">QC</span>
                </div>
                <h4 className="text-[10px] font-black text-slate-500 tracking-[0.2em] uppercase">AUTHORIZED SIGNATORY</h4>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">
        PAGE 01 — 04
      </div>
    </div>
  );
};

const MinimalCoverOnly = ({ quotation, companyInfo }) => {
  const ts = quotation?.templateSettings || {};
  const data = normalizeQuotationData(quotation, companyInfo);

  return (
    <div className="relative bg-white text-[#111827] flex flex-col p-[48px] shrink-0 overflow-hidden w-[794px] h-[1123px] min-w-[794px] min-h-[1123px] border border-gray-100 select-none">
      <DesignLayer settings={ts} shouldShowBg={ts.bgTarget === 'all' || ts.bgTarget === 'cover'} shouldShowWm={ts.showWatermark !== false} />
      <div className="p-12 h-full flex flex-col relative z-10">
        <div className="border-[6px] border-black p-10 h-full flex flex-col relative">
          <header className="flex justify-between items-start border-b-[3px] border-black pb-6 mb-10">
            <h1 className="text-3xl font-black uppercase tracking-tighter w-2/3 leading-none text-black">
              {ts.coverHeader || data.companyName || 'QUICK QUOTE'}
            </h1>
            <div className="text-right">
              <p className="font-mono text-[10px] font-bold bg-black text-white px-2 py-0.5 inline-block mb-1">
                REF: {data.quotationNumber}
              </p>
              <p className="font-mono text-[10px] uppercase font-bold text-black">{formatDate(data.createdAt)}</p>
            </div>
          </header>
          <div className="mb-12">
            <h2 className="text-5xl font-black uppercase tracking-tighter leading-[0.9] mb-4 text-black">
              {ts.coverTitle || data.projectName || 'PROJECT PROPOSAL'}
            </h2>
            <h3 className="text-xl font-mono uppercase text-slate-500 font-bold">
              {ts.coverSubtitle || 'Standard Quotation Document'}
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-12 mb-12 border-t-[1.5px] border-black pt-6">
            <div>
              <h4 className="font-mono text-[10px] uppercase mb-3 font-black text-black">Client</h4>
              <p className="text-lg font-black uppercase mb-1 text-black">{data.customer?.businessName || data.customer?.fullName || 'Client Name'}</p>
              <div className="font-mono text-[10px] space-y-0.5 text-slate-700 font-bold uppercase tracking-tight">
                {data.customer?.address ? data.customer.address.split('\n').map((l, i) => <p key={i}>{l}</p>) : <p>Address Not Provided</p>}
              </div>
            </div>
            <div>
              <h4 className="font-mono text-[10px] uppercase mb-3 font-black text-black">Metadata</h4>
              <div className="font-mono text-[10px] space-y-2 font-bold uppercase tracking-tight">
                <div className="flex justify-between border-b border-black pb-0.5 text-black">
                  <span>Validity</span> <span>{ts.validityDays || '30 Days'}</span>
                </div>
                <div className="flex justify-between border-b border-black pb-0.5 text-black">
                  <span>Priority</span> <span>Normal</span>
                </div>
                <div className="flex justify-between border-b border-black pb-0.5 text-black">
                  <span>Status</span> <span>Draft</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-grow">
            <h4 className="font-mono text-[10px] uppercase mb-3 font-black text-black border-b-[1.5px] border-black pb-1">Scope of Work</h4>
            <p className="font-sans font-medium text-sm text-slate-800 leading-relaxed">
              {ts.coverDescription || 'Provision of comprehensive consultancy and engineering designs as per the discussed requirements.'}
            </p>
          </div>
          <footer className="mt-auto border-t-[3px] border-black pt-4 flex justify-between font-mono text-[9px] uppercase font-black text-black">
            <span>{ts.coverFooterWebsite || 'WWW.QUICKQUOTE.COM'}</span>
            <span>CONTACT@COMPANY.COM</span>
          </footer>
        </div>
      </div>
      <div className="absolute bottom-6 right-16 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">
        PAGE 01 — 03
      </div>
    </div>
  );
};

const SimpleCoverOnly = ({ quotation, companyInfo }) => {
  const ts = quotation?.templateSettings || {};
  const data = normalizeQuotationData(quotation, companyInfo);

  return (
    <div className="relative bg-white text-[#111827] flex flex-col p-[48px] shrink-0 overflow-hidden w-[794px] h-[1123px] min-w-[794px] min-h-[1123px] border border-gray-100 select-none">
      <DesignLayer settings={ts} shouldShowBg={true} shouldShowWm={ts.showWatermark !== false} />
      <div className="h-full flex flex-col relative z-10 p-12">
        <div className="flex items-start justify-between mb-10 gap-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#111827] flex items-center justify-center rounded-lg text-white text-[14px] font-black">
              {data.companyName?.charAt(0) || 'S'}
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#6b7280] font-bold mb-2">{ts.coverHeader || data.companyName || 'STUDIO PRIME'}</p>
              <h1 className="text-3xl font-black text-[#111827] leading-tight">{data.companyName || 'STUDIO PRIME'}</h1>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-[5rem] font-black text-[#cce2fc] leading-none tracking-tight">QUOTATION</h2>
          </div>
        </div>

        <div className="flex justify-between mb-10 gap-10">
          <div className="text-[13px] text-[#64748b] leading-[1.7]">
            <p>{companyInfo.companyName || 'Architecture Hub'}</p>
            <p>{companyInfo.address || '882 Architectural Way'}</p>
            <p>{companyInfo.email || 'contact@studioquote.com'}</p>
          </div>
          <div className="text-[13px] text-[#111827] font-semibold">
            <div className="mb-3">
              <div className="text-[10px] uppercase tracking-[0.25em] text-[#94a3b8] mb-1">QUOTE NO</div>
              <div>{data.quotationNumber}</div>
            </div>
            <div className="mb-3">
              <div className="text-[10px] uppercase tracking-[0.25em] text-[#94a3b8] mb-1">DATE</div>
              <div>{formatDate(data.createdAt)}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-[#94a3b8] mb-1">VALIDITY</div>
              <div>{ts.validityDays || '30 Days'}</div>
            </div>
          </div>
        </div>

        <div className="mb-12">
          <div className="w-12 h-1 bg-[#2563eb] mb-3"></div>
          <h4 className="text-[#2563eb] font-black text-[12px] uppercase tracking-[0.15em] mb-2">Bill To</h4>
          <h3 className="text-[22px] font-bold text-[#111827] mb-1">{data.customer?.businessName || data.customer?.fullName || 'Client Name'}</h3>
          <div className="text-[#64748b] text-[13px] leading-[1.6] whitespace-pre-line">
            {data.customer?.address || 'Client Address'}
          </div>
        </div>

        <div className="mt-auto pt-6 border-t border-slate-200">
          <div className="flex justify-between items-center text-[10px] uppercase tracking-[0.3em] text-slate-500 font-black">
            <span>{ts.coverFooterWebsite || 'WWW.STUDIOQUOTE.COM'}</span>
            <span>{ts.coverFooterAddress || companyInfo.address || 'San Francisco, CA 94103'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ElegantCoverOnly = ({ quotation, companyInfo }) => {
  const ts = quotation?.templateSettings || {};
  const data = normalizeQuotationData(quotation, companyInfo);

  return (
    <div className="relative bg-white text-[#111827] flex flex-col p-[48px] shrink-0 overflow-hidden w-[794px] h-[1123px] min-w-[794px] min-h-[1123px] border border-gray-100 select-none">
      <DesignLayer settings={ts} shouldShowBg={true} shouldShowWm={ts.showWatermark !== false} />
      <div className="h-full flex flex-col bg-white/95 relative z-10">
        <div className="px-14 pt-16 pb-10 flex justify-between items-start">
          <div>
            <h1 className="text-[3.25rem] font-serif tracking-[0.15em] leading-none mb-4 text-slate-900">PRICE QUOTE</h1>
            <h2 className="text-sm font-semibold tracking-widest uppercase mb-1 text-slate-700">{data.companyName || ts.coverHeader || 'QUICK QUOTE SOLUTIONS'}</h2>
            <p className="text-[10px] text-slate-500 tracking-wide uppercase font-bold">Professional Services | Precision Delivery</p>
          </div>
          <div className="text-right">
            <div className="w-12 h-12 bg-slate-900 flex items-center justify-center text-white mb-4 ml-auto">
              <span className="font-serif text-2xl italic">E</span>
            </div>
          </div>
        </div>

        <div className="px-14 pb-8 flex justify-between">
          <div className="w-[45%]">
            <h3 className="font-serif text-2xl mb-4 text-slate-900 border-b border-slate-100 pb-2">BILL TO</h3>
            <p className="text-sm font-bold text-slate-700 uppercase tracking-tight mb-1">{data.customer?.businessName || data.customer?.fullName || 'Client Name'}</p>
            <p className="text-[11px] text-slate-500 leading-relaxed font-medium whitespace-pre-line">
              {data.customer?.address || 'Client Address'}
              {data.customer?.email ? `\n${data.customer.email}` : ''}
            </p>
          </div>
          <div className="w-[40%] flex flex-col gap-3 text-[11px] mt-2">
            <div className="flex items-end justify-between border-b border-slate-100 pb-1.5">
              <span className="font-bold uppercase tracking-[0.1em] text-slate-400">QUOTE #:</span>
              <span className="text-slate-800 font-bold">{data.quotationNumber}</span>
            </div>
            <div className="flex items-end justify-between border-b border-slate-100 pb-1.5">
              <span className="font-bold uppercase tracking-[0.1em] text-slate-400">DATE:</span>
              <span className="text-slate-800 font-bold">{formatDate(data.createdAt)}</span>
            </div>
            <div className="flex items-end justify-between border-b border-slate-100 pb-1.5">
              <span className="font-bold uppercase tracking-[0.1em] text-slate-400">VALIDITY:</span>
              <span className="text-slate-800 font-bold">{ts.validityDays || '30 Days'}</span>
            </div>
          </div>
        </div>

        <div className="px-14 mt-auto pb-10">
          <div className="bg-[#F4EEE8] py-6 text-center tracking-[0.4em] font-serif text-[11px] font-bold text-slate-700 uppercase rounded-2xl">
            Thank you for choosing our excellence
          </div>
        </div>
      </div>
    </div>
  );
};

const CreativeCoverOnly = ({ quotation, companyInfo }) => {
  const ts = quotation?.templateSettings || {};
  const data = normalizeQuotationData(quotation, companyInfo);

  return (
    <div className="relative bg-white text-[#111827] flex flex-col p-[48px] shrink-0 overflow-hidden w-[794px] h-[1123px] min-w-[794px] min-h-[1123px] border border-gray-100 select-none">
      <DesignLayer settings={ts} shouldShowBg={true} shouldShowWm={ts.showWatermark !== false} />
      <div className="flex h-full relative z-10">
        <div className="w-12 bg-emerald-600 h-full flex flex-col justify-end py-12 shrink-0">
          <p className="transform -rotate-90 text-white/80 text-[10px] font-bold tracking-[0.3em] uppercase whitespace-nowrap">{ts.coverFooterWebsite || 'QUICK QUOTE'}</p>
        </div>

        <div className="p-16 w-full flex flex-col relative">
          <div className="absolute top-16 right-16 text-right">
            <h1 className="text-5xl font-black text-zinc-900 tracking-tighter uppercase leading-none">{(ts.coverHeader || 'PROJECT PROPOSAL').split(' ')[0]}</h1>
            <h1 className="text-5xl font-black text-emerald-600 tracking-tighter uppercase leading-none">{(ts.coverHeader || 'PROJECT PROPOSAL').split(' ').slice(1).join(' ')}</h1>
            <p className="text-zinc-500 font-bold mt-4 tracking-widest text-xs">REF: {data.quotationNumber}</p>
          </div>

          <div className="mt-32">
            <h2 className="text-3xl font-black text-zinc-900 tracking-tight max-w-[80%] leading-tight">{ts.coverTitle || data.projectName || 'Modern Residential Complex'}</h2>
            <div className="flex items-center gap-4 mt-6 text-[11px] font-black uppercase tracking-widest text-zinc-400">
              <span className="flex items-center gap-1.5"><Calendar size={14} className="text-emerald-600" /> {formatDate(data.createdAt)}</span>
              <span className="w-1 h-1 bg-zinc-300 rounded-full" />
              <span className="flex items-center gap-1.5"><Clock size={14} className="text-emerald-600" /> {ts.validityDays || '30 DAYS'} VALIDITY</span>
              <span className="w-1 h-1 bg-zinc-300 rounded-full" />
              <span className="flex items-center gap-1.5 text-emerald-600"><CheckSquare size={14} /> DRAFT PROPOSAL</span>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-8 mt-16">
            <div className="col-span-2 bg-zinc-50 p-6 rounded-2xl border border-zinc-100 shadow-sm">
              <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Prepared For</h3>
              <p className="font-black text-zinc-900 text-lg leading-tight mb-3">{data.customer?.businessName || data.customer?.fullName || 'Client Name'}</p>
              <div className="text-xs font-bold text-zinc-500 space-y-1 leading-relaxed">
                {(data.customer?.address || 'Client Address Not Provided').split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </div>
            <div className="col-span-3 p-6 flex flex-col justify-center">
               <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-4">Project Scope</h3>
               <p className="text-zinc-900 font-bold text-lg leading-snug mb-3">{ts.coverDescriptionTitle || 'Provision of comprehensive consultancy and engineering designs.'}</p>
               <p className="text-zinc-500 text-xs font-medium leading-relaxed">{ts.coverDescription || 'Detailed project requirements and scope as discussed during the preliminary consultation phase.'}</p>
            </div>
          </div>

          <footer className="mt-auto border-t-2 border-zinc-100 pt-8 flex justify-between items-end">
            <div>
              <div className="flex items-center gap-2 text-zinc-900 font-black tracking-widest text-xs mb-3 uppercase">
                <div className="bg-emerald-600 p-1.5 rounded-lg text-white">
                  <Building2 size={16} />
                </div>
                {ts.coverFooterWebsite || 'QUICK QUOTE'}
              </div>
              <p className="text-[10px] font-bold text-zinc-400 max-w-xs uppercase tracking-wider">{ts.coverFooterAddress || '102 Innovation Drive, Suite 400, NY'}</p>
            </div>
            <div className="text-right text-[10px] font-black text-zinc-900 space-y-1 uppercase tracking-widest">
              <p className="text-emerald-600">{ts.coverFooterWebsite || 'WWW.QUICKQUOTE.COM'}</p>
              <p>CONTACT@COMPANY.COM</p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export const renderCoverPage = (config, data, companyInfo) => {
  if (config.coverMode === 'existing') {
    switch (config.existingCoverTemplateId) {
      case 'simple':
        return <SimpleCoverOnly quotation={data} companyInfo={companyInfo} />;
      case 'elegant':
        return <ElegantCoverOnly quotation={data} companyInfo={companyInfo} />;
      case 'creative':
        return <CreativeCoverOnly quotation={data} companyInfo={companyInfo} />;
      case 'dual':
        return <DualCoverOnly quotation={data} companyInfo={companyInfo} />;
      case 'inst':
        return <InstCoverOnly quotation={data} companyInfo={companyInfo} />;
      case 'minimal':
        return <MinimalCoverOnly quotation={data} companyInfo={companyInfo} />;
      default:
        break;
    }
  }

  const accentColor = config.accentColor || companyInfo?.primaryColor || '#145be9';
  const logoUrl = config.logo || companyInfo?.logo;
  const headerColor = config.headerColor || '#1a2b4b';

  return (
    <div className="relative bg-white text-[#111827] flex flex-col p-[48px] shrink-0 overflow-hidden w-[794px] h-[1123px] min-w-[794px] min-h-[1123px] border border-gray-100 select-none">
      {/* Header Band */}
      <div className={`h-[280px] relative p-12 flex justify-between items-center -mx-[48px] -mt-[48px] mb-12 select-none`} style={{ backgroundColor: headerColor }}>
        <div className="flex-1 pr-4">
          <h1 className="text-[48px] font-black text-white leading-none tracking-tight uppercase">
            {config.title || 'PRICE QUOTE'}
          </h1>
          {config.subtitle && (
            <p className="text-white/60 text-sm mt-3 font-medium">{config.subtitle}</p>
          )}
        </div>
        <div className="shrink-0">
          {logoUrl ? (
            <div className="w-[80px] h-[60px] bg-white rounded p-1 flex items-center justify-center shadow-md">
              <img src={logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
            </div>
          ) : (
            <div
              style={{ backgroundColor: accentColor }}
              className="w-[80px] h-[60px] flex items-center justify-center text-center p-1 text-white font-black text-[9px] uppercase tracking-wider rounded shadow-md"
            >
              Logo Here
            </div>
          )}
        </div>
      </div>

      {/* Columns: To & From */}
      <div className="grid grid-cols-2 gap-10 mt-6 flex-1 text-[13px]">
        <div>
          <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 pb-1 border-b border-gray-100">To.</h4>
          <div className="text-sm font-bold text-gray-800 mb-1">
            {data.customer?.businessName || '(Company Name)'}
          </div>
          <div className="text-xs text-gray-500 font-medium mb-1">
            {data.customer?.fullName || '(Contact Person)'}
          </div>
          <div className="text-xs text-gray-500 leading-relaxed mb-1 whitespace-pre-line">
            {data.customer?.address || '(Address)'}
          </div>
          <div className="text-xs text-gray-500 font-medium">
            {data.customer?.email}
          </div>
        </div>

        <div>
          <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 pb-1 border-b border-gray-100">From.</h4>
          <div className="text-sm font-bold text-gray-800 mb-1">
            {companyInfo?.companyName || config.companyName || '(Company Name)'}
          </div>
          {companyInfo?.ownerName && (
            <div className="text-xs text-gray-500 font-medium mb-1">
              {companyInfo.ownerName}
            </div>
          )}
          <div className="text-xs text-gray-500 leading-relaxed mb-1 whitespace-pre-line">
            {companyInfo?.address || config.address || '(Address)'}
          </div>
          <div className="text-xs text-gray-500 font-medium mb-1">
            {companyInfo?.phone || config.phone || '(Phone)'}
          </div>
          <div className="text-xs text-gray-500 font-medium mb-1">
            {companyInfo?.email || config.email || '(Email)'}
          </div>
          {(companyInfo?.gstNo || config.gstNumber) && (
            <div className="text-xs text-gray-400 font-bold mt-1">
              GST: {companyInfo?.gstNo || config.gstNumber}
            </div>
          )}
        </div>
      </div>

      {/* Project Description */}
      <div className="mt-auto border-t border-gray-100 pt-6 pb-4">
        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Project Description:</h4>
        <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
          {data.internalNotes || 'Standard Architectural & Design Proposal specifications.'}
        </p>
      </div>

      {/* Quote Details */}
      <div className="border-t border-gray-100 pt-4 flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase tracking-wider">
        <div>Reference: {data.quotationNumber}</div>
        <div>Date: {formatDate(data.createdAt || data.date)}</div>
      </div>
    </div>
  );
};

export const renderItemsPage = (config, data) => {
  const showProductImages = !!config.showProductImages;
  const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  const FALLBACK_DESC =
    'Comprehensive technical details for this component. This item has been selected for its structural integrity, aesthetic alignment, and adherence to the project scope requirements.';

  return (
    <div className="relative bg-white text-[#111827] flex flex-col p-[48px] shrink-0 w-[794px] h-[1123px] min-w-[794px] min-h-[1123px] border border-gray-100 select-none">
      {/* Page header */}
      <div className="mb-6">
        <h3 className="text-[18px] font-black text-[#1a2b4b] uppercase tracking-wider leading-none">
          Quotation Items
        </h3>
        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-1">
          Detailed Pricing Table Breakdown
        </p>
      </div>

      {/* Product cards */}
      <div className="flex flex-col flex-1">
        {data.items?.map((item, idx) => {
          let imgUrl = null;
          if (item.productImage) {
            imgUrl = item.productImage.startsWith('http')
              ? item.productImage
              : `${BASE_URL}/${item.productImage}`;
          }

          const description = item.description?.trim() || FALLBACK_DESC;

          return (
            <div
              key={idx}
              className="flex gap-4 bg-white border border-gray-200 rounded-lg p-4 mb-4"
              style={{ borderRadius: '8px', border: '1px solid #e5e7eb', padding: '16px', marginBottom: '16px' }}
            >
              {/* LEFT — image column (45%) */}
              {showProductImages && (
                <div className="relative shrink-0" style={{ width: '45%' }}>
                  {imgUrl ? (
                    <img
                      src={imgUrl}
                      alt={item.name}
                      style={{ width: '100%', maxHeight: '160px', objectFit: 'cover', borderRadius: '6px', display: 'block' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling && (e.target.nextSibling.style.display = 'flex');
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%', height: '160px', borderRadius: '6px',
                        background: '#f3f4f6', display: 'flex', alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v13.5a1.5 1.5 0 001.5 1.5z" />
                      </svg>
                    </div>
                  )}
                  {/* SKU badge */}
                  {item.sku && (
                    <div
                      style={{
                        position: 'absolute', bottom: '8px', left: '8px',
                        backgroundColor: '#1a2b4b', color: '#fff',
                        fontSize: '9px', fontWeight: '900',
                        padding: '2px 8px', borderRadius: '999px',
                        letterSpacing: '0.08em', textTransform: 'uppercase',
                        pointerEvents: 'none',
                      }}
                    >
                      SKU: {item.sku}
                    </div>
                  )}
                </div>
              )}

              {/* RIGHT — specs column (55% or full width) */}
              <div
                className="flex flex-col justify-center"
                style={{ width: showProductImages ? '55%' : '100%' }}
              >
                <p style={{ fontSize: '16px', fontWeight: '700', color: '#1a2b4b', marginBottom: '6px', lineHeight: '1.3' }}>
                  {item.name}
                </p>
                <p style={{ fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                  Specifications &amp; Details
                </p>
                <p style={{ fontSize: '13px', color: '#4b5563', lineHeight: '1.6' }}>
                  {description}
                </p>

                {/* Pricing footer */}
                <div style={{ borderTop: '1px solid #e5e7eb', marginTop: '12px', paddingTop: '10px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '16px', fontSize: '11px', color: '#6b7280', fontWeight: '700' }}>
                  <span>QTY: {item.qty}</span>
                  <span style={{ color: '#9ca3af' }}>·</span>
                  <span>UNIT PRICE: {formatMoney(item.price, data.currency)}</span>
                  <span style={{ color: '#9ca3af' }}>·</span>
                  <span style={{ color: '#1a2b4b', fontWeight: '900' }}>TOTAL: {formatMoney(item.total, data.currency)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-auto border-t border-gray-100 pt-4 flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase tracking-wider">
        <div>Quotation: {data.quotationNumber}</div>
        <div>Page Items Breakdown</div>
      </div>
    </div>
  );
};

export const CatalogPdfRenderer = ({ dataUrl, itemName, pageNum, showHeader }) => {
  // Header height is fixed at 72px (pt-32px + pb-16px + ~24px text).
  // The image fills the remaining vertical space so the catalog content
  // occupies the full A4 page area and is never letterboxed.
  const headerHeight = showHeader ? 72 : 0;
  const imageHeight = 1123 - headerHeight;

  return (
    <div
      className="relative bg-white flex flex-col shrink-0 w-[794px] h-[1123px] min-w-[794px] min-h-[1123px] border border-gray-100 select-none overflow-hidden"
    >
      {showHeader && (
        <div
          className="px-[48px] pt-[32px] pb-[16px] border-b border-gray-100 shrink-0"
          style={{ height: headerHeight }}
        >
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Product Catalog
          </p>
          <h4 className="text-[15px] font-black text-[#1a2b4b] mt-1">{itemName}</h4>
        </div>
      )}
      {/* objectFit:fill stretches the rasterised canvas to fill the slot exactly.
          The canvas was already rendered at 2× resolution for sharpness, so
          scaling it back down to the A4 width produces a crisp result. */}
      <img
        src={dataUrl}
        alt={`${itemName} catalog page ${pageNum}`}
        style={{
          width: '100%',
          height: imageHeight,
          display: 'block',
          objectFit: 'fill',
          flexShrink: 0,
        }}
      />
    </div>
  );
};

export const renderCatalogsPage = (data) => {
  const items = (data?.items || []).filter((item) => item.cataloguePdf);
  const hasCatalogs = items.length > 0;

  return (
    <div className="relative bg-white flex flex-col items-center justify-center shrink-0 w-[794px] h-[1123px] min-w-[794px] min-h-[1123px] border border-gray-100 select-none">
      <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
        {hasCatalogs ? 'Loading product catalogs...' : 'No product catalogs attached'}
      </p>
      <p className="text-[10px] text-gray-300 mt-2">
        {hasCatalogs ? 'Preparing catalog pages for preview' : 'Add catalog PDFs to products to display them here'}
      </p>
    </div>
  );
};

export const renderSummaryPage = (config, data) => {
  const accentColor = config.accentColor || '#145be9';
  const showSubtotal = config.showSubtotal !== false;
  const showTax = config.showTaxRate !== false;
  const showShipping = !!config.showShipping;
  const shippingAmt = Number(config.shippingAmount) || 0;

  const subtotal = data.subtotal || 0;
  const taxRate = data.taxRate || 0;
  const tax = data.taxAmount || data.taxTotal || 0;
  const finalTotal = subtotal + tax + (showShipping ? shippingAmt : 0);

  return (
    <div className="relative bg-white text-[#111827] flex flex-col p-[48px] shrink-0 w-[794px] h-[1123px] min-w-[794px] min-h-[1123px] border border-gray-100 select-none">
      <div className="mb-8">
        <h3 className="text-base font-black text-[#1a2b4b] uppercase tracking-wider">Financial Summary</h3>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Statement of costs and totals</p>
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full gap-4 text-[14px]">
        {showSubtotal && (
          <div className="flex justify-between items-center py-3 border-b border-gray-200">
            <span className="font-bold text-gray-400 uppercase tracking-widest text-[11px]">SUBTOTAL</span>
            <span className="font-bold text-gray-800">{formatMoney(subtotal, data.currency)}</span>
          </div>
        )}

        {showTax && (
          <>
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="font-bold text-gray-400 uppercase tracking-widest text-[11px]">TAX RATE</span>
              <span className="font-bold text-gray-800">{taxRate}%</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-200">
              <span className="font-bold text-gray-400 uppercase tracking-widest text-[11px]">SALES TAX</span>
              <span className="font-bold text-gray-800">{formatMoney(tax, data.currency)}</span>
            </div>
          </>
        )}

        {showShipping && (
          <div className="flex justify-between items-center py-3 border-b border-gray-200">
            <span className="font-bold text-gray-400 uppercase tracking-widest text-[11px]">SHIPPING AND HANDLING</span>
            <span className="font-bold text-gray-800">{formatMoney(shippingAmt, data.currency)}</span>
          </div>
        )}

        <div style={{ backgroundColor: accentColor }} className="mt-8 p-[16px] text-white flex justify-between items-center shadow-md">
          <span className="text-[20px] font-black uppercase tracking-wider">TOTAL DUE</span>
          <span className="text-[20px] font-black tracking-tight">
            {formatMoney(finalTotal, data.currency)}
          </span>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4 flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase tracking-wider">
        <div>Quotation: {data.quotationNumber}</div>
        <div>Financial Statement Summary</div>
      </div>
    </div>
  );
};

export const renderTermsPage = (config, data) => {
  const accentColor = config.accentColor || '#145be9';
  const savedTermsContent = data.termsAndConditions?.content || '';
  const pdfText = config.termsPdfText?.trim();
  const customText = config.termsText || '';

  const content = config.termsSource === 'saved'
    ? savedTermsContent || customText
    : config.termsSource === 'pdf'
      ? pdfText
      : customText;

  const html = plainTextToHtml(content || '');

  const chunks = html ? chunkHtmlElements(html) : [[]];

  return chunks.map((chunk, chunkIndex) => (
    <div key={`terms-${chunkIndex}`} className="relative bg-white text-[#111827] flex flex-col p-[48px] shrink-0 w-[794px] h-[1123px] min-w-[794px] min-h-[1123px] border border-gray-100 select-none">
      {chunkIndex === 0 && (
        <div className="mb-6">
          <h3 style={{ borderBottomColor: accentColor }} className="text-base font-black text-[#1a2b4b] uppercase tracking-wider pb-2 border-b-2 mb-1 inline-block">
            {config.sectionTitle || 'Terms & Conditions'}
          </h3>
        </div>
      )}

      <div className="flex-1 overflow-hidden p-1">
        {html ? (
          <div className="terms-rich-text text-[12px] text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: chunk.join('') }} />
        ) : (
          <div className="p-10 border border-dashed border-gray-300 rounded-lg text-center text-gray-500 italic bg-gray-50/80">Your terms and conditions will appear here.</div>
        )}
      </div>

      {chunkIndex === chunks.length - 1 && (
        <div className="mt-8 border-t border-gray-100 pt-6 flex justify-end">
          <div className="w-[200px] flex flex-col items-center">
            <div className="w-full border-t border-gray-300 pt-2 text-center text-gray-400 text-xs">Authorized Signature</div>
            <span className="font-black text-[#111827] text-[9px] uppercase tracking-widest mt-1">PROJECT PRINCIPAL</span>
          </div>
        </div>
      )}

      <div className="mt-6 border-t border-gray-100 pt-4 flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase tracking-wider">
        <div>Quotation: {data.quotationNumber}</div>
        <div>PAGE {String(chunkIndex + 1).padStart(2, '0')} â€” {String(chunks.length).padStart(2, '0')}</div>
      </div>
    </div>
  ));
};

export const renderCompanyPage = (config, data, companyInfo) => {
  const name = companyInfo?.companyName || config.companyName || '(Company Name)';
  const address = companyInfo?.address || config.address || '(Address)';
  const phone = companyInfo?.phone || config.phone || '(Phone)';
  const email = companyInfo?.email || config.email || '(Email)';
  const gst = companyInfo?.gstNo || config.gstNumber || '(GST Number)';

  return (
    <div className="relative bg-white text-[#111827] flex flex-col p-[48px] shrink-0 w-[794px] h-[1123px] min-w-[794px] min-h-[1123px] border border-gray-100 select-none">
      <div className="mb-10">
        <h3 className="text-base font-black text-[#1a2b4b] uppercase tracking-wider">Company Information</h3>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Official identity &amp; details</p>
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full gap-6">
        <div>
          <h2 className="text-[28px] font-black text-[#1a2b4b] tracking-tight leading-tight">{name}</h2>
          <div className="h-1 w-12 bg-[#1a2b4b] mt-3 rounded"></div>
        </div>

        <div className="grid grid-cols-1 gap-5 mt-4 text-[14px]">
          <div>
            <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest block mb-1">Corporate Address</span>
            <p className="text-gray-800 font-medium leading-relaxed">{address}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest block mb-1">Contact Phone</span>
              <p className="text-gray-800 font-medium">{phone}</p>
            </div>

            <div>
              <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest block mb-1">Official Email</span>
              <p className="text-gray-800 font-medium">{email}</p>
            </div>
          </div>

          <div>
            <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest block mb-1">GST/Registration Number</span>
            <p className="text-gray-800 font-medium">{gst}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4 flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase tracking-wider">
        <div>Quotation: {data.quotationNumber}</div>
        <div>Company Identity Card</div>
      </div>
    </div>
  );
};