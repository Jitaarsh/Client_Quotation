import React from 'react';
import { ArrowUpRight, Contact } from 'lucide-react';

const IntegrationsBanner = () => {
  return (
    <div className="mt-8 border-2 border-dashed border-gray-200 rounded-[2rem] p-12 flex flex-col items-center justify-center text-center bg-white/50">
      <div className="w-16 h-16 bg-[#eef2ff] rounded-2xl flex items-center justify-center mb-6">
        <Contact className="w-8 h-8 text-[#145be9]" />
      </div>
      <h3 className="text-[#1a2b4b] text-xl font-bold mb-3 tracking-tight">Build a stronger client ledger</h3>
      <p className="text-gray-500 text-[15px] font-medium leading-relaxed max-w-[360px] mb-8">
        Connect your business email or CRM to automatically import and sync customer details in real-time.
      </p>
      <button className="flex items-center text-[#145be9] font-bold text-[15px] hover:text-blue-700 transition-colors group">
        Explore integrations
        <ArrowUpRight className="w-4 h-4 ml-1.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
      </button>
    </div>
  );
};

export default IntegrationsBanner;
