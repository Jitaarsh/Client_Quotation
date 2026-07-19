import React, { useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Download, FileText, Loader2, XCircle } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import axios from 'axios';
import Simple from '../company/quotations/components/Simple';
import DualPageFormat from '../company/quotations/components/DualPageFormat';
import ThreePageDesign from '../company/quotations/components/3-PageDesign';
import Complete4PageFormat from '../company/quotations/components/Complete4-PageFormat';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const renderTemplateById = (templateId, quotation) => {
  const props = { isVertical: true, quotation };
  switch (templateId) {
    case 'simple':
      return <Simple {...props} />;
    case 'dual':
      return <DualPageFormat {...props} />;
    case 'threepage':
      return <ThreePageDesign {...props} />;
    case 'fourpage':
      return <Complete4PageFormat {...props} />;
    default:
      return <Simple {...props} />;
  }
};

const pageStyle = `
  @page {
    size: A4 portrait;
    margin: 0;
  }
  @media print {
    html, body {
      width: 210mm !important;
      height: auto !important;
      margin: 0 !important;
      padding: 0 !important;
      background-color: white !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .no-print {
      display: none !important;
    }
    .group\\/container, div[style*="transform"], div[style*="overflow"] {
      transform: none !important;
      box-shadow: none !important;
      margin: 0 auto !important;
      height: auto !important;
      overflow: visible !important;
    }
    div[class*="h-[8px]"] {
      display: none !important;
    }
  }
`;

const SharedQuotationPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const shouldAutoDownload = searchParams.get('download') === '1';
  const printRef = useRef(null);
  const queryClient = useQueryClient();

  const {
    data: quotationResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['shared-quotation', id, email],
    queryFn: async () => {
      const response = await axios.get(
        `${API_BASE}/company/quotation/public/${id}?email=${encodeURIComponent(email)}`
      );
      return response.data;
    },
    enabled: Boolean(id && email),
    retry: false,
  });

  const quotation = quotationResponse?.data;
  const templateId = quotation?.templateSettings?.templateId || 'simple';
  const responseStatus = quotation?.customerResponse?.status || 'Pending';

  const responseMutation = useMutation({
    mutationFn: async (action) => {
      const response = await axios.post(`${API_BASE}/company/quotation/public/${id}/respond`, {
        email,
        action,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shared-quotation', id, email] });
    },
  });

  const handleDownloadPdf = useReactToPrint({
    contentRef: printRef,
    documentTitle: `${quotation?.quotationNumber || 'Quotation'}_Export`,
    pageStyle,
  });

  useEffect(() => {
    if (quotation && shouldAutoDownload) {
      const timer = window.setTimeout(() => handleDownloadPdf(), 600);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [quotation, shouldAutoDownload, handleDownloadPdf]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#f3f6fb]">
        <Loader2 className="mb-4 h-12 w-12 animate-spin text-[#145be9]" />
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Loading quotation...</p>
      </div>
    );
  }

  if (error || !quotation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f3f6fb] p-6">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl">
          <FileText className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h1 className="text-2xl font-black text-[#1a2b4b]">Quotation unavailable</h1>
          <p className="mt-3 text-sm font-medium leading-relaxed text-slate-500">
            This shared quotation link is invalid or no longer available.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f6fb] font-sans">
      <div className="no-print sticky top-0 z-40 border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Shared Quotation
            </p>
            <h1 className="text-xl font-black tracking-tight text-[#1a2b4b]">
              {quotation.quotationNumber}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-black uppercase tracking-wider ${
                responseStatus === 'Accepted'
                  ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
                  : responseStatus === 'Rejected'
                    ? 'border-rose-100 bg-rose-50 text-rose-700'
                    : 'border-slate-200 bg-slate-50 text-slate-500'
              }`}
            >
              {responseStatus === 'Accepted' ? <CheckCircle2 className="h-4 w-4" /> : null}
              {responseStatus === 'Rejected' ? <XCircle className="h-4 w-4" /> : null}
              {responseStatus}
            </span>
            <button
              type="button"
              onClick={() => responseMutation.mutate('accept')}
              disabled={responseMutation.isPending}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <CheckCircle2 className="h-4 w-4" />
              Accept
            </button>
            <button
              type="button"
              onClick={() => responseMutation.mutate('reject')}
              disabled={responseMutation.isPending}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-rose-500/20 transition-all hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <XCircle className="h-4 w-4" />
              Reject
            </button>
            <button
              type="button"
              onClick={() => handleDownloadPdf()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#145be9] px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-700"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </button>
          </div>
        </div>
        {responseMutation.isError ? (
          <div className="mx-auto mt-3 max-w-6xl rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
            {responseMutation.error?.response?.data?.message || 'Unable to save your response. Please try again.'}
          </div>
        ) : null}
      </div>

      <div className="flex justify-center overflow-hidden p-4 lg:p-8">
        <div className="w-full max-w-[860px]" ref={printRef}>
          {renderTemplateById(templateId, quotation)}
        </div>
      </div>
    </div>
  );
};

export default SharedQuotationPage;
