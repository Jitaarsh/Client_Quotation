import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import quotationApi from '../../../services/quotationApi';
import customerApi from '../../../services/customerApi';
import { 
    FileText, 
    Users,
    PlusCircle, 
    UserPlus, 
    Bell, 
    MoreVertical, 
    Search, 
    SlidersHorizontal, 
    CalendarCheck, 
    Lightbulb,
    X,
    Mail,
    Phone,
    MapPin,
    Briefcase,
    User,
    Activity
} from 'lucide-react';

const CustomerDetailsModal = ({ customer, isOpen, onClose }) => {
    const navigate = useNavigate();
    if (!isOpen || !customer) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
                onClick={onClose}
            />
            
            {/* Modal Content */}
            <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden transform transition-all animate-in fade-in zoom-in duration-300">
                {/* Header/Gradient */}
                <div className="h-32 bg-gradient-to-br from-[#145be9] to-[#0557cc] relative">
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="absolute -bottom-10 left-8">
                        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black shadow-lg border-4 border-white ${customer.logoBg} ${customer.logoBg === 'bg-[#1a2b4b]' ? 'text-white' : 'text-[#145be9]'}`}>
                            {customer.name?.charAt(0)}
                        </div>
                    </div>
                </div>

                <div className="pt-14 px-8 pb-8">
                    <div className="mb-6">
                        <h3 className="text-2xl font-black text-[#1a2b4b]">{customer.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="bg-[#eef4ff] text-[#145be9] text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                {customer.category || 'Standard'}
                            </span>
                            <span className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                                customer.leadType === 'hot' ? 'bg-red-50 text-red-600' :
                                customer.leadType === 'warm' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
                            }`}>
                                {customer.leadType || 'Warm'} Lead
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Contact Info */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-slate-600">
                                <Mail className="w-4 h-4 text-[#145be9]" />
                                <span className="text-[14px] font-medium truncate">{customer.email || 'no-email@firm.com'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-600">
                                <Phone className="w-4 h-4 text-[#145be9]" />
                                <span className="text-[14px] font-medium">{customer.phone || '+1 --- --- ----'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-600">
                                <MapPin className="w-4 h-4 text-[#145be9]" />
                                <span className="text-[14px] font-medium">{customer.city}, {customer.country}</span>
                            </div>
                        </div>

                        {/* Business Info */}
                        <div className="bg-[#f8fafc] rounded-2xl p-5 border border-slate-100">
                            <div className="flex items-center gap-2 text-slate-400 mb-4">
                                <Activity className="w-4 h-4" />
                                <span className="text-[11px] font-black uppercase tracking-widest">Performance</span>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500 text-[13px] font-medium">Total Volume</span>
                                    <span className="text-[#1a2b4b] font-black">{customer.projectsCount} Quotes</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500 text-[13px] font-medium">Account Rep</span>
                                    <span className="text-[#1a2b4b] font-black text-[13px]">Arthur Dent</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 flex gap-3">
                        <button 
                            onClick={() => navigate('/dashboard/create-quotation')}
                            className="flex-1 bg-[#145be9] hover:bg-[#0557cc] text-white py-3 rounded-xl font-bold text-[14px] transition-all transform hover:scale-[1.02] shadow-lg shadow-blue-500/20"
                        >
                            New Quotation
                        </button>
                        <button 
                            className="bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#1a2b4b] px-6 py-3 rounded-xl font-bold text-[14px] transition-all"
                            onClick={onClose}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};



const CompanyDashboard = () => {
    const navigate = useNavigate();
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // ── Data Fetching ──────────────────────────────────────────
    const { data: quoteResponse, isLoading: quoteLoading } = useQuery({
        queryKey: ['quotations'],
        queryFn: quotationApi.getQuotations
    });

    const { data: customerResponse, isLoading: customerLoading } = useQuery({
        queryKey: ['all-customers'],
        queryFn: customerApi.getCustomers
    });

    const recentQuotationsRaw = React.useMemo(
        () => (Array.isArray(quoteResponse?.data) ? quoteResponse.data : []),
        [quoteResponse]
    );
    const allCustomers = React.useMemo(
        () => (Array.isArray(customerResponse?.data) ? customerResponse.data : []),
        [customerResponse]
    );

    const activeQuotesCount = React.useMemo(() => {
        if (!recentQuotationsRaw.length) return 0;

        return recentQuotationsRaw.filter((quotation) => {
            const status = quotation.status?.toLowerCase();
            return status === 'draft' || status === 'sent';
        }).length;
    }, [recentQuotationsRaw]);

    const customerCount = customerLoading ? 0 : allCustomers.length;

    // Only take top 3 for the table
    const recentQuotations = recentQuotationsRaw.slice(0, 3).map((item, index) => {
        const clientName = item.customer?.businessName || item.customer?.fullName || 'N/A';
        const initials = clientName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
        
        // Cycle through predefined colors
        const colors = [
            { bg: 'bg-[#e0eafe]', text: 'text-[#145be9]' },
            { bg: 'bg-[#e6fbd9]', text: 'text-[#1f8b24]' },
            { bg: 'bg-[#fef3c7]', text: 'text-[#d97706]' }
        ];
        const color = colors[index % colors.length];

        const getStatusStyles = (status) => {
            switch (status?.toLowerCase()) {
                case 'paid': return 'bg-[#e6fbd9] text-[#1f8b24]';
                case 'sent': return 'bg-[#dce9fe] text-[#145be9]';
                case 'draft': return 'bg-[#f1f5f9] text-[#145be9]';
                case 'cancelled': return 'bg-[#fee2e2] text-[#ef4444]';
                default: return 'bg-[#f1f5f9] text-slate-500';
            }
        };

        const getCurrencySymbol = (code) => {
            const symbols = { 'INR': '₹', 'USD': '$', 'EUR': '€', 'GBP': '£' };
            return symbols[code] || '$';
        };

        return {
            id: item._id,
            avatar: initials,
            avatarBg: color.bg,
            avatarText: color.text,
            client: clientName,
            project: 'Project Demo', // Shared demo name for now
            amount: `${getCurrencySymbol(item.currency)}${item.finalTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
            status: (item.status || 'Draft').toUpperCase(),
            statusClass: getStatusStyles(item.status)
        };
    });

    // Calculate Top Customers based on Quotation volume
    const topCustomers = React.useMemo(() => {
        if (!allCustomers.length || quoteLoading) return [];

        // Count quotes per customer
        const quoteCounts = recentQuotationsRaw.reduce((acc, quote) => {
            const custId = quote.customer?._id || quote.customer;
            if (custId) {
                acc[custId] = (acc[custId] || 0) + 1;
            }
            return acc;
        }, {});

        // Map onto customers and rank
        const ranked = allCustomers.map(cust => ({
            id: cust._id,
            name: cust.businessName || cust.fullName,
            email: cust.email,
            phone: cust.phone,
            city: cust.city,
            country: cust.country,
            category: cust.category,
            leadType: cust.leadType,
            projectsCount: quoteCounts[cust._id] || 0,
            projects: `${quoteCounts[cust._id] || 0} Project${(quoteCounts[cust._id] || 0) !== 1 ? 's' : ''}`,
            logoBg: cust.category === 'corporate' ? 'bg-[#1a2b4b]' : 'bg-[#eef4ff]',
            logoText: 'C'
        }));


        // Sort by quote density and take top 3
        return [...ranked]
            .sort((a, b) => b.projectsCount - a.projectsCount)
            .slice(0, 3);
    }, [allCustomers, recentQuotationsRaw, quoteLoading]);



    return (
        <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-10 font-sans">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-[2rem] font-black tracking-tight text-[#1a2b4b] mb-1">
                        Operational Ledger
                    </h1>
                    <p className="text-slate-500 font-medium text-sm">
                        Welcome back, Arthur. Here is your firm's performance today.
                    </p>
                </div>
            </div>

            {/* Top Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* Active Quotes */}
                <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div className="w-12 h-12 bg-[#eef4ff] rounded-xl flex items-center justify-center text-[#145be9]">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div className="bg-[#f1f5f9] text-slate-500 text-[12px] font-bold px-3 py-1 rounded-full">
                            {activeQuotesCount} active
                        </div>
                    </div>
                    <div className="mt-8">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">ACTIVE QUOTES</div>
                        <div className="text-[1.75rem] font-black text-[#1a2b4b]">{activeQuotesCount}</div>
                    </div>
                </div>

                {/* Customers */}
                <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div className="w-12 h-12 bg-[#eef4ff] rounded-xl flex items-center justify-center text-[#145be9]">
                            <Users className="w-6 h-6" />
                        </div>
                        <div className="bg-[#e6fbd9] text-[#1f8b24] text-[12px] font-bold px-3 py-1 rounded-full">
                            Live
                        </div>
                    </div>
                    <div className="mt-8">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">CUSTOMERS</div>
                        <div className="text-[1.75rem] font-black text-[#1a2b4b]">{customerCount}</div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-[#0557cc] rounded-2xl p-6 shadow-[0_8px_20px_rgba(5,87,204,0.25)] flex flex-col">
                    <h3 className="text-white font-bold text-[16px] mb-4">Quick Actions</h3>
                    <div className="flex flex-col gap-2">
                        <button 
                            onClick={() => navigate('/dashboard/create-quotation')}
                            className="w-full bg-[#1e6ce6] hover:bg-[#2e7bf2] transition-colors text-white py-2 px-3 rounded-lg flex items-center justify-start gap-3"
                        >
                            <PlusCircle className="w-4 h-4" />
                            <span className="font-semibold text-[13px]">Create New Quote</span>
                        </button>
                        <button 
                            onClick={() => navigate('/dashboard/customers/add')}
                            className="w-full bg-[#1e6ce6] hover:bg-[#2e7bf2] transition-colors text-white py-2 px-3 rounded-lg flex items-center justify-start gap-3"
                        >
                            <UserPlus className="w-4 h-4" />
                            <span className="font-semibold text-[13px]">Add Customer</span>
                        </button>
                    </div>
                </div>

            </div>

            {/* Middle Section Layout */}
            <div className="grid grid-cols-1 gap-6 items-start">
                
                {/* Main Content Column */}
                <div className="flex flex-col gap-6">
                    
                    {/* Recent Quotations */}
                    <div className="bg-white rounded-2xl p-7 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-[18px] font-black text-[#1a2b4b]">Recent Quotations</h2>
                            <button className="text-[#145be9] font-bold text-[13px] hover:underline">View All</button>
                        </div>

                        {/* Table Header */}
                        <div className="grid grid-cols-12 items-center pb-3 mb-3 border-b border-slate-100 px-2 lg:px-0">
                            <div className="col-span-5 md:col-span-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Client</div>
                            <div className="hidden md:block md:col-span-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Project</div>
                            <div className="col-span-3 md:col-span-2 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right md:text-center">Amount</div>
                            <div className="col-span-4 md:col-span-2 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right md:text-center">Status</div>
                        </div>

                        {/* Table Items */}
                        <div className="flex flex-col gap-2">
                            {quoteLoading ? (
                                [1, 2, 3].map(i => (
                                    <div key={i} className="animate-pulse flex items-center gap-4 py-4">
                                        <div className="w-9 h-9 bg-slate-100 rounded-full" />
                                        <div className="h-4 bg-slate-100 rounded w-1/4" />
                                        <div className="h-4 bg-slate-100 rounded w-1/4" />
                                        <div className="h-4 bg-slate-100 rounded w-1/4" />
                                    </div>
                                ))
                            ) : recentQuotations.length > 0 ? (
                                recentQuotations.map((quote) => (
                                    <div key={quote.id} className="grid grid-cols-12 items-center py-3 border-b border-slate-100/80 last:border-0 px-2 lg:px-0">
                                        <div className="col-span-5 md:col-span-4 flex items-center gap-3 min-w-0">
                                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-[12px] shrink-0 ${quote.avatarBg} ${quote.avatarText}`}>
                                                {quote.avatar}
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <div className="font-bold text-[#1a2b4b] text-[14px] leading-tight truncate pr-2">{quote.client}</div>
                                                <div className="md:hidden text-[11px] font-medium text-slate-400 truncate mt-0.5">{quote.project}</div>
                                            </div>
                                        </div>
                                        <div className="hidden md:block md:col-span-4 text-[13.5px] font-medium text-slate-500 leading-tight text-center px-3">
                                            {quote.project}
                                        </div>
                                        <div className="col-span-3 md:col-span-2 flex justify-end md:justify-center">
                                            <div className="font-bold text-[#1a2b4b] text-[14.5px] whitespace-nowrap text-right md:text-center">
                                                {quote.amount}
                                            </div>
                                        </div>
                                        <div className="col-span-4 md:col-span-2 flex justify-end md:justify-center">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wide text-center ${quote.statusClass}`}>
                                                {quote.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-10 text-center text-slate-400 font-medium text-sm">
                                    No recent quotations found.
                                </div>
                            )}
                        </div>

                    </div>

                    {/* Top Customers */}
                    <div className="bg-white rounded-2xl p-7 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-[18px] font-black text-[#1a2b4b]">Top Customers</h2>
                            <div className="flex items-center gap-2">
                                <button className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors">
                                    <Search className="w-4 h-4" />
                                </button>
                                <button className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors">
                                    <SlidersHorizontal className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                            {topCustomers.map((cust) => (
                                <div key={cust.id} className="bg-[#eef4ff] rounded-2xl p-6 flex flex-col items-center text-center">
                                    <div className={`w-14 h-14 rounded-[0.8rem] flex justify-center items-center mb-4 ${cust.logoBg}`}>
                                        <div className="text-[#dba856] text-[10px] font-black uppercase tracking-widest -mt-1"><span className="text-[18px]">●</span> <br/> CLIENT</div>
                                    </div>
                                    <h4 className="font-black text-[#1a2b4b] text-[15px] mb-0.5 leading-tight">{cust.name}</h4>
                                    <p className="text-[12px] font-medium text-slate-500 mb-5">{cust.projects}</p>
                                    <button 
                                        onClick={() => { setSelectedCustomer(cust); setIsModalOpen(true); }}
                                        className="bg-white text-[#145be9] hover:bg-[#e0eafe] transition-colors font-bold text-[13px] px-6 py-2 rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.02)] w-full"
                                    >
                                        Details
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

            </div>
            {/* Modal */}
            <CustomerDetailsModal 
                customer={selectedCustomer} 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
            />
        </div>
    );
};


export default CompanyDashboard;
