import React from 'react';
import { Globe, AtSign } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full bg-white border-t border-gray-200 py-12 px-8">
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        
        {/* Left: Brand & Copyright */}
        <div className="flex flex-col items-center md:items-start space-y-2">
          <span className="text-lg font-bold text-[#141b2d]">Quick Quote</span>
          <span className="text-xs text-gray-500 font-medium">© 2026 Quick Quote. All rights reserved.</span>
        </div>

        {/* Middle: Links */}
        <div className="flex items-center space-x-6 text-sm font-medium text-gray-500">
          <a href="#" className="hover:text-gray-900 transition-colors">About Us</a>
          <a href="#" className="hover:text-gray-900 transition-colors">Support</a>
          <a href="#" className="hover:text-gray-900 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-gray-900 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-gray-900 transition-colors">Contact</a>
        </div>

        {/* Right: Social/Icons */}
        <div className="flex items-center space-x-3">
          <a href="#" className="w-8 h-8 rounded-full bg-[#f1f5f9] hover:bg-[#e2e8f0] flex items-center justify-center transition-colors text-gray-600">
            <Globe className="w-4 h-4" />
          </a>
          <a href="#" className="w-8 h-8 rounded-full bg-[#f1f5f9] hover:bg-[#e2e8f0] flex items-center justify-center transition-colors text-gray-600">
            <AtSign className="w-4 h-4" />
          </a>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
