import React, { useEffect, useState } from 'react';
import { AlertCircle, Building2, FileText, Loader2, ShieldCheck } from 'lucide-react';
import { getPublicCustomers } from '../../api/publicCustomersApi';
import Footer from '../components/Footer';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [companyCount, setCompanyCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        setLoadError('');
        const response = await getPublicCustomers();
        if (response.success) {
          setCustomers(response.data || []);
          setCompanyCount(response.count || 0);
        }
      } catch (err) {
        console.error('Error fetching public customers:', err);
        setLoadError('Customer showcase could not be loaded right now. Please try again shortly.');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  return (
    <div className="min-h-screen bg-[#fafcff] font-sans overflow-x-hidden flex flex-col">
      <main className="flex-1">
        <section className="px-6 py-16 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-6xl text-center">
            <span className="text-xs font-black uppercase tracking-widest text-[#145be9]">
              Customer Showcase
            </span>
            <h1 className="mx-auto mt-5 max-w-4xl text-4xl font-black leading-tight text-[#1a2b4b] sm:text-5xl lg:text-6xl">
              Trusted by {companyCount} companies
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base font-medium leading-8 text-slate-500 sm:text-lg">
              Teams use Quick Quote to create clearer quotation workflows and keep client proposals moving.
            </p>
          </div>
        </section>

        <section className="border-y border-gray-100 bg-white px-6 py-14 lg:px-8">
          <div className="mx-auto max-w-6xl">
            {loading ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-gray-100 bg-[#f8fbff] py-20 shadow-inner">
                <Loader2 className="h-12 w-12 animate-spin text-[#145be9]" />
                <p className="mt-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Loading Customers...
                </p>
              </div>
            ) : loadError ? (
              <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{loadError}</span>
              </div>
            ) : customers.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50/50 py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-blue-50 text-[#145be9]">
                  <Building2 className="h-8 w-8" />
                </div>
                <p className="text-lg font-bold text-gray-500">No customers to show yet</p>
                <p className="text-sm text-gray-400">Check back soon for customer activity.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {customers.map((customer, index) => (
                  <article
                    key={`${customer.companyName}-${index}`}
                    className="rounded-lg border border-slate-100 bg-[#fafcff] p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-blue-100 hover:shadow-md"
                  >
                    <div className="mb-5 flex items-start justify-between gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-[#145be9]">
                        <Building2 className="h-6 w-6" />
                      </div>
                      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-white px-3 py-1 text-[11px] font-black uppercase tracking-wider text-[#1a2b4b] ring-1 ring-slate-100">
                        <ShieldCheck className="h-3.5 w-3.5 text-[#145be9]" />
                        Trusted
                      </span>
                    </div>
                    <h2 className="text-xl font-black text-[#1a2b4b]">
                      {customer.companyName || 'Quick Quote Customer'}
                    </h2>
                    <div className="mt-4 flex items-center gap-2 text-sm font-bold text-slate-500">
                      <FileText className="h-4 w-4 text-[#145be9]" />
                      <span>
                        {customer.quotationCount} {customer.quotationCount === 1 ? 'quotation' : 'quotations'}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Customers;
