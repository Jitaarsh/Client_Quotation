import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Archive,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Package,
  Plus,
  Save,
  Trash2,
  User,
  X,
} from 'lucide-react';
import Footer from '../components/Footer';
import Simple from '../../pages/company/quotations/components/Simple';

const demoCustomer = {
  fullName: 'Demo Client Pvt Ltd',
  businessName: 'Demo Client Pvt Ltd',
  phone: '+91 98765 43210',
};

const demoProduct = {
  name: 'Demo Product',
  sku: 'DEMO-001',
  price: 2500,
};

const formatCurrency = (amount) =>
  `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const DemoQuotation = () => {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [lineItems, setLineItems] = useState([]);
  const [taxRate, setTaxRate] = useState(20);
  const [demoMessage, setDemoMessage] = useState('');
  const [demoQuotation, setDemoQuotation] = useState(null);

  const financials = useMemo(() => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.price * item.qty, 0);
    const taxTotal = subtotal * (taxRate / 100);

    return {
      subtotal,
      discountTotal: 0,
      taxTotal,
      finalTotal: subtotal + taxTotal,
    };
  }, [lineItems, taxRate]);

  const addDemoProduct = () => {
    setLineItems((items) => {
      const existingIndex = items.findIndex((item) => item.sku === demoProduct.sku);

      if (existingIndex === -1) {
        return [{ ...demoProduct, qty: 1 }];
      }

      return items.map((item, index) =>
        index === existingIndex ? { ...item, qty: item.qty + 1 } : item
      );
    });
  };

  const updateQty = (index, qty) => {
    setLineItems((items) =>
      items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, qty: Math.max(1, qty) } : item
      )
    );
  };

  const removeItem = (index) => {
    setLineItems((items) => items.filter((_, itemIndex) => itemIndex !== index));
  };

  const showDemoSaveMessage = () => {
    setDemoMessage('This is a demo - sign up to save real quotations.');
  };

  const createDemoQuotation = () => {
    const createdAt = new Date();
    const expiryDate = new Date(createdAt);
    expiryDate.setDate(expiryDate.getDate() + 30);

    setDemoQuotation({
      quotationNumber: '#DEMO-0001',
      createdAt,
      expiryDate,
      customer: {
        fullName: 'Demo Client',
        businessName: selectedCustomer?.businessName || 'Demo Client Pvt Ltd',
        email: 'demo@example.com',
      },
      items: lineItems.map((item) => ({
        name: item.name,
        sku: '',
        qty: item.qty,
        price: item.price,
        total: item.qty * item.price,
      })),
      subtotal: financials.subtotal,
      taxAmount: financials.taxTotal,
      finalTotal: financials.finalTotal,
      currency: 'INR',
    });
    setDemoMessage('');
    window.scrollTo(0, 0);
  };

  if (demoQuotation) {
    return (
      <div className="min-h-screen bg-[#f8fbff] font-sans overflow-x-hidden flex flex-col">
        <main className="flex-1">
          <section className="bg-[#eff5ff] px-6 py-8 lg:px-8">
            <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-[#145be9]">
                  Demo Preview
                </span>
                <h1 className="mt-3 text-3xl font-black text-[#1a2b4b] sm:text-4xl">
                  Simple Template
                </h1>
                <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500">
                  This template is rendered from in-memory demo data. Nothing has been saved.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDemoQuotation(null)}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#145be9] px-5 py-3 text-sm font-bold text-white shadow-md shadow-blue-500/20 transition-colors hover:bg-blue-700"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to edit
              </button>
            </div>
          </section>

          <section className="px-3 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl overflow-hidden rounded-2xl border border-gray-200 bg-white p-3 shadow-sm sm:p-6">
              <Simple quotation={demoQuotation} />
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fbff] font-sans overflow-x-hidden flex flex-col">
      <main className="flex-1">
        <section className="bg-[#eff5ff] px-6 py-10 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-[#145be9]">
                  Public Demo
                </span>
                <h1 className="mt-3 text-3xl font-black text-[#1a2b4b] sm:text-4xl">
                  Create Quotation
                </h1>
                <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500">
                  Try the quotation workflow with sample data. Nothing is saved or sent.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-bold text-[#1a2b4b] shadow-sm ring-1 ring-blue-100">
                <FileText className="h-4 w-4 text-[#145be9]" />
                Demo Quote
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-8 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[1fr_380px]">
            <div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6 font-sans relative">
                <div className="flex justify-between items-center mb-5">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-[#145be9]" />
                    <h2 className="text-[#1a2b4b] font-bold text-lg">Customer Selection</h2>
                  </div>
                </div>

                {selectedCustomer ? (
                  <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#145be9] rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {selectedCustomer.fullName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-[#1a2b4b] text-sm flex items-center gap-2">
                          {selectedCustomer.fullName}
                          <CheckCircle2 className="w-4 h-4 text-[#145be9]" />
                        </div>
                        <div className="text-xs text-gray-500 font-medium">
                          {selectedCustomer.businessName} • {selectedCustomer.phone}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedCustomer(null)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      aria-label="Clear selected customer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-6 text-center">
                    <p className="mb-4 text-sm font-medium text-gray-500">
                      No customer selected.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSelectedCustomer(demoCustomer)}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#145be9] px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-500/20 transition-colors hover:bg-blue-700"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Select Demo Client
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 font-sans relative">
                <div className="flex items-center gap-2 mb-5">
                  <Archive className="w-5 h-5 text-[#145be9]" />
                  <h2 className="text-[#1a2b4b] font-bold text-lg">Line Items</h2>
                </div>

                <div className="border border-gray-100 rounded-2xl p-4 mb-6 bg-white shadow-sm">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-[#145be9]">
                        <Package className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-[#1a2b4b] font-bold text-base">Product Selection</h3>
                        <p className="text-xs font-medium text-gray-500">
                          {demoProduct.name} - {formatCurrency(demoProduct.price)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={addDemoProduct}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#145be9] px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-500/20 transition-colors hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4" />
                      Add Product
                    </button>
                  </div>
                </div>

                {lineItems.length > 0 ? (
                  <div className="w-full overflow-x-auto">
                    <div className="min-w-[720px]">
                      <div className="grid grid-cols-[2fr_0.5fr_1fr_1fr_0.2fr] gap-4 mb-3 px-4">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Product / Service Description</div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Qty</div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Unit Price</div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Total</div>
                        <div className="w-5" />
                      </div>

                      <div className="space-y-2">
                        {lineItems.map((item, index) => (
                          <div key={item.sku} className="grid grid-cols-[2fr_0.5fr_1fr_1fr_0.2fr] gap-4 items-center bg-[#f8fafc] p-4 rounded-xl transition-all hover:shadow-sm hover:bg-[#f3f7ff]">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-white border border-blue-50 rounded-lg flex items-center justify-center text-blue-400">
                                <Package className="w-4 h-4" />
                              </div>
                              <div>
                                <h3 className="text-[#1a2b4b] font-bold text-sm mb-0.5">{item.name}</h3>
                                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-tighter">{item.sku}</p>
                              </div>
                            </div>
                            <div className="text-center">
                              <input
                                type="number"
                                min="1"
                                value={item.qty}
                                onChange={(event) => updateQty(index, parseInt(event.target.value, 10) || 1)}
                                className="w-full text-center bg-white border border-gray-100 rounded-lg py-1 font-bold text-[#145be9] text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                            <div className="text-right font-bold text-gray-700 text-sm">
                              {formatCurrency(item.price)}
                            </div>
                            <div className="text-right font-black text-[#1a2b4b] text-sm bg-white/50 px-2 py-1 rounded-lg border border-gray-100/50">
                              {formatCurrency(item.price * item.qty)}
                            </div>
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              className="text-gray-300 hover:text-red-500 transition-colors p-1"
                              aria-label="Remove product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border border-dashed border-gray-200 rounded-xl p-6 text-center bg-gray-50/50">
                    <p className="text-gray-500 text-sm font-medium">
                      No product selected. Add the demo product to start building the quote.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <aside>
              <div className="bg-[#eff3fc] rounded-2xl p-6 border border-gray-100 font-sans mb-6 shadow-sm xl:sticky xl:top-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-gray-500 font-bold text-[11px] uppercase tracking-widest">
                    Financial Summary
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tax:</span>
                    <input
                      type="number"
                      value={taxRate}
                      onChange={(event) => setTaxRate(parseFloat(event.target.value) || 0)}
                      className="w-12 bg-white border border-blue-100 rounded px-1.5 py-0.5 text-[11px] font-bold text-[#145be9] focus:outline-none"
                    />
                    <span className="text-[10px] font-bold text-gray-400">%</span>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 font-medium">Subtotal</span>
                    <span className="text-[#1a2b4b] font-bold">{formatCurrency(financials.subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#10b981] font-medium">Discount Total</span>
                    <span className="text-[#10b981] font-bold">-{formatCurrency(financials.discountTotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 font-medium">Estimated Tax ({taxRate}%)</span>
                    <span className="text-[#1a2b4b] font-bold">{formatCurrency(financials.taxTotal)}</span>
                  </div>
                </div>

                <div className="border-t border-gray-200/60 pt-4 flex justify-between items-end">
                  <span className="text-[#1a2b4b] font-black text-base">Total Amount</span>
                  <div className="text-right">
                    <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">INR Currency</div>
                    <div className="text-[#145be9] font-black text-2xl lg:text-3xl tracking-tight leading-none">
                      {formatCurrency(financials.finalTotal)}
                    </div>
                  </div>
                </div>

                {demoMessage && (
                  <div className="mt-5 rounded-xl border border-blue-100 bg-white p-4">
                    <p className="text-sm font-bold text-[#1a2b4b]">{demoMessage}</p>
                    <Link
                      to="/register"
                      className="mt-3 inline-flex items-center justify-center rounded-lg bg-[#145be9] px-4 py-2 text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-blue-700"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>

              <div className="grid gap-3">
                <button
                  type="button"
                  onClick={showDemoSaveMessage}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-[#145be9] bg-white px-5 py-3 text-sm font-bold text-[#145be9] transition-colors hover:bg-blue-50"
                >
                  <Save className="h-4 w-4" />
                  Save as Draft
                </button>
                <button
                  type="button"
                  onClick={createDemoQuotation}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#145be9] px-5 py-3 text-sm font-bold text-white shadow-md shadow-blue-500/20 transition-colors hover:bg-blue-700"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Create Quotation
                </button>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default DemoQuotation;
