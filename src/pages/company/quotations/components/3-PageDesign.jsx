import React, { useEffect, useRef, useState } from 'react';
import DesignLayer from './DesignLayer';
import { ChevronLeft, ChevronRight, Shield, ShieldCheck, CreditCard, Clock, FileText, User, Calendar, MapPin, Globe } from 'lucide-react';
import { chunkHtmlElements, plainTextToHtml } from '../../../../utils/pdfTextExtractor';

const ThreePageDesign = ({ quotation, isVertical = false }) => {
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

  // Mock data matching the new specific context
  const data = quotation || {
    quotationNumber: 'QTN-9981',
    createdAt: new Date('2024-10-24'),
    projectName: 'Modern Residential Complex',
    customer: {
       businessName: 'Sterling Miller Architects',
       address: '452 Skyline Blvd, CA\nSan Francisco, 94105\nUnited States',
    },
    items: [
      { name: 'Research & Discovery', sku: 'Site analysis & briefs', qty: 1, price: 3500, total: 3500 },
      { name: 'Schematic Design', sku: 'Sketches & 3D plans', qty: 1, price: 6800, total: 6800 },
      { name: 'Construction Docs', sku: 'Engineering sets', qty: 1, price: 8250, total: 8250 }
    ],
    subtotal: 18550,
    taxTotal: 1855,
    finalTotal: 20405,
    currency: 'USD'
  };

  // --- REWRITTEN PAGE 1 (Matching Dual Page) ---
  const PageOne = () => (
    <div className={`w-full flex-shrink-0 flex flex-col bg-white relative ${isVertical ? 'h-[297mm]' : 'h-full'}`}>
      <DesignLayer settings={ts} shouldShowBg={true} shouldShowWm={ts.showWatermark !== false} />
      <div className="flex-1 flex flex-col p-12 pb-16 relative z-10">
        <div className="relative mb-14">
          <div className="absolute -left-12 -top-12 -right-12 bottom-0 w-[calc(100%+96px)] h-full bg-[#E8EDF2] z-0">
             <div className="absolute inset-0 opacity-[0.1]" style={{ backgroundImage: 'linear-gradient(#1a2b4b 1px, transparent 1px), linear-gradient(90deg, #1a2b4b 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
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
              <div className="w-12 h-[1px] bg-gray-300 mx-4"></div>
              <div className="text-[14px] text-[#4b5563] font-medium">
                Issue Date: {formatDate(data.createdAt)}
              </div>
            </div>
          </div>
        </div>

        {/* Client Information */}
        <div className="mb-10 w-full relative z-10">
          <h4 className="text-[11px] font-black uppercase tracking-[0.15em] text-[#145be9] mb-3">
            CLIENT INFORMATION
          </h4>
          <div className="bg-[#f3f7fb] border-l-[4px] border-[#145be9] rounded-r-xl p-6">
            <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">TO:</div>
            <h3 className="text-[22px] font-bold text-[#111827] mb-2">{data.customer?.businessName || 'Sterling Miller Architects'}</h3>
            <div className="text-[#4b5563] text-[14px] leading-relaxed">
              {(data.customer?.address || '452 Skyline Blvd, CA\nSan Francisco, 94105\nUnited States').split('\n').map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Scope of Work */}
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

        {/* Information Pills */}
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
                <div className="w-2 h-2 rounded-full bg-[#059669]"></div>
                Draft Proposal
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
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
            <div className="text-right flex flex-col items-end">
              <div className="text-[#111827] font-bold text-[14px] mb-2">contact@archledger.com</div>
              <div className="text-[#9ca3af] text-[10px] font-black uppercase tracking-widest">PAGE 01 — 03</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // --- STYLIZED PAGE 2 (Matching Dual Page) ---
  const PageTwo = () => (
    <div className={`w-full flex-shrink-0 flex flex-col bg-white relative ${isVertical ? 'h-[297mm]' : 'h-full'}`}>
      <DesignLayer settings={ts} shouldShowBg={ts.bgTarget === 'all'} shouldShowWm={ts.showWatermark !== false && ts.wmTarget === 'all'} />
      <div className="flex-1 flex flex-col p-12 pb-16 relative z-10">
        
        {/* Header Section */}
        <div className="mb-10 w-full relative z-10">
          <h4 className="text-[11px] font-black uppercase tracking-[0.15em] text-[#145be9] mb-3">
            FINANCIAL SUMMARY
          </h4>
          <h1 className="text-[32px] font-bold text-[#111827] leading-[1.1] tracking-tight mb-2">
            Investment Breakdown
          </h1>
          <p className="text-[13px] text-[#4b5563] w-3/4">
            Detailed cost estimation for all deliverables outlined in the scope of work. Prices are fixed for the duration of the validity period.
          </p>
        </div>

        {/* Line Items Table */}
        <div className="mb-8 w-full shrink-0">
          <div className="grid grid-cols-12 border-b-[2px] border-[#111827] pb-3 mb-4">
            <div className="col-span-6 font-black text-[11px] uppercase tracking-[0.15em] text-[#111827]">DESCRIPTION OF SERVICES</div>
            <div className="col-span-2 text-center font-black text-[11px] uppercase tracking-[0.15em] text-[#111827]">QTY</div>
            <div className="col-span-2 text-right font-black text-[11px] uppercase tracking-[0.15em] text-[#111827] pr-4">RATE</div>
            <div className="col-span-2 text-right font-black text-[11px] uppercase tracking-[0.15em] text-[#111827]">AMOUNT</div>
          </div>

          <div className="flex flex-col space-y-4">
            {data.items?.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 items-start py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                <div className="col-span-6 pr-6">
                  <h4 className="text-[#111827] font-bold text-[14px] mb-1">{item.name}</h4>
                  <p className="text-[#6b7280] text-[12px] leading-[1.5]">{item.sku}</p>
                </div>
                <div className="col-span-2 text-center text-[#111827] text-[14px] mt-0.5 font-medium">{Number(item.qty).toFixed(1)}</div>
                <div className="col-span-2 text-right text-[#4b5563] text-[14px] mt-0.5 pr-4 border-r border-gray-200">
                  {formatMoney(item.price, data.currency)}
                </div>
                <div className="col-span-2 text-right font-bold text-[#111827] text-[14px] mt-0.5">
                  {formatMoney(item.total, data.currency)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Totals Section */}
        <div className="flex justify-end mb-12">
          <div className="w-[320px] bg-[#f3f7fb] rounded-xl p-6 border border-[#e2e8f0]">
            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-center">
                <span className="font-bold text-[#64748b] text-[11px] uppercase tracking-widest">SUBTOTAL</span>
                <span className="font-semibold text-[#111827] text-[14px]">{formatMoney(data.subtotal, data.currency)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-[#64748b] text-[11px] uppercase tracking-widest">TAX (ESTIMATE)</span>
                <span className="font-semibold text-[#111827] text-[14px]">{formatMoney(data.taxTotal || 0, data.currency)}</span>
              </div>
            </div>
            
            <div className="w-full h-[2px] bg-[#145be9]/20 mb-4"></div>

            <div className="flex justify-between items-center">
              <span className="font-black text-[#111827] text-[12px] uppercase tracking-widest">FINAL TOTAL</span>
              <span className="text-[#145be9] text-[22px] font-black tracking-tight">{formatMoney(data.finalTotal, data.currency)}</span>
            </div>
          </div>
        </div>

        {/* Footer / Authorizations */}
        <div className="mt-auto w-full pt-8 border-t border-gray-200 flex justify-between items-end">
          <div className="w-[60%] pr-10">
             <h4 className="font-black text-[#111827] text-[10px] uppercase tracking-widest mb-2">TERMS & ACCEPTANCE</h4>
             <p className="text-[#6b7280] text-[11px] leading-[1.6]">
                By signing below, the client agrees to the costs estimated on this page and the scope of work defined on page 1. Prices are valid for the listed validity period. Upon acceptance, an initial deposit invoice will be issued.
             </p>
          </div>
          
          <div className="w-[200px] flex flex-col items-end">
             <div className="text-[#9ca3af] text-[10px] font-black uppercase tracking-widest">PAGE 02 — 03</div>
          </div>
        </div>
      </div>
    </div>
  );

  // --- NEW STYLIZED PAGE 3 (Terms and Conditions Image Match) ---
  const termsChunks = chunkHtmlElements(plainTextToHtml(data.termsAndConditions?.content || ''), 887);
  const paginatedTerms = termsChunks.length ? termsChunks : [[]];

  const PageThree = ({ htmlContent }) => {
    const tncContent = htmlContent || '';

    return (
      <div className={`w-full flex-shrink-0 flex flex-col bg-white relative ${isVertical ? 'h-[297mm]' : 'h-full'}`}>
        <DesignLayer settings={ts} shouldShowBg={ts.bgTarget === 'all'} shouldShowWm={ts.showWatermark !== false && ts.wmTarget === 'all'} />
        {/* Top Banner Header */}
        <div className="w-full bg-[#f3f7fb] border-b border-[#d1e0f0] rounded-b-xl py-6 flex items-center justify-center mb-8 shrink-0 relative z-10">
          <h1 className="text-[18px] font-bold text-[#111827]">Terms and Conditions – Quick Quote Application</h1>
        </div>

      <div className="flex-1 flex flex-col p-12 pb-16 relative z-10 text-[13px] leading-[1.55] text-[#111827]">
          
            <div className="space-y-3 prose prose-sm max-w-none prose-headings:mb-1 prose-headings:text-[#111827] prose-p:text-[#374151] prose-li:text-[#374151]">
            {tncContent ? (
              <div 
                dangerouslySetInnerHTML={{ __html: tncContent }} 
                className="dynamic-tnc-content"
              />
            ) : (
              <div className="space-y-3">
                <div>
                  <h4 className="font-bold mb-0.5">1. Agreement Overview</h4>
                  <p className="text-[#374151]">These Terms and Conditions ("Agreement") govern the use of the Quick Quote application ("Application," "Service," or "Platform") provided by [Your Company Name] ("Company," "We," "Us"). By accessing or using the Application, you ("User," "Client") agree to comply with and be bound by these Terms.</p>
                </div>

                <div>
                  <h4 className="font-bold mb-0.5">2. Description of Service</h4>
                  <ul className="list-disc pl-5 space-y-0.5 text-[#374151]">
                    <li>Quick Quote is a digital platform that enables users to generate, manage, and share price quotations for products and services. The platform may include features such as automated pricing, templates, analytics, and integrations.</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold mb-0.5">3. User Responsibilities</h4>
                  <ul className="list-disc pl-5 space-y-0.5 text-[#374151]">
                    <li>Users must provide accurate and complete information while generating quotations.</li>
                    <li>Users are responsible for reviewing all quotes before sharing them with clients.</li>
                    <li>Any misuse of the platform, including fraudulent or misleading quotations, is strictly prohibited.</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold mb-0.5">4. Pricing & Payments</h4>
                  <ul className="list-disc pl-5 space-y-0.5 text-[#374151]">
                    <li>The Application may offer free and paid plans. Pricing details will be clearly communicated on the platform.</li>
                    <li>Subscription fees (if applicable) are billed on a recurring basis.</li>
                    <li>All payments are non-refundable unless otherwise stated.</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold mb-0.5">5. Data & Privacy</h4>
                  <ul className="list-disc pl-5 space-y-0.5 text-[#374151]">
                    <li>We collect and process user data in accordance with our Privacy Policy.</li>
                    <li>Users retain ownership of the data they input into the platform.</li>
                    <li>The Company implements reasonable security measures but does not guarantee absolute data protection.</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold mb-0.5">6. Intellectual Property</h4>
                  <ul className="list-disc pl-5 space-y-0.5 text-[#374151]">
                    <li>All software, design, content, and features of the Application are the intellectual property of the Company.</li>
                    <li>Users may not copy, modify, distribute, or reverse engineer any part of the Application without prior written consent.</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold mb-0.5">7. Accuracy of Quotes</h4>
                  <ul className="list-disc pl-5 space-y-0.5 text-[#374151]">
                    <li>The Application provides estimates based on user inputs and predefined logic.</li>
                    <li>The Company does not guarantee the accuracy, completeness, or reliability of generated quotes.</li>
                    <li>Final pricing decisions remain the responsibility of the user.</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Footer / Authorizations */}
          <div className="mt-auto w-full pt-6 border-t border-gray-200 flex justify-between items-end pb-8">
            <div className="w-[60%] pr-10">
               <h4 className="font-black text-[#111827] text-[10px] uppercase tracking-widest mb-2">TERMS & ACCEPTANCE</h4>
               <p className="text-[#6b7280] text-[11px] leading-[1.6]">
                  By signing below, the client agrees to the costs estimated on this page and the scope of work defined on page 1. Prices are valid for the listed validity period. Upon acceptance, an initial deposit invoice will be issued.
               </p>
            </div>
            
            <div className="w-[200px] flex flex-col items-center">
              <div className="w-full border-b border-gray-300 pb-2 mb-2 text-center">
                <span className="text-gray-300 font-medium text-[16px] select-none">Client Signature</span>
              </div>
              <span className="font-black text-[#111827] text-[9px] uppercase tracking-widest">AUTHORIZED APPROVAL</span>
            </div>
          </div>

        </div>
        
        {/* Absolute Bottom Page Numbering */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-[0.25em] text-[#4b5563]">
          PAGE 03 — 03
        </div>
      </div>
    );
  };

  const numPages = 2 + paginatedTerms.length;
  const unscaledPageHeight = 1122.5; // 297mm in pixels at 96dpi
  const separatorHeight = 8;
  const totalUnscaledHeight = (unscaledPageHeight * numPages) + ((numPages - 1) * separatorHeight);

  return (
    <div 
      className="flex items-start justify-center w-full leading-normal group/container"
      style={isVertical ? { height: totalUnscaledHeight * scale, overflow: 'hidden' } : { overflow: 'hidden' }}
    >
      {/* Wrapper to handle scaling centrally */}
      <div
        ref={containerRef}
        style={{
          width: '210mm',
          height: isVertical ? `${totalUnscaledHeight}px` : '297mm',
          minWidth: '210mm',
          minHeight: '297mm',
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)'
        }}
        className={`bg-white flex flex-col shrink-0 relative ${isVertical ? '' : 'overflow-hidden'}`}
      >
        {/* Slider Track or Vertical Stack */}
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
        </div>

        {/* Navigation Controls Overlay - Only show in horizontal slider mode */}
        {!isVertical && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4 bg-[#111827]/90 text-white px-5 py-2.5 rounded-full shadow-lg border border-white/20 backdrop-blur-sm opacity-100 md:opacity-0 md:group-hover/container:opacity-100 transition-opacity duration-300">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`p-1 rounded-full transition-colors ${currentPage === 1 ? 'text-white/20 cursor-default' : 'hover:bg-white/10 text-white cursor-pointer'}`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3 px-3">
              <span className={`w-2 h-2 rounded-full transition-all duration-300 ${currentPage === 1 ? 'bg-white w-5' : 'bg-white/30'}`}></span>
              <span className={`w-2 h-2 rounded-full transition-all duration-300 ${currentPage === 2 ? 'bg-white w-5' : 'bg-white/30'}`}></span>
              <span className={`w-2 h-2 rounded-full transition-all duration-300 ${currentPage === 3 ? 'bg-white w-5' : 'bg-white/30'}`}></span>
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

export default ThreePageDesign;
