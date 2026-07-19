import React from 'react';
import { Link } from 'react-router-dom';

const CTA = () => {
  return (
    <section className="w-full bg-[#f4f7fc] pt-0 pb-16 px-8 relative z-20 -mt-16">
      <div className="max-w-4xl mx-auto">
        <div className="bg-[#0b5cda] rounded-[2rem] p-10 md:p-12 flex flex-col items-center text-center shadow-[0_20px_60px_-15px_rgba(11,92,218,0.4)] bg-gradient-to-br from-[#145be9] to-[#0a48b3]">
          
          <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-4 tracking-tight">
            Ready to elevate your <br className="hidden md:block" /> business?
          </h2>
          
          <p className="text-blue-100 text-base md:text-lg mb-8 max-w-xl font-medium leading-relaxed">
            Join over 10,000 professionals who trust Architect Ledger for their mission-critical documentation.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link
              to="/register"
              className="bg-white text-[#145be9] hover:bg-gray-50 px-7 py-3 rounded-lg font-bold transition-colors w-full sm:w-auto min-w-[140px]"
            >
              Register
            </Link>
            <button className="bg-transparent border border-blue-400 hover:bg-blue-600/30 text-white px-7 py-3 rounded-lg font-bold transition-colors w-full sm:w-auto min-w-[140px]">
              Contact Sales
            </button>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default CTA;
