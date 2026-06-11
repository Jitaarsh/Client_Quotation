import React, { useEffect, useRef, useState } from 'react';
import DesignLayer from './DesignLayer';
import { ChevronLeft, ChevronRight, Building2 } from 'lucide-react';

const MinimalistDesign = ({ quotation, isVertical = false }) => {
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

  const data = quotation || {};

  // --- PAGE 1: MINIMALIST COVER ---
  const PageOne = () => (
    <div className={`w-full flex-shrink-0 flex flex-col bg-white relative ${isVertical ? 'h-[297mm]' : 'h-full'}`}>
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

  // --- PAGE 2: MINIMALIST FINANCIALS ---
  const PageTwo = () => (
    <div className={`w-full flex-shrink-0 flex flex-col bg-white relative ${isVertical ? 'h-[297mm]' : 'h-full'}`}>
      <DesignLayer settings={ts} shouldShowBg={ts.bgTarget === 'all'} shouldShowWm={ts.showWatermark !== false && ts.wmTarget === 'all'} />
      <div className="p-12 h-full flex flex-col relative z-10">
        <div className="border-[6px] border-black p-10 h-full flex flex-col relative">
          
          <header className="mb-10 border-b-[3px] border-black pb-6">
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-1 text-black">Financials</h2>
            <p className="font-mono text-[10px] text-slate-500 uppercase font-black tracking-widest">Investment Breakdown</p>
          </header>

          <div className="mb-10 flex-grow">
            <table className="w-full text-left font-mono">
              <thead>
                <tr className="border-y-[1.5px] border-black text-[10px] uppercase font-black text-black">
                  <th className="py-3 px-2">Item Description</th>
                  <th className="py-3 px-2 text-right">Qty</th>
                  <th className="py-3 px-2 text-right">Rate</th>
                  <th className="py-3 px-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="text-black">
                {data.items?.map((item, idx) => (
                  <tr key={idx} className="border-b border-black">
                    <td className="py-4 px-2">
                      <p className="font-black uppercase text-sm font-sans tracking-tight leading-tight">{item.name}</p>
                      <p className="text-[9px] mt-0.5 text-slate-500 font-bold uppercase">{item.sku}</p>
                    </td>
                    <td className="py-4 px-2 text-right font-bold text-xs">{item.qty}</td>
                    <td className="py-4 px-2 text-right font-bold text-xs">{formatMoney(item.price, data.currency)}</td>
                    <td className="py-4 px-2 text-right font-black text-base">{formatMoney(item.total, data.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end mt-6">
              <div className="w-1/2 font-mono">
                <div className="flex justify-between py-1.5 border-b border-black text-[10px] font-bold text-black uppercase">
                  <span>Subtotal</span><span>{formatMoney(data.subtotal, data.currency)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-black text-[10px] font-bold text-black uppercase">
                  <span>Tax (Est.)</span><span>{formatMoney(data.taxTotal, data.currency)}</span>
                </div>
                <div className="flex justify-between items-center py-3 text-xl font-black bg-black text-white px-3 mt-3">
                  <span className="uppercase tracking-widest text-[12px]">Total</span>
                  <span>{formatMoney(data.finalTotal, data.currency)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto grid grid-cols-2 gap-12 pt-6 border-t-[1.5px] border-black">
            <div>
              <h4 className="font-mono font-black text-[10px] uppercase mb-2 text-black">Terms</h4>
              <p className="font-sans font-medium text-[10px] text-slate-700 leading-snug">
                Prices valid for listed period. Initial deposit required upon acceptance. All works strictly as per scope.
              </p>
            </div>
            <div className="space-y-8">
              <div>
                <div className="border-b-[1.5px] border-black h-6 mb-1"></div>
                <p className="font-mono text-[8px] font-black uppercase text-right text-black">Client Signature</p>
              </div>
              <div>
                <div className="border-b-[1.5px] border-black h-6 mb-1"></div>
                <p className="font-mono text-[8px] font-black uppercase text-right text-black">Authorized Approval</p>
              </div>
            </div>
          </div>

        </div>
      </div>
      <div className="absolute bottom-6 right-16 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">
        PAGE 02 — 03
      </div>
    </div>
  );

  // --- PAGE 3: MINIMALIST TERMS ---
  const PageThree = () => (
    <div className={`w-full flex-shrink-0 flex flex-col bg-white relative ${isVertical ? 'h-[297mm]' : 'h-full'}`}>
      <DesignLayer settings={ts} shouldShowBg={ts.bgTarget === 'all'} shouldShowWm={ts.showWatermark !== false && ts.wmTarget === 'all'} />
      <div className="p-12 h-full flex flex-col relative z-10">
        <div className="border-[6px] border-black p-10 h-full flex flex-col relative">
          
          <header className="mb-10 border-b-[3px] border-black pb-6">
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-1 text-black">Legal</h2>
            <p className="font-mono text-[10px] text-slate-500 uppercase font-black tracking-widest">Terms & Conditions</p>
          </header>

          <div className="flex-1 text-black font-sans text-[11px] leading-relaxed overflow-hidden">
            {data.termsAndConditions?.content ? (
              <div 
                dangerouslySetInnerHTML={{ __html: data.termsAndConditions.content }} 
                className="prose prose-xs max-w-none text-black font-medium"
              />
            ) : (
              <div className="space-y-6">
                <div>
                  <h4 className="font-mono font-black text-[10px] uppercase mb-2">01. Acceptance</h4>
                  <p className="font-medium text-slate-700">Initial deposit of 50% is required to commence project work. Signature on this document constitutes a binding agreement.</p>
                </div>
                <div>
                  <h4 className="font-mono font-black text-[10px] uppercase mb-2">02. Validity</h4>
                  <p className="font-medium text-slate-700">This quotation is valid for 30 days from the date of issue. Prices may be subject to adjustment after this period.</p>
                </div>
                <div>
                  <h4 className="font-mono font-black text-[10px] uppercase mb-2">03. Scope Variations</h4>
                  <p className="font-medium text-slate-700">Any deviations from the listed scope of work will be billed as additional works at standard hourly rates.</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-10 pt-6 border-t-[3px] border-black flex justify-between items-center font-mono text-[9px] font-black text-black uppercase">
            <span>Generated via Quick Quote CRM</span>
            <span>All Rights Reserved — {new Date().getFullYear()}</span>
          </div>

        </div>
      </div>
      <div className="absolute bottom-6 right-16 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">
        PAGE 03 — 03
      </div>
    </div>
  );

  const numPages = 3;
  const unscaledPageHeight = 1122.5; 
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
          <PageOne />
          {isVertical && <div className="h-[8px] bg-[#323639] w-full shrink-0" />}
          <PageTwo />
          {isVertical && <div className="h-[8px] bg-[#323639] w-full shrink-0" />}
          <PageThree />
        </div>

        {!isVertical && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4 bg-black/90 text-white px-5 py-2 rounded-full shadow-xl border border-white/10 backdrop-blur-sm opacity-100 md:opacity-0 md:group-hover/container:opacity-100 transition-opacity duration-300">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`p-1 rounded-full transition-colors ${currentPage === 1 ? 'text-white/20 cursor-default' : 'hover:bg-white/10 text-white cursor-pointer'}`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 px-3">
              {[1,2,3].map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${currentPage === p ? 'bg-white w-5' : 'bg-white/30 hover:bg-white/50'}`}
                />
              ))}
            </div>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(3, prev + 1))}
              disabled={currentPage === 3}
              className={`p-1 rounded-full transition-colors ${currentPage === 3 ? 'text-white/20 cursor-default' : 'hover:bg-white/10 text-white cursor-pointer'}`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MinimalistDesign;