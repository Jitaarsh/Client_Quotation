import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import quotationApi from '../services/quotationApi';

const currencySymbols = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

const formatMoney = (amount = 0, currency = 'INR') => {
  const symbol = currencySymbols[currency] || currencySymbols.INR;
  return `${symbol}${Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const SelectCustomers = () => {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState([]);
  const [selected, setSelected] = useState([]);
  const [isSending, setIsSending] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['customerQuotations'],
    queryFn: quotationApi.getQuotations,
    retry: false,
    onSuccess: (result) => {
      if (Array.isArray(result)) setQuotations(result);
      else if (result?.data) setQuotations(result.data);
      else setQuotations([]);
    },
    onError: () => {
      setQuotations([]);
    },
  });

  useEffect(() => {
    if (Array.isArray(data)) setQuotations(data);
    else if (data?.data) setQuotations(data.data);
  }, [data]);

  const toggleSelect = (id) => {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const isAllSelected = quotations.length > 0 && selected.length === quotations.length;
  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelected([]);
    } else {
      setSelected(quotations.map((quotation) => quotation._id));
    }
  };

  const handleSubmit = async () => {
    if (selected.length === 0 || isSending) return;

    setIsSending(true);
    try {
      const response = await quotationApi.sendQuotationEmails(selected);
      const results = response?.data?.results || response?.results || [];
      const successCount = results.filter((item) => item.status === 'sent').length;
      const failedCount = results.length - successCount;

      if (successCount > 0) {
        toast.success(`${successCount} quotation PDF(s) sent successfully.`);
      }
      if (failedCount > 0) {
        toast.error(`${failedCount} quotation(s) could not be sent.`);
      }

      if (successCount > 0) {
        setSelected([]);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send selected quotation PDFs.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f6fb] px-4 py-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 text-xs font-black uppercase tracking-[0.3em] text-[#145be9]">Select Customers</div>
            <h1 className="text-3xl font-black tracking-tight text-[#1a2b4b]">Choose customers with quotations</h1>
            <p className="mt-3 max-w-2xl text-sm font-medium leading-relaxed text-slate-500">
              Select every quotation and submit your chosen customers in one click.
            </p>
          </div>

          <div className="flex flex-col gap-3 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 text-slate-700">
            <div className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Selected</div>
            <div className="text-3xl font-black text-[#145be9]">{selected.length}</div>
            <button
              type="button"
              onClick={toggleSelectAll}
              className="rounded-2xl bg-[#145be9] px-4 py-2 text-sm font-black text-white transition hover:bg-blue-700"
            >
              {isAllSelected ? 'Deselect All' : 'Select All'}
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex min-h-[280px] items-center justify-center rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <Loader2 className="h-12 w-12 animate-spin text-[#145be9]" />
          </div>
        ) : error ? (
          <div className="rounded-[2rem] border border-red-100 bg-red-50 p-8 text-center text-red-700 shadow-sm">
            <p className="mb-4 text-lg font-black">Unable to load quotations.</p>
            <p className="mb-6 text-sm">Please check your network or login status, then try again.</p>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="rounded-2xl bg-[#145be9] px-5 py-3 text-sm font-black text-white hover:bg-blue-700"
            >
              Return to Dashboard
            </button>
          </div>
        ) : quotations.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white px-8 py-16 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-[#145be9]">
              <Search className="h-7 w-7" />
            </div>
            <h2 className="mb-2 text-2xl font-black text-[#1a2b4b]">No quotations found</h2>
            <p className="mx-auto max-w-md text-sm font-medium leading-relaxed text-slate-500">
              You don’t have any saved quotations yet. Create one first and come back to select customers.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {quotations.map((quotation) => {
              const checked = selected.includes(quotation._id);
              const customerName = quotation.customer?.businessName || quotation.customer?.fullName || 'Unnamed Customer';

              return (
                <div
                  key={quotation._id}
                  className={`rounded-[1.75rem] border p-5 shadow-sm transition ${
                    checked ? 'border-blue-200 bg-blue-50' : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-start gap-4">
                      <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-black ${
                        checked ? 'bg-[#145be9] text-white' : 'bg-[#eef2fa] text-[#1a2b4b]'
                      }`}>
                        {customerName
                          .split(' ')
                          .map((part) => part[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">{quotation.quotationNumber || 'No ID'}</p>
                        <h3 className="truncate text-xl font-black text-[#1a2b4b]">{customerName}</h3>
                        <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-500">
                          {quotation.customer?.email && <span>{quotation.customer.email}</span>}
                          {quotation.customer?.phone && <span>{quotation.customer.phone}</span>}
                          <span>{quotation.items?.length || 0} items</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-black text-[#145be9]">{formatMoney(quotation.finalTotal, quotation.currency)}</p>
                        <p className="text-xs text-slate-400">{formatDate(quotation.createdAt)}</p>
                      </div>
                      <label className="flex cursor-pointer items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 shadow-sm">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleSelect(quotation._id)}
                          className="h-4 w-4 rounded border-gray-300 text-[#145be9] focus:ring-[#145be9]"
                        />
                        Select
                      </label>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="fixed bottom-6 right-6 z-50">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={selected.length === 0 || isSending}
          className={`rounded-2xl px-6 py-3 text-sm font-black text-white transition ${
            selected.length === 0 || isSending
              ? 'bg-slate-300 cursor-not-allowed'
              : 'bg-[#145be9] hover:bg-blue-700'
          }`}
        >
          {isSending ? `Sending... (${selected.length})` : `Submit (${selected.length})`}
        </button>
      </div>
    </div>
  );
};

export default SelectCustomers;
