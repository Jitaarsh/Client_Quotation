import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FileUp, ChevronDown, Plus,Eye, User, Search, CheckCircle2,Minus, X, Package, Archive, Trash2, ListPlus } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAuthStore from '../../../store/authStore';
import useProfileStore from '../../../store/profileStore';
import customerApi from '../../../services/customerApi';
import productApi from '../../../services/productApi';
import invoiceApi from '../../../services/invoiceApi';
import NotificationOverlay from '../createQuote/NotificationOverlay';
import { Loader2 } from 'lucide-react';

const CreateInvoice = () => {
    const { user } = useAuthStore();
    const { settings, fetchSettings } = useProfileStore();
    const navigate = useNavigate();
    const { id } = useParams();
    const queryClient = useQueryClient();
    const isEditMode = !!id;
    const fileInputRef = useRef(null);

    const [notification, setNotification] = useState({
        isOpen: false,
        type: 'success',
        title: '',
        message: '',
    });

    // Client Search State
    const [searchTerm, setSearchTerm] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    // Product Search State
    const [prodSearchTerm, setProdSearchTerm] = useState('');
    const [isProdDropdownOpen, setIsProdDropdownOpen] = useState(false);
    const [recentProducts, setRecentProducts] = useState([]);

    // Fetch Customers
    const { data: customersResponse, isLoading: isLoadingCustomers } = useQuery({
        queryKey: ['customers'],
        queryFn: customerApi.getCustomers
    });

    // Fetch Products
    const { data: productsResponse, isLoading: isLoadingProducts } = useQuery({
        queryKey: ['products'],
        queryFn: productApi.getProducts
    });
    
    // Fetch Invoice (for Edit Mode)
    const { data: invoiceResponse, isLoading: isLoadingInvoice } = useQuery({
        queryKey: ['invoice', id],
        queryFn: () => invoiceApi.getInvoiceById(id),
        enabled: isEditMode
    });

    const allCustomers = customersResponse?.data || [];
    const allProducts = productsResponse?.data || [];

    const filteredCustomers = allCustomers.filter(c => 
        c.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredProducts = allProducts.filter(p => 
        p.name?.toLowerCase().includes(prodSearchTerm.toLowerCase()) || 
        p.sku?.toLowerCase().includes(prodSearchTerm.toLowerCase())
    );

    // Currency Helper
    const getCurrencySymbol = (code) => {
        const symbols = {
            'INR': '₹',
            'USD': '$',
            'EUR': '€',
            'GBP': '£'
        };
        return symbols[code] || '$';
    };

    // Initial dummy data to match the screenshot provided
    const [formData, setFormData] = useState({
        invoiceNumber: 'INV-2024-0042',
        issueDate: '2024-10-24',
        dueDate: '2024-11-24',
        businessName: 'e.g. Creative Studio Lab',
        gstin: '22AAAAA0000A1Z5',
        address: '',
        email: '',
        phone: '',
        clientName: '',
        clientCompany: '',
        clientAddress: '',
        clientEmail: '',
        clientPhone: '',
        discountPercentage: 5,
        lineItems: [],
        financials: {
            subtotal: 0,
            tax: 0,
            discount: 0,
            grandTotal: 0
        },
        companyLogo: null,
    });

    const { lineItemsWithTotals, financials } = useMemo(() => {
        const lineItemsWithTotals = formData.lineItems.map(item => {
            const itemBase = item.qty * item.price;
            const itemTax = (itemBase * item.tax) / 100;
            const total = itemBase + itemTax;

            return { ...item, total };
        });

        const totals = formData.lineItems.reduce(
            (acc, item) => {
                const itemBase = item.qty * item.price;
                const itemTax = (itemBase * item.tax) / 100;

                return {
                    subtotal: acc.subtotal + itemBase,
                    tax: acc.tax + itemTax
                };
            },
            { subtotal: 0, tax: 0 }
        );

        const discount = (totals.subtotal * formData.discountPercentage) / 100;
        const grandTotal = totals.subtotal + totals.tax - discount;

        return {
            lineItemsWithTotals,
            financials: {
                subtotal: totals.subtotal,
                tax: totals.tax,
                discount,
                grandTotal
            }
        };
    }, [formData.lineItems, formData.discountPercentage]);

    // Determine Invoice Currency (based on first item or default)
    const invoiceCurrencyCode = formData.lineItems.length > 0 ? formData.lineItems[0].currency : 'USD';
    const currencySymbol = getCurrencySymbol(invoiceCurrencyCode);


    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleCustomerSelect = (customer) => {
        setSelectedCustomer(customer);
        setIsDropdownOpen(false);
        setSearchTerm('');

        // Format customer address (Customer model uses city/state/country)
        const parts = [
            customer.city,
            customer.state,
            customer.country
        ].filter(Boolean);

        const customerAddress = parts.join(', ');

        setFormData(prev => ({
            ...prev,
            clientName: customer.fullName,
            clientCompany: customer.businessName,
            clientEmail: customer.email,
            clientPhone: customer.phone,
            clientAddress: customerAddress
        }));
    };

    const handleRemoveCustomer = () => {
        setSelectedCustomer(null);
        setFormData(prev => ({
            ...prev,
            clientName: '',
            clientCompany: '',
            clientEmail: '',
            clientPhone: '',
            clientAddress: ''
        }));
    };
    
    // ── Logo Management ──────────────────────────────────────
    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                setNotification({
                    isOpen: true,
                    type: 'error',
                    title: 'File Too Large',
                    message: 'Please upload an image smaller than 2MB.',
                });
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, companyLogo: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveLogo = (e) => {
        e.stopPropagation();
        setFormData(prev => ({ ...prev, companyLogo: null }));
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // ── Product Management ───────────────────────────────────

    const getTierPrice = (product, qty) => {
        if (!product || !product.pricingTiers || product.pricingTiers.length === 0) {
            return product?.basePrice || 0;
        }

        // Sort tiers by minQty to ensure consistent selection
        const sortedTiers = [...product.pricingTiers].sort((a, b) => a.minQty - b.minQty);

        // 1. Find exact match within tiers
        const matchedTier = sortedTiers.find(
            tier => qty >= tier.minQty && (tier.maxQty === null || tier.maxQty === undefined || qty <= tier.maxQty)
        );
        
        if (matchedTier) return matchedTier.price;

        // 2. If qty exceeds the highest defined tier, use the highest tier's price
        const highestTier = sortedTiers[sortedTiers.length - 1];
        if (qty > highestTier.maxQty) {
            return highestTier.price;
        }

        return product.basePrice;
    };


    const handleProductSelect = (product) => {
        setIsProdDropdownOpen(false);
        setProdSearchTerm('');
        
        // Add to recent if not exists
        setRecentProducts(prev => {
            const filtered = prev.filter(p => p._id !== product._id);
            return [product, ...filtered].slice(0, 5);
        });

        // Check if already in lineItems
        const existingIndex = formData.lineItems.findIndex(item => item.product === product._id);
        
        if (existingIndex > -1) {
            const updatedItems = [...formData.lineItems];
            const newQty = updatedItems[existingIndex].qty + 1;
            const newPrice = getTierPrice(product, newQty);
            
            updatedItems[existingIndex].qty = newQty;
            updatedItems[existingIndex].price = newPrice;
            setFormData(prev => ({ ...prev, lineItems: updatedItems }));
        } else {
            const initialPrice = getTierPrice(product, 1);
            const newItem = {
                product: product._id,
                name: product.name,
                description: product.description || product.category || 'Standard Product',
                qty: 1,
                price: initialPrice,
                tax: product.taxRate || 18, // Default tax if not in product
                currency: product.currency || 'USD',
                total: 0 // Will be calculated by effect
            };
            setFormData(prev => ({ ...prev, lineItems: [...prev.lineItems, newItem] }));
        }
    };

    const handleUpdateItem = (index, field, value) => {
        const updatedItems = [...formData.lineItems];
        updatedItems[index][field] = value;

        // If quantity changed, check for new tier price
        if (field === 'qty') {
            const productData = allProducts.find(p => p._id === updatedItems[index].product);
            if (productData) {
                updatedItems[index].price = getTierPrice(productData, value);
            }
        }
        
        setFormData(prev => ({ ...prev, lineItems: updatedItems }));
    };


    const handleRemoveItem = (index) => {
        setFormData(prev => ({
            ...prev,
            lineItems: prev.lineItems.filter((_, i) => i !== index)
        }));
    };

    // ── Financial Calculation Engine ──────────────────────────

    // ── Submission Logic ─────────────────────────────────────

    const saveMutation = useMutation({
        mutationFn: ({ payload, status }) => {
            const finalPayload = { ...payload, status };
            if (isEditMode) {
                return invoiceApi.updateInvoice(id, finalPayload);
            }
            return invoiceApi.createInvoice(finalPayload);
        },
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            if (isEditMode) {
                queryClient.invalidateQueries({ queryKey: ['invoice', id] });
            }
            queryClient.invalidateQueries({ queryKey: ['profile-settings'] });

            setNotification({
                isOpen: true,
                type: 'success',
                title: isEditMode ? 'Invoice Updated!' : 'Invoice Created!',
                message: isEditMode 
                    ? `Invoice ${response.data.invoiceNumber} has been successfully updated.`
                    : `Invoice ${response.data.invoiceNumber} has been successfully saved.`,
            });
        },
        onError: (error) => {
            setNotification({
                isOpen: true,
                type: 'error',
                title: 'Submission Failed',
                message: error.response?.data?.message || 'Failed to save invoice. Please try again.',
            });
        }
    });

    const handleSaveInvoice = (status = 'Draft') => {
        if (!selectedCustomer) {
            setNotification({
                isOpen: true,
                type: 'error',
                title: 'Client Required',
                message: 'Please select a client before creating the invoice.',
            });
            return;
        }

        if (formData.lineItems.length === 0) {
            setNotification({
                isOpen: true,
                type: 'error',
                title: 'No Items',
                message: 'Add at least one product or service to the invoice.',
            });
            return;
        }

        const payload = {
            customer: selectedCustomer._id,
            issueDate: formData.issueDate,
            dueDate: formData.dueDate,
            items: lineItemsWithTotals.map(item => ({
                product: item.product,
                name: item.name,
                sku: item.sku || 'N/A',
                qty: item.qty,
                price: item.price,
                discount: item.discount || 0,
                total: item.total
            })),
            subtotal: financials.subtotal,
            discountTotal: financials.discount,
            taxTotal: financials.tax,
            finalTotal: financials.grandTotal,
            internalNotes: formData.internalNotes || '',
            currency: invoiceCurrencyCode,
            companyLogo: formData.companyLogo
        };

        saveMutation.mutate({ payload, status });
    };

    const closeNotification = () => {
        setNotification(prev => ({ ...prev, isOpen: false }));
        if (notification.type === 'success') {
            navigate('/dashboard/invoices');
        }
    };

    // ── Data Initialization ─────────────────────────────────

    // Fetch settings on mount
    useEffect(() => {
        if (!settings) {
            fetchSettings();
        }
    }, [settings, fetchSettings]);

    // Auto-populate from Zustand stores (Business Details)
    useEffect(() => {
        if (!user && !settings) {
            return;
        }

        const timeoutId = setTimeout(() => {
            const today = new Date().toISOString().split('T')[0];
            const nextMonth = new Date();
            nextMonth.setDate(nextMonth.getDate() + 30);
            const dueDate = nextMonth.toISOString().split('T')[0];

            setFormData(prev => ({
                ...prev,
                // Document Info (Apply logic only for NEW invoices)
                ...(!isEditMode ? {
                    invoiceNumber: settings 
                        ? `${settings.invoicePrefix}${settings.invoiceStartNumber}` 
                        : prev.invoiceNumber,
                    issueDate: today,
                    dueDate: dueDate,
                } : {}),

                // Business Details (Always from current user record)
                businessName: user?.companyName || prev.businessName,
                gstin: user?.gstNo || prev.gstin,
                email: user?.email || prev.email,
                phone: user?.phone || prev.phone,
                address: user?.address 
                    ? `${user.address}, \n${user.city || ''}, ${user.state || ''} ${user.pincode || ''}, ${user.country || ''}.`.replace(/,\s*,/g, ',').replace(/\n\s*,/g, '\n').trim()
                    : prev.address,
                companyLogo: settings?.primaryLogo || prev.companyLogo
            }));
        }, 0);

        return () => clearTimeout(timeoutId);
    }, [user, settings, isEditMode]);

    // Populate from fetched invoice (Edit Mode Only)
    useEffect(() => {
        if (!isEditMode || !invoiceResponse?.data?.customer) {
            return;
        }

        const timeoutId = setTimeout(() => {
            const inv = invoiceResponse.data;
            setSelectedCustomer(inv.customer);
            
            // Address formatting
            const parts = [
                inv.customer.city,
                inv.customer.state,
                inv.customer.country
            ].filter(Boolean);
            const customerAddress = parts.join(', ');

            setFormData(prev => ({
                ...prev,
                invoiceNumber: inv.invoiceNumber,
                issueDate: inv.issueDate ? new Date(inv.issueDate).toISOString().split('T')[0] : '',
                dueDate: inv.dueDate ? new Date(inv.dueDate).toISOString().split('T')[0] : '',
                clientName: inv.customer.fullName || '',
                clientCompany: inv.customer.businessName || '',
                clientEmail: inv.customer.email || '',
                clientPhone: inv.customer.phone || '',
                clientAddress: customerAddress,
                internalNotes: inv.internalNotes || '',
                discountPercentage: (inv.discountTotal / inv.subtotal) * 100 || 0,
                companyLogo: inv.companyLogo || null,
                lineItems: (inv.items || []).map(item => ({
                    product: item.product?._id || item.product,
                    name: item.name,
                    description: item.description || 'Standard Product',
                    qty: item.qty,
                    price: item.price,
                    tax: item.tax || 18,
                    currency: inv.currency || 'USD',
                    total: item.total
                }))
            }));
        }, 0);

        return () => clearTimeout(timeoutId);
    }, [isEditMode, invoiceResponse]);

    if (isEditMode && isLoadingInvoice) {
        return (
            <div className="min-h-screen bg-white p-6 lg:p-10 font-sans flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#145be9]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white p-6 lg:p-10 font-sans pb-24">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
                <div>
                  <h1 className="text-[#1a2b4b] text-[2rem] font-black tracking-tight leading-tight">
                    {isEditMode ? 'Edit Invoice' : 'Invoice Creation'}
                  </h1>
                  <p className="text-gray-500 text-sm font-medium hidden sm:block">
                    {isEditMode ? 'Modify existing invoice records and details.' : 'Generate a new professional invoice for your client.'}
                  </p>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
                    <button 
                        onClick={() => navigate('/dashboard/invoices')}
                        className="px-5 py-2.5 rounded-xl text-sm font-bold text-[#145be9] bg-[#dce9fe] hover:bg-[#cde0fe] transition-colors flex items-center gap-2 whitespace-nowrap"
                    >
                        <Eye className="w-4 h-4" />
                        View Invoices
                    </button>
                    <button 
                        disabled={saveMutation.isPending}
                        onClick={() => handleSaveInvoice('Draft')}
                        className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
                    >
                        {saveMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                        Save Draft
                    </button>
                    <button 
                        disabled={saveMutation.isPending}
                        onClick={() => handleSaveInvoice('Unpaid')}
                        className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[#0557cc] hover:bg-[#0449ad] shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50 whitespace-nowrap"
                    >
                        {saveMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isEditMode ? 'Update Invoice' : 'Review & Create'}
                    </button>
                </div>
            </div>

            {/* Meta Data Card (Horizontal) */}
            <div className="bg-[#f1f5ff]/50 rounded-[2rem] p-8 mb-8 border border-blue-50/50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">INVOICE NUMBER</label>
                        <input 
                            type="text" 
                            readOnly
                            value={formData.invoiceNumber}
                            className="w-full bg-white rounded-xl px-5 py-4 text-[15px] font-bold text-[#1a2b4b] border-none shadow-sm outline-none transition-all cursor-not-allowed"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">ISSUE DATE</label>
                        <input 
                            type="date" 
                            value={formData.issueDate}
                            onChange={(e) => handleInputChange('issueDate', e.target.value)}
                            className="w-full bg-white rounded-xl px-5 py-4 text-[15px] font-bold text-[#1a2b4b] border-none shadow-sm focus:ring-2 focus:ring-[#145be9]/20 outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">DUE DATE</label>
                        <input 
                            type="date" 
                            value={formData.dueDate}
                            onChange={(e) => handleInputChange('dueDate', e.target.value)}
                            className="w-full bg-white rounded-xl px-5 py-4 text-[15px] font-bold text-[#1a2b4b] border-none shadow-sm focus:ring-2 focus:ring-[#145be9]/20 outline-none transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Main Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                
                {/* Your Business Details Card */}
                <div className="bg-white rounded-[2.5rem] p-8 lg:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-50">
                    <h2 className="text-2xl font-black text-[#1a2b4b] mb-8">Your Business Details</h2>
                    
                    {/* Logo Placeholder */}
                    <div className="mb-8">
                        <input 
                            type="file" 
                            ref={fileInputRef}
                            onChange={handleLogoUpload}
                            accept="image/*"
                            className="hidden"
                        />
                        {formData.companyLogo ? (
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="group relative w-full h-32 border-2 border-slate-100 bg-[#f8fafc] rounded-2xl flex items-center justify-center overflow-hidden cursor-pointer hover:border-[#145be9]/30 transition-all"
                            >
                                <img 
                                    src={formData.companyLogo} 
                                    alt="Company Logo" 
                                    className="max-w-full max-h-full object-contain p-4"
                                />
                                <div className="absolute inset-0 bg-[#1a2b4b]/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <p className="text-white text-[10px] font-black uppercase tracking-widest">Change Logo</p>
                                </div>
                                <button
                                    onClick={handleRemoveLogo}
                                    className="absolute top-2 right-2 w-8 h-8 bg-white/90 hover:bg-white text-red-500 rounded-lg shadow-sm flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full h-20 border-2 border-dashed border-[#145be9]/30 bg-blue-50/10 rounded-2xl flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-blue-50/20 hover:border-[#145be9]/50 transition-all group"
                            >
                                <FileUp className="w-5 h-5 text-[#145be9] group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] font-black text-[#145be9] uppercase tracking-widest">Company Logo</span>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">BUSINESS NAME</label>
                            <input 
                                type="text" 
                                readOnly
                                placeholder="e.g. Creative Studio Lab"
                                value={formData.businessName}
                                className="w-full bg-[#f8fafc] rounded-xl px-5 py-3.5 text-[14px] font-bold text-[#1a2b4b] border-none outline-none cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">GSTIN / TAX ID</label>
                            <input 
                                type="text" 
                                readOnly
                                placeholder="22AAAAA0000A1Z5"
                                value={formData.gstin}
                                className="w-full bg-[#f8fafc] rounded-xl px-5 py-3.5 text-[14px] font-bold text-[#1a2b4b] border-none outline-none cursor-not-allowed"
                            />
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">ADDRESS</label>
                        <textarea 
                            rows="2"
                            readOnly
                            placeholder="Street name, Building, City, State, Zip"
                            value={formData.address}
                            className="w-full bg-[#f8fafc] rounded-xl px-5 py-3.5 text-[14px] font-bold text-[#1a2b4b] border-none outline-none resize-none cursor-not-allowed"
                        ></textarea>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">EMAIL ADDRESS</label>
                            <input 
                                type="email" 
                                readOnly
                                value={formData.email}
                                className="w-full bg-[#f8fafc] rounded-xl px-5 py-3.5 text-[14px] font-bold text-[#1a2b4b] border-none outline-none cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">PHONE NUMBER</label>
                            <input 
                                type="text" 
                                readOnly
                                value={formData.phone}
                                className="w-full bg-[#f8fafc] rounded-xl px-5 py-3.5 text-[14px] font-bold text-[#1a2b4b] border-none outline-none cursor-not-allowed"
                            />
                        </div>
                    </div>
                </div>

                {/* Client Recipient Card */}
                <div className="bg-white rounded-[2.5rem] p-8 lg:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-50">
                    <h2 className="text-2xl font-black text-[#1a2b4b] mb-8">Client Recipient</h2>
                    
                    <div className="mb-8 relative">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">SELECT EXISTING CLIENT</label>
                        
                        {!selectedCustomer ? (
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-[#145be9]/40" />
                                </div>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setIsDropdownOpen(true);
                                    }}
                                    onFocus={() => setIsDropdownOpen(true)}
                                    placeholder="Search by name, company or email..."
                                    className="w-full pl-12 pr-5 py-4 bg-[#f1f5ff] rounded-xl text-[14px] font-bold text-[#1a2b4b] placeholder-[#145be9]/30 border-none focus:ring-2 focus:ring-[#145be9]/20 outline-none transition-all"
                                />

                                {isDropdownOpen && searchTerm && (
                                    <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 max-h-64 overflow-y-auto overflow-x-hidden">
                                        {isLoadingCustomers ? (
                                            <div className="p-6 text-center text-slate-400 text-sm font-bold uppercase tracking-widest animate-pulse transition-all">Loading customers...</div>
                                        ) : filteredCustomers.length > 0 ? (
                                            filteredCustomers.map(c => (
                                                <div 
                                                    key={c._id}
                                                    onClick={() => handleCustomerSelect(c)}
                                                    className="p-5 hover:bg-[#f1f5ff] cursor-pointer border-b border-slate-50 last:border-0 transition-all group"
                                                >
                                                    <div className="font-black text-[#1a2b4b] text-[15px] group-hover:text-[#145be9] transition-colors">{c.fullName}</div>
                                                    <div className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">{c.businessName || 'Individual'} • {c.email}</div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-6 text-center text-slate-400 text-sm font-bold uppercase tracking-widest">No customers found</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-[#f0f4ff] border border-blue-100 rounded-2xl p-5 flex items-center justify-between animate-in fade-in zoom-in-95 duration-200">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-[#145be9] rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/20">
                                        {selectedCustomer.fullName.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-black text-[#1a2b4b] text-[16px] flex items-center gap-2">
                                            {selectedCustomer.fullName}
                                            <CheckCircle2 className="w-4 h-4 text-[#145be9]" />
                                        </div>
                                        <div className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                                            {selectedCustomer.businessName || 'Individual'} • {selectedCustomer.phone}
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={handleRemoveCustomer}
                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">CLIENT NAME</label>
                            <input 
                                type="text" 
                                placeholder="Contact Person Name"
                                value={formData.clientName}
                                onChange={(e) => handleInputChange('clientName', e.target.value)}
                                className="w-full bg-[#f8fafc] rounded-xl px-5 py-3.5 text-[14px] font-bold text-[#1a2b4b] border-none focus:ring-2 focus:ring-[#145be9]/20 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">COMPANY NAME</label>
                            <input 
                                type="text" 
                                placeholder="Legal Entity Name"
                                value={formData.clientCompany}
                                onChange={(e) => handleInputChange('clientCompany', e.target.value)}
                                className="w-full bg-[#f8fafc] rounded-xl px-5 py-3.5 text-[14px] font-bold text-[#1a2b4b] border-none focus:ring-2 focus:ring-[#145be9]/20 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">BILLING ADDRESS</label>
                        <textarea 
                            rows="2"
                            placeholder="Client's registered address"
                            value={formData.clientAddress}
                            onChange={(e) => handleInputChange('clientAddress', e.target.value)}
                            className="w-full bg-[#f8fafc] rounded-xl px-5 py-3.5 text-[14px] font-bold text-[#1a2b4b] border-none focus:ring-2 focus:ring-[#145be9]/20 outline-none transition-all resize-none"
                        ></textarea>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">CLIENT EMAIL</label>
                            <input 
                                type="email" 
                                placeholder='client@company.com'
                                value={formData.clientEmail}
                                onChange={(e) => handleInputChange('clientEmail', e.target.value)}
                                className="w-full bg-[#f8fafc] rounded-xl px-5 py-3.5 text-[14px] font-bold text-[#1a2b4b] border-none focus:ring-2 focus:ring-[#145be9]/20 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">CLIENT PHONE</label>
                            <input 
                                type="text" 
                                placeholder='+91 00000 00000'
                                value={formData.clientPhone}
                                onChange={(e) => handleInputChange('clientPhone', e.target.value)}
                                className="w-full bg-[#f8fafc] rounded-xl px-5 py-3.5 text-[14px] font-bold text-[#1a2b4b] border-none focus:ring-2 focus:ring-[#145be9]/20 outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Line Items & Sidebar Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8 mt-8">
                
                {/* Left Column (Table + Terms & Notes) */}
                <div className="lg:col-span-8 flex flex-col gap-8">
                    {/* Line Items Table */}
                    <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-50 flex flex-col min-h-[500px]">
                    {/* Table Header - Desktop Only */}
                    <div className="hidden lg:grid grid-cols-12 bg-[#eef4ff] px-8 py-4 border-b border-blue-100/50 rounded-t-[2.5rem] items-center">
                        <div className="col-span-5 text-[10px] font-black text-[#145be9] uppercase tracking-widest text-left pl-2">Product / Service</div>
                        <div className="col-span-7 grid grid-cols-7 gap-4">
                            <div className="col-span-1 text-[10px] font-black text-[#145be9] uppercase tracking-widest text-center">Qty</div>
                            <div className="col-span-2 text-[10px] font-black text-[#145be9] uppercase tracking-widest text-center">Price</div>
                            <div className="col-span-1 text-[10px] font-black text-[#145be9] uppercase tracking-widest text-center">Tax</div>
                            <div className="col-span-2 text-[10px] font-black text-[#145be9] uppercase tracking-widest text-right pr-4">Total</div>
                            <div className="col-span-1 text-[10px] font-black text-[#145be9] uppercase tracking-widest text-right pr-4">Act.</div>
                        </div>
                    </div>

                    <div className="flex-grow divide-y divide-slate-50">
                        {lineItemsWithTotals.length > 0 ? (
                            lineItemsWithTotals.map((item, index) => (
                                <div key={index} className="flex flex-col md:grid md:grid-cols-12 px-6 md:px-8 py-6 md:py-8 items-start md:items-center group transition-colors hover:bg-slate-50/50 gap-6 md:gap-0 relative">
                                    {/* Product / Service Name & Description */}
                                    <div className="md:col-span-12 lg:col-span-5 w-full pr-8">
                                        <h4 className="text-[17px] font-black text-[#1a2b4b] mb-1 leading-tight">{item.name}</h4>
                                        <p className="text-sm font-medium text-slate-400 max-w-full md:max-w-[320px] leading-relaxed line-clamp-2 md:line-clamp-none">{item.description}</p>
                                    </div>

                                    {/* Quantitative Data Row */}
                                    <div className="w-full md:col-span-12 lg:col-span-7 grid grid-cols-2 lg:grid-cols-7 items-center gap-y-6 gap-x-4 mt-4 lg:mt-0">
                                        {/* Qty */}
                                        <div className="flex flex-col items-center lg:items-start gap-1 col-span-1">
                                            <span className="lg:hidden text-[9px] font-black text-[#145be9] uppercase tracking-widest">Qty</span>
                                            <div className="flex items-center justify-center min-w-[90px] px-5 py-3">
                                                <input 
                                                    type="number"
                                                    value={item.qty}
                                                    onChange={(e) => handleUpdateItem(index, 'qty', Math.max(1, parseInt(e.target.value) || 0))}
                                                    className="bg-transparent text-[#1a2b4b] font-black text-[16px] w-full text-center border-none focus:ring-0 p-0 outline-none"
                                                />
                                            </div>
                                        </div>

                                        {/* Price */}
                                        <div className="flex flex-col items-center gap-1 col-span-1 lg:col-span-2">
                                            <span className="lg:hidden text-[9px] font-black text-[#145be9] uppercase tracking-widest">Price</span>
                                            <div className="flex items-center justify-center bg-transparent px-4 py-1.5 min-w-[100px]">
                                                <span className="text-slate-400 font-black text-[15px]">{getCurrencySymbol(item.currency)}</span>
                                                <span className="font-black text-[#1a2b4b] text-[17px] ml-1">
                                                    {item.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Tax */}
                                        <div className="flex flex-col items-center gap-1 col-span-1">
                                            <span className="lg:hidden text-[9px] font-black text-[#145be9] uppercase tracking-widest">Tax</span>
                                            <div className="flex items-center justify-center px-3 py-3 min-w-[70px]">
                                                <input 
                                                    type="number"
                                                    value={item.tax}
                                                    onChange={(e) => handleUpdateItem(index, 'tax', Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                                                    className="w-10 text-center bg-transparent text-[15px] font-black text-[#1a2b4b] border-none focus:ring-0 p-0 outline-none"
                                                />
                                                <span className="text-[11px] text-slate-400 font-black ml-0.5">%</span>
                                            </div>
                                        </div>

                                        {/* Total */}
                                        <div className="flex flex-col items-center lg:items-end gap-1 col-span-1 lg:col-span-2">
                                            <span className="lg:hidden text-[9px] font-black text-[#145be9] uppercase tracking-widest lg:text-right">Total</span>
                                            <div className="flex items-center justify-center lg:justify-end pr-2">
                                                <span className="text-[#1a2b4b] font-black text-[18px] tracking-tight whitespace-nowrap">
                                                    {getCurrencySymbol(item.currency)}{item.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Trash Action */}
                                        <div className="flex justify-center lg:justify-end col-span-2 lg:col-span-1 pt-2 lg:pt-0">
                                            <button 
                                                onClick={() => handleRemoveItem(index)}
                                                className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all group/btn shadow-sm"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-20 flex flex-col items-center justify-center text-center px-8">
                                <div className="w-16 h-16 bg-[#f1f5ff] rounded-[1.5rem] flex items-center justify-center mb-4">
                                    <Archive className="w-8 h-8 text-[#145be9]/30" />
                                </div>
                                <h3 className="text-lg font-black text-[#1a2b4b] mb-1">No Items Added</h3>
                                <p className="text-sm font-medium text-slate-400 max-w-[240px]">Search and select products below to start building your invoice ledger.</p>
                            </div>
                        )}
                    </div>

                    {/* Add Item Trigger Area */}
                    <div className="p-8 bg-[#f8fafc]/30 border-t border-slate-50 relative rounded-b-[2.5rem]">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-grow relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-[#145be9]/40" />
                                </div>
                                <input
                                    type="text"
                                    value={prodSearchTerm}
                                    onChange={(e) => {
                                        setProdSearchTerm(e.target.value);
                                        setIsProdDropdownOpen(true);
                                    }}
                                    onFocus={() => setIsProdDropdownOpen(true)}
                                    placeholder="Add Product (Search by name or SKU...)"
                                    className="w-full pl-12 pr-5 py-4 bg-white border-none rounded-2xl text-[14px] font-bold text-[#1a2b4b] placeholder-[#145be9]/30 shadow-sm focus:ring-2 focus:ring-[#145be9]/20 outline-none transition-all"
                                />

                                {isProdDropdownOpen && (prodSearchTerm || recentProducts.length > 0) && (
                                    <div className="absolute top-full left-0 w-full mt-3 bg-white border border-slate-100 rounded-[1.5rem] shadow-2xl z-50 max-h-72 overflow-y-auto overflow-x-hidden">
                                        {/* Recent Products Section */}
                                        {!prodSearchTerm && recentProducts.length > 0 && (
                                            <div className="p-4 bg-slate-50/50">
                                                <div className="flex items-center gap-2 mb-3 px-2">
                                                    <ListPlus className="w-4 h-4 text-[#145be9]" />
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recent Selection</span>
                                                </div>
                                                <div className="grid grid-cols-1 gap-2">
                                                    {recentProducts.map(p => (
                                                        <div 
                                                            key={p._id}
                                                            onClick={() => handleProductSelect(p)}
                                                            className="flex items-center justify-between p-3 bg-white rounded-xl hover:bg-[#f1f5ff] cursor-pointer border border-slate-100 transition-all group"
                                                        >
                                                            <div className="font-bold text-[#1a2b4b] text-sm group-hover:text-[#145be9]">{p.name}</div>
                                                            <div className="text-[11px] font-black text-slate-400 px-3 py-1 bg-slate-50 rounded-lg">{getCurrencySymbol(p.currency)}{p.basePrice}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="h-px bg-slate-100 my-4"></div>
                                            </div>
                                        )}

                                        {/* Search Results */}
                                        {prodSearchTerm && (
                                            <div className="p-2">
                                                {isLoadingProducts ? (
                                                    <div className="p-6 text-center text-slate-400 text-sm font-bold uppercase tracking-widest animate-pulse">Loading products...</div>
                                                ) : filteredProducts.length > 0 ? (
                                                    filteredProducts.map(p => (
                                                        <div 
                                                            key={p._id}
                                                            onClick={() => handleProductSelect(p)}
                                                            className="p-4 hover:bg-[#f1f5ff] cursor-pointer border-b border-slate-50 last:border-0 transition-all group flex items-center justify-between"
                                                        >
                                                            <div>
                                                                <div className="font-black text-[#1a2b4b] text-[15px] group-hover:text-[#145be9] transition-colors">{p.name}</div>
                                                                <div className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">SKU: {p.sku} • {p.category}</div>
                                                            </div>
                                                            <div className="text-sm font-black text-[#1a2b4b]">{getCurrencySymbol(p.currency)}{p.basePrice}</div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="p-10 text-center text-slate-400 text-sm font-bold uppercase tracking-widest">Product Not Found</div>
                                                )}
                                            </div>
                                        )}
                                        
                                        {!prodSearchTerm && recentProducts.length === 0 && (
                                            <div className="p-10 text-center text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Start typing to find products</div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <button 
                                onClick={() => setIsProdDropdownOpen(!isProdDropdownOpen)}
                                className="w-full sm:w-auto py-4 sm:py-0 px-8 bg-[#145be9] flex items-center justify-center text-white font-black text-[14px] rounded-2xl shadow-lg shadow-blue-500/20 hover:bg-[#1048b9] transition-all whitespace-nowrap"
                            >
                                <Plus className="w-5 h-5 text-white" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Terms & Notes (Below Table) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Payment Terms */}
                    <div className="bg-[#f8fafc] rounded-[2rem] p-8 md:p-10">
                        <h5 className="text-xl font-black text-[#1a2b4b] mb-6">Payment Terms</h5>
                        
                        <div className="mb-6 relative">
                            <button className="w-full bg-white flex items-center justify-between rounded-xl px-5 py-4 text-[14px] font-black text-[#1a2b4b] border border-transparent shadow-sm hover:border-blue-200 transition-all outline-none">
                                <span>Net 30 days</span>
                                <ChevronDown className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        <p className="text-[11px] font-medium text-slate-400 leading-relaxed italic">
                            * Late payments are subject to a 1.5% monthly interest fee as per standard architectural service agreements.
                        </p>
                    </div>

                    {/* Internal Notes */}
                    <div className="bg-[#f8fafc] rounded-[2rem] p-8 md:p-10 border border-transparent">
                        <h5 className="text-xl font-black text-[#1a2b4b] mb-6">Internal Notes</h5>
                        <textarea 
                            rows="5"
                            placeholder="Confidential notes for your team..."
                            className="w-full bg-white rounded-2xl px-6 py-5 text-[14px] font-medium text-[#1a2b4b] border border-transparent shadow-sm focus:ring-2 focus:ring-[#145be9]/10 outline-none transition-all resize-none min-h-[140px]"
                        ></textarea>
                    </div>
                </div>
            </div>

            {/* Right Column: Financials & Info */}
            <div className="lg:col-span-4 flex flex-col gap-6">
                    
                    {/* Final Calculation Card */}
                    <div className="bg-[#145be9] rounded-[2rem] p-8 text-white shadow-xl shadow-blue-500/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
                        
                        <div className="relative z-10">
                            <h5 className="text-[10px] font-black uppercase tracking-[0.25em] text-white/50 mb-6">Final Calculation</h5>
                            
                            <div className="flex items-center justify-between mb-8">
                                <p className="text-sm font-black text-white/70 leading-tight">Grand<br/>Total</p>
                                <p className="text-4xl lg:text-5xl font-black tracking-tight text-white">
                                    {currencySymbol}{financials.grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </p>
                            </div>

                            <div className="space-y-4 pt-6 border-t border-white/10">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-bold text-white/60">Subtotal</span>
                                    <span className="font-black">{currencySymbol}{financials.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-bold text-white/60">Tax Total</span>
                                    <span className="font-black">{currencySymbol}{financials.tax.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-white/60">Discount</span>
                                        <div className="flex items-center bg-white/10 rounded-xl px-2 py-1 gap-1 border border-white/5">
                                            <button 
                                                onClick={() => handleInputChange('discountPercentage', Math.max(0, formData.discountPercentage - 1))}
                                                className="w-5 h-5 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
                                            >
                                                <Minus className="w-3 h-3 text-white/70" />
                                            </button>
                                            <input 
                                                type="number"
                                                value={formData.discountPercentage}
                                                onChange={(e) => handleInputChange('discountPercentage', Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                                                className="w-7 bg-transparent border-none text-[12px] font-black text-white focus:ring-0 p-0 text-center outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            />
                                            <button 
                                                onClick={() => handleInputChange('discountPercentage', Math.min(100, formData.discountPercentage + 1))}
                                                className="w-5 h-5 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
                                            >
                                                <Plus className="w-3 h-3 text-white/70" />
                                            </button>
                                            <span className="text-[10px] text-white/30 font-black">%</span>
                                        </div>
                                    </div>
                                    <span className="font-black text-blue-200">-{currencySymbol}{financials.discount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Client Profile Card */}
                    <div className="bg-white rounded-[2rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-50">
                        <h5 className="text-[10px] font-black uppercase tracking-[0.25em] text-[#145be9] mb-6">Client Profile</h5>
                        
                        <div className="flex items-start gap-4 mb-8">
                            <div className="w-14 h-14 rounded-2xl bg-[#1a2b4b] overflow-hidden flex items-center justify-center text-white shrink-0 shadow-lg shadow-slate-900/10">
                                {formData.clientName ? (
                                    <span className="text-2xl font-black">{formData.clientName.charAt(0)}</span>
                                ) : (
                                    <User className="w-8 h-8 opacity-40" />
                                )}
                            </div>
                            <div>
                                <h6 className="text-xl font-black text-[#1a2b4b] leading-tight mb-1">
                                    {formData.clientCompany || "Client Organization"}
                                </h6>
                                <p className="text-xs font-bold text-slate-400">
                                    Lead: {formData.clientName || "Not Selected"}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4 pt-6 border-t border-slate-50">
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-slate-400">Active Projects</span>
                                <span className="font-black text-[#1a2b4b]">3</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-slate-400">Payment History</span>
                                <span className="font-black text-emerald-500 uppercase tracking-widest text-[10px]">Excellent</span>
                            </div>
                        </div>
                    </div>

                    {/* Attachment Card */}
                    <div className="bg-[#f8fafc]/50 rounded-[2rem] p-8 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 text-center transition-colors hover:bg-slate-50 group">
                        <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#145be9]/50 group-hover:text-[#145be9] transition-colors">
                            <FileUp className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-black text-[#1a2b4b] mb-1">Attach Blueprint PDFs</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Drag and drop files or click to browse</p>
                        </div>
                    </div>
                </div>
            </div>
            {/* Notification Overlay */}
            <NotificationOverlay
                isOpen={notification.isOpen}
                onClose={closeNotification}
                type={notification.type}
                title={notification.title}
                message={notification.message}
                isLoading={saveMutation.isPending}
            />
        </div>
    );
};

export default CreateInvoice;
