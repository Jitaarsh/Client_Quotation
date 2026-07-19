import React, { useEffect, useRef, useState } from 'react';
import DesignLayer from './DesignLayer';
import { Calendar, Clock, CheckSquare, Building2, FileText, ChevronLeft, ChevronRight } from 'lucide-react';

const Creative3PageDesign = ({ quotation, isVertical = false }) => {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const ts = quotation?.templateSettings || {};

  // A4 scale lock logic
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current && containerRef.current.parentElement) {
        const parentWidth = containerRef.current.parentElement.offsetWidth;
        const targetWidth = 794; // approx pixels for 210mm at 96dpi
        const newScale = parentWidth / targetWidth;
        if (newScale < 1) {
          setScale(newScale);
        } else {
          setScale(1);
        }
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const currencySymbols = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£',
  };

  const formatMoney = (amount = 0, currency = 'USD') => {
    const symbol = currencySymbols[currency] || currencySymbols.USD;
    return `${symbol}${Number(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (value) => {
    if (!value) return '';
    return new Date(value).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Standard data object mapped from quotation prop
  const data = quotation || {};

  // --- PAGE 1: CREATIVE COVER ---
  const renderPageOne = () => (
    <div className={`w-full flex-shrink-0 flex flex-col bg-white relative ${isVertical ? 'h-[297mm]' : 'h-full'}`}>
      <DesignLayer settings={ts} shouldShowBg={true} shouldShowWm={ts.showWatermark !== false} />
      <div className="flex h-full relative z-10">
        {/* Left Sidebar Accent */}
        <div className="w-12 bg-emerald-600 h-full flex flex-col justify-end py-12 shrink-0">
          <p className="transform -rotate-90 text-white/50 text-[10px] font-bold tracking-[0.3em] whitespace-nowrap uppercase">
            © {new Date().getFullYear()} {ts.coverFooterWebsite || 'QUICK QUOTE CRM'}
          </p>
        </div>

        <div className="p-16 w-full flex flex-col relative">
          <div className="absolute top-16 right-16 text-right">
            <h1 className="text-5xl font-black text-zinc-900 tracking-tighter uppercase leading-none">
              {(ts.coverHeader || 'PROJECT PROPOSAL').split(' ')[0]}
            </h1>
            <h1 className="text-5xl font-black text-emerald-600 tracking-tighter uppercase leading-none">
              {(ts.coverHeader || 'PROJECT PROPOSAL').split(' ').slice(1).join(' ')}
            </h1>
            <p className="text-zinc-500 font-bold mt-4 tracking-widest text-xs">REF: {data.quotationNumber}</p>
          </div>

          <div className="mt-32">
            <h2 className="text-3xl font-black text-zinc-900 tracking-tight max-w-[80%] leading-tight">
              {ts.coverTitle || data.projectName || 'Modern Residential Complex'}
            </h2>
            <div className="flex items-center gap-4 mt-6 text-[11px] font-black uppercase tracking-widest text-zinc-400">
              <span className="flex items-center gap-1.5"><Calendar size={14} className="text-emerald-600" /> {formatDate(data.createdAt)}</span>
              <span className="w-1 h-1 bg-zinc-300 rounded-full"></span>
              <span className="flex items-center gap-1.5"><Clock size={14} className="text-emerald-600" /> 30 DAYS VALIDITY</span>
              <span className="w-1 h-1 bg-zinc-300 rounded-full"></span>
              <span className="flex items-center gap-1.5 text-emerald-600"><CheckSquare size={14} /> DRAFT PROPOSAL</span>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-8 mt-16">
            <div className="col-span-2 bg-zinc-50 p-6 rounded-2xl border border-zinc-100 shadow-sm">
              <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Prepared For</h3>
              <p className="font-black text-zinc-900 text-lg leading-tight mb-3">{data.customer?.businessName || data.customer?.fullName}</p>
              <div className="text-xs font-bold text-zinc-500 mt-2 space-y-1 leading-relaxed">
                {(data.customer?.address || 'Client Address Not Provided').split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </div>
            <div className="col-span-3 p-6 flex flex-col justify-center">
               <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-4">Project Scope</h3>
               <p className="text-zinc-900 font-bold text-lg leading-snug mb-3">
                 {ts.coverDescriptionTitle || 'Provision of comprehensive consultancy and engineering designs.'}
               </p>
               <p className="text-zinc-500 text-xs font-medium leading-relaxed">
                 {ts.coverDescription || 'Detailed project requirements and scope as discussed during the preliminary consultation phase.'}
               </p>
            </div>
          </div>

          {/* Footer Info */}
          <footer className="mt-auto border-t-2 border-zinc-50 pt-8 flex justify-between items-end">
            <div>
              <div className="flex items-center gap-2 text-zinc-900 font-black tracking-widest text-xs mb-3 uppercase">
                <div className="bg-emerald-600 p-1.5 rounded-lg text-white">
                  <Building2 size={16}/>
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

  // --- PAGE 2: FINANCIAL SUMMARY ---
  const renderPageTwo = () => (
    <div className={`w-full flex-shrink-0 flex flex-col bg-white relative ${isVertical ? 'h-[297mm]' : 'h-full'}`}>
      <DesignLayer settings={ts} shouldShowBg={ts.bgTarget === 'all'} shouldShowWm={ts.showWatermark !== false && ts.wmTarget === 'all'} />
      <div className="flex h-full relative z-10">
        <div className="w-12 bg-emerald-600 h-full shrink-0"></div>
        <div className="p-16 w-full flex flex-col">
          
          <header className="mb-12">
            <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-3">PHASE 02 / COSTS</h4>
            <h2 className="text-4xl font-black text-zinc-900 tracking-tighter uppercase mb-2">Financial <span className="text-emerald-600">Summary</span></h2>
            <p className="text-zinc-500 font-bold text-sm tracking-wide">Investment Breakdown & Deliverables</p>
          </header>

          <div className="flex-grow">
            <div className="bg-zinc-50 rounded-2xl overflow-hidden border border-zinc-100 mb-8 shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-zinc-100 text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em]">
                  <tr>
                    <th className="py-5 px-6">Service Description</th>
                    <th className="py-5 px-6 text-center">Qty</th>
                    <th className="py-5 px-6 text-right">Rate</th>
                    <th className="py-5 px-6 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/50">
                  {data.items?.map((item, idx) => (
                    <tr key={idx} className="bg-white">
                      <td className="py-5 px-6">
                        <p className="font-black text-zinc-900 text-sm">{item.name}</p>
                        <p className="text-[10px] font-bold text-zinc-400 mt-1 uppercase tracking-widest">{item.sku}</p>
                      </td>
                      <td className="py-5 px-6 text-center text-zinc-900 font-black text-sm">{Number(item.qty).toFixed(1)}</td>
                      <td className="py-5 px-6 text-right text-zinc-500 font-bold text-sm">{formatMoney(item.price, data.currency)}</td>
                      <td className="py-5 px-6 text-right font-black text-zinc-900 text-sm">{formatMoney(item.total, data.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <div className="w-[300px] bg-zinc-900 text-white rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-600/10 rounded-full -mr-12 -mt-12"></div>
                
                <div className="flex justify-between items-center mb-3 text-zinc-400 text-[10px] font-black uppercase tracking-widest relative z-10">
                  <span>Subtotal</span>
                  <span className="text-zinc-200">{formatMoney(data.subtotal, data.currency)}</span>
                </div>
                <div className="flex justify-between items-center mb-6 text-zinc-400 text-[10px] font-black uppercase tracking-widest relative z-10">
                  <span>Tax (Est.)</span>
                  <span className="text-zinc-200">{formatMoney(data.taxTotal || 0, data.currency)}</span>
                </div>
                <div className="flex justify-between items-end border-t border-zinc-800 pt-5 relative z-10">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Total Investment</span>
                  <span className="text-3xl font-black text-emerald-400 leading-none">{formatMoney(data.finalTotal, data.currency)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12 items-end mt-auto">
            <div>
              <h4 className="text-[10px] font-black text-zinc-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                <FileText size={14} className="text-emerald-600"/> Terms of Agreement
              </h4>
              <p className="text-[10px] font-bold text-zinc-400 leading-relaxed uppercase tracking-wider">
                By signing, the client agrees to the costs estimated on this page and the scope of work defined on page 1. Prices are valid for 30 days.
              </p>
            </div>
            <div className="space-y-10">
              <div className="relative">
                <div className="border-b-2 border-dashed border-zinc-200 h-8 mb-2"></div>
                <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] absolute top-10 right-0">Client Signature / Date</p>
              </div>
              <div className="relative">
                <div className="border-b-2 border-dashed border-zinc-200 h-8 mb-2"></div>
                <p className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em] absolute top-10 right-0">Authorized Approval</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-6 right-16 text-[9px] font-black text-zinc-400 uppercase tracking-[0.3em]">
        PAGE 02 — 02
      </div>
    </div>
  );



  const numPages = 2;
  const unscaledPageHeight = 1122.5; // 297mm in pixels at 96dpi
  const separatorHeight = 8;
  const totalUnscaledHeight = (unscaledPageHeight * numPages) + ((numPages - 1) * separatorHeight);

  return (
    <div 
      className="flex items-start justify-center w-full leading-normal group/container"
      style={isVertical ? { height: totalUnscaledHeight * scale, overflow: 'hidden' } : { overflow: 'hidden' }}
    >
      <div
        ref={containerRef}
        style={{
          width: '210mm',
          height: isVertical ? `${totalUnscaledHeight}px` : '297mm',
          minWidth: '210mm',
          minHeight: '297mm',
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          boxShadow: '0 20px 50px -12px rgba(0,0,0,0.15)'
        }}
        className={`bg-white flex flex-col shrink-0 relative ${isVertical ? '' : 'overflow-hidden'}`}
      >
        <div 
          className={`flex h-full w-full ${isVertical ? 'flex-col' : 'transition-transform duration-500 ease-in-out'}`}
          style={!isVertical ? { transform: `translateX(-${(currentPage - 1) * 100}%)` } : { height: 'auto' }}
        >
          {renderPageOne()}
          {isVertical && <div className="h-[8px] bg-[#323639] w-full shrink-0" />}
          {renderPageTwo()}
        </div>

        {!isVertical && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4 bg-zinc-900 text-white px-5 py-2.5 rounded-full shadow-2xl border border-white/10 backdrop-blur-sm opacity-100 md:opacity-0 md:group-hover/container:opacity-100 transition-opacity duration-300">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`p-1 rounded-full transition-colors ${currentPage === 1 ? 'text-white/20 cursor-default' : 'hover:bg-white/10 text-white cursor-pointer'}`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 px-3">
              {[1,2].map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${currentPage === p ? 'bg-emerald-400 w-5' : 'bg-white/30 hover:bg-white/50'}`}
                />
              ))}
            </div>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(2, prev + 1))}
              disabled={currentPage === 2}
              className={`p-1 rounded-full transition-colors ${currentPage === 2 ? 'text-white/20 cursor-default' : 'hover:bg-white/10 text-white cursor-pointer'}`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Creative3PageDesign;
