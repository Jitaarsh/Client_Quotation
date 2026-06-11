import React, { useMemo, useRef, useState } from 'react';
import { useNavigate, useOutletContext, useParams, useSearchParams, useLocation } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, Loader2, Mail } from 'lucide-react';
import CustomerSelectionCard from './CustomerSelectionCard';
import LineItemsCard from './LineItemsCard';
import FinancialSummaryCard from './FinancialSummaryCard';
import InternalNotesCard from './InternalNotesCard';
import NotificationOverlay from './NotificationOverlay';
import quotationApi from '../../../services/quotationApi';
import profileSettingsApi from '../../../services/profileSettingsApi';
import productApi from '../../../services/productApi';
import inquiryApi from '../../../services/inquiryApi';

const toFiniteNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const getTierPrice = (product, qty) => {
  const basePrice = toFiniteNumber(product?.basePrice, 0);

  if (!Array.isArray(product?.pricingTiers) || product.pricingTiers.length === 0) {
    return basePrice;
  }

  const sortedTiers = [...product.pricingTiers].sort(
    (a, b) => toFiniteNumber(a.minQty) - toFiniteNumber(b.minQty)
  );

  const matchedTier = sortedTiers.find((tier) => {
    const minQty = toFiniteNumber(tier.minQty);
    const maxQty = tier.maxQty === null || tier.maxQty === undefined
      ? Infinity
      : toFiniteNumber(tier.maxQty, Infinity);

    return qty >= minQty && qty <= maxQty;
  });

  return matchedTier ? toFiniteNumber(matchedTier.price, basePrice) : basePrice;
};

