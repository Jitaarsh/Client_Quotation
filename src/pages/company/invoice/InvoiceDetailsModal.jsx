import React, { useRef, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, Printer, Download, Loader2 } from 'lucide-react';
import invoiceApi from '../../../services/invoiceApi';
import useProfileStore from '../../../store/profileStore';
import useAuthStore from '../../../store/authStore';

const InvoiceDetailsModal = ({ invoiceId, onClose }) => {
    const printRef = useRef();

    const { settings } = useProfileStore();
    const { user } = useAuthStore();

    const { data: response, isLoading, error } = useQuery({
        queryKey: ['invoice', invoiceId],
        queryFn: () => invoiceApi.getInvoiceById(invoiceId),
        enabled: !!invoiceId,
    });

    const invoice = response?.data;

    const containerRef = useRef(null);
    const paperRef = useRef(null);
    const [scale, setScale] = useState(1);
    const [paperHeight, setPaperHeight] = useState(1131); // 800 * 1.414 ratio for A4

    useEffect(() => {
        const updateLayout = () => {
            if (containerRef.current) {
                const containerWidth = containerRef.current.clientWidth;
                // Fixed base width 800px, container padding 32px
                const targetScale = Math.min(1, (containerWidth - 32) / 800);
                setScale(targetScale);
            }
            if (paperRef.current) {
                setPaperHeight(paperRef.current.offsetHeight);
            }
        };

        const observer = new ResizeObserver(updateLayout);
        if (containerRef.current) observer.observe(containerRef.current);
        if (paperRef.current) observer.observe(paperRef.current);

        window.addEventListener('resize', updateLayout);
        // Initial call
        updateLayout();

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', updateLayout);
        };
    }, []);

    const handlePrint = () => {
        const printContent = printRef.current;
        const windowPrint = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
        
        // Include basic styles for printing
        windowPrint.document.write(`
            <html>
                <head>
                    <title>Invoice - ${invoice?.invoiceNumber}</title>
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            margin: 0; 
                            padding: 20px; 
                            color: #333;
                            -webkit-print-color-adjust: exact;
                        }
                        .invoice-box {
                            max-width: 800px;
                            margin: auto;
                            font-size: 14px;
                            line-height: 24px;
                        }
                        table { width: 100%; text-align: left; border-collapse: collapse; margin-top: 20px; }
                        table th, table td { padding: 8px; border-bottom: 1px solid #eee; }
                        table th { background: #f8f8f8; font-weight: bold; }
                        .text-right { text-align: right; }
                        .font-bold { font-weight: bold; }
                        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
                        .grid-2 { display: flex; justify-content: space-between; margin-bottom: 20px; }
                        .totals { width: 300px; float: right; margin-top: 20px; border-top: 2px solid #333; padding-top: 10px; }
                        .total-row { display: flex; justify-content: space-between; padding: 4px 0; }
                    </style>
                </head>
                <body>
                    ${printContent.innerHTML}
                </body>
            </html>
        `);
        windowPrint.document.close();
        windowPrint.focus();
        setTimeout(() => {
            windowPrint.print();
            windowPrint.close();
        }, 250);
    };

    if (!invoiceId) return null;

    const getCurrencySymbol = (code) => {
        const symbols = { 'INR': '₹', 'USD': '$', 'EUR': '€', 'GBP': '£' };
        return symbols[code] || '$';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto w-full h-full">
            {/* Modal Container */}
            <div className="relative w-full max-w-4xl bg-stone-100 rounded-none shadow-2xl flex flex-col max-h-[95vh] my-auto">
                
                {/* Header Actions */}
                <div className="flex items-center justify-between p-4 bg-white border-b border-stone-200 sticky top-0 z-10 print:hidden">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                        Invoice Preview
                        {invoice?.status && (
                            <span className={`px-2 py-0.5 rounded text-[10px] ${
                                invoice.status === 'Completed' || invoice.status === 'Paid' ? 'bg-green-100 text-green-800' :
                                invoice.status === 'Draft' ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                                {invoice.status}
                            </span>
                        )}
                    </h3>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={handlePrint}
                            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                            title="Print/Save as PDF"
                        >
                            <Printer className="w-5 h-5" />
                        </button>
                        {/* Currently download relies on print->save as pdf. Can expand later */}
                        <button 
                            onClick={onClose}
                            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors ml-2"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content Area (A4 Paper Simulation) */}
                <div ref={containerRef} className="flex-1 overflow-auto p-4 sm:p-8 bg-stone-100 flex flex-col items-center">
                    
                    <div style={{ width: 800 * scale, height: paperHeight * scale, position: 'relative' }}>
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center p-20 bg-white shadow-[0_0_15px_rgba(0,0,0,0.1)] absolute top-0 left-0 origin-top-left" style={{ width: '800px', minHeight: '1131px', transform: `scale(${scale})` }}>
                                <Loader2 className="w-10 h-10 text-slate-400 animate-spin mb-4" />
                                <p className="text-slate-500 font-medium">Loading Invoice...</p>
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center p-20 bg-white shadow-[0_0_15px_rgba(0,0,0,0.1)] text-red-500 absolute top-0 left-0 origin-top-left" style={{ width: '800px', minHeight: '1131px', transform: `scale(${scale})` }}>
                               <p>Error loading invoice.</p>
                            </div>
                        ) : (
                            <div 
                                ref={(el) => {
                                    printRef.current = el;
                                    paperRef.current = el;
                                }}
                                className="bg-white shadow-[0_0_15px_rgba(0,0,0,0.1)] text-black font-sans box-border absolute top-0 left-0 origin-top-left"
                                style={{ 
                                    width: '800px',
                                    minHeight: '1131px',
                                    padding: '40px',
                                    boxSizing: 'border-box',
                                    transform: `scale(${scale})`
                                }}
                            >
                            {/* Invoice Header */}
                            <div className="header" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #1a2b4b', paddingBottom: '20px', marginBottom: '30px' }}>
                                <div style={{ flex: 1 }}>
                                    {(invoice?.companyLogo || settings?.primaryLogo) && (
                                         <img src={invoice?.companyLogo || settings?.primaryLogo} alt="Logo" style={{ maxHeight: '60px', marginBottom: '15px' }} />
                                    )}
                                    <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#1a2b4b' }}>
                                        {user?.companyName || 'Your Company Name'}
                                    </h1>
                                    <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#555', whiteSpace: 'pre-wrap' }}>
                                        {user?.address ? 
                                            `${user.address}\n${user.city || ''}, ${user.state || ''} ${user.pincode || ''}` : 
                                            'Company Address Line 1\nCity, State, Zip'
                                        }
                                        <br/>
                                        GSTIN: {user?.gstNo || '-'}
                                    </p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <h2 style={{ margin: 0, fontSize: '36px', fontWeight: '900', color: '#e2e8f0', letterSpacing: '0.05em' }}>INVOICE</h2>
                                    <div style={{ marginTop: '20px', fontSize: '14px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '5px' }}>
                                            <span style={{ color: '#64748b', marginRight: '15px', fontWeight: 'bold' }}>Invoice No:</span>
                                            <span style={{ fontWeight: 'bold' }}>{invoice?.invoiceNumber}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '5px' }}>
                                            <span style={{ color: '#64748b', marginRight: '15px', fontWeight: 'bold' }}>Issue Date:</span>
                                            <span>{invoice?.issueDate ? new Date(invoice.issueDate).toLocaleDateString() : '-'}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <span style={{ color: '#64748b', marginRight: '15px', fontWeight: 'bold' }}>Due Date:</span>
                                            <span>{invoice?.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '-'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bill To Section */}
                            <div className="grid-2" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
                                <div style={{ maxWidth: '50%' }}>
                                    <h4 style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 'bold' }}>Bill To</h4>
                                    <p style={{ margin: 0, fontSize: '15px', fontWeight: 'bold', color: '#1a2b4b' }}>
                                        {invoice?.customer?.businessName || invoice?.customer?.fullName}
                                    </p>
                                    <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#475569' }}>
                                        {invoice?.customer?.fullName !== invoice?.customer?.businessName && invoice?.customer?.fullName ? `${invoice?.customer?.fullName}\n` : ''}
                                        {invoice?.customer?.address ? `${invoice.customer.address}, ` : ''}
                                        {invoice?.customer?.city ? `${invoice.customer.city}, ` : ''}
                                        {invoice?.customer?.state ? `${invoice.customer.state} ` : ''}
                                    </p>
                                    {invoice?.customer?.email && <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#475569' }}>Email: {invoice.customer.email}</p>}
                                    {invoice?.customer?.phone && <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#475569' }}>Phone: {invoice.customer.phone}</p>}
                                </div>
                            </div>

                            {/* Line Items Table */}
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px', fontSize: '13px' }}>
                                <thead>
                                    <tr>
                                        <th style={{ padding: '12px 10px', backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', borderTop: '2px solid #e2e8f0', textAlign: 'left', fontWeight: 'bold', color: '#334155', width: '50%' }}>Description</th>
                                        <th style={{ padding: '12px 10px', backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', borderTop: '2px solid #e2e8f0', textAlign: 'center', fontWeight: 'bold', color: '#334155' }}>Qty</th>
                                        <th style={{ padding: '12px 10px', backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', borderTop: '2px solid #e2e8f0', textAlign: 'right', fontWeight: 'bold', color: '#334155' }}>Price</th>
                                        <th style={{ padding: '12px 10px', backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', borderTop: '2px solid #e2e8f0', textAlign: 'right', fontWeight: 'bold', color: '#334155' }}>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoice?.items?.map((item, idx) => (
                                        <tr key={idx}>
                                            <td style={{ padding: '15px 10px', borderBottom: '1px solid #f1f5f9' }}>
                                                <div style={{ fontWeight: 'bold', color: '#1a2b4b' }}>{item.name}</div>
                                                {item.sku && <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>SKU: {item.sku}</div>}
                                            </td>
                                            <td style={{ padding: '15px 10px', borderBottom: '1px solid #f1f5f9', textAlign: 'center' }}>{item.qty}</td>
                                            <td style={{ padding: '15px 10px', borderBottom: '1px solid #f1f5f9', textAlign: 'right' }}>
                                                {getCurrencySymbol(invoice?.currency)}{item.price?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td style={{ padding: '15px 10px', borderBottom: '1px solid #f1f5f9', textAlign: 'right', fontWeight: 'bold' }}>
                                                {getCurrencySymbol(invoice?.currency)}{item.total?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Financial Summary */}
                            <div style={{ display: 'flex', justifySelf: 'flex-end', justifyContent: 'flex-end', marginBottom: '50px' }}>
                                <div className="totals" style={{ width: '350px' }}>
                                    <div className="total-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px' }}>
                                        <span style={{ color: '#475569' }}>Subtotal</span>
                                        <span style={{ fontWeight: 'bold' }}>{getCurrencySymbol(invoice?.currency)}{invoice?.subtotal?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="total-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px' }}>
                                        <span style={{ color: '#475569' }}>Tax</span>
                                        <span style={{ fontWeight: 'bold' }}>{getCurrencySymbol(invoice?.currency)}{invoice?.taxTotal?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    {invoice?.discountTotal > 0 && (
                                        <div className="total-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', color: '#059669' }}>
                                            <span>Discount</span>
                                            <span>-{getCurrencySymbol(invoice?.currency)}{invoice?.discountTotal?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    )}
                                    <div className="total-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 10px', marginTop: '10px', backgroundColor: '#f8fafc', borderTop: '2px solid #1a2b4b' }}>
                                        <span style={{ fontWeight: 'bold', color: '#1a2b4b', fontSize: '16px' }}>Grand Total</span>
                                        <span style={{ fontWeight: 'bold', color: '#1a2b4b', fontSize: '16px' }}>{getCurrencySymbol(invoice?.currency)}{invoice?.finalTotal?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Terms and Notes Footer */}
                            {(invoice?.internalNotes || settings?.paymentTerms) && (
                                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px', marginTop: 'auto' }}>
                                    {invoice?.internalNotes && (
                                        <div style={{ marginBottom: '20px' }}>
                                            <h4 style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 'bold' }}>Notes</h4>
                                            <p style={{ margin: 0, fontSize: '12px', color: '#475569', whiteSpace: 'pre-wrap' }}>{invoice.internalNotes}</p>
                                        </div>
                                    )}
                                    {settings?.paymentTerms && (
                                        <div>
                                            <h4 style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 'bold' }}>Payment Terms</h4>
                                            <p style={{ margin: 0, fontSize: '12px', color: '#475569' }}>{settings.paymentTerms}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>
                    )}
                    </div>
                </div>
            </div>
            
            {/* Click outside to close (invisible layer behind modal) */}
            <div className="fixed inset-0 z-[-1]" onClick={onClose} />
        </div>
    );
};

export default InvoiceDetailsModal;
