import React, { useState, useEffect, useRef } from "react";
import { Building2, User, Hash, PenLine, CheckCircle2, FileCog, Palette, FileUp, ChevronDown, PlusCircle, Check, Minus, Key, Copy } from "lucide-react";
import useAuthStore from "../../../store/authStore";
import profileSettingsApi from "../../../services/profileSettingsApi";
import Toast from "../../../components/Toast";

const Profile = () => {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    businessName: user?.companyName || "Architectural Ledger Ltd.",
    registrationNumber: "REG-992-102-Architect",
    address: user?.address 
      ? `${user.address}, \n${user.city || ''}, ${user.state || ''} ${user.pincode || ''}, ${user.country || ''}.`.replace(/,\s*,/g, ',').trim()
      : "88 Blueprint Avenue, Design District,\nLondon, E1 6AN, United Kingdom",
    senderName: user?.ownerName || "Architect Ledger Admin",
    fromEmail: user?.email || "billing@company.com",
    replyToEmail: "support@company.com",
    invoicePrefix: "INV-",
    invoiceStartAt: "1001",
    quotePrefix: "QTN-",
    quoteStartAt: "500",
    defaultTaxRate: "20",
    validityPeriod: "30",
    paymentTerms: "Net 30 - Payment due in 30 days",
    primaryColor: "#0557cc",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const [isInvoiceEditing, setIsInvoiceEditing] = useState(false);
  const [isQuotationEditing, setIsQuotationEditing] = useState(false);
  const [isDefaultsEditing, setIsDefaultsEditing] = useState(false);
  const [isBrandEditing, setIsBrandEditing] = useState(false);

  const [isPaymentDropdownOpen, setIsPaymentDropdownOpen] = useState(false);
  const paymentRef = useRef(null);

  const paymentTermsOptions = [
    "Net 30 - Payment due in 30 days",
    "Net 15 - Payment due in 15 days",
    "Due on Receipt",
    "Immediate Payment",
    "Custom Terms"
  ];

  // Load settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await profileSettingsApi.getSettings();
        if (response.success && response.data) {
          const settings = response.data;
          setFormData(prev => ({
            ...prev,
            invoicePrefix: settings.invoicePrefix ?? prev.invoicePrefix,
            invoiceStartAt: settings.invoiceStartNumber?.toString() ?? prev.invoiceStartAt,
            quotePrefix: settings.quotePrefix ?? prev.quotePrefix,
            quoteStartAt: settings.quoteStartNumber?.toString() ?? prev.quoteStartAt,
            defaultTaxRate: settings.defaultTaxRate?.toString() ?? prev.defaultTaxRate,
            validityPeriod: settings.validityPeriod?.toString() ?? prev.validityPeriod,
            paymentTerms: settings.paymentTerms ?? prev.paymentTerms,
            primaryColor: settings.primaryColor ?? prev.primaryColor,
          }));
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (paymentRef.current && !paymentRef.current.contains(event.target)) {
        setIsPaymentDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Map UI state keys back to backend model keys with defensive parsing
      const payload = {
        invoicePrefix: formData.invoicePrefix || "INV-",
        invoiceStartNumber: parseInt(formData.invoiceStartAt) || 1001,
        quotePrefix: formData.quotePrefix || "QTN-",
        quoteStartNumber: parseInt(formData.quoteStartAt) || 500,
        defaultTaxRate: parseFloat(formData.defaultTaxRate) || 0,
        validityPeriod: parseInt(formData.validityPeriod) || 30,
        paymentTerms: formData.paymentTerms || "Due on Receipt",
        primaryColor: formData.primaryColor || "#145be9",
      };

      console.log("Saving profile settings with payload:", payload);
      const response = await profileSettingsApi.updateSettings(payload);
      
      if (response.success) {
        setToast({
          show: true,
          message: "Profile settings saved successfully!",
          type: "success"
        });
        return true; // Indicate success
      }
      return false;
    } catch (error) {
      console.error("Save error:", error);
      setToast({
        show: true,
        message: error.response?.data?.message || "Failed to save settings. Please try again.",
        type: "error"
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faff] p-4 sm:p-6 lg:p-10 font-sans">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase mb-1">
            <span className="text-slate-500">WORKSPACE</span>
            <span className="text-slate-400">/</span>
            <span className="text-[#145be9]">GENERAL CONFIGURATION</span>
          </div>
          <h1 className="text-[2rem] font-black text-[#1a2b4b] leading-tight tracking-tight">
            General Info
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-[#e6f4f1] px-4 py-2 rounded-xl border border-teal-100/50">
            <div className="w-2 h-2 rounded-full bg-teal-600"></div>
            <span className="text-[12px] font-bold text-teal-700">
              Synchronized
            </span>
          </div>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#0557cc] hover:bg-[#0449ad] shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-70"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Saving...
              </>
            ) : "Save Changes"}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
           <div className="w-10 h-10 border-4 border-[#e3ebfc] border-t-[#145be9] rounded-full animate-spin"></div>
           <p className="text-slate-500 font-bold text-[13px] tracking-widest uppercase animate-pulse">Synchronizing Workspace...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-700">
        {/* Left Column: Business Identity */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[24px] p-8 lg:p-10 shadow-[0_2px_10px_rgba(0,0,0,0.02)] h-full border border-slate-50">
             <div className="flex items-center gap-4 mb-8">
                <div className="w-11 h-11 bg-[#eef3ff] rounded-xl flex items-center justify-center text-[#145be9]">
                   <Building2 className="w-5 h-5" />
                </div>
                <h2 className="text-[22px] font-semibold text-[#1a2b4b]">Business Identity</h2>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                   <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                     Business Name
                   </label>
                   <input 
                     type="text"
                     value={formData.businessName}
                     onChange={(e) => handleInputChange("businessName", e.target.value)}
                     className="w-full bg-[#e3ebfc] focus:ring-2 focus:ring-[#145be9]/20 border-none rounded-xl px-4 py-3.5 text-[14px] font-medium text-[#1a2b4b] outline-none"
                   />
                </div>
                <div>
                   <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                     Registration Number
                   </label>
                   <input 
                     type="text"
                     value={formData.registrationNumber}
                     onChange={(e) => handleInputChange("registrationNumber", e.target.value)}
                     className="w-full bg-[#e3ebfc] focus:ring-2 focus:ring-[#145be9]/20 border-none rounded-xl px-4 py-3.5 text-[14px] font-medium text-[#1a2b4b] outline-none"
                   />
                </div>
             </div>

             <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Registered Address
                </label>
                <textarea 
                  rows="3"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className="w-full bg-[#e3ebfc] focus:ring-2 focus:ring-[#145be9]/20 border-none rounded-xl px-4 py-3.5 text-[14px] font-medium text-[#1a2b4b] outline-none resize-none"
                ></textarea>
             </div>
          </div>
        </div>

        {/* Right Column: Sender Profile */}
        <div className="lg:col-span-1">
           <div className="bg-[#f5f8ff] rounded-[24px] p-8 lg:p-10 border border-[#e2e8f0] h-full shadow-[0_2px_10px_rgba(0,0,0,0.01)]">
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-11 h-11 bg-[#e1ecfe] rounded-xl flex items-center justify-center text-[#145be9]">
                    <User className="w-5 h-5" />
                 </div>
                 <h2 className="text-[22px] font-semibold text-[#1a2b4b]">Sender Profile</h2>
              </div>

              <div className="space-y-6">
                 <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                      Sender Name
                    </label>
                    <input 
                      type="text"
                      value={formData.senderName}
                      onChange={(e) => handleInputChange("senderName", e.target.value)}
                      className="w-full bg-[#e3ebfc] focus:ring-2 focus:ring-[#145be9]/20 border-none rounded-xl px-4 py-3.5 text-[14px] font-medium text-slate-700 outline-none"
                    />
                 </div>
                 
                 <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                      From Email
                    </label>
                    <input 
                      type="email"
                      value={formData.fromEmail}
                      onChange={(e) => handleInputChange("fromEmail", e.target.value)}
                      className="w-full bg-[#e3ebfc] focus:ring-2 focus:ring-[#145be9]/20 border-none rounded-xl px-4 py-3.5 text-[14px] font-medium text-slate-700 outline-none"
                    />
                 </div>

                 <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                      Reply-to Email
                    </label>
                    <input 
                      type="email"
                      value={formData.replyToEmail}
                      onChange={(e) => handleInputChange("replyToEmail", e.target.value)}
                      className="w-full bg-[#e3ebfc] focus:ring-2 focus:ring-[#145be9]/20 border-none rounded-xl px-4 py-3.5 text-[14px] font-medium text-slate-700 outline-none"
                    />
                 </div>
              </div>
           </div>
        </div>
        </div>
      )}

      {/* Document Numbering Pattern */}
      <div className="bg-white rounded-[24px] p-8 lg:p-10 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-50 mt-6 relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-slate-50 rounded-full blur-3xl opacity-50 pointer-events-none -translate-y-1/2"></div>
        
        <div className="flex items-center gap-4 mb-8 relative z-10">
           <div className="w-11 h-11 bg-[#eef3ff] rounded-xl flex items-center justify-center text-[#145be9]">
              <Hash className="w-5 h-5" />
           </div>
           <h2 className="text-[22px] font-semibold text-[#1a2b4b]">Document Numbering Pattern</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {/* Invoices */}
          <div className={`bg-[#f5f8ff] rounded-[24px] p-6 lg:p-8 border-2 transition-all duration-300 ${isInvoiceEditing ? "border-[#145be9] bg-white ring-8 ring-[#145be9]/5 shadow-xl" : "border-[#e2e8f0]"}`}>
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-[17px] font-bold text-[#1a2b4b]">Invoices</h3>
                <button 
                  onClick={() => setIsInvoiceEditing(!isInvoiceEditing)}
                  className={`p-2 rounded-lg transition-colors ${isInvoiceEditing ? "bg-[#145be9] text-white" : "hover:bg-[#eef3ff] text-[#145be9]"}`}
                >
                  <PenLine className="w-4 h-4" />
                </button>
             </div>
             <div className="space-y-6">
                <div>
                   <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 border-b border-transparent">PREFIX</label>
                   <input 
                     type="text" 
                     value={formData.invoicePrefix} 
                     onChange={(e) => handleInputChange('invoicePrefix', e.target.value)} 
                     disabled={!isInvoiceEditing}
                     className={`w-full transition-all duration-300 rounded-[10px] px-4 py-3 text-[14px] font-bold outline-none ${
                       isInvoiceEditing 
                         ? "bg-[#f8fafc] shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] border-none text-[#1a2b4b]" 
                         : "bg-transparent border-none text-slate-500 cursor-not-allowed opacity-80"
                     }`} 
                   />
                </div>
                <div>
                   <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 border-b border-transparent">STARTING NUMBER</label>
                   <input 
                     type="text" 
                     value={formData.invoiceStartAt} 
                     onChange={(e) => handleInputChange('invoiceStartAt', e.target.value)} 
                     disabled={!isInvoiceEditing}
                     className={`w-full transition-all duration-300 rounded-[10px] px-4 py-3 text-[14px] font-bold outline-none ${
                       isInvoiceEditing 
                         ? "bg-[#f8fafc] shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] border-none text-[#1a2b4b]" 
                         : "bg-transparent border-none text-slate-500 cursor-not-allowed opacity-80"
                     }`} 
                   />
                </div>
                <div className="pt-2 flex items-center justify-between">
                   <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">PREVIEW</label>
                      <p className="text-[#145be9] font-mono text-[19px] font-black tracking-tight">{formData.invoicePrefix}{formData.invoiceStartAt}</p>
                   </div>
                   {isInvoiceEditing && (
                     <div className="flex items-center gap-2">
                       <button 
                         onClick={async () => {
                           const success = await handleSave();
                           if (success) setIsInvoiceEditing(false);
                         }}
                         disabled={isSaving}
                         className={`bg-[#145be9] text-white px-4 py-1.5 rounded-lg text-[12px] font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 ${isSaving ? "opacity-50" : ""}`}
                       >
                         {isSaving ? "Saving..." : "Save"}
                       </button>
                       <button 
                         onClick={() => setIsInvoiceEditing(false)}
                         className="text-slate-400 hover:text-slate-600 font-bold text-[12px] px-2"
                       >
                         Cancel
                       </button>
                     </div>
                   )}
                </div>
             </div>
          </div>

          {/* Quotations */}
          <div className={`bg-[#f5f8ff] rounded-[24px] p-6 lg:p-8 border-2 transition-all duration-300 ${isQuotationEditing ? "border-[#145be9] bg-white ring-8 ring-[#145be9]/5 shadow-xl" : "border-[#e2e8f0]"}`}>
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-[17px] font-bold text-[#1a2b4b]">Quotations</h3>
                <button 
                  onClick={() => setIsQuotationEditing(!isQuotationEditing)}
                  className={`p-2 rounded-lg transition-colors ${isQuotationEditing ? "bg-[#145be9] text-white" : "hover:bg-[#eef3ff] text-[#145be9]"}`}
                >
                  <PenLine className="w-4 h-4" />
                </button>
             </div>
             <div className="space-y-6">
                <div>
                   <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 border-b border-transparent">PREFIX</label>
                   <input 
                     type="text" 
                     value={formData.quotePrefix} 
                     onChange={(e) => handleInputChange('quotePrefix', e.target.value)} 
                     disabled={!isQuotationEditing}
                     className={`w-full transition-all duration-300 rounded-[10px] px-4 py-3 text-[14px] font-bold outline-none ${
                       isQuotationEditing 
                         ? "bg-[#f8fafc] shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] border-none text-[#1a2b4b]" 
                         : "bg-transparent border-none text-slate-500 cursor-not-allowed opacity-80"
                     }`} 
                   />
                </div>
                <div>
                   <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 border-b border-transparent">STARTING NUMBER</label>
                   <input 
                     type="text" 
                     value={formData.quoteStartAt} 
                     onChange={(e) => handleInputChange('quoteStartAt', e.target.value)} 
                     disabled={!isQuotationEditing}
                     className={`w-full transition-all duration-300 rounded-[10px] px-4 py-3 text-[14px] font-bold outline-none ${
                       isQuotationEditing 
                         ? "bg-[#f8fafc] shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] border-none text-[#1a2b4b]" 
                         : "bg-transparent border-none text-slate-500 cursor-not-allowed opacity-80"
                     }`} 
                   />
                </div>
                <div className="pt-2 flex items-center justify-between">
                   <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">PREVIEW</label>
                      <p className="text-[#145be9] font-mono text-[19px] font-black tracking-tight">{formData.quotePrefix}{formData.quoteStartAt}</p>
                   </div>
                   {isQuotationEditing && (
                     <div className="flex items-center gap-2">
                       <button 
                         onClick={async () => {
                           const success = await handleSave();
                           if (success) setIsQuotationEditing(false);
                         }}
                         disabled={isSaving}
                         className={`bg-[#145be9] text-white px-4 py-1.5 rounded-lg text-[12px] font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 ${isSaving ? "opacity-50" : ""}`}
                       >
                         {isSaving ? "Saving..." : "Save"}
                       </button>
                       <button 
                         onClick={() => setIsQuotationEditing(false)}
                         className="text-slate-400 hover:text-slate-600 font-bold text-[12px] px-2"
                       >
                         Cancel
                       </button>
                     </div>
                   )}
                </div>
             </div>
          </div>

          {/* Architectural Logic */}
          <div className="bg-[#1a73e8] rounded-[24px] p-6 lg:p-8 text-white relative overflow-hidden flex flex-col justify-center md:col-span-2 lg:col-span-1">
             {/* Background graphic */}
             <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
             
             <h3 className="text-[17px] font-bold mb-4 relative z-10 text-white leading-tight">Architectural Logic</h3>
             <p className="text-[#a8c7fa] text-[13.5px] leading-[1.6] mb-8 relative z-10">
               The ledger uses sequential increments. Changing the starting number will only affect new documents created after the update.
             </p>
             <ul className="space-y-4 relative z-10">
               <li className="flex items-center gap-3 text-[11px] font-bold tracking-widest uppercase text-white/95">
                 <CheckCircle2 className="w-4 h-4 text-white" /> 
                 NO DUPLICATES
               </li>
               <li className="flex items-center gap-3 text-[11px] font-bold tracking-widest uppercase text-white/95">
                 <CheckCircle2 className="w-4 h-4 text-white" /> 
                 AUDIT TRAIL PRESERVED
               </li>
             </ul>
          </div>
        </div>
      </div>

      {/* Bottom section grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Standard Defaults */}
        <div className={`bg-white rounded-[24px] p-8 lg:p-10 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border-2 transition-all duration-300 ${isDefaultsEditing ? "border-[#145be9] ring-8 ring-[#145be9]/5 shadow-xl" : "border-slate-50"}`}>
          <div className="flex items-center justify-between mb-8">
             <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-[#eef3ff] rounded-xl flex items-center justify-center text-[#145be9]">
                   <FileCog className="w-5 h-5" />
                </div>
                <h2 className="text-[22px] font-semibold text-[#1a2b4b]">Standard Defaults</h2>
             </div>
             <button 
               onClick={() => setIsDefaultsEditing(!isDefaultsEditing)}
               className={`p-2 rounded-lg transition-colors ${isDefaultsEditing ? "bg-[#145be9] text-white" : "hover:bg-[#eef3ff] text-[#145be9]"}`}
             >
               <PenLine className="w-4 h-4" />
             </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
             <div>
               <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">DEFAULT TAX RATE (%)</label>
               <input 
                 type="text" 
                 value={formData.defaultTaxRate} 
                 onChange={e => handleInputChange('defaultTaxRate', e.target.value)} 
                 disabled={!isDefaultsEditing}
                 className={`w-full transition-all duration-300 rounded-xl px-4 py-3.5 text-[14px] font-bold outline-none ${
                   isDefaultsEditing 
                   ? "bg-[#f8fafc] border border-slate-200 text-[#1a2b4b] focus:ring-2 focus:ring-[#145be9]/20" 
                   : "bg-[#e3ebfc] border-none text-slate-500 cursor-not-allowed opacity-80"
                 }`} 
               />
             </div>
             <div>
               <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">VALIDITY PERIOD (DAYS)</label>
               <input 
                 type="text" 
                 value={formData.validityPeriod} 
                 onChange={e => handleInputChange('validityPeriod', e.target.value)} 
                 disabled={!isDefaultsEditing}
                 className={`w-full transition-all duration-300 rounded-xl px-4 py-3.5 text-[14px] font-bold outline-none ${
                   isDefaultsEditing 
                   ? "bg-[#f8fafc] border border-slate-200 text-[#1a2b4b] focus:ring-2 focus:ring-[#145be9]/20" 
                   : "bg-[#e3ebfc] border-none text-slate-500 cursor-not-allowed opacity-80"
                 }`} 
               />
             </div>
          </div>
          
           <div className="relative" ref={paymentRef}>
             <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">PAYMENT TERMS</label>
             <button 
               type="button"
               disabled={!isDefaultsEditing}
               onClick={() => setIsPaymentDropdownOpen(!isPaymentDropdownOpen)}
               className={`w-full flex items-center justify-between border-2 transition-all rounded-xl px-4 py-3.5 text-[14px] font-semibold outline-none ${
                 !isDefaultsEditing ? "bg-[#e3ebfc] border-transparent text-slate-500 cursor-not-allowed opacity-80" :
                 isPaymentDropdownOpen ? "border-[#145be9] bg-white ring-4 ring-[#145be9]/10 text-[#1a2b4b]" : "border-transparent bg-[#e3ebfc] text-[#1a2b4b]"
               }`}
             >
               <span>{formData.paymentTerms}</span>
               <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-200 ${isPaymentDropdownOpen ? "rotate-180" : ""}`} />
             </button>

             {isPaymentDropdownOpen && (
               <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-slate-100 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                 {paymentTermsOptions.map((opt) => (
                   <button
                     key={opt}
                     type="button"
                     onClick={() => {
                       handleInputChange("paymentTerms", opt);
                       setIsPaymentDropdownOpen(false);
                     }}
                     className={`w-full flex items-center justify-between px-4 py-3 text-[13.5px] font-semibold transition-colors ${
                       formData.paymentTerms === opt
                         ? "bg-[#f0f4ff] text-[#145be9]"
                         : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                     }`}
                   >
                     <span>{opt}</span>
                     {formData.paymentTerms === opt && (
                       <Check className="w-4 h-4" />
                     )}
                   </button>
                 ))}
               </div>
             )}
           </div>

           {isDefaultsEditing && (
             <div className="mt-8 pt-6 border-t border-slate-100 flex items-center gap-3">
               <button 
                 onClick={async () => {
                   const success = await handleSave();
                   if (success) setIsDefaultsEditing(false);
                 }}
                 disabled={isSaving}
                 className={`bg-[#145be9] text-white px-6 py-2 rounded-xl text-[14px] font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 ${isSaving ? "opacity-50" : ""}`}
               >
                 {isSaving ? "Saving..." : "Save Config"}
               </button>
               <button 
                 onClick={() => setIsDefaultsEditing(false)}
                 className="text-slate-400 hover:text-slate-600 font-bold text-[14px] px-2"
               >
                 Cancel
               </button>
             </div>
           )}
        </div>

        {/* Brand Assets */}
        <div className={`bg-white rounded-[24px] p-8 lg:p-10 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border-2 transition-all duration-300 ${isBrandEditing ? "border-[#145be9] ring-8 ring-[#145be9]/5 shadow-xl" : "border-slate-50"}`}>
          <div className="flex items-center justify-between mb-8">
             <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-[#eef3ff] rounded-xl flex items-center justify-center text-[#145be9]">
                   <Palette className="w-5 h-5" />
                </div>
                <h2 className="text-[22px] font-semibold text-[#1a2b4b]">Brand Assets</h2>
             </div>
             <button 
               onClick={() => setIsBrandEditing(!isBrandEditing)}
               className={`p-2 rounded-lg transition-colors ${isBrandEditing ? "bg-[#145be9] text-white" : "hover:bg-[#eef3ff] text-[#145be9]"}`}
             >
               <PenLine className="w-4 h-4" />
             </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
             <div>
               <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">PRIMARY LOGO</label>
               <div className={`border border-dashed rounded-[20px] h-[130px] flex flex-col items-center justify-center transition-all ${
                 isBrandEditing 
                 ? "border-[#145be9]/50 bg-[#f0f4ff]/50 text-[#145be9] cursor-pointer" 
                 : "border-[#cbd5e1] bg-[#f8fafc] text-slate-400 cursor-not-allowed"
               }`}>
                  <FileUp className="w-6 h-6 mb-3" />
                  <span className="text-[10px] font-bold tracking-widest uppercase">DROP SVG/PNG</span>
               </div>
             </div>
             <div>
               <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">SECONDARY LOGO</label>
               <div className={`border border-dashed rounded-[20px] h-[130px] flex flex-col items-center justify-center transition-all ${
                 isBrandEditing 
                 ? "border-[#145be9]/50 bg-[#f0f4ff]/50 text-[#145be9] cursor-pointer" 
                 : "border-[#cbd5e1] bg-[#f8fafc] text-slate-400 cursor-not-allowed"
               }`}>
                  <FileUp className="w-6 h-6 mb-3" />
                  <span className="text-[10px] font-bold tracking-widest uppercase">OPTIONAL ICON</span>
               </div>
             </div>
          </div>

          <div className={`rounded-2xl p-4 px-4 sm:px-6 flex flex-col sm:flex-row sm:items-center items-start justify-between gap-4 sm:gap-0 transition-colors ${
            isBrandEditing ? "bg-[#f8fafc] border border-slate-100" : "bg-[#e3ebfc]"
          }`}>
            <span className={`text-[13px] font-bold ${isBrandEditing ? "text-[#145be9]" : "text-[#1a2b4b]"}`}>Primary Brand Color</span>
            <div className="flex items-center gap-4">
              <span className="text-slate-500 text-[13px] font-semibold uppercase">{formData.primaryColor}</span>
              <div 
                className={`w-8 h-8 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.1)] relative overflow-hidden ${isBrandEditing ? "cursor-pointer scale-110 border-2 border-[#145be9]" : "cursor-not-allowed"} transition-transform`}
                style={{ backgroundColor: formData.primaryColor }}
              >
                 <input 
                   type="color" 
                   className="opacity-0 absolute inset-0 cursor-pointer scale-150" 
                   value={formData.primaryColor || "#0557cc"} 
                   onChange={e => handleInputChange('primaryColor', e.target.value)} 
                 />
              </div>
            </div>
          </div>

          {isBrandEditing && (
             <div className="mt-8 pt-6 border-t border-slate-100 flex items-center gap-3">
               <button 
                 onClick={async () => {
                   const success = await handleSave();
                   if (success) setIsBrandEditing(false);
                 }}
                 disabled={isSaving}
                 className={`bg-[#145be9] text-white px-6 py-2 rounded-xl text-[14px] font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 ${isSaving ? "opacity-50" : ""}`}
               >
                 {isSaving ? "Saving..." : "Apply Palette"}
               </button>
               <button 
                 onClick={() => setIsBrandEditing(false)}
                 className="text-slate-400 hover:text-slate-600 font-bold text-[14px] px-2"
               >
                 Cancel
               </button>
             </div>
           )}
        </div>
      </div>

      {/* Roles & Permissions */}
      <div className="mt-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <h2 className="text-[28px] font-bold text-[#1a2b4b] tracking-tight">Roles & Permissions</h2>
          <button className="flex items-center gap-2 text-[#145be9] font-bold text-[14px] hover:text-blue-800 transition-colors">
             <PlusCircle className="w-5 h-5" />
             Add Custom Role
          </button>
        </div>

        <div className="bg-white rounded-[32px] shadow-[0_2px_15px_rgba(0,0,0,0.02)] border border-slate-50 overflow-hidden pb-4">
          <div className="overflow-x-auto">
             <table className="w-full text-left min-w-[800px] border-collapse">
                <thead>
                   <tr className="bg-[#fcfdfd]">
                      <th className="py-6 px-10 text-[11px] font-bold uppercase tracking-[0.15em] text-[#8e9cbe] w-1/4">ROLE NAME</th>
                      <th className="py-6 px-6 text-[11px] font-bold uppercase tracking-[0.15em] text-[#8e9cbe] text-center w-[18%]">QUOTATIONS</th>
                      <th className="py-6 px-6 text-[11px] font-bold uppercase tracking-[0.15em] text-[#8e9cbe] text-center w-[18%]">FINANCIALS</th>
                      <th className="py-6 px-6 text-[11px] font-bold uppercase tracking-[0.15em] text-[#8e9cbe] text-center w-[18%]">LEGAL DOCS</th>
                      <th className="py-6 px-6 text-[11px] font-bold uppercase tracking-[0.15em] text-[#8e9cbe] text-center w-[18%]">SETTINGS</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                   {/* Admin Row */}
                   <tr className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-7 px-10">
                         <span className="font-bold text-[#1a2b4b] text-[15px]">Admin</span>
                      </td>
                      <td className="py-7 px-6">
                         <div className="flex justify-center">
                            <div className="w-[22px] h-[22px] rounded-full bg-[#145be9] flex items-center justify-center shadow-sm">
                               <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                            </div>
                         </div>
                      </td>
                      <td className="py-7 px-6">
                         <div className="flex justify-center">
                            <div className="w-[22px] h-[22px] rounded-full bg-[#145be9] flex items-center justify-center shadow-sm">
                               <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                            </div>
                         </div>
                      </td>
                      <td className="py-7 px-6">
                         <div className="flex justify-center">
                            <div className="w-[22px] h-[22px] rounded-full bg-[#145be9] flex items-center justify-center shadow-sm">
                               <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                            </div>
                         </div>
                      </td>
                      <td className="py-7 px-6">
                         <div className="flex justify-center">
                            <div className="w-[22px] h-[22px] rounded-full bg-[#145be9] flex items-center justify-center shadow-sm">
                               <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                            </div>
                         </div>
                      </td>
                   </tr>
                   
                   {/* Sales Director Row */}
                   <tr className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-7 px-10">
                         <span className="font-bold text-[#1a2b4b] text-[15px]">Sales Director</span>
                      </td>
                      <td className="py-7 px-6">
                         <div className="flex justify-center">
                            <div className="w-[22px] h-[22px] rounded-full bg-[#145be9] flex items-center justify-center shadow-sm">
                               <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                            </div>
                         </div>
                      </td>
                      <td className="py-7 px-6">
                         <div className="flex justify-center">
                            <div className="w-[22px] h-[22px] rounded-full bg-[#145be9] flex items-center justify-center shadow-sm">
                               <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                            </div>
                         </div>
                      </td>
                      <td className="py-7 px-6">
                         <div className="flex justify-center">
                            <div className="w-[22px] h-[22px] rounded-full bg-[#cbd5e1] flex items-center justify-center">
                               <Minus className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                            </div>
                         </div>
                      </td>
                      <td className="py-7 px-6">
                         <div className="flex justify-center">
                            <div className="w-[22px] h-[22px] rounded-full bg-[#cbd5e1] flex items-center justify-center">
                               <Minus className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                            </div>
                         </div>
                      </td>
                   </tr>

                   {/* Legal Counsel Row */}
                   <tr className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-7 px-10">
                         <span className="font-bold text-[#1a2b4b] text-[15px]">Legal Counsel</span>
                      </td>
                      <td className="py-7 px-6">
                         <div className="flex justify-center">
                            <div className="w-[22px] h-[22px] rounded-full bg-[#cbd5e1] flex items-center justify-center">
                               <Minus className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                            </div>
                         </div>
                      </td>
                      <td className="py-7 px-6">
                         <div className="flex justify-center">
                            <div className="w-[22px] h-[22px] rounded-full bg-[#cbd5e1] flex items-center justify-center">
                               <Minus className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                            </div>
                         </div>
                      </td>
                      <td className="py-7 px-6">
                         <div className="flex justify-center">
                            <div className="w-[22px] h-[22px] rounded-full bg-[#145be9] flex items-center justify-center shadow-sm">
                               <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                            </div>
                         </div>
                      </td>
                      <td className="py-7 px-6">
                         <div className="flex justify-center">
                            <div className="w-[22px] h-[22px] rounded-full bg-[#cbd5e1] flex items-center justify-center">
                               <Minus className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                            </div>
                         </div>
                      </td>
                   </tr>
                </tbody>
             </table>
          </div>
        </div>
      </div>

      {/* Secure Integrations (API) */}
      <div className="bg-[#e4effc] rounded-[36px] p-8 lg:p-12 mt-10 relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start gap-10">
           <div className="max-w-2xl z-10 w-full md:w-auto flex-1">
              <h2 className="text-[28px] font-bold text-[#344158] tracking-tight mb-3">Secure Integrations (API)</h2>
              <p className="text-[#64748b] text-[15.5px] leading-relaxed mb-10 max-w-xl">
                 Manage your secret keys for external ledger synchronization and architectural tool integrations. Keep these keys private.
              </p>

              <div className="bg-[#f3f7fd] rounded-[20px] p-5 px-6 flex items-center justify-between mb-6 shadow-sm border border-white/40 max-w-xl">
                 <div className="space-y-1 w-full min-w-0">
                   <span className="text-[11px] font-bold tracking-[0.1em] uppercase text-[#8e9cbe]">LIVE API KEY</span>
                   <p className="font-mono text-[#475569] text-[15px] sm:text-[16px] tracking-widest pt-1 flex items-center gap-1 w-full">
                     <span className="text-[#94a3b8] truncate">******************************</span>
                     <span className="font-semibold text-[#334155] tracking-widest text-[17px]">7f2e</span>
                   </p>
                 </div>
                 <button className="text-slate-400 hover:text-[#1a2b4b] transition-colors p-2 cursor-pointer">
                    <Copy className="w-[22px] h-[22px]" />
                 </button>
              </div>

              <button className="bg-[#f8fafc] hover:bg-white text-[#1a2b4b] font-bold py-3.5 px-6 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.05)] text-[14px] transition-all border border-slate-100">
                 Generate New Key
              </button>
           </div>
           
           <div className="bg-[#f8fafc] rounded-[32px] w-36 h-36 hidden md:flex items-center justify-center shrink-0 z-10 border border-white/50 shadow-[0_4px_15px_rgba(0,0,0,0.02)] mt-4 md:mt-2">
              <Key className="w-[42px] h-[42px] text-[#8e9cbe]" strokeWidth={2.5} />
           </div>
        </div>
      </div>

      <Toast 
        show={toast.show} 
        type={toast.type} 
        message={toast.message} 
        onClose={() => setToast({ ...toast, show: false })} 
      />
    </div>
  );
};

export default Profile;
