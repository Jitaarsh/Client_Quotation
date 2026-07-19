import React from 'react';
import { PenSquare, Share2, Calculator } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Features = () => {
  const navigate = useNavigate();

  return (
    <section className="w-full bg-[#f4f7fc] py-32 px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#141b2d] mb-4">
            A Smarter Way to Manage Quotations
          </h2>
          <p className="text-gray-500 text-lg">
            Quick Quote helps businesses create, manage, and organize quotations quickly without manual work or complex spreadsheets.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Manage with Ease (Span 2) */}
          <div className="md:col-span-2 bg-white rounded-[2rem] p-10 relative overflow-hidden shadow-sm">
            <div className="relative z-10 max-w-md">
              <div className="mb-6">
                 {/* Faux Icon for List with Pen */}
                 <div className="relative w-8 h-8 text-[#145be9]">
                    <div className="absolute top-1 left-0 w-5 md:w-6 h-1 bg-current rounded-full" />
                    <div className="absolute top-4 left-0 w-3 h-1 bg-current rounded-full" />
                    <PenSquare className="absolute -bottom-1 -right-1 w-5 h-5 fill-white" />
                 </div>
              </div>
              <h3 className="text-2xl font-bold text-[#141b2d] mb-4">
                Manage with Ease
              </h3>
              <p className="text-gray-500 leading-relaxed text-[15px]">
                Organize your entire project ledger in one sophisticated interface. Track revisions, version history, and client interactions with architectural precision.
              </p>
            </div>
            {/* Decorative Compass background graphic */}
            <div className="absolute -bottom-16 -right-8 w-48 h-64 text-gray-100 opacity-80 pointer-events-none twist-and-position flex items-end justify-center">
               <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
                 <path d="M45,20 L55,20 L55,40 A15,15 0 0,1 50,55 A15,15 0 0,1 45,40 Z" />
                 <circle cx="50" cy="55" r="10" fill="none" stroke="currentColor" strokeWidth="6" />
                 <circle cx="50" cy="55" r="3" />
                 <path d="M40,63 L25,100 L35,100 L46,65 Z" />
                 <path d="M60,63 L75,100 L65,100 L54,65 Z" />
               </svg>
            </div>
          </div>

          {/* Card 2: Create and Share Instantly */}
          <div className="bg-white rounded-[2rem] p-10 flex flex-col shadow-sm">
            <div className="mb-6 text-[#0f8b65]">
              <Share2 className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h3 className="text-xl font-bold text-[#141b2d] mb-4">
              Create and Share Instantly
            </h3>
            <p className="text-gray-500 leading-relaxed text-[15px] mb-8">
              Send interactive links or white-labeled PDF exports. Secure, professional, and branded with your identity.
            </p>
            <div className="mt-auto flex items-center -space-x-2">
              <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-100 mix-blend-multiply"></div>
              <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-200 mix-blend-multiply"></div>
              <div className="w-8 h-8 rounded-full border-2 border-white bg-teal-200 mix-blend-multiply"></div>
              <div className="w-8 h-8 rounded-full border-2 border-white bg-indigo-100 text-[10px] font-bold text-[#145be9] flex items-center justify-center relative z-10">
                +12
              </div>
            </div>
          </div>

          {/* Card 3: Auto-Calculations */}
          <div className="bg-white rounded-[2rem] p-10 flex flex-col shadow-sm">
            <div className="mb-6 text-[#145be9]">
              <Calculator className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h3 className="text-xl font-bold text-[#141b2d] mb-4">
              Auto-Calculations
            </h3>
            <p className="text-gray-500 leading-relaxed text-[15px]">
              Complex tax logic, multi-currency support, and dynamic line items that update in real-time as you build.
            </p>
          </div>

          {/* Card 4: Professional Templates (Span 2) */}
          <div className="md:col-span-2 bg-[#1b212f] rounded-[2rem] p-10 flex flex-col md:flex-row shadow-sm gap-8 items-center">
             <div className="flex-1">
               <h3 className="text-2xl font-bold text-white mb-4">
                 Professional Templates
               </h3>
               <p className="text-gray-400 leading-relaxed text-[15px] mb-8 max-w-sm">
                 Choose from a library of industry-standard templates curated for architects, engineers, and designers.
               </p>
               <button
                 onClick={() => navigate('/quotations')}
                 className="bg-white hover:bg-gray-50 text-[#141b2d] px-6 py-2.5 rounded-lg font-bold text-sm transition-colors cursor-pointer"
               >
                 Explore Gallery
               </button>
             </div>
             
             {/* Templates Decorative Grid */}
             <div className="w-full md:w-[300px] grid grid-cols-2 gap-3 shrink-0">
                <div className="bg-[#242b3b] rounded-lg aspect-[4/3] border border-gray-700/50 shadow-inner"></div>
                <div className="bg-[#242b3b] rounded-lg aspect-[4/3] border border-gray-700/50 shadow-inner"></div>
                <div className="bg-[#242b3b] rounded-lg aspect-[4/3] border border-gray-700/50 shadow-inner"></div>
                <div className="bg-[#242b3b] rounded-lg aspect-[4/3] border border-gray-700/50 shadow-inner"></div>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Features;
