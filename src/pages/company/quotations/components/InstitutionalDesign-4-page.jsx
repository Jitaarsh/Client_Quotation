import React, { useEffect, useRef, useState } from 'react';
import DesignLayer from './DesignLayer';
import { ChevronLeft, ChevronRight, Briefcase, BadgeCheck, FileText, User, Info, CheckCircle2, ShieldCheck } from 'lucide-react';
import { chunkHtmlElements, plainTextToHtml } from '../../../../utils/pdfTextExtractor';

const toProductImageUrl = (productImage) => {
  if (typeof productImage === 'string') return productImage;
  if (!productImage?.data || !productImage?.contentType) return '';
  return `data:${productImage.contentType};base64,${productImage.data}`;
};

const InstitutionalDesign = ({ quotation, isVertical = false }) => {
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
  const termsChunks = chunkHtmlElements(plainTextToHtml(data.termsAndConditions?.content || ''), 887);
  const paginatedTerms = termsChunks.length ? termsChunks : [[]];
  const hasManyTerms = (data.termsAndConditions?.content?.length || 0) > 1600;
  const numPages = 3 + paginatedTerms.length + (hasManyTerms ? 1 : 0);

  const getPageNum = (p) => `0${p} — 0${numPages}`;

  // --- PAGE 1: COVER PAGE ---
  const PageOne = () => (
    <div className={`w-full flex-shrink-0 flex bg-white relative ${isVertical ? 'h-[297mm]' : 'h-full'}`}>
      <DesignLayer settings={ts} shouldShowBg={ts.bgTarget === 'all' || ts.bgTarget === 'cover'} shouldShowWm={ts.showWatermark !== false} />
      <div className="flex h-full w-full relative z-10">
        <div className="w-[280px] bg-[#131B2A] text-white flex flex-col px-10 py-16 shrink-0 relative overflow-hidden">
          <div className="absolute -right-20 top-40 w-40 h-40 border-[20px] border-[#00A98F]/10 rounded-full"></div>
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
            <div className="w-12 h-1 bg-[#00A98F] mt-4"></div>
          </div>
          <div className="relative z-10">
            <h4 className="text-[#00A98F] text-[10px] font-black tracking-[0.2em] uppercase mb-3">Quotation Reference</h4>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">#{data.quotationNumber}</p>
          </div>
          <div className="mt-auto relative z-10">
            <div className="w-full h-px bg-slate-700/50 mb-8"></div>
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
                  "{ts.coverDescription || 'Provision of comprehensive consultancy and engineering designs tailored for institutional requirements.'}"
                </p>
              </div>
            </div>
          </div>
          <div className="h-[35%] bg-[#EBF0FF] px-14 py-12 flex items-end relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-[#00A98F]/5 rounded-bl-full"></div>
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
        PAGE {getPageNum(1)}
      </div>
    </div>
  );
  };

  // --- PAGE 2: PRODUCTS PRICING ---
  const PageTwo = () => (
    <div className={`w-full flex-shrink-0 flex bg-white relative ${isVertical ? 'h-[297mm]' : 'h-full'}`}>
      <DesignLayer settings={ts} shouldShowBg={ts.bgTarget === 'all'} shouldShowWm={ts.showWatermark !== false && ts.wmTarget === 'all'} />
      <div className="flex h-full w-full relative z-10">
        <div className="w-[80px] bg-[#131B2A] flex flex-col items-center py-16 shrink-0">
           <div className="w-10 h-10 bg-[#00A98F] flex items-center justify-center shrink-0">
               <FileText size={18} className="text-white" strokeWidth={2.5} />
            </div>
        </div>
        <div className="flex-1 bg-white px-16 py-20 flex flex-col">
           <div className="mb-10">
              <h2 className="text-4xl font-black text-slate-900 leading-none mb-4 uppercase tracking-tighter">Products & Pricing</h2>
              <div className="w-16 h-[5px] bg-[#00A98F]"></div>
           </div>
           <div className="flex-grow">
             <table className="w-full text-left border-collapse font-sans">
                <thead className="border-b-[3px] border-slate-900">
                  <tr>
                    <th className="py-4 px-2 font-black text-[10px] tracking-[0.2em] uppercase text-slate-500">Service Description</th>
                    <th className="py-4 px-2 font-black text-[10px] tracking-[0.2em] uppercase text-slate-500 text-center">Qty</th>
                    <th className="py-4 px-2 font-black text-[10px] tracking-[0.2em] uppercase text-slate-500 text-right">Rate</th>
                    <th className="py-4 px-2 font-black text-[10px] tracking-[0.2em] uppercase text-slate-500 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.items?.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-5 px-2">
                        <p className="font-bold text-slate-800 text-[15px] uppercase tracking-tight">{item.name}</p>
                        <p className="text-[10px] text-slate-400 mt-1 font-mono font-bold uppercase">{item.sku}</p>
                      </td>
                      <td className="py-5 px-2 text-center text-slate-600 font-bold text-sm">{item.qty}</td>
                      <td className="py-5 px-2 text-right text-slate-600 font-bold text-sm">{formatMoney(item.price, data.currency)}</td>
                      <td className="py-5 px-2 text-right font-black text-slate-900 text-base">{formatMoney(item.total, data.currency)}</td>
                    </tr>
                  ))}
                </tbody>
             </table>
             <div className="flex justify-end mt-8">
              <div className="w-[320px] bg-[#F8F9FA] p-8 border-t-[4px] border-[#00A98F] shadow-sm">
                <div className="flex justify-between items-center mb-3 text-[11px] font-black uppercase text-slate-600 tracking-widest">
                  <span>Subtotal</span>
                  <span className="text-slate-900 font-bold">{formatMoney(data.subtotal, data.currency)}</span>
                </div>
                <div className="flex justify-between items-center mb-5 text-[11px] font-black uppercase text-slate-600 tracking-widest">
                  <span>Tax (Est.)</span>
                  <span className="text-slate-900 font-bold">{formatMoney(data.taxTotal, data.currency)}</span>
                </div>
                <div className="flex justify-between items-center pt-5 border-t border-slate-200">
                  <span className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-900">Final Total</span>
                  <span className="text-2xl font-black text-[#00A98F]">{formatMoney(data.finalTotal, data.currency)}</span>
                </div>
              </div>
            </div>
           </div>
        </div>
      </div>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">
        PAGE {getPageNum(2)}
      </div>
    </div>
  );

  // --- PAGE 3: TERMS & CONDITIONS ---
  const PageThree = ({ htmlContent }) => {
    const html = htmlContent || '';
    return (
    <div className={`w-full flex-shrink-0 flex bg-white relative ${isVertical ? 'h-[297mm]' : 'h-full'}`}>
      <DesignLayer settings={ts} shouldShowBg={ts.bgTarget === 'all'} shouldShowWm={ts.showWatermark !== false && ts.wmTarget === 'all'} />
      <div className="flex h-full w-full relative z-10">
        <div className="w-[80px] bg-[#131B2A] flex flex-col items-center py-16 shrink-0">
           <div className="w-10 h-10 bg-[#00A98F] flex items-center justify-center shrink-0">
               <ShieldCheck size={18} className="text-white" strokeWidth={2.5} />
            </div>
        </div>
        <div className="flex-1 bg-white px-16 py-20 flex flex-col">
           <div className="mb-10">
              <h2 className="text-4xl font-black text-slate-900 leading-none mb-4 uppercase tracking-tighter">Terms & Conditions</h2>
              <div className="w-16 h-[5px] bg-[#00A98F]"></div>
           </div>
           <div className="flex-grow">
              <h4 className="text-[10px] font-black text-[#00A98F] tracking-[0.2em] uppercase mb-6">Agreement Details</h4>
              <div className={`text-slate-600 text-sm leading-relaxed max-w-2xl font-medium ${hasManyTerms ? '' : 'mb-16'}`}>
                {html ? (
                  <div 
                    dangerouslySetInnerHTML={{ __html: html }}
                    className="prose prose-xs max-w-none font-medium text-slate-600"
                  />
                ) : (
                  <div className="space-y-6">
                    <p>By signing below, the client agrees to the costs estimated on Page 2 and the scope of work defined in this proposal. Prices are valid for the listed validity period. Upon acceptance, an initial deposit invoice will be issued to commence operations.</p>
                    <div className="grid grid-cols-2 gap-8 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        <div className="p-4 bg-[#F8F9FA] border-l-2 border-[#00A98F]">
                            <p className="text-[#00A98F] mb-1">01. Payment Terms</p>
                            <p>50% Advance / 50% on Completion</p>
                        </div>
                        <div className="p-4 bg-[#F8F9FA] border-l-2 border-[#00A98F]">
                            <p className="text-[#00A98F] mb-1">02. Validity</p>
                            <p>30 Days from issue date</p>
                        </div>
                    </div>
                  </div>
                )}
              </div>
              
              {!hasManyTerms && (
                <div className="flex gap-20 mt-auto pt-10">
                   <div className="flex-1 max-w-[240px]">
                      <div className="w-full border-t-[3px] border-slate-900 pt-4">
                         <p className="text-[10px] font-black text-slate-500 tracking-[0.2em] uppercase mb-1">Client Signature</p>
                         <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Authorized Representative</p>
                      </div>
                   </div>
                   <div className="flex-1 max-w-[240px]">
                      <div className="w-full border-t-[3px] border-[#00A98F] pt-4">
                         <p className="text-[10px] font-black text-[#00A98F] tracking-[0.2em] uppercase mb-1">Authorized Approval</p>
                         <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Project Lead / Signatory</p>
                      </div>
                   </div>
                </div>
              )}
           </div>
           
           <div className="mt-auto flex justify-between items-center pt-10 border-t border-slate-100 font-mono text-[9px] font-black text-slate-400 uppercase tracking-widest">
              <span>Institution Certified Document</span>
              <span>Ref: {data.quotationNumber}</span>
           </div>
        </div>
      </div>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">
        PAGE {getPageNum(3)}
      </div>
    </div>
  );

  // --- PAGE 4: ACCEPTANCE (ONLY IF TERMS ARE LONG) ---
  const PageAcceptance = () => (
    <div className={`w-full flex-shrink-0 flex bg-white relative ${isVertical ? 'h-[297mm]' : 'h-full'}`}>
      <DesignLayer settings={ts} shouldShowBg={ts.bgTarget === 'all'} shouldShowWm={ts.showWatermark !== false && ts.wmTarget === 'all'} />
      <div className="flex h-full w-full relative z-10">
        <div className="w-[80px] bg-[#131B2A] flex flex-col items-center py-16 shrink-0">
           <div className="w-10 h-10 bg-[#00A98F] flex items-center justify-center shrink-0">
               <User size={18} className="text-white" strokeWidth={2.5} />
            </div>
        </div>
        <div className="flex-1 bg-white px-16 py-20 flex flex-col">
           <div className="mb-10">
              <h2 className="text-4xl font-black text-slate-900 leading-none mb-4 uppercase tracking-tighter">Acceptance</h2>
              <div className="w-16 h-[5px] bg-[#00A98F]"></div>
           </div>
           <div className="flex-grow">
              <h4 className="text-[10px] font-black text-[#00A98F] tracking-[0.2em] uppercase mb-8">Formal Confirmation</h4>
              <p className="text-slate-600 text-sm leading-relaxed max-w-2xl mb-16 font-medium">
                By signing below, the client agrees to the costs estimated on Page 2 and the detailed terms and conditions provided on Page 3. Signature on this document constitutes a binding agreement and authorization to proceed with the project scope.
              </p>
              
              <div className="flex gap-20 mt-12">
                 <div className="flex-1 max-w-[240px]">
                    <div className="w-full border-t-[3px] border-slate-900 pt-4">
                       <p className="text-[10px] font-black text-slate-500 tracking-[0.2em] uppercase mb-1">Client Signature</p>
                       <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Authorized Representative</p>
                    </div>
                 </div>
                 <div className="flex-1 max-w-[240px]">
                    <div className="w-full border-t-[3px] border-[#00A98F] pt-4">
                       <p className="text-[10px] font-black text-[#00A98F] tracking-[0.2em] uppercase mb-1">Authorized Approval</p>
                       <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Project Lead / Signatory</p>
                    </div>
                 </div>
              </div>
           </div>
           <div className="mt-auto flex justify-between items-center pt-10 border-t border-slate-100 font-mono text-[9px] font-black text-slate-400 uppercase tracking-widest">
              <span>Institution Certified Document</span>
              <span>Ref: {data.quotationNumber}</span>
           </div>
        </div>
      </div>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">
        PAGE {getPageNum(4)}
      </div>
    </div>
  );

  // --- PAGE 4 or 5: PRODUCT DETAIL ---
  const PageProductDetail = ({ pageIndex }) => (
    <div className={`w-full flex-shrink-0 flex bg-white relative ${isVertical ? 'h-[297mm]' : 'h-full'}`}>
      <DesignLayer settings={ts} shouldShowBg={ts.bgTarget === 'all'} shouldShowWm={ts.showWatermark !== false && ts.wmTarget === 'all'} />
      <div className="flex h-full w-full relative z-10">
        <div className="w-[80px] bg-[#131B2A] flex flex-col items-center py-16 shrink-0">
           <div className="w-10 h-10 bg-[#00A98F] flex items-center justify-center shrink-0">
               <Info size={18} className="text-white" strokeWidth={2.5} />
            </div>
        </div>
        <div className="flex-1 bg-white px-16 py-20 flex flex-col">
           <div className="mb-10">
              <h2 className="text-4xl font-black text-slate-900 leading-none mb-4 uppercase tracking-tighter">Product Detail</h2>
              <div className="w-16 h-[5px] bg-[#00A98F]"></div>
           </div>
           <div className="flex-grow overflow-hidden">
              <div className="grid grid-cols-1 gap-8 max-h-[700px] overflow-y-auto pr-4 scrollbar-hide">
                  {data.items?.map((item, idx) => (
                      <div key={idx} className="flex gap-8 p-6 bg-[#F8F9FA] border-l-[4px] border-[#00A98F] relative overflow-hidden group/item">
                          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-slate-200/30 rounded-full group-hover/item:scale-150 transition-transform duration-700"></div>
                          {toProductImageUrl(item.productImage || item.image) && (
                              <div className="w-32 h-32 bg-white rounded-lg border border-slate-200 p-2 shrink-0 flex items-center justify-center relative z-10 overflow-hidden shadow-sm">
                                  <img src={toProductImageUrl(item.productImage || item.image)} alt={item.name} className="max-w-full max-h-full object-contain" />
                              </div>
                          )}
                          <div className="flex-1 relative z-10">
                              <div className="flex justify-between items-start mb-2">
                                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{item.name}</h3>
                                  <span className="text-[10px] font-black bg-[#131B2A] text-white px-2 py-0.5 rounded uppercase tracking-widest">{item.sku}</span>
                              </div>
                              <p className="text-sm text-slate-600 leading-relaxed font-medium mb-4 italic">
                                  {item.description || 'Professional grade institutional solution designed for performance and longevity.'}
                              </p>
                              <div className="grid grid-cols-3 gap-4 border-t border-slate-200 pt-4">
                                  <div>
                                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Quantity</p>
                                      <p className="text-sm font-bold text-slate-900">{item.qty} Units</p>
                                  </div>
                                  <div>
                                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Unit Rate</p>
                                      <p className="text-sm font-bold text-slate-900">{formatMoney(item.price, data.currency)}</p>
                                  </div>
                                  <div>
                                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Total</p>
                                      <p className="text-sm font-black text-[#00A98F]">{formatMoney(item.total, data.currency)}</p>
                                  </div>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
           </div>
           <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <span>Detailed Specifications Appendix</span>
              <div className="flex items-center gap-2 text-[#00A98F]">
                  <CheckCircle2 size={12} />
                  <span>Verified Solution</span>
              </div>
           </div>
        </div>
      </div>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">
        PAGE {getPageNum(pageIndex)}
      </div>
    </div>
  );

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
          {paginatedTerms.map((chunk, index) => (
            <React.Fragment key={`terms-${index}`}>
              {index > 0 && isVertical && <div className="h-[8px] bg-[#323639] w-full shrink-0" />}
              <PageThree htmlContent={chunk.join('')} />
            </React.Fragment>
          ))}
          
          {hasManyTerms && (
            <>
              {isVertical && <div className="h-[8px] bg-[#323639] w-full shrink-0" />}
              <PageAcceptance />
            </>
          )}

          {isVertical && <div className="h-[8px] bg-[#323639] w-full shrink-0" />}
          <PageProductDetail pageIndex={3 + paginatedTerms.length + (hasManyTerms ? 1 : 0)} />
        </div>

        {!isVertical && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4 bg-[#131B2A]/90 text-white px-5 py-2 rounded-full shadow-xl border border-white/10 backdrop-blur-sm opacity-100 md:opacity-0 md:group-hover/container:opacity-100 transition-opacity duration-300">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`p-1 rounded-full transition-colors ${currentPage === 1 ? 'text-white/20 cursor-default' : 'hover:bg-white/10 text-white cursor-pointer'}`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 px-3">
              {Array.from({ length: numPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${currentPage === p ? 'bg-[#00A98F] w-5' : 'bg-white/30 hover:bg-white/50'}`}
                />
              ))}
            </div>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(numPages, prev + 1))}
              disabled={currentPage === numPages}
              className={`p-1 rounded-full transition-colors ${currentPage === numPages ? 'text-white/20 cursor-default' : 'hover:bg-white/10 text-white cursor-pointer'}`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstitutionalDesign;
