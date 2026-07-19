import React, { useEffect, useRef, useState } from 'react';
import DesignLayer from './DesignLayer';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ElegantDesign = ({ quotation, isVertical = false }) => {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
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
  const items = data.items || [];
  const emptyRows = Array(Math.max(0, 10 - items.length)).fill(null);

  return (
    <div 
      className="flex items-start justify-center w-full leading-normal"
      style={isVertical ? { height: 1122.5 * scale, overflow: 'hidden' } : { overflow: 'hidden' }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap');
        .font-elegant-serif { font-family: 'Playfair Display', serif; }
        .font-elegant-script { font-family: 'Great Vibes', cursive; }
      `}</style>
      
      <div
        ref={containerRef}
        style={{
          width: '210mm',
          height: '297mm',
          minWidth: '210mm',
          minHeight: '297mm',
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          boxShadow: '0 20px 50px -12px rgba(0,0,0,0.15)'
        }}
        className="bg-white flex flex-col shrink-0 relative overflow-hidden"
      >
        <DesignLayer settings={ts} shouldShowBg={true} shouldShowWm={ts.showWatermark !== false} />
        
        <div className="h-full flex flex-col bg-white/95 text-slate-800 font-sans relative z-10">
          {/* Header */}
          <div className="px-14 pt-16 pb-10 flex justify-between items-start">
            <div>
              <h1 className="text-[3.25rem] font-elegant-serif tracking-[0.15em] leading-none mb-4 text-slate-900">
                PRICE QUOTE
              </h1>
              <h2 className="text-sm font-semibold tracking-widest uppercase mb-1">
                {data.companyName || 'QUICK QUOTE SOLUTIONS'}
              </h2>
              <p className="text-[10px] text-slate-500 tracking-wide uppercase font-bold">
                Professional Services | Precision Delivery
              </p>
            </div>
            <div className="text-right">
                <div className="w-12 h-12 bg-slate-900 flex items-center justify-center text-white mb-4 ml-auto">
                    <span className="font-elegant-serif text-2xl italic">E</span>
                </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="px-14 pb-8 flex justify-between">
            <div className="w-[45%]">
              <h3 className="font-elegant-serif text-2xl mb-4 text-slate-900 border-b border-slate-100 pb-2">BILL TO</h3>
              <p className="text-sm font-bold text-slate-700 uppercase tracking-tight mb-1">{data.customer?.businessName || data.customer?.fullName || 'Client Name'}</p>
              <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                {data.customer?.address || 'Client Address'}<br/>
                {data.customer?.email || 'client@example.com'}
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
                <span className="font-bold uppercase tracking-[0.1em] text-slate-400">EXPIRY:</span>
                <span className="text-slate-800 font-bold">{ts.validityDays || '30'} Days</span>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="px-14 mb-8 flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F4EEE8]/50">
                  <th className="py-3 px-4 font-elegant-serif text-xs tracking-widest text-center border border-slate-200 w-16">NO</th>
                  <th className="py-3 px-4 font-elegant-serif text-xs tracking-widest border border-slate-200 uppercase">DESCRIPTION</th>
                  <th className="py-3 px-4 font-elegant-serif text-xs tracking-widest text-center border border-slate-200 w-20 uppercase">QTY</th>
                  <th className="py-3 px-4 font-elegant-serif text-xs tracking-widest text-right border border-slate-200 w-28 uppercase">PRICE</th>
                  <th className="py-3 px-4 font-elegant-serif text-xs tracking-widest text-right border border-slate-200 w-28 uppercase">AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-100">
                    <td className="py-3 px-4 text-center text-[11px] text-slate-500 border-x border-slate-100 font-bold">{(idx + 1).toString().padStart(2, '0')}</td>
                    <td className="py-3 px-4 text-[11px] text-slate-700 border-r border-slate-100 font-bold uppercase tracking-tight">{item.name}</td>
                    <td className="py-3 px-4 text-center text-[11px] text-slate-500 border-r border-slate-100 font-bold">{item.qty}</td>
                    <td className="py-3 px-4 text-right text-[11px] text-slate-500 border-r border-slate-100 font-bold">{formatMoney(item.price, data.currency)}</td>
                    <td className="py-3 px-4 text-right text-[11px] text-slate-900 border-r border-slate-100 font-black">{formatMoney(item.total, data.currency)}</td>
                  </tr>
                ))}
                {/* Empty Filler Rows */}
                {emptyRows.map((_, idx) => (
                  <tr key={`empty-${idx}`} className="border-b border-slate-50 h-[38px]">
                    <td className="border-x border-slate-50"></td>
                    <td className="border-r border-slate-50"></td>
                    <td className="border-r border-slate-50"></td>
                    <td className="border-r border-slate-50"></td>
                    <td className="border-r border-slate-50"></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom Section */}
          <div className="px-14 flex gap-12 mb-16">
            {/* Left side: Signatures */}
            <div className="w-[50%] flex flex-col justify-end gap-6 pb-2">
              <div className="space-y-4">
                 <div className="flex items-end gap-3">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest min-w-[70px]">Signature</span>
                    <div className="flex-1 border-b border-slate-200 pb-1 italic font-elegant-script text-2xl text-slate-700">
                        Sarah Chen
                    </div>
                 </div>
                 <div className="flex items-end gap-3">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest min-w-[70px]">Date</span>
                    <div className="flex-1 border-b border-slate-200 pb-1 text-[11px] font-bold text-slate-800">
                        {formatDate(new Date())}
                    </div>
                 </div>
              </div>
            </div>

            {/* Right side: Totals */}
            <div className="w-[50%]">
              <div className="space-y-1">
                 <div className="flex items-center">
                    <div className="flex-1 text-right pr-4 text-[10px] font-black tracking-widest uppercase text-slate-400">SUBTOTAL</div>
                    <div className="bg-[#F4EEE8]/40 py-2 px-4 text-right text-slate-700 font-bold text-[11px] w-32">{formatMoney(data.subtotal, data.currency)}</div>
                 </div>
                 <div className="flex items-center">
                    <div className="flex-1 text-right pr-4 text-[10px] font-black tracking-widest uppercase text-slate-400">TAX (EST.)</div>
                    <div className="bg-[#F4EEE8]/40 py-2 px-4 text-right text-slate-700 font-bold text-[11px] w-32">{formatMoney(data.taxTotal, data.currency)}</div>
                 </div>
                 <div className="flex items-center pt-2">
                    <div className="flex-1 text-right pr-4 text-[11px] font-black tracking-[0.2em] uppercase text-slate-900">TOTAL DUE</div>
                    <div className="bg-slate-900 py-3 px-4 text-right text-white font-black text-sm w-32 shadow-lg">
                        {formatMoney(data.finalTotal, data.currency)}
                    </div>
                 </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="bg-[#F4EEE8] py-6 text-center tracking-[0.4em] font-elegant-serif text-[11px] font-bold text-slate-700 w-full shrink-0 uppercase">
            Thank you for choosing our excellence
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElegantDesign;