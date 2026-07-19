import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, ListFilter, ChevronLeft, ChevronRight, 
  Loader2, Pencil, Trash2, Mail, Phone 
} from 'lucide-react';

const CustomerTable = ({ customers, isLoading, setSelectedCustomer, handleDelete, deleteMutation }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => 
      c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [customers, searchTerm]);

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const startIdx = (currentPage - 1) * itemsPerPage + 1;
  const endIdx = Math.min(currentPage * itemsPerPage, filteredCustomers.length);

  // ── Helper: Generate Initial Badge ─────────────────────────
  const getBadge = (name) => {
    const initials = name
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
    
    // Cycle through soft backgrounds
    const colors = [
      'bg-blue-100 text-blue-600',
      'bg-indigo-100 text-indigo-600',
      'bg-emerald-100 text-emerald-600',
      'bg-rose-100 text-rose-600',
      'bg-amber-100 text-amber-600'
    ];
    const colorIdx = initials.charCodeAt(0) % colors.length;
    
    return { initials, colorClass: colors[colorIdx] };
  };

  return (
    <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm overflow-hidden mb-12">
      {/* Table Top Bar: Filters and Pagination Overlay */}
      <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row flex-wrap items-center justify-between gap-6">
        <div className="flex items-center space-x-6">
          <div className="text-sm font-bold text-gray-500">
            Showing <span className="text-[#1a2b4b]">{filteredCustomers.length > 0 ? startIdx : 0} to {endIdx}</span> of <span className="text-[#1a2b4b]">{filteredCustomers.length}</span> customers
          </div>
          <div className="hidden md:flex items-center bg-gray-50 rounded-xl p-1 px-1.5 space-x-1">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-30 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
                  currentPage === i + 1 ? 'bg-[#145be9] text-white shadow-md shadow-blue-500/20' : 'text-gray-400 hover:text-gray-600 hover:bg-white'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1.5 rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-30 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-4 flex-1 justify-end w-full md:w-auto">
          <div className="relative flex-1 max-w-sm group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#145be9] transition-colors" />
            <input 
              type="text" 
              placeholder="Find in ledger..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border-none rounded-xl pl-11 pr-4 py-2.5 text-sm font-semibold focus:ring-4 focus:ring-blue-500/5 focus:bg-white transition-all outline-none"
            />
          </div>
          <button className="p-2.5 bg-gray-50 rounded-xl text-gray-500 hover:bg-blue-50 hover:text-[#145be9] transition-all">
            <ListFilter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* The Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-[#fcfcfd]">
              <th className="px-8 py-4 text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] border-b border-gray-50">Business Name</th>
              <th className="px-8 py-4 text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] border-b border-gray-50">Contact Name</th>
              <th className="px-8 py-4 text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] border-b border-gray-50">Email ID</th>
              <th className="px-8 py-4 text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] border-b border-gray-50">Contact Number</th>
              <th className="px-8 py-4 text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] border-b border-gray-50">Address</th>
              <th className="px-8 py-4 text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] border-b border-gray-50 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              <tr>
                <td colSpan="6" className="py-20 text-center">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="w-10 h-10 text-[#145be9] animate-spin" />
                    <span className="text-gray-400 font-bold tracking-widest text-xs uppercase">Syncing Ledger...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedCustomers.length > 0 ? (
              paginatedCustomers.map((customer) => {
                const badge = getBadge(customer.businessName);
                return (
                  <tr key={customer._id} className="group hover:bg-blue-50/30 transition-all cursor-default">
                    <td className="px-8 py-6">
                      <div 
                        className="flex items-center space-x-4 cursor-pointer"
                        onClick={() => setSelectedCustomer(customer)}
                      >
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm shadow-sm transition-transform group-hover:scale-110 ${badge.colorClass}`}>
                          {badge.initials}
                        </div>
                        <div>
                          <div className="text-[#1a2b4b] font-bold text-[15px] group-hover:text-[#145be9] transition-colors">{customer.businessName}</div>
                          <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mt-0.5">{customer.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-[#1a2b4b] font-bold text-[15px]">{customer.fullName}</div>
                      <div className="text-gray-400 text-[11px] font-bold uppercase tracking-tighter inline-flex items-center mt-1">
                        <span className={`w-1.5 h-1.5 rounded-full mr-1 ${
                          customer.leadType === 'hot' ? 'bg-rose-500' : customer.leadType === 'warm' ? 'bg-amber-500' : 'bg-blue-500'
                        }`}></span>
                        {customer.leadType}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center text-gray-500 font-semibold text-sm hover:text-[#145be9] transition-colors cursor-pointer">
                        <Mail className="w-3.5 h-3.5 mr-2 opacity-40" />
                        {customer.email}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center text-gray-500 font-semibold text-sm">
                        <Phone className="w-3.5 h-3.5 mr-2 opacity-40" />
                        {customer.phone}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-gray-500 text-sm font-semibold max-w-[200px] truncate">
                        {customer.city}, {customer.state}, {customer.country}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link 
                          to={`/dashboard/customers/edit/${customer._id}`}
                          className="p-2 text-gray-400 hover:text-[#145be9] hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={(e) => handleDelete(e, customer)}
                          disabled={deleteMutation.isPending}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-30"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="py-24 text-center">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                      <Search className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-[#1a2b4b] font-black text-lg">No records found</p>
                      <p className="text-gray-400 text-sm font-medium">Try adjusting your search or filters.</p>
                    </div>
                    <Link 
                      to="/dashboard/customers/add"
                      className="text-[#145be9] font-black text-xs uppercase tracking-widest hover:underline"
                    >
                      Add your first customer
                    </Link>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerTable;