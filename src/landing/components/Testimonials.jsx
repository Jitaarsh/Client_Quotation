import React from 'react';

export default function Testimonials() {
  return (
    <section className="w-full bg-[#f4f7fc] font-sans flex flex-col items-center pt-12 pb-20 overflow-x-hidden">
      
      {/* Heading */}
      <h2 className="text-[#141b2d] text-3xl md:text-4xl font-bold tracking-tight mb-12 md:mb-20">
        Testimonials
      </h2>

      {/* --- DESKTOP LAYOUT (Pixel-perfect rigid structure) --- */}
      <div className="relative w-[750px] h-[460px] hidden md:block">
        
        {/* 1. Blue Decorative Lines Background */}
        <div className="absolute inset-0 pointer-events-none z-0">
          {/* Top Line */}
          <div className="absolute top-[20px] left-[140px] right-[20px] h-[3px] bg-[#145be9]"></div>
          
          {/* Right Line */}
          <div className="absolute top-[20px] right-[20px] w-[3px] bg-[#145be9] h-[280px]"></div>
          
          {/* Tail SVG (Connecting right vertical to horizontal) */}
          <svg className="absolute right-[20px] top-[300px] w-[60px] h-[52px]" fill="none">
             <path d="M 0 50 L 58.5 0" stroke="#145be9" strokeWidth="3" />
          </svg>
          
          {/* Bottom Line */}
          <div className="absolute top-[348.5px] left-[260px] right-[78.5px] h-[3px] bg-[#145be9]"></div>
          
          {/* Connecting Dot */}
          <div className="absolute top-[342px] left-[250px] w-[16px] h-[16px] bg-[#145be9] rounded-full"></div>
        </div>

        {/* 2. Main White Card */}
        <div className="absolute top-[40px] left-[20px] right-[50px] min-h-[260px] bg-white rounded-2xl rounded-bl-[3.5rem] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.08)] p-10 z-10 border border-gray-100">
          
          {/* Opening Outlined Quote */}
          <span 
            className="absolute top-[-55px] left-[30px] text-[140px] font-serif leading-none text-transparent select-none opacity-40" 
            style={{ WebkitTextStroke: '2px #145be9', fontFamily: 'Georgia, serif' }}
          >
            &ldquo;
          </span>
          
          {/* Testimonial Text */}
          <div className="relative z-10">
            <p className="text-[#4b5563] text-[1.2rem] leading-[1.8] tracking-wide pt-2">
              Getting multiple quotes used to take hours.<br/>
              This platform made it effortless ;<br/>
              I received competitive pricing within<br/>
              minutes. <span className="text-[#145be9] font-bold">Highly recommended for anyone<br/>who values time.</span>
            </p>
          </div>
          
          {/* Closing Outlined Quote */}
          <span 
            className="absolute bottom-[-25px] right-[30px] text-[140px] font-serif leading-none text-transparent select-none opacity-40" 
            style={{ WebkitTextStroke: '2px #145be9', fontFamily: 'Georgia, serif' }}
          >
            &rdquo;
          </span>
        </div>

        {/* 3. Author Info */}
        <div className="absolute top-[334px] left-[45px] z-10">
          <h3 className="text-[#141b2d] font-bold text-[22px] tracking-wide leading-tight">Amit Patel</h3>
          <h4 className="text-[#145be9] font-semibold text-[16px] leading-tight mt-1 tracking-wide">CEO</h4>
          <p className="text-gray-500 text-[15px] mt-1.5 tracking-wide font-medium">@Neuralschema Infotech Pvt. Ltd.</p>
        </div>
      </div>

      {/* --- MOBILE LAYOUT (Flexible, simplified structure) --- */}
      <div className="block md:hidden px-5 w-full max-w-md relative mt-4">
        
        {/* Mobile Card */}
        <div className="bg-white rounded-2xl rounded-bl-[3rem] shadow-xl p-8 pt-10 relative z-10 border border-gray-100">
          <span 
            className="absolute top-[-40px] left-[15px] text-[100px] font-serif leading-none text-transparent select-none opacity-40" 
            style={{ WebkitTextStroke: '2px #145be9', fontFamily: 'Georgia, serif' }}
          >
            &ldquo;
          </span>
          
          <p className="text-[#4b5563] text-lg leading-relaxed relative z-10">
            Getting multiple quotes used to take hours. This platform made it effortless I received competitive pricing within minutes. <span className="text-[#145be9] font-bold">Highly recommended for anyone who values time.</span>
          </p>
          
          <span 
            className="absolute bottom-[-15px] right-[20px] text-[100px] font-serif leading-none text-transparent select-none opacity-40" 
            style={{ WebkitTextStroke: '2px #145be9', fontFamily: 'Georgia, serif' }}
          >
            &rdquo;
          </span>
        </div>
        
        {/* Mobile Author Info */}
        <div className="mt-6 ml-4 flex items-center">
          {/* Small decorative line for mobile to keep theme */}
          <div className="w-[3px] h-[50px] bg-[#145be9] mr-4 rounded-full"></div>
          <div>
            <h3 className="text-[#141b2d] font-bold text-xl">Amit Patel</h3>
            <h4 className="text-[#145be9] font-bold text-lg mt-0.5">CEO</h4>
            <p className="text-gray-500 text-sm mt-1 font-medium">@Neuralschema Infotech Pvt. Ltd.</p>
          </div>
        </div>
      </div>

      {/* --- Pagination Dots --- */}
      <div className="flex items-center justify-center space-x-2.5 mt-10 md:mt-6 mb-10">
        <div className="w-[10px] h-[10px] rounded-full bg-[#d0e0ff] cursor-pointer hover:bg-[#b0ccff] transition-colors"></div>
        <div className="w-[10px] h-[10px] rounded-full bg-[#d0e0ff] cursor-pointer hover:bg-[#b0ccff] transition-colors"></div>
        <div className="w-[12px] h-[12px] rounded-full bg-[#145be9] cursor-pointer shadow-sm"></div>
        <div className="w-[10px] h-[10px] rounded-full bg-[#d0e0ff] cursor-pointer hover:bg-[#b0ccff] transition-colors"></div>
        <div className="w-[10px] h-[10px] rounded-full bg-[#d0e0ff] cursor-pointer hover:bg-[#b0ccff] transition-colors"></div>
      </div>
      
    </section>
  );
}