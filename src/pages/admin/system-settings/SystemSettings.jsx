import React from 'react';
import { 
  ShieldCheck, 
  Asterisk, 
  Cloud,
  ChevronDown,
  FolderOpen,
  CloudUpload,
  Gavel,
  Check
} from 'lucide-react';

const SystemSettings = () => {
  return (
    <div className="p-4 lg:p-8 bg-[#f8fafc] min-h-full">
      <div className="w-full flex flex-col gap-6 lg:gap-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
          <div>
            <h1 className="text-3xl lg:text-[32px] font-black text-[#1a2b4b] tracking-tight mb-2">
                          </h1>
            <p className="text-sm font-medium text-gray-500">
              Manage global authentication policies and session parameters.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#eff6ff] rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-[#145be9]"></div>
            <span className="text-[10px] font-black text-[#145be9] uppercase tracking-widest">
              System Live
            </span>
          </div>
        </div>

        {/* Top Row: 2FA & Password Complexity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Two-Factor Auth */}
          <div className="bg-white rounded-[1.5rem] p-6 lg:p-8 shadow-sm border border-gray-100 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#eff6ff] flex items-center justify-center text-[#145be9]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <button className="w-12 h-6 bg-[#145be9] rounded-full relative cursor-pointer shadow-inner">
                <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm"></div>
              </button>
            </div>
            <div>
              <h3 className="text-[17px] font-bold text-[#1a2b4b] mb-2">Two-Factor Auth</h3>
              <p className="text-[13px] font-medium text-gray-500 leading-relaxed">
                Require all admin users to verify their identity via SMS or Auth App.
              </p>
            </div>
          </div>

          {/* Password Complexity */}
          <div className="lg:col-span-2 bg-white rounded-[1.5rem] p-6 lg:p-8 shadow-sm border border-gray-100 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex text-[#145be9]">
                <Asterisk className="w-4 h-4" />
                <Asterisk className="w-4 h-4 -ml-1.5" />
                <Asterisk className="w-4 h-4 -ml-1.5" />
              </div>
              <h3 className="text-[17px] font-bold text-[#1a2b4b]">Password Complexity</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
              <div className="bg-[#f8fafc] rounded-xl p-4 flex justify-between items-center">
                <span className="text-[13px] font-bold text-[#1a2b4b]">Min. 12 Characters</span>
                <div className="w-5 h-5 bg-[#145be9] rounded-md flex items-center justify-center text-white">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>
              <div className="bg-[#f8fafc] rounded-xl p-4 flex justify-between items-center">
                <span className="text-[13px] font-bold text-[#1a2b4b]">Special Symbols</span>
                <div className="w-5 h-5 bg-[#145be9] rounded-md flex items-center justify-center text-white">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>
              <div className="bg-[#f8fafc] rounded-xl p-4 flex justify-between items-center">
                <span className="text-[13px] font-bold text-[#1a2b4b]">Numeric Values</span>
                <div className="w-5 h-5 bg-white border border-gray-200 rounded-md"></div>
              </div>
              <div className="bg-[#f8fafc] rounded-xl p-4 flex justify-between items-center">
                <span className="text-[13px] font-bold text-[#1a2b4b]">Uppercase Mixed</span>
                <div className="w-5 h-5 bg-[#145be9] rounded-md flex items-center justify-center text-white">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Row: Session Parameters */}
        <div className="bg-[#eff6ff] rounded-[1.5rem] p-6 lg:p-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="max-w-md">
            <h3 className="text-[17px] font-bold text-[#1a2b4b] mb-2">Session Parameters</h3>
            <p className="text-[13px] font-medium text-gray-500 leading-relaxed">
              Define how long administrative sessions remain active before requiring re-authentication.
            </p>
          </div>
          <div className="bg-white rounded-2xl py-4 px-8 flex items-center gap-10 shadow-sm">
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em] mb-1">Timeout (Minutes)</p>
              <p className="text-3xl font-black text-[#145be9]">30</p>
            </div>
            <div className="w-px h-12 bg-gray-100"></div>
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em] mb-1">Max Retries</p>
              <p className="text-3xl font-black text-[#1a2b4b]">5</p>
            </div>
          </div>
        </div>

        {/* Bottom Grid: Email & Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Email & SMTP Relay */}
          <div className="lg:col-span-2 bg-white rounded-[1.5rem] p-6 lg:p-8 shadow-sm border border-gray-100 flex flex-col justify-between h-full">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-[17px] font-bold text-[#1a2b4b]">Email & SMTP Relay</h3>
              <button className="px-4 py-2 bg-[#eff6ff] text-[#145be9] text-[11px] font-bold rounded-lg hover:bg-blue-100 transition-colors">
                Test Connection
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mb-2">SMTP Host</label>
                <input 
                  type="text" 
                  value="smtp.admin-ledger.io" 
                  readOnly
                  className="w-full bg-[#f8fafc] text-[#1a2b4b] text-[13px] font-bold px-4 py-3 rounded-xl border-none focus:ring-0"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mb-2">Port</label>
                  <input 
                    type="text" 
                    value="587" 
                    readOnly
                    className="w-full bg-[#f8fafc] text-[#1a2b4b] text-[13px] font-bold px-4 py-3 rounded-xl border-none focus:ring-0"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mb-2">Encryption</label>
                  <div className="relative">
                    <select className="w-full bg-[#f8fafc] text-[#1a2b4b] text-[13px] font-bold px-4 py-3 rounded-xl border-none appearance-none focus:ring-0 cursor-pointer">
                      <option>STARTTLS</option>
                      <option>SSL/TLS</option>
                      <option>None</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column Stack */}
          <div className="flex flex-col gap-6">
            {/* PDF Engine Status */}
            <div className="bg-[#145be9] rounded-[1.5rem] p-6 lg:p-8 text-white relative overflow-hidden flex-1 flex flex-col justify-center">
              <div className="absolute -right-2 -bottom-2 text-[100px] font-black text-white/10 leading-none select-none">
                PDF
              </div>
              <h3 className="text-[17px] font-bold mb-2 relative z-10">PDF Engine Status</h3>
              <p className="text-[13px] font-medium text-blue-100 leading-relaxed mb-6 relative z-10 max-w-[90%]">
                Chromium engine is currently handling 1,240 generations per hour.
              </p>
              <div className="flex flex-wrap items-center gap-2 relative z-10 mt-auto">
                <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold tracking-wide">
                  A4 Format
                </span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold tracking-wide">
                  V8.2 Runtime
                </span>
              </div>
            </div>

            {/* Legal Documents */}
            <div className="bg-[#f8fafc] rounded-[1.5rem] p-6 lg:px-8 border border-dashed border-gray-300 flex justify-between items-center">
              <div>
                <h3 className="text-[15px] font-bold text-[#1a2b4b] mb-1">Legal Documents</h3>
                <p className="text-[11px] font-medium text-gray-500">Last updated Oct 12, 2023</p>
              </div>
              <Gavel className="w-6 h-6 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Footer Card: Automated Backup */}
        <div className="bg-white rounded-[1.5rem] p-6 lg:p-8 shadow-sm border border-gray-100 flex flex-col gap-8">
          {/* Top Section */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-8">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#f8fafc] flex items-center justify-center text-gray-500">
                  <Cloud className="w-5 h-5" />
                </div>
                <h3 className="text-[15px] font-bold text-[#1a2b4b]">Automated Backup Frequency</h3>
              </div>
              
              {/* Segmented Control */}
              <div className="flex items-center p-1 bg-white border border-gray-200 rounded-full">
                <button className="px-4 py-1.5 text-[11px] font-bold bg-[#eff6ff] text-[#145be9] rounded-full transition-colors border border-blue-100">
                  DAILY
                </button>
                <button className="px-4 py-1.5 text-[11px] font-bold text-gray-500 hover:text-[#1a2b4b] rounded-full transition-colors">
                  WEEKLY
                </button>
                <button className="px-4 py-1.5 text-[11px] font-bold text-gray-500 hover:text-[#1a2b4b] rounded-full transition-colors">
                  MONTHLY
                </button>
              </div>
            </div>
            
            <button className="flex items-center gap-2 px-5 py-2.5 bg-[#1e293b] text-white text-[13px] font-bold rounded-xl hover:bg-black transition-colors">
              <CloudUpload className="w-4 h-4" />
              Backup Now
            </button>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-end">
            <div className="lg:col-span-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mb-2">Destination Path</label>
              <div className="flex items-center gap-3 bg-[#f8fafc] px-4 py-3 rounded-xl">
                <FolderOpen className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="font-mono text-[13px] text-[#1a2b4b] font-medium truncate">
                  s3://backups.adminledger.net/archive
                </span>
              </div>
            </div>
            <div className="lg:text-right">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mb-1">Storage Status</p>
              <p className="text-xl font-black text-[#1a2b4b]">
                1.2 TB <span className="text-gray-400">/ 5 TB</span>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SystemSettings;
