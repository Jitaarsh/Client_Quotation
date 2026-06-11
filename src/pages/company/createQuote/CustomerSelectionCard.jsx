import React, { useState } from 'react';
import { User, Search, CheckCircle2, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import customerApi from '../../../services/customerApi';

const CustomerSelectionCard = ({ selectedCustomer, setSelectedCustomer }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // ── Fetch Customers ────────────────────────────────────────
  const { data: customersResponse, isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: customerApi.getCustomers
  });

  const allCustomers = customersResponse?.data || [];

  // Filter based on search
  const filteredCustomers = allCustomers.filter(c => 
    c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (customer) => {
    setSelectedCustomer(customer);
    setSearchTerm('');
    setIsDropdownOpen(false);
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6 font-sans relative">
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-[#145be9]" />
          <h2 className="text-[#1a2b4b] font-bold text-lg">Customer Selection</h2>
        </div>
        <button 
          type="button"
          className="text-[#145be9] font-bold text-sm hover:underline"
        >
          Add New Customer
        </button>
      </div>

      <div className="relative mb-5">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsDropdownOpen(true);
          }}
          onFocus={() => setIsDropdownOpen(true)}
          className="block w-full pl-11 pr-4 py-3.5 bg-[#f4f7fe] border-transparent rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#145be9] focus:bg-white transition-all"
          placeholder="Search customer by name, email or company..."
        />

        {/* Search Results Dropdown */}
        {isDropdownOpen && searchTerm && (
          <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-400 text-sm">Loading customers...</div>
            ) : filteredCustomers.length > 0 ? (
              filteredCustomers.map(c => (
                <div 
                  key={c._id}
                  onClick={() => handleSelect(c)}
                  className="p-4 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors"
                >
                  <div className="font-bold text-[#1a2b4b] text-sm">{c.fullName}</div>
                  <div className="text-xs text-gray-500 font-medium">{c.businessName} • {c.email}</div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-400 text-sm">No customers found</div>
            )}
          </div>
        )}
      </div>

      {selectedCustomer ? (
        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex items-center justify-between animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-[#145be9] rounded-full flex items-center justify-center text-white font-bold text-lg">
                {selectedCustomer.fullName.charAt(0)}
             </div>
             <div>
                <div className="font-bold text-[#1a2b4b] text-sm flex items-center gap-2">
                    {selectedCustomer.fullName}
                    <CheckCircle2 className="w-4 h-4 text-[#145be9]" />
                </div>
                <div className="text-xs text-gray-500 font-medium">{selectedCustomer.businessName} • {selectedCustomer.phone}</div>
             </div>
          </div>
          <button 
            onClick={() => setSelectedCustomer(null)}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="border border-dashed border-gray-200 rounded-xl p-6 text-center">
          <p className="text-gray-500 text-sm font-medium">
            No customer selected. Search above or select from <span className="text-[#145be9] cursor-pointer hover:underline">Recent Clients</span>.
          </p>
        </div>
      )}
    </div>
  );
};

export default CustomerSelectionCard;
