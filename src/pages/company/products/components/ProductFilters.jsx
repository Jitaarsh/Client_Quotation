import React, { useState } from 'react';
import { Search, Shapes, ListFilter, ChevronDown, Check } from 'lucide-react';

const ProductFilters = ({ filters, setFilters }) => {
  const [activeDropdown, setActiveDropdown] = useState(null);

  const categories = ['ALL', 'Materials', 'Services', 'Consulting'];
  const statuses = ['ALL', 'Active', 'Inactive'];

  const handleSearchChange = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  const handleFilterSelect = (type, value) => {
    setFilters(prev => ({ ...prev, [type]: value }));
    setActiveDropdown(null);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-8">
      {/* Search Bar */}
      <div className="flex-1 relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={filters.search}
          onChange={handleSearchChange}
          className="block w-full pl-11 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl text-sm font-medium placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#145be9]/5 transition-all shadow-sm focus:border-[#145be9]"
          placeholder="Search inventory by name, SKU or keyword..."
        />
      </div>

      {/* Filter Dropdowns */}
      <div className="flex flex-wrap gap-4">
        {/* Category */}
        <div className="relative">
          <button 
            onClick={() => setActiveDropdown(activeDropdown === 'category' ? null : 'category')}
            className={`flex items-center justify-between gap-3 bg-white border px-5 py-3.5 rounded-2xl text-sm font-bold transition-all shadow-sm min-w-[170px] ${
              activeDropdown === 'category' ? 'border-[#145be9] ring-4 ring-blue-500/5' : 'border-gray-100 hover:border-gray-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <Shapes className={`w-4 h-4 ${filters.category !== 'ALL' ? 'text-[#145be9]' : 'text-gray-400'}`} />
              <span className="text-gray-700">{filters.category === 'ALL' ? 'All Categories' : filters.category}</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${activeDropdown === 'category' ? 'rotate-180 text-[#145be9]' : ''}`} />
          </button>

          {activeDropdown === 'category' && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)}></div>
              <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-20 animate-in fade-in zoom-in-95 duration-200">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleFilterSelect('category', cat)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold transition-colors ${
                      filters.category === cat ? 'bg-blue-50 text-[#145be9]' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span>{cat === 'ALL' ? 'All Categories' : cat}</span>
                    {filters.category === cat && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Status */}
        <div className="relative">
          <button 
            onClick={() => setActiveDropdown(activeDropdown === 'status' ? null : 'status')}
            className={`flex items-center justify-between gap-3 bg-white border px-5 py-3.5 rounded-2xl text-sm font-bold transition-all shadow-sm min-w-[160px] ${
              activeDropdown === 'status' ? 'border-[#145be9] ring-4 ring-blue-500/5' : 'border-gray-100 hover:border-gray-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <Check className={`w-4 h-4 ${filters.status !== 'ALL' ? 'text-emerald-500' : 'text-gray-400'}`} />
              <span className="text-gray-700">{filters.status === 'ALL' ? 'Any Status' : filters.status}</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${activeDropdown === 'status' ? 'rotate-180 text-[#145be9]' : ''}`} />
          </button>

          {activeDropdown === 'status' && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)}></div>
              <div className="absolute top-[calc(100%+8px)] right-0 w-full bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-20 animate-in fade-in zoom-in-95 duration-200">
                {statuses.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleFilterSelect('status', s)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold transition-colors ${
                      filters.status === s ? 'bg-emerald-50 text-emerald-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span>{s === 'ALL' ? 'Any Status' : s}</span>
                    {filters.status === s && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;