const CreateQuotation = () => {
  const { id } = useParams();
  const { isSidebarOpen } = useOutletContext();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(id);

  // Inquiry Conversion Data
  const inquiryId = location.state?.inquiryId;
  const inquiryData = location.state?.inquiryData;

  // Read template selection from URL (?template=dual etc.)
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('template') || 'simple';

  // Ref to capture the newly-created quotation ID for navigation after modal closes
  const savedQuotationIdRef = useRef(null);

  const [selectedCustomer, setSelectedCustomer] = useState();
  const [lineItems, setLineItems] = useState();
  const [internalNotes, setInternalNotes] = useState();
  const [taxRate, setTaxRate] = useState();
  const [notification, setNotification] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
  });

  const { data: quotationResponse, isLoading: isQuotationLoading } = useQuery({
    queryKey: ['quotation-edit', id],
    queryFn: () => quotationApi.getQuotationById(id),
    enabled: isEditMode,
  });

  const { data: settingsResponse } = useQuery({
    queryKey: ['profile-settings'],
    queryFn: () => profileSettingsApi.getSettings(),
  });

  const profileSettings = settingsResponse?.data;
  const initialQuotation = quotationResponse?.data;

  // ── Inquiry Pre-fill Logic ──────────────────────
  const { data: productsData } = useQuery({
    queryKey: ['products-lookup'],
    queryFn: () => productApi.getProducts(),
    enabled: !!inquiryData?.product
  });

  const inquiryLineItems = useMemo(() => {
    if (!inquiryData || isEditMode) return [];

    const products = Array.isArray(productsData?.data) ? productsData.data : [];
    const inquiryProductId =
      typeof inquiryData.product === 'object' ? inquiryData.product?._id : inquiryData.product;

    if (!inquiryProductId || products.length === 0) return [];

    const prod = products.find(p => String(p._id) === String(inquiryProductId));
    if (!prod) return [];

    const qty = Math.max(1, toFiniteNumber(inquiryData.quantity, 1));
    const price = getTierPrice(prod, qty);

    return [{
      product: prod._id,
      name: prod.name || 'Selected product',
      sku: prod.sku || 'N/A',
      qty,
      price,
      productImage: prod.productImage || '',
      discount: 0,
      total: price * qty
    }];
  }, [inquiryData, productsData, isEditMode]);

  const inquiryCustomer = useMemo(() => {
    if (!inquiryData?.customerName || isEditMode) return null;
    return { fullName: inquiryData.customerName, isInquiryLead: true };
  }, [inquiryData, isEditMode]);

  const initialLineItems = useMemo(
    () => {
      if (!initialQuotation) return inquiryLineItems;

      return (initialQuotation.items || []).map((item) => ({
        product: item.product?._id || item.product,
        name: item.name,
        sku: item.sku,
        qty: item.qty,
        price: item.price,
        productImage: item.productImage,
        discount: item.discount || 0,
        total: item.total,
      }));
    },
    [initialQuotation, inquiryLineItems]
  );

  const initialTaxRate = useMemo(() => {
    if (initialQuotation) {
      if (Number(initialQuotation.subtotal) > 0) {
        const derivedRate =
          (Number(initialQuotation.taxTotal || 0) / Number(initialQuotation.subtotal)) * 100;
        return Number.isFinite(derivedRate) ? Number(derivedRate.toFixed(2)) : 0;
      }
      return 0;
    }
    // New Quotation: Use profile default or fallback to 18
    return profileSettings?.defaultTaxRate ?? 18;
  }, [initialQuotation, profileSettings]);

  const activeCustomer =
    selectedCustomer === undefined ? initialQuotation?.customer || inquiryCustomer : selectedCustomer;
  const activeLineItems = lineItems === undefined ? initialLineItems : lineItems;
  const activeInternalNotes =
    internalNotes === undefined ? initialQuotation?.internalNotes || '' : internalNotes;
  const activeCurrency = initialQuotation?.currency || 'INR';
  const activeTaxRate = taxRate === undefined ? initialTaxRate : taxRate;

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, isOpen: false }));
    if (notification.type === 'success') {
      if (isEditMode) {
        // After editing, return to the hub for this specific quotation
        navigate(`/dashboard/quotation-preview/${id}`);
      } else {
        // After creating, go to the new quotation's hub
        const dest = savedQuotationIdRef.current
          ? `/dashboard/quotation-preview/${savedQuotationIdRef.current}`
          : '/dashboard/quotation-preview';
        navigate(dest);
      }
    }
  };

  const financials = useMemo(() => {
    const subtotal = activeLineItems.reduce((acc, item) => acc + (item.total || 0), 0);
    const discountTotal = activeLineItems.reduce((acc, item) => {
      const itemDiscount = item.price * item.qty * ((item.discount || 0) / 100);
      return acc + itemDiscount;
    }, 0);

    const taxTotal = subtotal * (activeTaxRate / 100);
    const finalTotal = subtotal + taxTotal;

    return {
      subtotal,
      discountTotal,
      taxTotal,
      finalTotal,
    };
  }, [activeLineItems, activeTaxRate]);

  const saveMutation = useMutation({
    mutationFn: ({ payload, status }) => {
      const finalPayload = { ...payload, status };
      return isEditMode
        ? quotationApi.updateQuotation(id, finalPayload)
        : quotationApi.createQuotation(finalPayload);
    },
    onSuccess: (response) => {
      // If conversion, update inquiry status
      if (inquiryId) {
        inquiryApi.updateInquiryStatus(inquiryId, 'Converted');
      }

      // Capture the new quotation's ID so closeNotification can navigate to its hub
      if (!isEditMode && response.data?._id) {
        savedQuotationIdRef.current = response.data._id;
      }
      // Invalidate quotations list to ensure fresh data on the preview page
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      // Invalidate profile settings to update the 'next' sequence number
      queryClient.invalidateQueries({ queryKey: ['profile-settings'] });

      setNotification({
        isOpen: true,
        type: 'success',
        title: isEditMode ? 'Quotation Updated!' : 'Quotation Created!',
        message: isEditMode
          ? `Reference ${response.data.quotationNumber} has been updated successfully.`
          : `Reference ${response.data.quotationNumber} has been successfully saved to your records.`,
      });
    },
    onError: (error) => {
      setNotification({
        isOpen: true,
        type: 'error',
        title: isEditMode ? 'Update Failed' : 'Draft Failed',
        message:
          error.response?.data?.message ||
          'We encountered an issue while saving your quotation. Please check your connection.',
      });
    },
  });

  const handleSaveQuotation = (status = 'Draft') => {
    if (!activeCustomer) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Customer Required',
        message: 'Please select a customer before proceeding with the quotation.',
      });
      return;
    }

    if (activeLineItems.length === 0) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'No Items Added',
        message: 'Your line items list is empty. Add at least one product or service.',
      });
      return;
    }

    const payload = {
      customer: activeCustomer._id,
      items: activeLineItems.map((item) => ({
        product: item.product,
        name: item.name,
        sku: item.sku,
        qty: item.qty,
        price: item.price,
        discount: item.discount,
        productImage: item.productImage,
        total: item.total,
      })),
      ...financials,
      internalNotes: activeInternalNotes,
      currency: activeCurrency,
      // Only attach templateSettings on creation (edit keeps whatever is saved in DB)
      ...(!isEditMode && { templateSettings: { templateId } }),
    };

    saveMutation.mutate({ payload, status });
  };

  if (isEditMode && isQuotationLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#f8fafc]">
        <Loader2 className="mb-4 h-12 w-12 animate-spin text-[#145be9]" />
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
          Loading quotation editor...
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f8fafc] p-4 font-sans lg:p-6 lg:pb-24">
      <div className="relative mb-6 flex flex-col items-start justify-between overflow-hidden rounded-2xl border border-blue-50/50 bg-[#eef2fa] p-6 shadow-sm sm:flex-row sm:items-center lg:p-8">
        <div className="relative z-10">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 sm:text-xs">
            <span>Quotations</span>
            <span>/</span>
            <span className="text-[#145be9]">{isEditMode ? 'Edit Draft' : 'New Draft'}</span>
          </div>
          <h1 className="mb-2 text-3xl font-black tracking-tight text-[#1a2b4b] lg:text-4xl">
            {isEditMode ? 'Edit Quotation' : 'Create Quotation'}
          </h1>
          <p className="text-sm font-medium text-gray-500">
            {isEditMode ? (
              <>Status: <span className="font-bold text-[#1a2b4b]">{quotationResponse?.data?.status || 'Editing'}</span></>
            ) : (
              <>Reference Preview: <span className="font-bold text-[#145be9]">{profileSettings ? `${profileSettings.quotePrefix}${profileSettings.quoteStartNumber}` : 'Loading...'}</span></>
            )}
          </p>
        </div>

        <div className="relative z-10 mt-4 sm:mt-0">
          <button
            disabled={saveMutation.isPending}
            onClick={() => handleSaveQuotation('Draft')}
            className="flex items-center gap-2 rounded-lg border border-gray-100 bg-white px-6 py-2.5 text-sm font-bold text-[#145be9] shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            {saveMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEditMode ? 'Update Draft' : 'Save as Draft'}
          </button>
        </div>
      </div>

      <div className="grid flex-grow grid-cols-1 gap-6 pb-20 xl:grid-cols-12">
        <div className="flex flex-col xl:col-span-8">
          <CustomerSelectionCard
            selectedCustomer={activeCustomer}
            setSelectedCustomer={setSelectedCustomer}
          />
          <LineItemsCard
            lineItems={activeLineItems}
            setLineItems={setLineItems}
            currency={activeCurrency}
          />
        </div>

        <div className="flex flex-col xl:col-span-4">
          <FinancialSummaryCard
            financials={financials}
            currency={activeCurrency}
            taxRate={activeTaxRate}
            setTaxRate={setTaxRate}
          />
          <InternalNotesCard notes={activeInternalNotes} setNotes={setInternalNotes} />
        </div>
      </div>

      <div
        className={`fixed bottom-0 right-0 z-50 flex flex-col items-center justify-between border-t border-gray-200 bg-white p-4 transition-all duration-300 sm:flex-row lg:px-8 ${
          isSidebarOpen ? 'lg:left-64' : 'left-0'
        }`}
      >
        <div className="mb-4 flex items-center gap-4 sm:mb-0">
          <button
            onClick={() => navigate('/dashboard/quotation-preview')}
            className="flex items-center gap-2 text-sm font-bold text-[#145be9] transition-colors hover:text-blue-800"
          >
            <Eye className="h-5 w-5" />
            <span>View/Preview</span>
          </button>
          <div className="h-6 w-px bg-gray-300" />
          <button className="flex items-center gap-2 text-sm font-bold text-[#145be9] transition-colors hover:text-blue-800">
            <Mail className="h-5 w-5" />
            <span>Send via Email</span>
          </button>
        </div>

        <div className="flex w-full items-center gap-4 sm:w-auto">
          <button
            onClick={() => navigate('/dashboard/quotation-preview')}
            className="flex-1 rounded-lg px-6 py-2.5 text-sm font-bold text-gray-500 transition-colors hover:text-gray-800 sm:flex-none"
          >
            Cancel
          </button>
          <button
            disabled={saveMutation.isPending}
            onClick={() => handleSaveQuotation('Sent')}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#145be9] px-8 py-2.5 text-sm font-bold text-white shadow-md transition-colors hover:bg-blue-800 disabled:opacity-50 sm:flex-none"
          >
            {saveMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEditMode ? 'Save Changes' : 'Create Quotation'}
          </button>
        </div>
      </div>

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

export default CreateQuotation;
