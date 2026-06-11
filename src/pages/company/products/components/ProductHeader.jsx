import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Upload, Plus, Download, Loader2 } from 'lucide-react';

const ProductHeader = ({ products, isLoading }) => {
  const [isExporting, setIsExporting] = useState(false);

  const exportToCSV = () => {
    setIsExporting(true);
    
    // Define Headers
    const headers = [
      'Product Name', 
      'SKU', 
      'Category', 
      'Status', 
      'Base Price', 
      'Currency', 
      'Unit', 
      'Port of Import', 
      'Warehouse Detail', 
      'Pricing Tiers (Min-Max: Price)'
    ];

    // Format Rows
    const rows = products.map(product => [
      `"${product.name || ''}"`,
      `"${product.sku || ''}"`,
      product.category || '',
      product.status || '',
      product.basePrice || 0,
      product.currency || '',
      product.unit || '',
      `"${product.portOfImport || ''}"`,
      `"${product.addressDetail || ''}"`,
      `"${(product.pricingTiers || []).map(t => `${t.minQty}-${t.maxQty}: ${t.price}`).join(' | ')}"`
    ]);

    // Combine into CSV string
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create Download Link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `UniCrop_Inventory_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => setIsExporting(false), 800);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
      <div>
        <h1 className="text-[2rem] font-black tracking-tight text-[#1a2b4b] mb-1">Products & Services</h1>
        <p className="text-sm text-gray-500 font-medium">
          Manage your architectural inventory, consulting rates, and materials.
        </p>
      </div>
      
      <div className="flex items-center gap-3">
        <button 
          onClick={exportToCSV}
          disabled={isLoading || isExporting || products.length === 0}
          className="px-5 py-2.5 rounded-xl text-sm font-bold text-[#145be9] bg-[#dce9fe] hover:bg-[#cde0fe] transition-colors flex items-center gap-2 disabled:opacity-50 active:scale-95"
        >
          {isExporting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          {isExporting ? 'Exporting...' : 'Export'}
        </button>
        <Link to="/dashboard/products/bulk" className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center gap-2 active:scale-95">
          <Upload className="w-4 h-4" />
          Bulk Import
        </Link>
        <Link to="/dashboard/products/add" className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#0557cc] hover:bg-[#0449ad] shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 active:scale-95">
          <Plus className="w-4 h-4" />
          Add New Item
        </Link>
      </div>
    </div>
  );
};

export default ProductHeader;
