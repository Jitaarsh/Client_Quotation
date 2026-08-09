import React from 'react';
import { Link } from 'react-router-dom';
import { UploadCloud, UserPlus } from 'lucide-react';

const CustomerHeader = () => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
      <div>
        <h1 className="text-[#1a2b4b] text-[2rem] font-black mb-2 tracking-tight">Customer Directory</h1>
        <p className="text-gray-500 text-[15px] max-w-md font-medium">
          Manage your client relationships and system integrations from a single architectural ledger.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Link 
          to="/dashboard/customers/bulk"
          className="px-5 py-2.5 rounded-xl text-sm font-bold text-[#145be9] bg-[#dce9fe] hover:bg-[#cde0fe] transition-colors flex items-center gap-2"
        >
          <UploadCloud className="w-5 h-5" />
          <span>Bulk Upload</span>
        </Link>
        <Link 
          to="/dashboard/customers/add"
          className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#0557cc] hover:bg-[#0449ad] shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
        >
          <UserPlus className="w-5 h-5" />
          <span>Add New Customer</span>
        </Link>
      </div>
    </div>
  );
};

export default CustomerHeader;
