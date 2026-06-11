import React, { useState } from 'react';
import { 
    Filter, 
    UserPlus, 
    X, 
    MessageSquare, 
    ChevronDown, 
    ListPlus, 
    Upload, 
    Settings, 
    CheckCircle2, 
    AlertCircle,
    FileText,
    Download,
    Globe,
    Key,
    Activity,
    ChevronLeft,
    ChevronRight,
    Trash2
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import inquiryApi from '../../../services/inquiryApi';
import productApi from '../../../services/productApi';

const ManageInquiries = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // ── State ──────────────────────────────────────────
    const [selectedInquiry, setSelectedInquiry] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [inquiryToDelete, setInquiryToDelete] = useState(null);
    
    // Quick Add Form State
    const [formData, setFormData] = useState({
        customerName: '',
        projectName: '',
        contactPerson: '',
        product: '',
        quantity: '',
        priority: 'Medium',
        message: ''
    });

    // Dynamic Fields Config
    const [fieldConfig, setFieldConfig] = useState({
        projectName: true,
        contactPerson: true,
        priority: true,
        message: true
    });

    // Import State
    const [importType, setImportType] = useState('csv'); // 'csv' or 'api'
    const [importData, setImportData] = useState(null);
    const [mappings, setMappings] = useState({});
    const [importStep, setImportStep] = useState(1);
    
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    // API Fetcher State
    const [apiConfig, setApiConfig] = useState({
        url: '',
        token: ''
    });
    const [isFetching, setIsFetching] = useState(false);
    const [fetchError, setFetchError] = useState(null);

    // ── Queries ────────────────────────────────────────
    const { data: inquiriesResponse, isLoading: inquiriesLoading } = useQuery({
        queryKey: ['inquiries'],
        queryFn: inquiryApi.getInquiries
    });

    const { data: productsResponse } = useQuery({
        queryKey: ['products'],
        queryFn: productApi.getProducts
    });

    const inquiries = inquiriesResponse?.data || [];
    const products = productsResponse?.data || [];

    // ── Mutations ──────────────────────────────────────
    const addInquiryMutation = useMutation({
        mutationFn: inquiryApi.createInquiry,
        onSuccess: () => {
            queryClient.invalidateQueries(['inquiries']);
            setFormData({
                customerName: '',
                projectName: '',
                contactPerson: '',
                product: '',
                quantity: '',
                priority: 'Medium',
                message: ''
            });
        }
    });

    const bulkImportMutation = useMutation({
        mutationFn: inquiryApi.bulkCreateInquiries,
        onSuccess: () => {
            queryClient.invalidateQueries(['inquiries']);
            setIsImportModalOpen(false);
            setImportData(null);
            setMappings({});
            setImportStep(1);
        }
    });

    const deleteInquiryMutation = useMutation({
        mutationFn: inquiryApi.deleteInquiry,
        onSuccess: () => {
            queryClient.invalidateQueries(['inquiries']);
            setIsDeleteModalOpen(false);
            setInquiryToDelete(null);
        }
    });

    // ── Handlers ───────────────────────────────────────
    const handleQuickAdd = (e) => {
        e.preventDefault();
        addInquiryMutation.mutate(formData);
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    setImportData(results.data);
                    setImportStep(2);
                }
            });
        }
    };

    const handleApiFetch = async () => {
        setIsFetching(true);
        setFetchError(null);
        try {
            const response = await inquiryApi.fetchExternal(apiConfig.url, apiConfig.token);
            // Detect if response is an array or object with data array
            const data = Array.isArray(response.data) ? response.data : (response.data?.data || []);
            
            if (data.length === 0) throw new Error("No inquiry data found in API response.");
            
            setImportData(data);
            setImportStep(2);
        } catch (error) {
            setFetchError(error.response?.data?.message || error.message);
        } finally {
            setIsFetching(false);
        }
    };

    const executeImport = () => {
        const mappedData = importData.map(row => {
            const entry = {};
            Object.keys(mappings).forEach(dbField => {
                entry[dbField] = row[mappings[dbField]];
            });
            return entry;
        });
        bulkImportMutation.mutate(mappedData);
    };

    const downloadExampleCSV = () => {
        const headers = ["Customer Name", "Project Name", "Contact Person", "Quantity", "Priority", "Requirements"];
        const rows = [
            ["Skyline Architectural Group", "Emerald Plaza Phase II", "Sarah Jenkins", "450", "High", "Needs premium glass panels"],
            ["Metro Transit Authority", "Downtown Transit Hub", "Robert Chen", "1200", "Urgent", "Structural steel components"]
        ];
        
        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "inquiry_template.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleConvertToQuote = (inquiry) => {
        navigate('/dashboard/create-quotation', { 
            state: { 
                inquiryId: inquiry._id,
                inquiryData: {
                    customerName: inquiry.customerName,
                    projectName: inquiry.projectName,
                    product: inquiry.product?._id || inquiry.product,
                    quantity: inquiry.quantity
                }
            } 
        });
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Converted': return 'bg-[#e6fbd9] text-[#1f8b24]';
            case 'In Progress': return 'bg-[#dce9fe] text-[#145be9]';
            case 'New': return 'bg-[#fee2e2] text-[#ef4444]';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-10 font-sans">
        
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-[2.5rem] font-black tracking-tight text-[#1a2b4b]">
                        Manage Inquiries
                    </h1>
                    <p className="text-slate-400 font-medium">Track and convert architectural leads into business</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button 
                        onClick={() => setIsSettingsModalOpen(true)}
                        className="flex-1 sm:flex-none px-5 py-3 rounded-2xl text-sm font-bold text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                    >
                        <Settings className="w-4 h-4" />
                        Form Fields
                    </button>
                    <button 
                        onClick={() => { setIsImportModalOpen(true); setImportStep(1); }}
                        className="flex-1 sm:flex-none px-5 py-3 rounded-2xl text-sm font-bold text-[#145be9] bg-[#eef4ff] hover:bg-[#dce9fe] transition-colors flex items-center justify-center gap-2"
                    >
                        <Globe className="w-4 h-4" />
                        Connect API / Import
                    </button>
                    <button className="w-full sm:w-auto px-6 py-3 rounded-2xl text-sm font-bold text-white bg-[#0557cc] hover:bg-[#0449ad] shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2">
                        <UserPlus className="w-4 h-4" />
                        Manual Entry
                    </button>
                </div>
            </div>

            {/* Main Layout Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start relative">
                
                {/* Left Column: List + Quick Add */}
                <div className={`flex flex-col gap-8 transition-all duration-300 ${isSidebarOpen ? 'xl:col-span-8 order-2 xl:order-1' : 'xl:col-span-12 order-1'}`}>
                    
                    {/* Inquiries Table */}
                    <div className="bg-white rounded-[2.5rem] shadow-[0_8px_40px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden transition-all">
                        <div className="hidden xl:grid grid-cols-12 px-10 py-6 border-b border-slate-50 bg-[#f8fafc]/50 items-center">
                            <div className="col-span-12 xl:col-span-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Customer Entity</div>
                            <div className="hidden xl:block xl:col-span-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Received</div>
                            <div className="hidden xl:block xl:col-span-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</div>
                            <div className="hidden xl:block xl:col-span-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</div>
                        </div>

                        <div className="divide-y divide-slate-50">
                            {inquiriesLoading ? (
                                <div className="p-20 text-center text-slate-400 font-medium">Loading inquiries...</div>
                            ) : inquiries.length === 0 ? (
                                <div className="p-20 text-center text-slate-400 font-medium">No inquiries found. Start by adding one below or importing from API.</div>
                            ) : inquiries.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((inq) => (
                                <div key={inq._id} className="flex flex-col xl:grid xl:grid-cols-12 items-start xl:items-center px-8 xl:px-10 py-8 xl:py-6 gap-6 xl:gap-0 hover:bg-[#f8fafc]/80 transition-colors group relative">
                                    <div className="col-span-12 xl:col-span-5 flex items-center gap-5 w-full">
                                        <div className="w-14 h-14 min-w-[3.5rem] rounded-2xl bg-[#f0f5ff] flex items-center justify-center font-black text-xl text-[#145be9] shadow-inner font-serif italic">
                                            {inq.customerName?.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-black text-[#1a2b4b] text-[16px] group-hover:text-[#145be9] transition-colors line-clamp-1">{inq.customerName}</div>
                                            <div className="text-[12px] font-semibold text-slate-400 mt-0.5 line-clamp-1">Project: {inq.projectName || 'Unassigned'}</div>
                                        </div>
                                    </div>

                                    <div className="col-span-12 xl:col-span-2 flex flex-row xl:flex-col items-center xl:items-start justify-between xl:justify-start w-full gap-2">
                                        <div className="xl:hidden text-[10px] font-black text-slate-300 uppercase tracking-widest">Received</div>
                                        <div className="flex flex-col items-end xl:items-start">
                                            <div className="font-bold text-[#1a2b4b] text-[14px]">{new Date(inq.createdAt).toLocaleDateString()}</div>
                                            <div className="text-[11px] font-bold text-slate-400 mt-0.5">{new Date(inq.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                        </div>
                                    </div>

                                    <div className="col-span-12 xl:col-span-3 flex items-center justify-between xl:justify-start w-full gap-2">
                                        <div className="xl:hidden text-[10px] font-black text-slate-300 uppercase tracking-widest">Status</div>
                                        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider ${getStatusStyle(inq.status)} shadow-sm`}>
                                            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${inq.status === 'New' ? 'bg-[#ef4444]' : inq.status === 'In Progress' ? 'bg-[#145be9]' : 'bg-[#1f8b24]'}`}></span>
                                            {inq.status}
                                        </div>
                                    </div>

                                    <div className="col-span-12 xl:col-span-2 flex flex-row xl:justify-end w-full gap-3 pt-4 xl:pt-0 border-t border-slate-50 xl:border-none">
                                        <div className="flex-1 xl:flex-none">
                                            {inq.status === 'Converted' ? (
                                                <button 
                                                    onClick={() => { setSelectedInquiry(inq); setIsSidebarOpen(true); }}
                                                    className="w-full text-center xl:w-auto text-[#145be9] font-black text-xs uppercase tracking-widest hover:underline py-3 xl:py-0"
                                                >
                                                    View Record
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => handleConvertToQuote(inq)}
                                                    className="w-full xl:w-auto bg-[#1a2b4b] hover:bg-[#145be9] text-white px-5 py-3 xl:py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-md transition-all flex items-center justify-center gap-2"
                                                >
                                                    Convert to Quote
                                                </button>
                                            )}
                                        </div>
                                        <button 
                                            onClick={() => { setInquiryToDelete(inq); setIsDeleteModalOpen(true); }}
                                            className="p-3 xl:p-2.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all border border-slate-100 xl:border-transparent hover:border-rose-100"
                                            title="Delete Lead"
                                        >
                                            <Trash2 className="w-5 h-5 xl:w-4.5 xl:h-4.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}


                        {/* Pagination Controls */}
                        {inquiries.length > 0 && (
                            <div className="px-10 py-6 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between">
                                <div className="text-[12px] font-bold text-slate-400">
                                    Showing <span className="text-[#1a2b4b]">{(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, inquiries.length)}</span> of <span className="text-[#1a2b4b]">{inquiries.length}</span> records
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#145be9] hover:border-[#145be9] disabled:opacity-30 disabled:hover:text-slate-400 disabled:hover:border-slate-200 transition-all"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    
                                    {[...Array(Math.ceil(inquiries.length / itemsPerPage))].map((_, i) => (
                                        <button 
                                            key={i + 1}
                                            onClick={() => setCurrentPage(i + 1)}
                                            className={`w-10 h-10 rounded-xl font-black text-xs transition-all ${
                                                currentPage === i + 1 
                                                ? 'bg-[#145be9] text-white shadow-lg shadow-blue-500/20' 
                                                : 'text-slate-400 hover:text-[#1a2b4b] hover:bg-slate-100'
                                            }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}

                                    <button 
                                        disabled={currentPage === Math.ceil(inquiries.length / itemsPerPage)}
                                        onClick={() => setCurrentPage(prev => Math.min(Math.ceil(inquiries.length / itemsPerPage), prev + 1))}
                                        className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#145be9] hover:border-[#145be9] disabled:opacity-30 disabled:hover:text-slate-400 disabled:hover:border-slate-200 transition-all"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Add Form */}
                    <div className="bg-white rounded-[2.5rem] p-10 shadow-[0_8px_40px_rgba(0,0,0,0.03)] border border-slate-100">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-[#145be9] to-[#0557cc] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 shrink-0">
                                    <ListPlus className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-[#1a2b4b]">Quick Add Lead</h2>
                                    <p className="text-[13px] font-medium text-slate-400">Streamline your pipeline entry</p>
                                </div>
                            </div>
                            <button 
                                onClick={handleQuickAdd}
                                disabled={addInquiryMutation.isLoading}
                                className="w-full sm:w-auto bg-[#0557cc] hover:bg-[#0449ad] text-white px-10 py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-600/20 transition-all transform active:scale-95 disabled:opacity-50"
                            >
                                {addInquiryMutation.isLoading ? 'Adding...' : 'Add Lead'}
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-10">
                            <div className="space-y-8">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-3">CUSTOMER NAME</label>
                                    <input 
                                        value={formData.customerName}
                                        onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                                        type="text" 
                                        placeholder="Skyline Dynamics Inc."
                                        className="w-full bg-[#f8fafc] rounded-2xl px-6 py-4 text-[14px] font-bold text-[#1a2b4b] border border-slate-100 focus:bg-white focus:border-[#145be9] focus:ring-8 focus:ring-[#145be9]/5 outline-none transition-all placeholder-slate-300"
                                    />
                                </div>
                                {fieldConfig.projectName && (
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-3">PROJECT NAME</label>
                                        <input 
                                            value={formData.projectName}
                                            onChange={(e) => setFormData({...formData, projectName: e.target.value})}
                                            type="text" 
                                            placeholder="Emerald Plaza Phase II"
                                            className="w-full bg-[#f8fafc] rounded-2xl px-6 py-4 text-[14px] font-bold text-[#1a2b4b] border border-slate-100 focus:bg-white focus:border-[#145be9] focus:ring-8 focus:ring-[#145be9]/5 outline-none transition-all placeholder-slate-300"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-8">
                                {fieldConfig.contactPerson && (
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-3">CONTACT PERSON</label>
                                        <input 
                                            value={formData.contactPerson}
                                            onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                                            type="text" 
                                            placeholder="David R. Harrison"
                                            className="w-full bg-[#f8fafc] rounded-2xl px-6 py-4 text-[14px] font-bold text-[#1a2b4b] border border-slate-100 focus:bg-white focus:border-[#145be9] focus:ring-8 focus:ring-[#145be9]/5 outline-none transition-all placeholder-slate-300"
                                        />
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="col-span-1">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-3">QUANTITY</label>
                                        <input 
                                            value={formData.quantity}
                                            onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                                            type="number" 
                                            placeholder="0"
                                            className="w-full bg-[#f8fafc] rounded-2xl px-6 py-4 text-[14px] font-bold text-[#1a2b4b] border border-slate-100 focus:bg-white focus:border-[#145be9] focus:ring-8 focus:ring-[#145be9]/5 outline-none transition-all"
                                        />
                                    </div>
                                    {fieldConfig.priority && (
                                        <div className="col-span-1">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-3">PRIORITY</label>
                                            <select 
                                                value={formData.priority}
                                                onChange={(e) => setFormData({...formData, priority: e.target.value})}
                                                className="w-full bg-[#f8fafc] rounded-2xl px-5 py-4 text-[13px] font-bold text-[#1a2b4b] border border-slate-100 focus:bg-white focus:border-[#145be9] outline-none transition-all cursor-pointer"
                                            >
                                                <option>Medium</option>
                                                <option>High</option>
                                                <option>Urgent</option>
                                            </select>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-3">PRODUCT SELECTION</label>
                                    <div className="relative">
                                        <select 
                                            value={formData.product}
                                            onChange={(e) => setFormData({...formData, product: e.target.value})}
                                            className="w-full bg-[#f8fafc] rounded-2xl px-6 py-4 text-[14px] font-bold text-[#1a2b4b] border border-slate-100 appearance-none outline-none focus:bg-white focus:border-[#145be9] transition-all cursor-pointer"
                                        >
                                            <option value="">Select a product...</option>
                                            {products.map(p => (
                                                <option key={p._id} value={p._id}>{p.name}</option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                                            <ChevronDown className="w-4 h-4 text-slate-400" />
                                        </div>
                                    </div>
                                </div>
                                {fieldConfig.message && (
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-3">REQUIREMENTS</label>
                                        <textarea 
                                            value={formData.message}
                                            onChange={(e) => setFormData({...formData, message: e.target.value})}
                                            rows="1"
                                            placeholder="Special handling or deadlines..."
                                            className="w-full bg-[#f8fafc] rounded-2xl px-6 py-4 text-[14px] font-bold text-[#1a2b4b] border border-slate-100 focus:bg-white focus:border-[#145be9] focus:ring-8 focus:ring-[#145be9]/5 outline-none transition-all placeholder-slate-300 resize-none h-[58px]"
                                        ></textarea>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar / Inquiry Peek */}
                {isSidebarOpen && selectedInquiry && (
                    <div className="xl:col-span-4 bg-white xl:bg-white/50 backdrop-blur-xl rounded-[3rem] p-10 fixed inset-0 xl:relative z-[150] xl:z-0 xl:flex flex-col h-full shadow-[0_20px_50px_rgba(0,0,0,0.1)] xl:shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white/50 overflow-y-auto xl:overflow-visible">
                        <div className="flex justify-between items-start mb-10">
                            <div>
                                <h3 className="text-3xl font-black text-[#1a2b4b] mb-1">Inquiry Peek</h3>
                                <div className="text-[11px] font-black text-[#145be9] uppercase tracking-[0.3em] opacity-60">Insight Analysis</div>
                            </div>
                            <button 
                                onClick={() => setIsSidebarOpen(false)}
                                className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-slate-400 hover:text-rose-500 shadow-sm border border-slate-100 transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="bg-white rounded-[2rem] p-7 flex items-center gap-5 mb-8 shadow-sm border border-slate-50">
                            <div className="w-16 h-16 rounded-2xl bg-[#f0f5ff] flex items-center justify-center font-black text-2xl text-[#145be9]">
                                {selectedInquiry.customerName?.charAt(0)}
                            </div>
                            <div>
                                <div className="font-black text-[#1a2b4b] text-[18px] mb-0.5">{selectedInquiry.customerName}</div>
                                <div className="text-[13px] font-bold text-slate-400 leading-tight">Project: {selectedInquiry.projectName}</div>
                            </div>
                        </div>

                        <div className="space-y-8 mb-10">
                            <div className="flex items-center gap-10">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 opacity-50">QUANTITY</label>
                                    <div className="text-[17px] font-black text-[#1a2b4b]">{selectedInquiry.quantity || 0} Units</div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 opacity-50">PRIORITY</label>
                                    <div className={`text-[12px] font-black uppercase tracking-wider ${
                                        selectedInquiry.priority === 'Urgent' ? 'text-rose-600' : 'text-[#145be9]'
                                    }`}>{selectedInquiry.priority || 'Medium'}</div>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 opacity-50">PRODUCT INTENT</label>
                                <div className="bg-[#f0f5ff] rounded-2xl p-5 border-l-4 border-[#145be9]">
                                    <div className="font-black text-[#1a2b4b] text-[15px]">{selectedInquiry.product?.name || selectedInquiry.productName || 'N/A'}</div>
                                    <div className="text-[11px] font-bold text-[#145be9] mt-1 uppercase tracking-widest">Architectural Tier</div>
                                </div>
                            </div>

                            {selectedInquiry.message && (
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <MessageSquare className="w-4 h-4 text-slate-300" />
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-50">CLIENT MESSAGE</label>
                                    </div>
                                    <div className="bg-slate-50/80 rounded-[2rem] p-8 text-[14px] text-slate-500 font-medium leading-relaxed italic border border-slate-100">
                                        "{selectedInquiry.message}"
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-auto pt-8 flex flex-col gap-4">
                            {selectedInquiry.status !== 'Converted' && (
                                <button 
                                    onClick={() => handleConvertToQuote(selectedInquiry)}
                                    className="w-full bg-[#0557cc] hover:bg-[#0449ad] text-white py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-500/30 transition-all hover:-translate-y-1"
                                >
                                    Convert to Quotation
                                </button>
                            )}
                            <button className="w-full bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-widest transition-all">
                                Send Memo
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Combined Import Modal */}
            {isImportModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-slate-900/40 animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        
                        {/* Modal Header */}
                        <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h3 className="text-2xl font-black text-[#1a2b4b]">Import Bulk Data</h3>
                                <p className="text-sm font-medium text-slate-400">Fetch leads from CSV or External API</p>
                            </div>
                            <button onClick={() => setIsImportModalOpen(false)} className="w-10 h-10 rounded-xl hover:bg-slate-200 flex items-center justify-center text-slate-400 transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Body / Steps */}
                        <div className="flex-1 overflow-y-auto">
                            {importStep === 1 && (
                                <div className="p-10 flex flex-col items-center">
                                    {/* Tab Switcher */}
                                    <div className="flex p-1.5 bg-slate-100 rounded-2xl mb-12 w-full max-w-sm">
                                        <button 
                                            onClick={() => setImportType('csv')}
                                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${importType === 'csv' ? 'bg-white text-[#145be9] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                        >
                                            <FileText className="w-4 h-4" /> CSV File
                                        </button>
                                        <button 
                                            onClick={() => setImportType('api')}
                                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${importType === 'api' ? 'bg-white text-[#145be9] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                        >
                                            <Globe className="w-4 h-4" /> Connect API
                                        </button>
                                    </div>

                                    {/* CSV Content */}
                                    {importType === 'csv' ? (
                                        <div className="text-center w-full animate-in zoom-in-95 duration-200">
                                            <div className="w-24 h-24 bg-[#eef4ff] rounded-[2.5rem] flex items-center justify-center text-[#145be9] mx-auto mb-6">
                                                <Upload className="w-10 h-10" />
                                            </div>
                                            <h4 className="text-[20px] font-black text-[#1a2b4b] mb-2">Drop your CSV here</h4>
                                            <p className="text-slate-400 font-medium mb-8">Standard Comma Separated format</p>
                                            
                                            <div className="flex flex-col items-center gap-4">
                                                <input type="file" accept=".csv" onChange={handleFileUpload} id="csv-upload" className="hidden" />
                                                <label htmlFor="csv-upload" className="bg-[#145be9] hover:bg-[#0557cc] text-white px-12 py-4 rounded-2xl font-black text-sm uppercase tracking-widest cursor-pointer transition-all inline-block shadow-lg">
                                                    Select File
                                                </label>
                                                
                                                <button 
                                                    onClick={downloadExampleCSV}
                                                    className="text-[11px] font-black text-slate-400 hover:text-[#145be9] uppercase tracking-[0.2em] transition-colors flex items-center gap-2 mt-4"
                                                >
                                                    <Download className="w-3.5 h-3.5" />
                                                    Download Sample Template
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="w-full max-w-xl animate-in zoom-in-95 duration-200">
                                            <div className="space-y-6">
                                                <div>
                                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">API ENDPOINT URL</label>
                                                    <div className="relative">
                                                        <Globe className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                                        <input 
                                                            type="url"
                                                            value={apiConfig.url}
                                                            onChange={(e) => setApiConfig({...apiConfig, url: e.target.value})}
                                                            placeholder="https://your-website.com/api/inquiries"
                                                            className="w-full bg-[#f8fafc] rounded-2xl pl-14 pr-6 py-4 text-sm font-bold text-[#1a2b4b] border border-slate-100 outline-none focus:bg-white focus:border-[#145be9] transition-all"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">AUTHORIZATION TOKEN (OPTIONAL)</label>
                                                    <div className="relative">
                                                        <Key className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                                        <input 
                                                            type="password"
                                                            value={apiConfig.token}
                                                            onChange={(e) => setApiConfig({...apiConfig, token: e.target.value})}
                                                            placeholder="Bearer token or API Key"
                                                            className="w-full bg-[#f8fafc] rounded-2xl pl-14 pr-6 py-4 text-sm font-bold text-[#1a2b4b] border border-slate-100 outline-none focus:bg-white focus:border-[#145be9] transition-all"
                                                        />
                                                    </div>
                                                </div>
                                                
                                                {fetchError && (
                                                    <div className="p-4 bg-rose-50 rounded-xl border border-rose-100 flex items-center gap-3 text-rose-600 text-xs font-bold animate-in shake duration-300">
                                                        <AlertCircle className="w-4 h-4" />
                                                        {fetchError}
                                                    </div>
                                                )}

                                                <button 
                                                    onClick={handleApiFetch}
                                                    disabled={!apiConfig.url || isFetching}
                                                    className="w-full bg-[#145be9] hover:bg-[#0557cc] text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 transition-all"
                                                >
                                                    {isFetching ? (
                                                        <Activity className="w-5 h-5 animate-spin" />
                                                    ) : (
                                                        <CheckCircle2 className="w-5 h-5" />
                                                    )}
                                                    {isFetching ? 'Connecting & Fetching...' : 'Fetch External Data'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Step 2: Field Mapping */}
                            {importStep === 2 && (
                                <div className="p-10">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-black shadow-lg">2</div>
                                        <h4 className="text-xl font-black text-[#1a2b4b]">Configure Data Mapping</h4>
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-10 gap-y-6 bg-slate-50 rounded-[2.5rem] p-10 border border-slate-100">
                                        {[
                                            { id: 'customerName', label: 'Customer Name*', required: true },
                                            { id: 'projectName', label: 'Project Name' },
                                            { id: 'contactPerson', label: 'Contact Person' },
                                            { id: 'quantity', label: 'Quantity' },
                                            { id: 'message', label: 'Message' }
                                        ].map(field => (
                                            <div key={field.id}>
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 opacity-60">{field.label}</label>
                                                <select 
                                                    className="w-full bg-white rounded-2xl px-5 py-4 text-[13px] font-bold text-[#1a2b4b] border border-slate-200 outline-none focus:border-[#145be9] transition-all"
                                                    onChange={(e) => setMappings({...mappings, [field.id]: e.target.value})}
                                                >
                                                    <option value="">Do not import</option>
                                                    {Object.keys(importData[0] || {}).map(header => (
                                                        <option key={header} value={header}>{header}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-10 flex justify-end gap-5">
                                        <button onClick={() => setImportStep(1)} className="px-10 py-4 rounded-xl font-black text-xs uppercase tracking-widest text-slate-400 hover:text-[#1a2b4b] transition-colors">Back</button>
                                        <button 
                                            onClick={() => setImportStep(3)}
                                            className="bg-[#1a2b4b] text-white px-12 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg"
                                        >
                                            Preview Sync
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Final Confirmation */}
                            {importStep === 3 && (
                                <div className="p-10">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-black shadow-lg">3</div>
                                        <h4 className="text-xl font-black text-[#1a2b4b]">Live Preview</h4>
                                    </div>
                                    <div className="overflow-hidden rounded-[2rem] border border-slate-100 shadow-sm">
                                        <table className="w-full text-left text-sm border-collapse">
                                            <thead className="bg-[#f8fafc] border-b border-slate-100">
                                                <tr>
                                                    {Object.keys(mappings).map(f => <th key={f} className="px-8 py-5 font-black uppercase text-[10px] text-slate-400 tracking-widest">{f}</th>)}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50 bg-white">
                                                {importData.slice(0, 5).map((row, idx) => (
                                                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                                        {Object.keys(mappings).map(f => <td key={f} className="px-8 py-5 font-bold text-[#1a2b4b]">{row[mappings[f]] || '-'}</td>)}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="mt-12 flex items-center justify-between">
                                        <div className="text-[12px] font-bold text-slate-400">Total detected: <span className="text-[#145be9]">{importData.length} inquiries</span></div>
                                        <div className="flex gap-4">
                                            <button onClick={() => setImportStep(2)} className="px-10 py-4 rounded-xl font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">Adjust Mapping</button>
                                            <button 
                                                onClick={executeImport}
                                                disabled={bulkImportMutation.isLoading}
                                                className="bg-[#0557cc] text-white px-14 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-500/30 disabled:opacity-50 transition-all active:scale-95"
                                            >
                                                {bulkImportMutation.isLoading ? 'Processing...' : 'Complete Import'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Field Settings Modal */}
            {isSettingsModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-slate-900/40">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden p-10">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h3 className="text-2xl font-black text-[#1a2b4b]">Form Settings</h3>
                                <p className="text-sm font-medium text-slate-400">Toggle inquiry fields</p>
                            </div>
                            <button onClick={() => setIsSettingsModalOpen(false)} className="text-slate-400 hover:text-rose-500 transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="space-y-6 mb-10">
                            {[
                                { id: 'projectName', label: 'Project Name' },
                                { id: 'contactPerson', label: 'Contact Person' },
                                { id: 'priority', label: 'Priority' },
                                { id: 'message', label: 'Requirements / Message' }
                            ].map(field => (
                                <div key={field.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:border-[#145be9] transition-all">
                                    <span className="font-bold text-[#1a2b4b]">{field.label}</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            className="sr-only peer"
                                            checked={fieldConfig[field.id]}
                                            onChange={() => setFieldConfig({...fieldConfig, [field.id]: !fieldConfig[field.id]})}
                                        />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#145be9]"></div>
                                    </label>
                                </div>
                            ))}
                        </div>
                        <button 
                            onClick={() => setIsSettingsModalOpen(false)}
                            className="w-full bg-[#1a2b4b] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg transition-transform active:scale-95"
                        >
                            Save Preferences
                        </button>
                    </div>
                </div>
            )}

            <DeleteConfirmationModal 
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={() => deleteInquiryMutation.mutate(inquiryToDelete?._id)}
                inquiryName={inquiryToDelete?.customerName}
                isLoading={deleteInquiryMutation.isLoading}
            />
        </div>
    );
};

// ── Shared Components ────────────────────────────────

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, inquiryName, isLoading }) => {
    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 backdrop-blur-md bg-slate-900/40 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-10 text-center animate-in zoom-in-95 duration-200">
                <div className="w-20 h-20 bg-rose-50 rounded-[2.5rem] flex items-center justify-center text-rose-500 mx-auto mb-8 shadow-inner">
                    <AlertCircle className="w-10 h-10" />
                </div>
                
                <h3 className="text-2xl font-black text-[#1a2b4b] mb-3">Delete Inquiry?</h3>
                <p className="text-slate-400 font-medium mb-10 leading-relaxed">
                    You are about to remove <span className="text-[#1a2b4b] font-black">{inquiryName}</span>. This action cannot be undone. Are you sure?
                </p>
                
                <div className="flex flex-col gap-3">
                    <button 
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="w-full bg-rose-500 hover:bg-rose-600 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-rose-500/20 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {isLoading ? 'Deleting...' : 'Yes, Delete Record'}
                    </button>
                    <button 
                        onClick={onClose}
                        className="w-full py-4 text-slate-400 font-black text-xs uppercase tracking-widest hover:text-[#1a2b4b] transition-colors"
                    >
                        Keep This Lead
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ManageInquiries;
