import React, { useEffect, useRef, useState } from 'react';
import DesignLayer from './DesignLayer';

const Simple = ({ quotation, isVertical = false }) => {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const ts = quotation?.templateSettings || {};

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current && containerRef.current.parentElement) {
        const parentWidth = containerRef.current.parentElement.offsetWidth;
        const targetWidth = 794; 
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

  // Mock data tailored for the exact visual preview shown in the mockup
  const data = quotation || {
    quotationNumber: '#ARCH-2024-082',
    createdAt: new Date('2024-10-24'),
    expiryDate: new Date('2024-11-24'),
    customer: {
       fullName: 'Sarah Jenkins',
       businessName: 'Modern Living Co.',
       email: '4122 Innovation Blvd\nPalo Alto, CA 94304'
    },
    items: [
      { name: 'Schematic Design Phase', sku: 'Initial site analysis, zoning review, and conceptual sketches.', qty: 1.0, price: 4500.00, total: 4500.00 },
      { name: '3D Photorealistic Rendering', sku: 'High-fidelity exterior and interior visualisations (4 views).', qty: 4.0, price: 850.00, total: 3400.00 },
      { name: 'Permit Documentation', sku: 'Preparation of full architectural set for city submission.', qty: 1.0, price: 2200.00, total: 2200.00 }
    ],
    subtotal: 10100.00,
    taxAmount: 858.50,
    finalTotal: 10958.50,
    currency: 'USD'
  };

  const numPages = 1;
  const unscaledPageHeight = 1122.5; // 297mm in pixels at 96dpi
  const totalUnscaledHeight = unscaledPageHeight * numPages;

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
          boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)'
        }}
        className={`bg-white text-[#111827] flex flex-col p-[40px] shrink-0 relative ${isVertical ? '' : 'overflow-hidden'}`}
      >
        {/* Design Layer Integration */}
        <DesignLayer 
          settings={ts} 
          shouldShowBg={true} 
          shouldShowWm={ts.showWatermark !== false} 
        />

        {/* Header Row: Logo & "QUOTATION" */}
        <div className="flex justify-between items-start mb-10 w-full">
          {/* Left: Logo & Company Name */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#111827] flex p-3 justify-center items-end relative shrink-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full text-white pb-1 relative z-10">
                <path strokeLinecap="square" d="M3 12l9-8 9 8M5 12v9h14v-9" />
                <path strokeLinecap="square" d="M9 21v-6h6v6M12 11v4" />
                <path strokeLinecap="square" d="M7 11v5" />
                <path strokeLinecap="square" d="M17 11v5" />
              </svg>
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="text-[26px] font-black leading-[1.1] tracking-wide text-[#111827]">STUDIO<br/>PRIME</h1>
            </div>
          </div>

          {/* Right: Large QUOTATION text */}
          <div className="flex items-start h-16">
            <h2 className="text-[52px] font-bold text-[#cce2fc] tracking-wide leading-none mt-1">QUOTATION</h2>
          </div>
        </div>

        {/* Info Row: Company Address / Quote Details */}
        <div className="flex justify-between mb-10">
          <div className="text-[13px] text-[#64748b] leading-[1.6]">
            <p>882 Architectural Way, Suite</p>
            <p>400</p>
            <p>San Francisco, CA 94103</p>
            <p className="text-[#64748b] mt-1">contact@studioprime.arch</p>
          </div>

          <div className="mt-2">
            <table className="text-[13px]">
              <tbody>
                <tr>
                  <td className="text-[#94a3b8] font-black uppercase tracking-widest text-right pr-3 py-1 text-[11px]">QUOTE NO:</td>
                  <td className="text-[#111827] font-bold">{data.quotationNumber}</td>
                </tr>
                <tr>
                  <td className="text-[#94a3b8] font-black uppercase tracking-widest text-right pr-3 py-1 text-[11px]">DATE:</td>
                  <td className="text-[#111827] font-medium">{formatDate(data.createdAt)}</td>
                </tr>
                <tr>
                  <td className="text-[#94a3b8] font-black uppercase tracking-widest text-right pr-3 py-1 text-[11px]">EXPIRY:</td>
                  <td className="text-[#111827] font-medium">{data.expiryDate ? formatDate(data.expiryDate) : 'Nov 24, 2024'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Bill To Section */}
        <div className="mb-10">
          <div className="w-8 h-[3px] bg-[#2563eb] mb-1"></div>
          <h4 className="text-[#2563eb] font-black text-[12px] uppercase tracking-widest flex items-center gap-2 mb-2">BILL TO</h4>
          <h3 className="text-[#111827] text-[22px] font-bold mb-1">
            {data.customer?.businessName || 'Modern Living Co.'}
          </h3>
          <div className="text-[#64748b] text-[13px] leading-[1.6]">
            {data.customer?.email?.split('\n').map((line, i) => <p key={i}>{line}</p>) || (
              <>
                <p>4122 Innovation Blvd</p>
                <p>Palo Alto, CA 94304</p>
              </>
            )}
            <p className="mt-1">Attn: {data.customer?.fullName || 'Sarah Jenkins'}</p>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="mb-8 w-full shrink-0">
          <div className="grid grid-cols-12 border-b-[2px] border-[#111827] pb-3 mb-4">
            <div className="col-span-7 font-black text-[12px] uppercase tracking-[0.15em] text-[#111827]">DESCRIPTION</div>
            <div className="col-span-1 text-center font-black text-[12px] uppercase tracking-[0.1em] text-[#111827]">QTY</div>
            <div className="col-span-2 text-center font-black text-[12px] uppercase tracking-[0.1em] text-[#111827] leading-tight">UNIT<br/>PRICE</div>
            <div className="col-span-2 text-right font-black text-[12px] uppercase tracking-[0.1em] text-[#111827]">TOTAL</div>
          </div>

          <div className="flex flex-col">
            {data.items?.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 items-start py-4 border-b border-gray-100 last:border-0">
                <div className="col-span-7 pr-6">
                  <h4 className="text-[#111827] font-bold text-[14px] mb-1">{item.name}</h4>
                  <p className="text-[#94a3b8] text-[13px] leading-[1.5] pr-8">{item.sku}</p>
                </div>
                <div className="col-span-1 text-center text-[#111827] text-[14px] mt-0.5 font-medium">{Number(item.qty).toFixed(1)}</div>
                <div className="col-span-2 text-center text-[#111827] text-[14px] mt-0.5">{formatMoney(item.price, data.currency)}</div>
                <div className="col-span-2 text-right font-bold text-[#111827] text-[14px] mt-0.5">{formatMoney(item.total, data.currency)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Totals Section */}
        <div className="flex justify-end mb-16 border-t border-gray-100 pt-6 mt-auto">
          <div className="w-[300px]">
            <div className="flex justify-between items-center mb-4">
              <span className="font-black text-[#94a3b8] text-[11px] uppercase tracking-widest">SUBTOTAL</span>
              <span className="font-bold text-[#111827] text-[14px]">{formatMoney(data.subtotal, data.currency)}</span>
            </div>
            <div className="flex justify-between items-center mb-6">
              <span className="font-black text-[#94a3b8] text-[11px] uppercase tracking-widest">TAX (8.5%)</span>
              <span className="font-bold text-[#111827] text-[14px]">{formatMoney(data.taxAmount || data.tax || 0, data.currency)}</span>
            </div>
            <div className="w-full h-[1px] bg-gray-100 mb-6"></div>
            <div className="flex justify-between items-center">
              <span className="font-black text-[#111827] text-[14px] uppercase tracking-widest">TOTAL</span>
              <span className="text-[#2563eb] text-[20px] font-bold">{formatMoney(data.finalTotal, data.currency)}</span>
            </div>
          </div>
        </div>

        {/* Footer (Terms & Signature) */}
        <div className="flex justify-between items-end">
          <div className="w-1/2 pr-12">
            <h4 className="font-black text-[#111827] text-[11px] uppercase tracking-widest mb-3">TERMS & CONDITIONS</h4>
            <p className="text-[#94a3b8] text-[11px] leading-[1.6]">
              Payment due within 15 days of acceptance. Quotation is valid for 30 days. Architecture services are subject to the master service agreement signed on Jan 1st.
            </p>
          </div>
          <div className="w-[200px] flex flex-col items-center">
            <div className="w-full border-b border-gray-400 pb-1 mb-2 text-center text-gray-300 text-[18px]">Authorized Signature</div>
            <span className="font-black text-[#111827] text-[10px] uppercase tracking-widest">PROJECT PRINCIPAL</span>
          </div>
        </div>

        {/* Pagination */}
        <div className="w-full mt-10 text-center">
          <span className="font-black text-[#111827] text-[10px] uppercase tracking-widest">PAGE 01 — 01</span>
        </div>
      </div>
    </div>
  );
};

export default Simple;
