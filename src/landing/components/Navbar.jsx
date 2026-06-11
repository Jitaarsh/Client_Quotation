import React from 'react';
import { Bell, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="w-full bg-white border-b border-gray-100 flex items-center justify-between px-8 py-4">
      {/* Logo */}
      <div className="flex items-center space-x-1">
        <span className="text-xl font-bold text-[#1a2b4b]">Quick</span>
        <span className="text-xl font-bold text-[#145be9]">Quote</span>
      </div>

      {/* Nav Links - Desktop */}
      <div className="hidden md:flex items-center space-x-8">
        <a href="/" className="text-[#145be9] font-medium border-b-2 border-[#145be9] pb-1">Home</a>
        <a href="#" className="text-gray-500 font-medium hover:text-gray-800 transition-colors pb-1">Quotations</a>
        <a href="#" className="text-gray-500 font-medium hover:text-gray-800 transition-colors pb-1">Pricing</a>
        <a href="#" className="text-gray-500 font-medium hover:text-gray-800 transition-colors pb-1">Account</a>
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-4">
        <Link to="/login">
          <button className="text-[#1a2b4b] hover:text-[#145be9] font-semibold transition-colors px-4 py-2 cursor-pointer">
            Login
          </button>
        </Link>
        <Link to="/register">
          <button className="bg-[#145be9] hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold shadow-md shadow-blue-500/20 transition-all hover:scale-105 cursor-pointer">
            Register
          </button>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
