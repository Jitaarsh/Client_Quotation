import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Search, 
    Filter, 
    Plus, 
    MoreVertical, 
    ExternalLink, 
    Download, 
    Trash2, 
    Eye,
    Calendar,
    User,
    ArrowUpRight,
    SearchX,
    Loader2,
    Pencil,
    ArrowLeft
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import invoiceApi from '../../../services/invoiceApi';
import InvoiceDetailsModal from './InvoiceDetailsModal';
import Toast from '../../../components/Toast';
import ConfirmModal from '../../../components/ConfirmModal';

const Invoices = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null, number: '' });

    // Fetch Invoices from Backend
    const { data: invoicesResponse, isLoading, error } = useQuery({
        queryKey: ['invoices'],
        queryFn: invoiceApi.getInvoices
    });

    const queryClient = useQueryClient();

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: (id) => invoiceApi.deleteInvoice(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            setToast({
                show: true,
                message: 'Invoice deleted successfully',
                type: 'success'
            });
            setConfirmDelete({ show: false, id: null, number: '' });
        },
        onError: (err) => {
            console.error('Failed to delete invoice:', err);
            setToast({
                show: true,
                message: err.response?.data?.message || 'Failed to delete invoice. Please try again.',
                type: 'error'
            });
            setConfirmDelete({ show: false, id: null, number: '' });
        }
    });

    const handleDeleteRequest = (id, invoiceNumber) => {
        setConfirmDelete({ show: true, id, number: invoiceNumber });
    };

    const allInvoices = invoicesResponse?.data || [];

    const getStatusStyles = (status) => {
        switch (status) {
            case 'Paid':
            case 'Completed':
                return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'Draft':
                return 'bg-slate-100 text-slate-600 border-slate-200';
            case 'Unpaid':
                return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'Overdue':
                return 'bg-red-50 text-red-600 border-red-100';
            default:
                return 'bg-blue-50 text-blue-600 border-blue-100';
        }
    };

    const getCurrencySymbol = (code) => {
        const symbols = { 'INR': '₹', 'USD': '$', 'EUR': '€', 'GBP': '£' };
        return symbols[code] || '$';
    };

    const filteredInvoices = allInvoices.filter(inv => 
        inv.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.customer?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.customer?.businessName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#fcfcfd] p-4 sm:p-6 lg:p-10 font-sans w-full overflow-hidden">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate(-1)}
                        className="p-3 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-[#145be9] hover:bg-blue-50 hover:border-blue-100 transition-all shadow-sm group"
                        title="Go Back"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-[2rem] font-black tracking-tight text-[#1a2b4b] mb-1">
                            Invoice Records
                        </h1>
                        <p className="text-slate-400 font-medium text-sm">
                            Manage and track all your architectural billing documents in one place.
                        </p>
                    </div>
                </div>
                <button 
                    onClick={() => navigate('/dashboard/invoice')}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#0557cc] hover:bg-[#0449ad] shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    CREATE NEW INVOICE
                </button>
            </div>

            {/* Navigation & Search Area */}
            <div className="bg-white rounded-3xl sm:rounded-[2.5rem] p-4 sm:p-6 lg:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-slate-50 mb-6 sm:mb-8">
                <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
                    <div className="relative w-full lg:max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-slate-300" />
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by ID or Client name..."
                            className="w-full pl-12 pr-5 py-4 bg-[#f8fafc] rounded-2xl text-[14px] font-bold text-[#1a2b4b] border-none focus:ring-2 focus:ring-[#145be9]/10 outline-none transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-4 w-full lg:w-auto">
                        <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-white border border-slate-100 rounded-2xl text-sm font-black text-slate-500 hover:bg-slate-50 transition-all">
                            <Filter className="w-4 h-4" />
                            FILTERS
                        </button>
                        <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-white border border-slate-100 rounded-2xl text-sm font-black text-slate-500 hover:bg-slate-50 transition-all">
                            <Download className="w-4 h-4" />
                            EXPORT
                        </button>
                    </div>
                </div>
            </div>

            {/* List Table */}
            <div className="bg-white rounded-3xl sm:rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-50 overflow-hidden">
                <div className="hidden lg:grid grid-cols-12 bg-[#eef4ff] px-10 py-5 border-b border-blue-100/50 items-center">
                    <div className="col-span-2 text-[10px] font-black text-[#145be9] uppercase tracking-widest pl-2">Invoice ID</div>
                    <div className="col-span-3 text-[10px] font-black text-[#145be9] uppercase tracking-widest">Client Name</div>
                    <div className="col-span-2 text-[10px] font-black text-[#145be9] uppercase tracking-widest text-left">Due Date</div>
                    <div className="col-span-2 text-[10px] font-black text-[#145be9] uppercase tracking-widest text-left">Amount</div>
                    <div className="col-span-1 text-[10px] font-black text-[#145be9] uppercase tracking-widest text-left">Status</div>
                    <div className="col-span-2 text-[10px] font-black text-[#145be9] uppercase tracking-widest text-right pr-4">Actions</div>
                </div>

                <div className="divide-y divide-slate-50">
                    {isLoading ? (
                        <div className="py-24 flex flex-col items-center justify-center text-center px-10">
                            <Loader2 className="w-12 h-12 text-[#145be9] animate-spin mb-4" />
                            <h3 className="text-xl font-black text-[#1a2b4b]">Synchronizing Invoices...</h3>
                        </div>
                    ) : filteredInvoices.length > 0 ? (
                        filteredInvoices.map((inv) => (
                            <div key={inv._id} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 px-5 sm:px-8 lg:px-10 py-6 lg:py-8 items-start lg:items-center group hover:bg-slate-50/50 transition-all gap-5 lg:gap-0 relative border-b border-slate-50 last:border-b-0">
                                {/* Mobile Label & ID */}
                                <div className="col-span-2 flex flex-col gap-1 pl-2">
                                    <span className="lg:hidden text-[9px] font-black text-[#145be9] uppercase tracking-widest">Invoice ID</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#145be9] font-black text-[10px] shadow-sm">
                                            #{inv.invoiceNumber.split('-').pop()}
                                        </div>
                                        <span className="text-[14px] font-black text-[#1a2b4b] tracking-tight">{inv.invoiceNumber}</span>
                                    </div>
                                </div>

                                {/* Client */}
                                <div className="col-span-3 flex flex-col gap-1">
                                    <span className="lg:hidden text-[9px] font-black text-[#145be9] uppercase tracking-widest">Client</span>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                                            <User className="w-4 h-4 text-slate-400" />
                                        </div>
                                        <span className="text-[15px] font-bold text-slate-600">{inv.customer?.businessName || inv.customer?.fullName || 'Untitled Client'}</span>
                                    </div>
                                </div>

                                {/* Due Date */}
                                <div className="col-span-2 flex flex-col lg:items-start gap-1">
                                    <span className="lg:hidden text-[9px] font-black text-[#145be9] uppercase tracking-widest">Due Date</span>
                                    <div className="flex items-center justify-center gap-2 text-slate-400 font-bold text-xs bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100/50">
                                        <Calendar className="w-3.5 h-3.5 text-[#145be9]/50" />
                                        {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : 'N/A'}
                                    </div>
                                </div>

                                {/* Amount */}
                                <div className="col-span-2 flex flex-col lg:items-start gap-1">
                                    <span className="lg:hidden text-[9px] font-black text-[#145be9] uppercase tracking-widest">Amount</span>
                                    <span className="text-[16px] font-black text-[#1a2b4b] tracking-tight">
                                        {getCurrencySymbol(inv.currency)}{inv.finalTotal?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>

                                {/* Status */}
                                <div className="col-span-1 flex flex-col lg:items-start gap-1">
                                    <span className="lg:hidden text-[9px] font-black text-[#145be9] uppercase tracking-widest">Status</span>
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusStyles(inv.status)}`}>
                                        {inv.status}
                                    </span>
                                </div>

                                {/* Actions */}
                                <div className="col-span-1 sm:col-span-2 flex items-center justify-start lg:justify-end gap-2.5 pt-4 lg:pt-0 lg:pr-4 w-full">
                                    <button 
                                        onClick={() => setSelectedInvoiceId(inv._id)}
                                        className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#145be9] hover:bg-blue-50 hover:border-blue-100 transition-all shadow-sm"
                                        title="View Invoice"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => navigate(`/dashboard/invoice/edit/${inv._id}`)}
                                        className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-500 hover:bg-blue-50 hover:border-blue-100 transition-all shadow-sm"
                                        title="Edit Invoice"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteRequest(inv._id, inv.invoiceNumber)}
                                        disabled={deleteMutation.isPending}
                                        className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all shadow-sm disabled:opacity-50"
                                        title="Delete Invoice"
                                    >
                                        {deleteMutation.isPending && deleteMutation.variables === inv._id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-24 flex flex-col items-center justify-center text-center px-10">
                            <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6">
                                <SearchX className="w-10 h-10 text-slate-200" />
                            </div>
                            <h3 className="text-xl font-black text-[#1a2b4b] mb-2">{searchTerm ? 'No results matching your quest' : 'No invoices generated yet'}</h3>
                            <p className="text-slate-400 font-medium max-w-sm">{searchTerm ? "We couldn't find any invoices matching your search. Try adjusting your keywords." : "Start by creating your first professional invoice today."}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Invoice Details Modal View */}
            {selectedInvoiceId && (
                <InvoiceDetailsModal 
                    invoiceId={selectedInvoiceId}
                    onClose={() => setSelectedInvoiceId(null)}
                />
            )}

            <Toast 
                show={toast.show}
                type={toast.type}
                message={toast.message}
                onClose={() => setToast(prev => ({ ...prev, show: false }))}
            />

            <ConfirmModal 
                show={confirmDelete.show}
                title="Delete Invoice?"
                message={`Are you sure you want to permanently delete invoice ${confirmDelete.number}? This action cannot be undone.`}
                confirmText="Delete Invoice"
                onConfirm={() => deleteMutation.mutate(confirmDelete.id)}
                onCancel={() => setConfirmDelete({ show: false, id: null, number: '' })}
                isLoading={deleteMutation.isPending}
            />
        </div>
    );
};

export default Invoices;
