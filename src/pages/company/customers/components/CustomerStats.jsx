import React from 'react';
import { Share2, Users, TrendingUp } from 'lucide-react';

const CustomerStats = ({ customersCount, isLoading }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
      {/* Card 1: API Connection */}
      <div className="bg-white rounded-[2rem] p-7 border border-gray-100 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
        <div>
          <div className="flex items-center justify-between mb-5">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-[#145be9]">
              <Share2 className="w-6 h-6" />
            </div>
            <span className="bg-[#0f766e] text-white text-[10px] uppercase tracking-wider font-black px-3 py-1.5 rounded-full flex items-center space-x-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
              <span>Active Link</span>
            </span>
          </div>
          <h3 className="text-[#1a2b4b] font-bold text-xl mb-2">Architect Sync</h3>
          <p className="text-gray-400 text-sm leading-relaxed mb-6 font-medium">
            Real-time synchronization active with your connected ERP module.
          </p>
        </div>
        <div className="flex items-center justify-between text-xs border-t border-gray-50 pt-5 mt-2">
          <span className="text-gray-400 font-bold">Last update: 2m ago</span>
          <button className="text-[#145be9] font-black flex items-center hover:translate-x-1 transition-transform">
            <span>CONFIG</span>
            <span className="ml-1 tracking-tighter">→</span>
          </button>
        </div>
      </div>

      {/* Card 2: Stats */}
      <div className="bg-white rounded-[2rem] p-7 border border-gray-100 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
        <div>
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-5">
            <Users className="w-6 h-6" />
          </div>
          <h2 className="text-[#1a2b4b] text-5xl font-black tracking-tighter mb-1">
            {isLoading ? '...' : customersCount.toLocaleString()}
          </h2>
          <p className="text-gray-400 text-sm font-bold uppercase tracking-wide">Total Leads Managed</p>
        </div>
        <div className="flex items-center text-[#0f766e] text-xs font-black mt-6 space-x-1 border-t border-gray-50 pt-5">
          <TrendingUp className="w-4 h-4" />
          <span>12.5% MONTHLY ACCELERATION</span>
        </div>
      </div>

      {/* Card 3: Architect Insights */}
      <div className="bg-[#1a2b4b] rounded-[2rem] p-7 shadow-xl shadow-slate-900/10 flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-700"></div>
        <div className="z-10">
          <h3 className="text-white font-black text-xl mb-2">Cloud Insights</h3>
          <p className="text-slate-400 text-sm leading-relaxed pr-4 font-medium">
            Integrations refined. Your recent customer batch is now fully indexed across all modules.
          </p>
        </div>
        <button className="bg-[#145be9] text-white font-bold w-full py-3.5 rounded-2xl mt-8 hover:bg-blue-600 transition-all shadow-lg shadow-blue-900/20 active:scale-95 z-10">
          Automate Workflows
        </button>
      </div>
    </div>
  );
};

export default CustomerStats;
