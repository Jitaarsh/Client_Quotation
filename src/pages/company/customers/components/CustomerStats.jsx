import React from 'react';
import { Share2, Users, TrendingUp } from 'lucide-react';

const CustomerStats = ({ customersCount, isLoading }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-10">
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
    </div>
  );
};

export default CustomerStats;
