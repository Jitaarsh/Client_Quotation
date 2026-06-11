import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, Image as ImageIcon, Video, 
  Edit3, Trash2, ChevronLeft, ChevronRight,
  Package, Box, Loader2, AlertCircle, Search
} from 'lucide-react';
import productApi from '../../../../services/productApi';
import { getServerAssetUrl } from '../../../../config/api';

const currencySymbols = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£'
};

const ProductTable = ({ products, isLoading, isError, error, filters, setFilters, onDeleteClick, onProductClick }) => {
  const navigate = useNavigate();

  // Unified Filtering Pipeline
  const filteredProducts = products.filter(product => {
    // 1. Search filter (Name, SKU, Description)
    const searchLower = filters.search.toLowerCase();
    const matchesSearch = !filters.search || 
      product.name?.toLowerCase().includes(searchLower) ||
      product.sku?.toLowerCase().includes(searchLower) ||
      product.description?.toLowerCase().includes(searchLower);

    // 2. Category filter (Synced with tabs and dropdown)
    const matchesCategory = filters.category === 'ALL' || 
      product.category?.toUpperCase() === filters.category.toUpperCase();

    // 3. Status filter
    const matchesStatus = filters.status === 'ALL' || 
      product.status?.toUpperCase() === filters.status.toUpperCase();

    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center py-24 mb-8">
        <Loader2 className="w-10 h-10 text-[#145be9] animate-spin mb-4" />
        <p className="text-gray-500 font-bold">Fetching Inventory...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-rose-100 flex flex-col items-center justify-center py-24 mb-8 px-10 text-center">
        <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-8 h-8 text-rose-500" />
        </div>
        <h3 className="text-xl font-black text-rose-900 mb-2">Network Error</h3>
        <p className="text-rose-600/70 font-medium max-w-sm">
          {error?.response?.data?.message || "We couldn't load your products. Please check your connection."}
        </p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center py-24 mb-8 px-10 text-center">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-6">
          <Package className="w-8 h-8 text-[#145be9]" />
        </div>
        <h3 className="text-xl font-black text-[#1a2b4b] mb-2">No Products Yet</h3>
        <p className="text-gray-500 font-medium max-w-sm mb-8">
          Your inventory is currently empty. Start by adding your first material or service item.
        </p>
        <button 
           onClick={() => navigate('/dashboard/products/add')}
           className="bg-[#145be9] hover:bg-blue-700 text-white px-8 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
        >
          Add First Product
        </button>
      </div>
    );
  }

  if (products.length > 0 && filteredProducts.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center py-24 mb-8 px-10 text-center animate-in fade-in duration-300">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6">
          <Search className="w-8 h-8 text-slate-300" />
        </div>
        <h3 className="text-xl font-black text-[#1a2b4b] mb-2">No Results Found</h3>
        <p className="text-gray-500 font-medium max-w-sm mb-8">
          We couldn't find any products matching your current search or filters. Try adjusting your keywords or resetting the filters.
        </p>
        <button 
           onClick={() => setFilters({ search: '', category: 'ALL', status: 'ALL' })}
           className="text-[#145be9] font-bold text-sm hover:underline active:scale-95 transition-all"
        >
          Clear All Filters
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col mb-8 overflow-hidden pt-2">
      
      {/* Table Tabs & Header Actions */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 mt-2 overflow-x-auto">
        <div className="flex items-center gap-4 min-w-max">
          <button 
            onClick={() => setFilters(prev => ({ ...prev, category: 'ALL' }))}
            className={`px-4 py-1.5 rounded-lg text-xs font-black tracking-wide transition-all ${
              filters.category === 'ALL' ? 'bg-[#eef2ff] text-[#145be9]' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            ALL ITEMS ({products.length})
          </button>
          <button 
            onClick={() => setFilters(prev => ({ ...prev, category: 'MATERIALS' }))}
            className={`px-4 py-1.5 rounded-lg text-xs font-black tracking-wide transition-all ${
              filters.category === 'MATERIALS' ? 'bg-[#eef2ff] text-[#145be9]' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            MATERIALS
          </button>
          <button 
            onClick={() => setFilters(prev => ({ ...prev, category: 'SERVICES' }))}
            className={`px-4 py-1.5 rounded-lg text-xs font-black tracking-wide transition-all ${
              filters.category === 'SERVICES' ? 'bg-[#eef2ff] text-[#145be9]' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            SERVICES
          </button>
          <button 
            onClick={() => setFilters(prev => ({ ...prev, category: 'CONSULTING' }))}
            className={`px-4 py-1.5 rounded-lg text-xs font-black tracking-wide transition-all ${
              filters.category === 'CONSULTING' ? 'bg-[#eef2ff] text-[#145be9]' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            CONSULTING
          </button>
        </div>
      </div>

      {/* Table Content Wrapper for Mobile Scroll */}
      <div className="overflow-x-auto">
        <div className="min-w-[1000px]">
          {/* Table Head */}
          <div className="bg-[#f4f7fe] px-6 py-4 grid grid-cols-12 gap-4 items-center">
        <div className="col-span-3 text-xs font-black text-gray-500 tracking-wider">PRODUCT NAME</div>
        <div className="col-span-2 text-xs font-black text-gray-500 tracking-wider">BASE PRICE</div>
        <div className="col-span-3 text-xs font-black text-gray-500 tracking-wider">QTY RULES / TIERS</div>
        <div className="col-span-2 text-xs font-black text-gray-500 tracking-wider">CATEGORY</div>
        <div className="col-span-1 text-xs font-black text-gray-500 tracking-wider">ASSETS</div>
        <div className="col-span-1 text-xs font-black text-gray-500 tracking-wider text-right">ACTIONS</div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-gray-100">
        {filteredProducts.map((product) => (
          <div key={product._id} className="px-6 py-6 grid grid-cols-12 gap-4 items-center hover:bg-gray-50/50 transition-colors">
            
            {/* Product Name & Image */}
            <div 
              className="col-span-3 flex items-center gap-4 cursor-pointer group/item"
              onClick={() => onProductClick(product)}
            >
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0 transition-transform group-hover/item:scale-110 overflow-hidden ${
                !product.productImage ? (
                  product.category === 'Materials' ? 'bg-blue-50' : 
                  product.category === 'Services' ? 'bg-emerald-50' : 'bg-amber-50'
                ) : 'bg-white'
              }`}>
                {product.productImage ? (
                  <img 
                    src={getServerAssetUrl(product.productImage)}
                    alt={product.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://placehold.co/100x100?text=No+Image';
                    }}
                  />
                ) : (
                  <Box className={`w-6 h-6 ${
                    product.category === 'Materials' ? 'text-blue-500' : 
                    product.category === 'Services' ? 'text-emerald-500' : 'text-amber-500'
                  }`} />
                )}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 leading-tight mb-0.5 group-hover/item:text-[#145be9] transition-colors">{product.name}</h3>
                <p className="text-xs text-gray-500 font-medium">SKU: {product.sku}</p>
              </div>
            </div>

            {/* Base Price */}
            <div className="col-span-2 flex items-baseline gap-1">
              <span className="font-black text-gray-900 tracking-tight">
                {currencySymbols[product.currency] || '$'}
                {product.basePrice?.toFixed(2)}
              </span>
              <span className="text-xs text-gray-500 font-semibold lowercase">/{product.unit}</span>
            </div>

            {/* Qty Rules */}
            <div className="col-span-3">
              {product.pricingTiers?.length > 0 ? (
                <div className="flex flex-col gap-1.5">
                  {product.pricingTiers.map((tier, idx) => (
                    <div key={idx} className="bg-[#eef2ff] px-3 py-1 rounded inline-flex w-max items-center gap-1.5">
                      <span className="text-xs font-bold text-[#145be9]">{tier.minQty}-{tier.maxQty} units:</span>
                      <span className="text-xs font-black text-[#145be9]">
                        {currencySymbols[product.currency] || '$'}{tier.price?.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-xs font-medium italic text-gray-400">No bulk tiers applied</span>
              )}
            </div>

            {/* Category Tag */}
            <div className="col-span-2">
               <div className={`inline-flex px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wider uppercase ${
                  product.category === 'Materials' ? 'bg-blue-100 text-blue-700' : 
                  product.category === 'Services' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
               }`}>
                  {product.category}
               </div>
            </div>

            {/* Assets Status */}
            <div className="col-span-1 flex items-center gap-2">
               <ImageIcon className={`w-4 h-4 ${product.productImage ? 'text-blue-500' : 'text-gray-200'}`} />
               <FileText className={`w-4 h-4 ${product.cataloguePdf ? 'text-emerald-500' : 'text-gray-200'}`} />
               <Video className="w-4 h-4 text-gray-100" />
            </div>

            {/* Actions */}
            <div className="col-span-1 flex items-center justify-end gap-3 text-gray-400">
              <button 
                onClick={() => navigate(`/dashboard/products/edit/${product._id}`)}
                className="hover:text-[#145be9] hover:bg-blue-50 p-2 rounded-lg transition-all"
              >
                <Edit3 className="w-5 h-5" />
              </button>
              <button 
                onClick={() => onDeleteClick(product)}
                className="hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            
            </div>
          ))}
        </div>
      </div>
      </div>

      {/* Pagination Container */}
      <div className="px-6 border-t border-gray-100 py-4 flex items-center justify-between">
        <div className="text-sm text-gray-500 font-medium">
          Showing <span className="font-bold text-gray-900">{filteredProducts.length}</span> items
        </div>
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors active:scale-95 disabled:opacity-50" disabled>
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#145be9] text-white font-bold text-sm shadow-sm transition-colors active:scale-95">
            1
          </button>
          
          <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors active:scale-95 disabled:opacity-50" disabled>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      
    </div>
  );
};

export default ProductTable;
