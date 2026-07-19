import React from 'react';
import { CheckCircle2, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="w-full max-w-7xl mx-auto px-8 pt-16 pb-32 flex flex-col lg:flex-row items-center justify-between gap-12 flex-1">
      
      {/* Left Content */}
      <div className="flex-1 w-full max-w-2xl flex flex-col items-start">
        {/* Badge */}
        <div className="flex items-center space-x-2 bg-[#eef4ff] px-4 py-1.5 rounded-full mb-8">
          <div className="w-2 h-2 rounded-full bg-[#145be9]"></div>
          <span className="text-xs font-bold tracking-wider text-[#145be9] uppercase">
            The Professional Choice
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-[3.5rem] leading-[1.1] font-bold text-[#141b2d] mb-6 tracking-tight">
          Create <br /> Professional <br />
          <span className="text-[#145be9]">Quotations</span> in
          <br /> Minutes
        </h1>

        {/* Description */}
        <p className="text-gray-600 text-lg leading-relaxed mb-10 max-w-lg">
          Elevate your consultancy with the ultimate ledger system. 
          Precision management, automated workflows, and high-end 
          editorial layouts designed for modern architects and engineers.
        </p>

        {/* Buttons */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/login')}
            className="bg-[#145be9] hover:bg-blue-700 text-white px-8 py-3.5 rounded-lg font-medium transition-colors cursor-pointer w-40 text-center"
          >
            Login
          </button>
          <button
            onClick={() => navigate('/demo')}
            className="bg-[#eaf1fd] hover:bg-[#d8e4fa] text-[#0b5cda] px-8 py-3.5 rounded-lg font-medium transition-colors flex items-center space-x-2 cursor-pointer w-44 justify-center"
          >
            <Play className="w-5 h-5 fill-current text-white stroke-[#0b5cda]" />
            <span>View Demo</span>
          </button>
        </div>
      </div>

      {/* Right Content - Mockup */}
      <div className="flex-1 w-full relative">
        <div className="relative z-0 border-[6px] border-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.08)] bg-white overflow-hidden aspect-[4/3] w-full max-w-[600px] ml-auto">
          {/* Faux Dashboard Header */}
          <div className="bg-[#1b212f] w-full h-full rounded-2xl flex flex-col overflow-hidden">
            <div className="h-16 border-b border-gray-700/50 flex items-center px-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div className="ml-6 text-gray-400 text-sm font-medium flex items-center space-x-2">
			  	<div className="w-5 h-5 rounded-full bg-gray-600 flex items-center justify-center text-[10px] text-white">D</div>
                <span>Dashboard</span>
              </div>
            </div>
            {/* Faux Dashboard Body */}
            <div className="flex-1 p-6 flex space-x-6 relative">
              {/* Sidebar */}
              <div className="w-32 flex flex-col space-y-4">
                <div className="h-3 w-full bg-gray-700/50 rounded"></div>
                <div className="h-3 w-3/4 bg-gray-700/50 rounded"></div>
                <div className="h-3 w-5/6 bg-gray-700/50 rounded"></div>
                <div className="h-3 w-full bg-gray-700/50 rounded"></div>
              </div>
              {/* Main Chart Area */}
              <div className="flex-1 bg-[#1e2532] rounded-xl flex items-center justify-center border border-gray-700/30">
                {/* World Map Placeholder */}
                <div className="w-[80%] h-[80%] bg-[#2a3441] rounded-lg opacity-50 flex items-center justify-center">
                   <div className="grid grid-cols-6 grid-rows-4 gap-2 w-full h-full p-4">
                      {/* Fake map dots */}
                      {Array.from({length: 24}).map((_, i) => (
                        <div key={i} className="w-full h-full bg-blue-500/10 rounded-sm"></div>
                      ))}
                   </div>
                </div>
              </div>
			  {/* Right sidebar details */}
			  <div className="w-12 flex flex-col items-center space-y-4 pt-4">
                <div className="w-8 h-8 rounded-full bg-gray-700/50 flex items-center justify-center">
                  <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
                </div>
				<div className="w-8 h-8 rounded-full bg-gray-700/50 flex items-center justify-center">
                  <div className="w-4 h-4 bg-gray-500 flex flex-col justify-between items-center py-0.5">
				  	<div className="w-3 h-0.5 bg-[#1b212f]"></div>
					<div className="w-3 h-0.5 bg-[#1b212f]"></div>
					<div className="w-3 h-0.5 bg-[#1b212f]"></div>
				  </div>
                </div>
              </div>
            </div>
			{/* Faux Dashboard Bottom table */}
			<div className="h-48 border-t border-gray-700/50 p-6 flex flex-col">
				<div className="flex space-x-4 mb-4">
				  <div className="h-3 w-24 bg-gray-700/50 rounded"></div>
				  <div className="h-3 w-24 bg-gray-700/50 rounded"></div>
				  <div className="h-3 w-24 bg-gray-700/50 rounded"></div>
				</div>
				<div className="flex-1 flex flex-col space-y-3">
				  <div className="h-4 w-full bg-gray-700/20 rounded"></div>
				  <div className="h-4 w-full bg-gray-700/20 rounded"></div>
				  <div className="h-4 w-full bg-gray-700/20 rounded"></div>
				</div>
			</div>
          </div>
        </div>

        {/* Floating Status Card */}
        <div className="absolute -bottom-6 -left-6 z-10 bg-white p-5 rounded-2xl shadow-[0_15px_35px_rgba(0,0,0,0.1)] border border-gray-100 flex flex-col justify-center min-w-[200px]">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-[#0f8b65] p-1.5 rounded-full">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-gray-400 tracking-wider">STATUS</span>
              <span className="text-sm font-bold text-[#141b2d]">Quote Approved</span>
            </div>
          </div>
          <div className="text-[1.75rem] font-bold text-[#145be9] mt-2">
            $42,500.00
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
