import React from 'react';
import { BarChart3, LayoutGrid, Users, FileText, ArrowRight } from 'lucide-react';

const WhyChooseUs = () => {
  return (
    <section className="w-full bg-[#fafcff] px-8 pt-32 pb-12">
      <div className="max-w-[1400px] w-full mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-[#141b2d]">
            Why Smart Businesses Choose Quick Quotes
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Real-time Analytics */}
          <div className="bg-white rounded-3xl p-6 flex flex-col shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full border border-gray-100">
            <div className="mb-4">
              <BarChart3 className="w-6 h-6 text-[#145be9]" />
            </div>
            <h3 className="text-lg font-bold text-[#141b2d] mb-3">
              Real-time Analytics
            </h3>
            <p className="text-gray-500 leading-relaxed text-[14px] mb-4 flex-1">
              Know the exact moment a prospect opens your quote. Track dwell time on specific line items to gauge interest.
            </p>
            <a href="#" className="inline-flex items-center text-[12px] font-bold text-[#145be9] uppercase tracking-wider mb-6 hover:text-blue-800 transition-colors">
              Explore Portal <ArrowRight className="w-4 h-4 ml-1" />
            </a>
            {/* Visual Graphic */}
            <div className="mt-auto">
              <div className="w-full h-[180px] bg-gradient-to-br from-[#1e2535] to-[#0f141f] rounded-2xl overflow-hidden relative shadow-inner p-5 flex items-end justify-between border border-gray-800">
                {/* 3D-ish Bars */}
                <div className="w-1/6 h-1/4 bg-[#3a4b66] rounded-t-sm shadow-[-5px_0px_10px_rgba(0,0,0,0.5)]"></div>
                <div className="w-1/6 h-2/5 bg-[#3a4b66] rounded-t-sm shadow-[-5px_0px_10px_rgba(0,0,0,0.5)]"></div>
                <div className="w-1/6 h-3/5 bg-[#4b6082] rounded-t-sm shadow-[-5px_0px_10px_rgba(0,0,0,0.5)]"></div>
                <div className="w-1/6 h-4/5 bg-[#5e779f] rounded-t-sm shadow-[-5px_0px_10px_rgba(0,0,0,0.5)] relative">
                  <div className="absolute top-0 right-0 w-[150%] h-[150%] bg-white blur-3xl opacity-20 transform translate-x-1/2 -translate-y-1/2 rounded-full"></div>
                </div>
                <div className="w-1/6 h-[95%] bg-[#7794c4] rounded-t-sm shadow-[-5px_0px_10px_rgba(0,0,0,0.5)] relative">
                  <div className="absolute top-0 left-1/2 w-4 h-4 bg-white shadow-[0_0_20px_rgba(255,255,255,0.8)] rounded-full -translate-x-1/2 -translate-y-2 z-10"></div>
                </div>
                {/* Trend Line Swoosh */}
                <svg className="absolute w-full h-[80%] bottom-5 left-0 z-0 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M 10 90 Q 40 80, 50 50 T 90 10" fill="none" stroke="#dbe7ff" strokeWidth="3" className="drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"></path>
                </svg>
              </div>
            </div>
          </div>

          {/* Card 2: Centralized Ledger */}
          <div className="bg-white rounded-3xl p-6 flex flex-col shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full border border-gray-100">
            <div className="mb-4">
              <LayoutGrid className="w-6 h-6 text-[#145be9]" />
            </div>
            <h3 className="text-lg font-bold text-[#141b2d] mb-3">
              Centralized Ledger
            </h3>
            <p className="text-gray-500 leading-relaxed text-[14px] mb-4 flex-1">
              Maintain a single source of truth for all outgoing proposals. Track every iteration with cryptographic precision.
            </p>
            <a href="#" className="inline-flex items-center text-[12px] font-bold text-[#145be9] uppercase tracking-wider mb-6 hover:text-blue-800 transition-colors">
              Explore Portal <ArrowRight className="w-4 h-4 ml-1" />
            </a>
            {/* Visual Graphic */}
            <div className="mt-auto">
              <div className="w-full h-[180px] bg-[#0a111a] rounded-2xl overflow-hidden relative shadow-inner flex items-center justify-center p-6 border border-gray-800">
                 {/* Sci-fi Tech Core visual */}
                 <div className="relative w-full h-full flex flex-col items-center justify-center space-y-4 perspective-1000 transform -rotate-z-12 rotate-x-45 scale-y-75">
                    {/* Ring */}
                    <div className="w-20 h-20 rounded-full border-4 border-[#0ae8f0] shadow-[0_0_20px_rgba(10,232,240,0.4)] opacity-80 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full border-2 border-dashed border-[#0ae8f0] animate-[spin_10s_linear_infinite]"></div>
                    </div>
                    {/* Base Plates */}
                    <div className="w-full h-12 border-2 border-[#0ae8f0]/40 rounded grid grid-cols-2 gap-2 p-2 bg-[#0ae8f0]/10 shadow-[0_0_30px_rgba(10,232,240,0.1)_inset]">
                       <div className="bg-[#0ae8f0]/30 rounded-sm"></div>
                       <div className="bg-[#0ae8f0]/30 rounded-sm"></div>
                    </div>
                 </div>
                 {/* Glowing overlays */}
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#0ae8f0] rounded-full blur-[60px] opacity-20"></div>
              </div>
            </div>
          </div>

          {/* Card 3: Client Portal */}
          <div className="bg-white rounded-3xl p-6 flex flex-col shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full border border-gray-100 relative">
            <div className="mb-4">
              <Users className="w-6 h-6 text-[#145be9]" />
            </div>
            <h3 className="text-lg font-bold text-[#141b2d] mb-3">
              Client Portal
            </h3>
            <p className="text-gray-500 leading-relaxed text-[14px] mb-4 flex-1">
              Secure, white-labeled environments where clients can review, comment, and sign instantly.
            </p>
            <a href="#" className="inline-flex items-center text-[12px] font-bold text-[#145be9] uppercase tracking-wider mb-6 hover:text-blue-800 transition-colors">
              Explore Portal <ArrowRight className="w-4 h-4 ml-1" />
            </a>
            {/* Visual Graphic */}
            <div className="mt-auto bg-[#f8fbff] rounded-2xl p-5 shadow-[0_10px_30px_rgba(0,0,0,0.05)_inset] border border-gray-200 h-[180px] flex items-end justify-center">
                <div className="w-full flex items-end justify-between space-x-2 h-[85%]">
                  <div className="w-1/5 h-[40%] bg-[#4883fb] rounded-t-lg shadow-sm"></div>
                  <div className="w-1/5 h-[60%] bg-[#4883fb] rounded-t-lg shadow-sm"></div>
                  <div className="w-1/5 h-[50%] bg-[#4883fb] rounded-t-lg shadow-sm"></div>
                  <div className="w-1/5 h-[80%] bg-[#4883fb] rounded-t-lg shadow-sm"></div>
                  <div className="w-1/5 h-[55%] bg-[#4883fb] rounded-t-lg shadow-sm"></div>
                </div>
            </div>
          </div>

          {/* Card 4: Smart Templates */}
          <div className="bg-white rounded-3xl p-6 flex flex-col shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full border border-gray-100">
            <div className="mb-4">
              <FileText className="w-6 h-6 text-[#145be9]" />
            </div>
            <h3 className="text-lg font-bold text-[#141b2d] mb-3">
              Smart Templates
            </h3>
            <p className="text-gray-500 leading-relaxed text-[14px] mb-4 flex-1">
              Editorial-grade layouts that adapt to your brand identity automatically.
            </p>
            <a href="#" className="inline-flex items-center text-[12px] font-bold text-[#145be9] uppercase tracking-wider mb-6 hover:text-blue-800 transition-colors">
              Explore Portal <ArrowRight className="w-4 h-4 ml-1" />
            </a>
            {/* Visual Graphic */}
            <div className="mt-auto">
              <div className="w-full h-[180px] bg-[#0b121b] rounded-2xl overflow-hidden shadow-inner p-3 border border-gray-800 relative flex justify-center items-center">
                 {/* Faux Tablet Device */}
                 <div className="w-[90%] h-full bg-[#1c2432] rounded-xl border-4 border-black flex flex-col shadow-[0_0_20px_rgba(0,0,0,0.5)] overflow-hidden">
                    {/* Tablet content */}
                    <div className="flex bg-[#232c3d] p-2 space-x-2 border-b border-gray-700">
                      <div className="w-6 h-1.5 bg-gray-600 rounded-full"></div>
                      <div className="h-1.5 flex-1 bg-gray-600 rounded-full"></div>
                    </div>
                    <div className="flex-1 p-2 flex space-x-2">
                       <div className="w-1/4 h-full bg-[#1b222f] rounded flex flex-col space-y-1 p-1">
                         <div className="w-full h-1 bg-gray-600 rounded-full"></div>
                         <div className="w-full h-1 bg-gray-600 rounded-full"></div>
                         <div className="w-5/6 h-1 bg-gray-600 rounded-full"></div>
                       </div>
                       <div className="flex-1 h-full bg-[#1b222f] rounded flex items-end justify-around p-1 pb-2 border-b border-gray-700 relative">
                         {/* Mini chart inside tablet */}
                         <div className="w-1 h-[20%] bg-green-500"></div>
                         <div className="w-1 h-[30%] bg-green-500"></div>
                         <div className="w-1 h-[15%] bg-red-500"></div>
                         <div className="w-1 h-[40%] bg-green-500"></div>
                         <div className="w-1 h-[50%] bg-green-500"></div>
                         <div className="w-1 h-[45%] bg-red-500"></div>
                         <div className="w-1 h-[60%] bg-green-500"></div>
                       </div>
                    </div>
                 </div>
                 {/* Ambient glow */}
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-500 rounded-full blur-[80px] opacity-10 pointer-events-none"></div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
