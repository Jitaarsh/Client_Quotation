import React from 'react';

const FinancialSummaryCard = ({ financials, currency, taxRate, setTaxRate }) => {
  const formatCurrency = (amount) => {
    const symbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };
    const symbol = symbols[currency] || '$';
    return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="bg-[#eff3fc] rounded-2xl p-6 border border-gray-100 font-sans mb-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-gray-500 font-bold text-[11px] uppercase tracking-widest ">Financial Summary</h3>
        <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tax:</span>
            <input 
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                className="w-12 bg-white border border-blue-100 rounded px-1.5 py-0.5 text-[11px] font-bold text-[#145be9] focus:outline-none"
            />
            <span className="text-[10px] font-bold text-gray-400">%</span>
        </div>
      </div>
      
      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600 font-medium">Subtotal</span>
          <span className="text-[#1a2b4b] font-bold">{formatCurrency(financials.subtotal)}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-[#10b981] font-medium">Discount Total</span>
          <span className="text-[#10b981] font-bold">-{formatCurrency(financials.discountTotal)}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600 font-medium">Estimated Tax ({taxRate}%)</span>
          <span className="text-[#1a2b4b] font-bold">{formatCurrency(financials.taxTotal)}</span>
        </div>
      </div>

      <div className="border-t border-gray-200/60 pt-4 flex justify-between items-end">
        <span className="text-[#1a2b4b] font-black text-base">Total Amount</span>
        <div className="text-right">
          <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{currency} Currency</div>
          <div className="text-[#145be9] font-black text-2xl lg:text-3xl tracking-tight leading-none">
            {formatCurrency(financials.finalTotal)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialSummaryCard;
