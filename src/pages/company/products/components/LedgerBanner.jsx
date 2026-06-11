import React from 'react';
import { Layout, Upload, SlidersHorizontal, Percent } from 'lucide-react';

const LedgerBanner = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
      
      {/* Title & Description */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-[#eef2ff] text-[#145be9] flex items-center justify-center flex-shrink-0">
          <Layout className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-[#0f172a] font-black text-sm tracking-wide">Ledger Management</h2>
          <p className="text-gray-500 text-xs font-semibold mt-0.5">Bulk updates for inventory and rules.</p>
        </div>
      </div>

      {/* Action Links */}
      <div className="flex flex-wrap items-center gap-6 md:gap-8">
        <button className="flex items-center gap-2 text-[#145be9] hover:text-blue-800 transition-colors font-black text-sm tracking-wide">
          <Upload className="w-4 h-4" />
          Import CSV
        </button>
        {/* <button className="flex items-center gap-2 text-[#145be9] hover:text-blue-800 transition-colors font-black text-sm tracking-wide">
          <SlidersHorizontal className="w-4 h-4" />
          Quantity Rules
        </button>
        <button className="flex items-center gap-2 text-[#145be9] hover:text-blue-800 transition-colors font-black text-sm tracking-wide">
          <Percent className="w-4 h-4" />
          Global Discounts
        </button> */}
      </div>

    </div>
  );
};

export default LedgerBanner;
