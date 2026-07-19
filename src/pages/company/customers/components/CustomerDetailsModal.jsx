import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, UserCircle, Mail, Phone, PieChart, Briefcase, TrendingUp, 
  UserPlus, Globe, DollarSign, Calendar, Pencil, MapPin, Building2, User as UserIcon
} from 'lucide-react';

const CustomerDetailsModal = ({ customer, onClose }) => {
  const navigate = useNavigate();
  if (!customer) return null;

  const initials = customer.businessName
    ? customer.businessName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'CU';

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
               <span className="text-white text-xl lg:text-2xl font-black">{initials}</span>
            </div>
            <div>
              <span className="hidden lg:block text-[#64748b] text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] mb-0.5 lg:mb-1">Customer Profile</span>
              <h2 className="text-[#1a2b4b] text-xl lg:text-3xl font-black tracking-tight leading-tight">{customer.businessName}</h2>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] font-black bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md uppercase tracking-wider">
                  {customer.category}
                </span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider bg-emerald-50 text-emerald-600`}>
                  {customer.leadType} Priority
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
          
          {/* Identity Section */}
          <div className="bg-[#f8fafc] border border-gray-100 rounded-[1.5rem] lg:rounded-[2rem] p-5 lg:p-8 flex items-start gap-4 lg:gap-5">
            <div className="w-9 h-9 lg:w-10 lg:h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-500 flex-shrink-0">
              <UserCircle className="w-4 h-4 lg:w-5 lg:h-5" />
            </div>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8">
              <div>
                <span className="text-[#1a2b4b] text-[10px] lg:text-[11px] font-black uppercase tracking-widest mb-1.5 lg:mb-2 block">Primary Contact</span>
                <p className="text-[#1a2b4b] font-bold text-sm lg:text-[16px]">{customer.fullName}</p>
                <div className="flex items-center gap-2 mt-1 text-[#64748b]">
                  <Mail className="w-3.5 h-3.5" />
                  <span className="text-xs lg:text-sm font-medium">{customer.email}</span>
                </div>
              </div>
              <div>
                <span className="text-[#1a2b4b] text-[10px] lg:text-[11px] font-black uppercase tracking-widest mb-1.5 lg:mb-2 block">Contact Line</span>
                <div className="flex items-center gap-2 text-[#1a2b4b]">
                  <Phone className="w-4 h-4 text-blue-500" />
                  <p className="font-bold text-sm lg:text-[16px]">{customer.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            
            {/* Workflow Column */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
                  <PieChart className="w-4 h-4" />
                </div>
                <h3 className="text-[#1a2b4b] font-black text-sm uppercase tracking-wider">Workflow Context</h3>
              </div>

              <div className="space-y-6 pl-1 pt-2">
                <div className="pl-11 relative">
                  <div className="absolute left-[15px] top-0 bottom-0 w-px bg-emerald-100"></div>
                  <div className="flex items-center gap-2 mb-1">
                    <Briefcase className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-[#94a3b8] text-[10px] font-black uppercase tracking-widest block">Business Sector</span>
                  </div>
                  <p className="text-[#1a2b4b] font-bold text-[15px]">{customer.category}</p>
                </div>

                <div className="pl-11 relative">
                  <div className="absolute left-[15px] top-0 bottom-0 w-px bg-emerald-100"></div>
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-[#94a3b8] text-[10px] font-black uppercase tracking-widest block">Account Intent</span>
                  </div>
                  <p className="text-[#1a2b4b] font-bold text-[15px]">{customer.leadType} Priority</p>
                </div>

                <div className="pl-11 relative">
                  <div className="absolute left-[15px] top-0 bottom-0 w-px bg-emerald-100"></div>
                  <div className="flex items-center gap-2 mb-1">
                    <UserPlus className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-[#94a3b8] text-[10px] font-black uppercase tracking-widest block">Relationship Manager</span>
                  </div>
                  <p className="text-[#1a2b4b] font-bold text-[15px]">{customer.assignedUser}</p>
                </div>
              </div>
            </div>

            {/* Regional Column */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                  <Globe className="w-4 h-4" />
                </div>
                <h3 className="text-[#1a2b4b] font-black text-sm uppercase tracking-wider">Regional Data</h3>
              </div>

              <div className="space-y-6 pl-1 pt-2">
                <div className="pl-11 relative">
                  <div className="absolute left-[15px] top-0 bottom-0 w-px bg-indigo-100"></div>
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="text-[#94a3b8] text-[10px] font-black uppercase tracking-widest block">Preferred Currency</span>
                  </div>
                  <p className="text-[#1a2b4b] font-bold text-[15px]">{customer.currency}</p>
                </div>

                <div className="pl-11 relative">
                  <div className="absolute left-[15px] top-0 bottom-0 w-px bg-indigo-100"></div>
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="text-[#94a3b8] text-[10px] font-black uppercase tracking-widest block">Primary Location</span>
                  </div>
                  <p className="text-[#1a2b4b] font-bold text-[15px] leading-snug">
                     {customer.city}, {customer.state}<br/>
                     <span className="text-gray-400 font-medium text-sm">{customer.country}</span>
                  </p>
                </div>

                <div className="pl-11 relative">
                  <div className="absolute left-[15px] top-0 bottom-0 w-px bg-indigo-100"></div>
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="text-[#94a3b8] text-[10px] font-black uppercase tracking-widest block">Registry Entry</span>
                  </div>
                  <p className="text-[#1a2b4b] font-bold text-[15px]">
                    {new Date(customer.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
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
             onClick={() => navigate(`/dashboard/customers/edit/${customer._id}`)}
             className="w-full sm:w-auto px-10 py-3.5 lg:py-4 bg-blue-600 text-white font-black rounded-xl lg:rounded-2xl hover:bg-blue-700 transition-all text-sm lg:text-[15px] shadow-xl shadow-blue-500/20 active:scale-95 text-center flex items-center justify-center gap-2"
           >
              <Pencil className="w-4 h-4" />
              <span>Edit Profile</span>
           </button>
        </div>

      </div>
    </div>
  );
};

export default CustomerDetailsModal;
