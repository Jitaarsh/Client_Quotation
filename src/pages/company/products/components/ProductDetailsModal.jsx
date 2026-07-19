import React from 'react';
import { X, Box, Info, DollarSign, Anchor, MapPin, IndianRupee, Euro, PoundSterling, FileText, Image as ImageIcon, ExternalLink } from 'lucide-react';

const currencySymbols = {
  INR: <IndianRupee className="w-4 h-4" />,
  USD: <DollarSign className="w-4 h-4" />,
  EUR: <Euro className="w-4 h-4" />,
  GBP: <PoundSterling className="w-4 h-4" />
};

const ProductDetailsModal = ({ product, onClose, onEdit }) => {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#0f172a]/40 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className="bg-white w-full max-w-3xl rounded-[1.5rem] lg:rounded-[2.5rem] shadow-[0_20px_70px_rgba(0,0,0,0.15)] flex flex-col max-h-[90vh] lg:max-h-[85vh] relative z-10 animate-in zoom-in-95 fade-in duration-300 overflow-hidden">
        
        {/* Header Section */}
        <div className="p-6 lg:p-10 flex items-start justify-between flex-shrink-0">
          <div className="flex items-center space-x-4 lg:space-x-5">
            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-blue-600 rounded-2xl lg:rounded-3xl flex items-center justify-center shadow-[0_8px_20px_rgba(37,99,235,0.3)] transform -rotate-3 transition-transform hover:rotate-0">
               <Box className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
            </div>
            <div>
              <span className="hidden lg:block text-[#64748b] text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] mb-0.5 lg:mb-1">Product Profile</span>
              <h2 className="text-[#1a2b4b] text-xl lg:text-3xl font-black tracking-tight leading-tight">{product.name}</h2>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] font-black bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md uppercase tracking-wider">
                  SKU: {product.sku}
                </span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
                  product.category === 'Materials' ? 'bg-blue-50 text-blue-600' : 
                  product.category === 'Services' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                }`}>
                  {product.category}
                </span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
                  product.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-rose-50 text-rose-600'
                }`}>
                  {product.status}
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="hidden lg:flex p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl lg:rounded-2xl transition-all"
          >
            <X className="w-5 h-5 lg:w-6 lg:h-6" />
          </button>
        </div>

        <div className="px-6 lg:px-10 pb-6 lg:pb-10 space-y-8 lg:space-y-10 overflow-y-auto flex-1">
          
          {/* Description Box */}
          <div className="bg-[#f8fafc] border border-gray-100 rounded-[1.5rem] lg:rounded-[2rem] p-5 lg:p-8 flex items-start gap-4 lg:gap-5">
            <div className="w-9 h-9 lg:w-10 lg:h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-500 flex-shrink-0">
              <Info className="w-4 h-4 lg:w-5 lg:h-5" />
            </div>
            <div>
              <span className="text-[#1a2b4b] text-[10px] lg:text-[11px] font-black uppercase tracking-widest mb-1.5 lg:mb-2 block">Description</span>
              <p className="text-[#475569] text-sm lg:text-[15px] max-h-[200px] overflow-y-auto custom-scrollbar leading-relaxed font-medium whitespace-pre-wrap">
                {product.description || "No detailed specifications are currently filed for this inventory item."}
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            
            {/* Pricing Tiers Column */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
                  <DollarSign className="w-4 h-4" />
                </div>
                <h3 className="text-[#1a2b4b] font-black text-sm uppercase tracking-wider">Pricing Tiers</h3>
              </div>

              <div className="space-y-4 pl-1">
                {product.pricingTiers && product.pricingTiers.length > 0 ? (
                  product.pricingTiers.map((tier, idx) => (
                    <div key={idx} className="flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className="w-1 h-8 bg-emerald-100 rounded-full group-hover:bg-emerald-500 transition-colors"></div>
                        <span className="text-[#64748b] font-bold text-sm tracking-tight">Qty: {tier.minQty} - {tier.maxQty}</span>
                      </div>
                      <span className="text-[#1a2b4b] font-black text-lg">
                        {product.currency === 'INR' ? '₹' : product.currency === 'USD' ? '$' : product.currency === 'EUR' ? '€' : '£'}
                        {tier.price.toFixed(2)}
                        <span className="text-xs text-gray-400 font-bold lowercase ml-1">/{product.unit}</span>
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center gap-4 py-2 border-l-2 border-emerald-100 pl-4 italic text-gray-400 text-sm">
                    No bulk pricing applied.
                  </div>
                )}
                
                {/* Base Price Row (Always shown if no tiers match or just for info) */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">Base Single Unit</span>
                  <span className="text-[#1a2b4b] font-black text-lg">
                    {product.currency === 'INR' ? '₹' : product.currency === 'USD' ? '$' : product.currency === 'EUR' ? '€' : '£'}
                    {product.basePrice.toFixed(2)}
                    <span className="text-xs text-gray-400 font-bold lowercase ml-1">/{product.unit}</span>
                  </span>
                </div>
              </div>

              {/* Media & Attachments Section */}
              <div className="space-y-6 pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-rose-50 rounded-lg flex items-center justify-center text-rose-600">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <h3 className="text-[#1a2b4b] font-black text-sm uppercase tracking-wider">Media & Assets</h3>
                </div>

                <div className="space-y-4">
                  {product.productImage ? (
                    <div className="relative group rounded-2xl overflow-hidden border border-gray-100 bg-white aspect-video shadow-sm">
                      <img 
                        src={`http://localhost:5000/${product.productImage}`} 
                        alt="Product" 
                        className="w-full h-full object-contain"
                      />
                      <a 
                        href={`http://localhost:5000/${product.productImage}`}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
                      >
                         <ExternalLink className="text-white w-6 h-6 drop-shadow-md" />
                      </a>
                    </div>
                  ) : (
                    <div className="p-10 border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center">
                       <ImageIcon className="w-8 h-8 text-gray-200 mb-2" />
                       <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">No Image Attached</p>
                    </div>
                  )}

                  {product.cataloguePdf ? (
                    <a 
                      href={`http://localhost:5000/${product.cataloguePdf}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between p-4 bg-[#f0f9ff] border border-blue-100 rounded-2xl hover:bg-blue-100 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                          <FileText className="w-5 h-5 text-blue-500" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold text-blue-900 leading-none mb-1">Product Catalogue</p>
                          <p className="text-[10px] font-black text-blue-400 uppercase tracking-wider">PDF Document</p>
                        </div>
                      </div>
                      <ExternalLink className="w-5 h-5 text-blue-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
                    </a>
                  ) : (
                    <div className="flex items-center gap-3 p-4 bg-gray-50 border border-transparent rounded-2xl opacity-60">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        <FileText className="w-5 h-5 text-gray-300" />
                      </div>
                      <div className="text-left">
                         <p className="text-sm font-bold text-gray-400 leading-none mb-1">No Catalogue filed</p>
                         <p className="text-[10px] font-black text-gray-300 uppercase tracking-wider">N/A</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Logistics & Address Column */}
            <div className="space-y-8">
              
              {/* Logistics */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                    <Anchor className="w-4 h-4" />
                  </div>
                  <h3 className="text-[#1a2b4b] font-black text-sm uppercase tracking-wider">Logistics Details</h3>
                </div>
                <div className="pl-11 relative">
                  <div className="absolute left-[15px] top-0 bottom-0 w-px bg-indigo-100"></div>
                  <span className="text-[#94a3b8] text-[10px] font-black uppercase tracking-widest block mb-1">Port of Import/Export</span>
                  <p className="text-[#1a2b4b] font-bold text-[15px]">{product.portOfImport || "Port details pending"}</p>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <h3 className="text-[#1a2b4b] font-black text-sm uppercase tracking-wider">Shipping Address</h3>
                </div>
                <div className="pl-11 relative">
                  <div className="absolute left-[15px] top-0 bottom-0 w-px bg-blue-100"></div>
                  <p className="text-[#1a2b4b] font-bold text-[15px] leading-snug">
                    {product.addressDetail || "No warehouse allocation assigned."}
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50/50 p-6 lg:p-10 flex flex-col sm:flex-row items-center justify-end gap-3 sm:space-x-4 border-t border-gray-100/50 flex-shrink-0">
           <button 
             onClick={onClose}
             className="w-full sm:w-auto px-8 py-3.5 lg:py-4 bg-white border border-gray-200 text-[#475569] font-black rounded-xl lg:rounded-2xl hover:bg-gray-50 transition-all text-sm lg:text-[15px] shadow-sm active:scale-95"
           >
             Close
           </button>
           <button 
             onClick={() => onEdit(product)}
             className="w-full sm:w-auto px-10 py-3.5 lg:py-4 bg-blue-600 text-white font-black rounded-xl lg:rounded-2xl hover:bg-blue-700 transition-all text-sm lg:text-[15px] shadow-xl shadow-blue-500/20 active:scale-95"
           >
             Edit Product
           </button>
        </div>

      </div>
    </div>
  );
};

export default ProductDetailsModal;
