import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import quotationApi from '../../../services/quotationApi';
import profileSettingsApi from '../../../services/profileSettingsApi';
import termsApi from '../../../services/termsApi';
import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Simple from './components/Simple';
import DualPageFormat from './components/DualPageFormat';
import ThreePageDesign from './components/3-PageDesign';
import Complete4PageFormat from './components/Complete4-PageFormat';
import Creative3PageDesign from './components/3-PageDesign-2';
import MinimalistDesign from './components/MinimalistDesign-3-page';
import InstitutionalDesign from './components/InstitutionalDesign-4-page';
import ElegantDesign from './components/ElegantDesign-simple-page';
import QuotationLimitModal from '../createQuote/QuotationLimitModal';
import useAuthStore from '../../../store/authStore';
import useCurrentUser from '../../../hooks/useCurrentUser';
import { FileText, Compass, Briefcase, ArrowLeft, ZoomOut, ZoomIn, Printer, Download, Layout, Square, Lock, GripVertical, ChevronDown, ChevronUp, Trash2, Plus, Loader2, CheckCircle2, Star } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import {
  renderCoverPage,
  renderItemsPage,
  CatalogPdfRenderer,
  renderCatalogsPage,
  renderSummaryPage,
  renderTermsPage,
  renderCompanyPage
} from './components/customPageRenderers';

if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).href;
}

// Icon Map for dynamic lookup
const ICON_MAP = {
  FileText: <FileText className="w-5 h-5" />,
  Compass: <Compass className="w-5 h-5" />,
  Briefcase: <Briefcase className="w-5 h-5" />,
  Layout: <Layout className="w-5 h-5" />,
  Square: <Square className="w-5 h-5" />,
};

const toCatalogueSource = (cataloguePdf) => {
  if (typeof cataloguePdf === 'string') return cataloguePdf;
  if (!cataloguePdf?.data || !cataloguePdf?.contentType) return '';
  return `data:${cataloguePdf.contentType};base64,${cataloguePdf.data}`;
};

const CustomLivePreview = ({ pages, quotation, companyInfo, themeColor }) => {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [catalogPages, setCatalogPages] = useState([]);
  const [catalogsLoading, setCatalogsLoading] = useState(false);
  const [catalogsError, setCatalogsError] = useState('');

  const hasCatalogsPage = pages.some(
    (page) => page.type === 'catalogs'
  );

  useEffect(() => {
    let cancelled = false;

    const loadCatalogPages = async () => {
      if (!hasCatalogsPage) {
        setCatalogPages([]);
        setCatalogsLoading(false);
        setCatalogsError('');
        return;
      }

      const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const catalogItems = (quotation.items || []).filter((item) => toCatalogueSource(item.cataloguePdf));
      if (catalogItems.length === 0) {
        setCatalogPages([]);
        setCatalogsLoading(false);
        setCatalogsError('No catalog PDF is attached.');
        return;
      }
      const renderedPages = [];
      setCatalogsLoading(true);
      setCatalogsError('');

      try {
        for (const [itemIndex, item] of catalogItems.entries()) {
          const catalogueSource = toCatalogueSource(item.cataloguePdf);
          const pdfUrl = /^https?:\/\//i.test(catalogueSource) || catalogueSource.startsWith('data:')
            ? catalogueSource
            : `${BASE_URL}/${catalogueSource}`;
          const pdf = await pdfjsLib.getDocument({ url: pdfUrl }).promise;

          for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
            const page = await pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale: 2 });
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;

            renderedPages.push({
              id: `${item.product || item.name || itemIndex}-${pageNum}`,
              itemName: item.name,
              pageNum,
              showHeader: pageNum === 1,
              dataUrl: canvas.toDataURL('image/png'),
            });
          }
        }

        if (!cancelled) setCatalogPages(renderedPages);
      } catch (error) {
        if (!cancelled) {
          setCatalogPages([]);
          setCatalogsError('The catalog PDF could not be loaded.');
        }
        console.error('Catalog PDF render error:', error);
      } finally {
        if (!cancelled) setCatalogsLoading(false);
      }
    };

    loadCatalogPages();
    return () => { cancelled = true; };
  }, [quotation.items, hasCatalogsPage]);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current && containerRef.current.parentElement) {
        const parentWidth = containerRef.current.parentElement.offsetWidth;
        const targetWidth = 794; 
        const newScale = (parentWidth - 32) / targetWidth;
        if (newScale < 1) {
          setScale(newScale);
        } else {
          setScale(1);
        }
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [pages]);

  const renderPage = (page) => {
    const resolvedConfig = {
      ...page.config,
      accentColor: page.config?.accentColor || themeColor || companyInfo.primaryColor,
    };

    switch (page.type) {
      case 'cover':
        return renderCoverPage(resolvedConfig, quotation, companyInfo);
      case 'items':
        return renderItemsPage(page.config, quotation);
      case 'catalogs':
        if (catalogsError) {
          return renderCatalogsPage({
            ...quotation,
            items: [],
          });
        }
        if (catalogsLoading || catalogPages.length === 0) return renderCatalogsPage(quotation);
        return catalogPages.map((catalogPage) => (
          <CatalogPdfRenderer key={catalogPage.id} {...catalogPage} />
        ));
      case 'summary':
        return renderSummaryPage(resolvedConfig, quotation);
      case 'terms':
        return renderTermsPage(resolvedConfig, quotation);
      case 'company':
        return renderCompanyPage(resolvedConfig, quotation, companyInfo);
      default:
        return null;
    }
  };

  const renderedPages = pages.flatMap((page) => {
    const rendered = renderPage(page);
    return Array.isArray(rendered) ? rendered : [rendered];
  });
  const numPages = renderedPages.length || 1;
  const unscaledPageHeight = 1122.5;
  const pageGap = 24; // Tailwind's gap-6 in the unscaled document wrapper
  const totalUnscaledHeight = (unscaledPageHeight * numPages) + (pageGap * Math.max(0, numPages - 1));

  return (
    <div 
      className="flex flex-col items-center justify-start w-full leading-normal"
      style={{ height: totalUnscaledHeight * scale, overflow: 'hidden' }}
    >
      <div 
        ref={containerRef}
        style={{ 
          width: '210mm', 
          height: `${totalUnscaledHeight}px`, 
          minWidth: '210mm',
          transform: `scale(${scale})`, 
          transformOrigin: 'top center',
        }}
        className="flex flex-col gap-6 shrink-0 relative overflow-hidden"
      >
        {renderedPages.map((renderedPage, index) => (
          <div key={`rendered-${index}`} className="relative w-full shadow-lg">
            {renderedPage}
            <div className="absolute bottom-[20px] left-0 right-0 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest pointer-events-none">
              PAGE {String(index + 1).padStart(2, '0')} — {String(numPages).padStart(2, '0')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const QuotationFormat = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const quoteId = searchParams.get('quoteId'); // present when changing template on existing quote
  const { user } = useAuthStore();
  const currentUserQuery = useCurrentUser();
  const queryClient = useQueryClient();
  const CUSTOM_CONFIG_STORAGE_KEY = 'customQuotationConfigDraft';
  const CUSTOM_THEME_COLOR_STORAGE_KEY = 'customQuotationThemeColorDraft';

  const [selectedFormat, setSelectedFormat] = useState('simple');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pdfUploadState, setPdfUploadState] = useState({});

  // Custom Builder state
  const [pages, setPages] = useState([]);
  const [themeColor, setThemeColor] = useState('#145be9');
  const [validationError, setValidationError] = useState('');
  const [savingDefault, setSavingDefault] = useState(false);
  const [isDefault, setIsDefault] = useState(false);

  const { data: quotationResponse } = useQuery({
    queryKey: ['quotation', quoteId],
    queryFn: () => quotationApi.getQuotationById(quoteId),
    enabled: Boolean(quoteId),
  });

  const EXISTING_COVER_TEMPLATES = [
    { id: 'simple', label: 'Simple' },
    { id: 'elegant', label: 'Elegant' },
    { id: 'creative', label: 'Creative' },
    { id: 'dual', label: 'Professional' },
    { id: 'inst', label: 'Institutional' },
    { id: 'minimal', label: 'Minimalist' },
  ];

  useEffect(() => {
    if (selectedFormat !== 'custom' || typeof window === 'undefined') return;

    const urlThemeColor = searchParams.get('themeColor');
    const storedThemeColor = window.sessionStorage.getItem(CUSTOM_THEME_COLOR_STORAGE_KEY);

    if (urlThemeColor) {
      setThemeColor(urlThemeColor);
      return;
    }

    if (storedThemeColor) {
      setThemeColor(storedThemeColor);
    }
  }, [selectedFormat, searchParams]);

  // Fetch company profile settings reactively
  const { data: settingsResponse } = useQuery({
    queryKey: ['profile-settings'],
    queryFn: () => profileSettingsApi.getSettings(),
  });
  const profileSettings = settingsResponse?.data;

  useEffect(() => {
    if (profileSettings) {
      setIsDefault(profileSettings.defaultTemplateId === selectedFormat);
    }
  }, [selectedFormat, profileSettings]);

  const handleSaveAsDefault = async () => {
    setSavingDefault(true);

    const payload = {
      defaultTemplateId: selectedFormat,
      defaultCustomConfig: selectedFormat === 'custom' ? { pages, themeColor } : null,
    };

    try {
      await profileSettingsApi.updateSettings(payload);
      setIsDefault(true);
      toast.success(`"${selectedFormat}" saved as your default template`);
      queryClient.invalidateQueries(['profile-settings']);
    } catch (err) {
      console.error(err);
      toast.error('Failed to save default template');
    } finally {
      setSavingDefault(false);
    }
  };

  // Fetch saved Terms & Conditions reactively
  const { data: termsResponse } = useQuery({
    queryKey: ['terms'],
    queryFn: () => termsApi.getAllTerms(),
  });
  const savedTermsList = termsResponse?.data || [];

  const companyInfo = {
    companyName: user?.companyName,
    ownerName: user?.ownerName,
    email: user?.email,
    address: [user?.address, user?.city, user?.state, user?.pincode, user?.country]
              .filter(Boolean).join(', '),
    phone: user?.phone,
    gstNo: user?.gstNo,
    logo: profileSettings?.primaryLogo 
          ? `http://localhost:5000/${profileSettings.primaryLogo}` 
          : null,
    primaryColor: profileSettings?.primaryColor || '#145be9'
  };

  useEffect(() => {
    if (profileSettings?.primaryColor && themeColor === '#145be9') {
      setThemeColor(profileSettings.primaryColor);
    }
  }, [profileSettings?.primaryColor, themeColor]);

  const handleThemeColorChange = (color) => {
    setThemeColor(color);
    setPages((prev) => prev.map((page) => {
      if (Object.prototype.hasOwnProperty.call(page.config, 'accentColor')) {
        return {
          ...page,
          config: {
            ...page.config,
            accentColor: color,
          },
        };
      }
      return page;
    }));

    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(CUSTOM_THEME_COLOR_STORAGE_KEY, color);
    }
  };

  const extractPdfText = async (file) => {
    const rawData = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: rawData }).promise;
    let fullText = '';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const lines = {};

      textContent.items.forEach((item) => {
        const y = Math.round((item.transform?.[5] || 0) / 2) * 2;
        if (!lines[y]) lines[y] = [];
        lines[y].push({ x: item.transform?.[4] || 0, text: String(item.str || '').trim() });
      });

      const sortedYs = Object.keys(lines)
        .map(Number)
        .sort((a, b) => b - a);

      let prevY = null;
      sortedYs.forEach((y) => {
        const lineText = lines[y]
          .sort((a, b) => a.x - b.x)
          .map((i) => i.text)
          .join(' ')
          .trim();

        if (!lineText) return;

        if (prevY !== null && prevY - y > 20) {
          fullText += '\n';
        }

        fullText += lineText + '\n';
        prevY = y;
      });

      if (pageNum < pdf.numPages) fullText += '\n';
    }

    return fullText.trim();
  };

  const handleTermsPdfUpload = async (pageId, file) => {
    if (!file) return;

    setPdfUploadState((prev) => ({
      ...prev,
      [pageId]: { isLoading: true, error: null },
    }));

    try {
      const extractedText = await extractPdfText(file);
      updatePageConfig(pageId, {
        termsPdfName: file.name,
        termsPdfText: extractedText,
      });
      setPdfUploadState((prev) => ({
        ...prev,
        [pageId]: { isLoading: false, error: null },
      }));
    } catch (error) {
      console.error('PDF extract error:', error);
      updatePageConfig(pageId, {
        termsPdfName: file.name,
        termsPdfText: '',
      });
      setPdfUploadState((prev) => ({
        ...prev,
        [pageId]: { isLoading: false, error: 'Unable to extract text from this PDF.' },
      }));
    }
  };

  const generateId = () => Math.random().toString(36).substring(2, 11);

  const addPage = (type) => {
    const id = generateId();
    let config = {};
    if (type === 'cover') {
      config = {
        logo: null,
        title: 'PRICE QUOTE',
        subtitle: '',
        accentColor: null,
        headerColor: '#1a2b4b',
        coverMode: 'custom',
        existingCoverTemplateId: 'dual',
      };
    } else if (type === 'items') {
      config = {
        headerBgColor: '#1a2b4b',
        showProductImages: false,
      };
    } else if (type === 'catalogs') {
      config = {};
    } else if (type === 'terms') {
      config = {
        termsSource: 'custom',
        termsText: '',
        termsId: '',
        termsPdfName: '',
        termsPdfText: '',
        sectionTitle: 'Terms & Conditions',
        accentColor: null,
      };
    } else if (type === 'summary') {
      config = {
        showSubtotal: true,
        showTaxRate: true,
        showShipping: false,
        shippingAmount: 0,
        accentColor: null,
      };
    } else if (type === 'company') {
      config = {
        accentColor: null,
      };
    }

    setPages([...pages, { id, type, config, isExpanded: true }]);
    setValidationError('');
  };

  const toggleExpand = (id) => {
    setPages(pages.map(p => p.id === id ? { ...p, isExpanded: !p.isExpanded } : p));
  };

  const movePage = (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === pages.length - 1) return;
    const newPages = [...pages];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newPages[index];
    newPages[index] = newPages[targetIndex];
    newPages[targetIndex] = temp;
    setPages(newPages);
  };

  const removePage = (id) => {
    setPages(pages.filter(p => p.id !== id));
  };

  const updatePageConfig = (id, newConfig) => {
    setPages(pages.map(p => p.id === id ? { ...p, config: { ...p.config, ...newConfig } } : p));
  };

  const handleLogoUpload = (id, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updatePageConfig(id, { logo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Mutation for change-mode: PATCH templateSettings
  const changeTemplateMutation = useMutation({
    mutationFn: (settings) =>
      quotationApi.updateTemplateSettings(quoteId, settings),
    onSuccess: () => {
      navigate(`/dashboard/quotation-preview/${quoteId}`);
    },
  });

  const handleUseTemplate = () => {
    if (selectedFormat === 'custom') {
      if (pages.length === 0) {
        setValidationError('Add at least one page before continuing.');
        return;
      }
      if (quoteId) {
        changeTemplateMutation.mutate({
          templateId: 'custom',
          customConfig: pages,
          themeColor,
        });
      } else {
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem(CUSTOM_CONFIG_STORAGE_KEY, JSON.stringify(pages));
          window.sessionStorage.setItem(CUSTOM_THEME_COLOR_STORAGE_KEY, themeColor);
        }
        navigate(`/dashboard/create-quotation?template=custom&themeColor=${encodeURIComponent(themeColor)}`, {
          state: { customConfig: pages, themeColor },
        });
      }
    } else {
      if (isSelectedTemplateLocked) {
        openTemplateLimitModal();
        return;
      }

      if (quoteId) {
        changeTemplateMutation.mutate({ templateId: selectedFormat });
      } else {
        navigate(`/dashboard/create-quotation?template=${selectedFormat}`);
      }
    }
  };

  // Fetch templates from backend
  const { data: templatesResponse, isLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: quotationApi.getTemplates,
  });

  const DEFAULT_FORMATS = [
    { templateId: 'simple', title: 'Simple', description: 'Clean, one-page minimal design.', icon: 'FileText', iconBg: 'bg-blue-50', pages: 1 },
    { templateId: 'dual', title: 'Dual Page', description: 'Sophisticated two-page layout.', icon: 'Compass', iconBg: 'bg-emerald-50', pages: 2 },
    { templateId: 'threepage', title: '3-Page Design', description: 'Complete proposal with T&C.', icon: 'Layout', iconBg: 'bg-amber-50', pages: 3 },
    { templateId: 'fourpage', title: 'Professional 4-Page', description: 'High-fidelity detailed format.', icon: 'Briefcase', iconBg: 'bg-indigo-50', pages: 4 },
    { templateId: 'creative', title: 'Creative Emerald 2-Page', description: 'Modern, high-contrast creative design.', icon: 'Layout', iconBg: 'bg-emerald-100', pages: 2 },
    { templateId: 'minimalist', title: 'Minimalist Bold', description: 'High-contrast monochrome design.', icon: 'Square', iconBg: 'bg-slate-100', pages: 3 },
    { templateId: 'institutional', title: 'Institutional Emerald', description: 'Premium 4-page corporate design.', icon: 'Briefcase', iconBg: 'bg-[#EBF0FF]', pages: 4 },
    { templateId: 'elegant', title: 'Elegant Serif', description: 'Sophisticated single-page quote.', icon: 'Compass', iconBg: 'bg-stone-100', pages: 1 },
    { templateId: 'custom', title: 'Custom Builder', description: 'Build your own layout page by page.', icon: 'Layout', iconBg: 'bg-purple-50', pages: null }
  ];

  const fetchedFormats = templatesResponse?.data || [];
  const formats = fetchedFormats.length > 0 ? [...fetchedFormats] : [...DEFAULT_FORMATS];
  const selectedFormatLabel = formats.find((f) => f.templateId === selectedFormat)?.title || selectedFormat;

  // Ensure creative, minimalist, institutional, elegant, and custom are always there
  ['creative', 'minimalist', 'institutional', 'elegant', 'custom'].forEach(id => {
    if (!formats.find(f => (f.templateId || f.id) === id)) {
      formats.push(DEFAULT_FORMATS.find(f => f.templateId === id));
    }
  });

  const selectedPlan = user?.selectedPlan;
  const isPlanObject = typeof selectedPlan === 'object' && selectedPlan !== null;
  const planName = isPlanObject ? selectedPlan.name : null;
  const rawTemplateLimit = isPlanObject
    ? selectedPlan.limitations?.numberOfTemplates
    : null;
  const maxTemplates = rawTemplateLimit === null || rawTemplateLimit === undefined
    ? Number.NaN
    : Number(rawTemplateLimit);
  const isPlanLoading = currentUserQuery.isLoading || currentUserQuery.isFetching;
  const shouldEnforceTemplateLimit =
    !isPlanLoading && planName === 'Starter' && Number.isFinite(maxTemplates) && maxTemplates !== -1;

  const isTemplateLocked = (index) => {
    const format = formats[index];
    if (format && format.templateId === 'custom') return false;
    return shouldEnforceTemplateLimit && index >= maxTemplates;
  };

  const selectedFormatIndex = formats.findIndex((format) => format.templateId === selectedFormat);
  const isSelectedTemplateLocked =
    selectedFormatIndex !== -1 && isTemplateLocked(selectedFormatIndex);

  const openTemplateLimitModal = () => {
    setIsLimitModalOpen(true);
  };

  const handleUpgradePlan = () => {
    setIsLimitModalOpen(false);
    navigate('/register');
  };

  const handleSelectFormat = (format, index) => {
    if (isTemplateLocked(index)) {
      openTemplateLimitModal();
      return;
    }

    setSelectedFormat(format.templateId);
  };

  // Template registry for dynamic rendering
  const MOCK_QUOTATION = {
    quotationNumber: '#STUDIO-2024-PREMIUM',
    createdAt: new Date(),
    customer: {
      fullName: 'Johnathan Wright',
      businessName: 'Global Innovation Labs',
      address: 'San Francisco, CA',
      email: 'john@innovation.lab'
    },
    items: [
      { name: 'Architectural Blueprinting', sku: 'Phase 1: Concepts', qty: 1, price: 4500, total: 4500, productImage: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=400&q=80', description: 'Technical blueprint and concept drawings for Phase 1 of the project. Includes full schematics, site planning documentation, and preliminary design renderings aligned with client specifications.' },
      { name: '3D Environmental Rendering', sku: 'Photorealistic Set', qty: 4, price: 850, total: 3400, productImage: 'https://images.unsplash.com/photo-1503387762-592dea58ef03?auto=format&fit=crop&w=400&q=80', description: 'High-fidelity photorealistic 3D render set for the project environment. Each render is delivered in 4K resolution with full lighting simulation, material textures, and post-production colour grading.' },
      { name: 'Structural Load Analysis', sku: 'Engineering Certification', qty: 1, price: 1200, total: 1200, productImage: 'https://images.unsplash.com/photo-1590069230002-70cc8386377e?auto=format&fit=crop&w=400&q=80', description: 'Certified structural load analysis report covering dead loads, live loads, seismic resistance, and wind load calculations. Produced by a licensed structural engineer per local building code requirements.' }
    ],
    subtotal: 9100,
    taxTotal: 910,
    finalTotal: 10010,
    currency: 'USD'
  };
  const previewQuotation = quoteId && quotationResponse?.data
    ? quotationResponse.data
    : MOCK_QUOTATION;

  const renderTemplate = (forceVertical = false) => {
    const props = { isVertical: forceVertical, quotation: MOCK_QUOTATION };
    switch (selectedFormat) {
      case 'simple':        return <Simple {...props} />;
      case 'dual':          return <DualPageFormat {...props} />;
      case 'threepage':     return <ThreePageDesign {...props} />;
      case 'fourpage':      return <Complete4PageFormat {...props} />;
      case 'creative':      return <Creative3PageDesign {...props} />;
      case 'minimalist':    return <MinimalistDesign {...props} />;
      case 'institutional': return <InstitutionalDesign {...props} />;
      case 'elegant':       return <ElegantDesign {...props} />;
      case 'custom':        return <CustomTemplate {...props} />;
      default:              return <Simple {...props} />;
    }
  };

  // Prevent double scrolling when preview is open
  React.useEffect(() => {
    if (isPreviewOpen) {
      document.body.style.overflow = 'hidden';
      setZoom(1); 
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isPreviewOpen]);

  const handleZoomOut = () => setZoom(prev => Math.max(0.6, prev - 0.1));
  const handleZoomIn = () => setZoom(prev => Math.min(1.5, prev + 0.1));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#145be9]"></div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 min-h-screen flex flex-col">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[2rem] font-black tracking-tight text-[#1a2b4b] mb-1">Select Quotation Template</h1>
          <p className="text-gray-500 font-medium text-sm">Choose a professional format for your quotes from our architectural collection.</p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-100 rounded-full">
            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Note: All templates are optimized for standard A4 size</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[300px_1fr] gap-4 lg:gap-6 flex-1 mb-6">
        
        {/* Left Sidebar - Formats List */}
        <div className="bg-[#f8fafc] rounded-2xl p-3 lg:p-4 flex flex-col border border-gray-100">
          <h3 className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-3 px-1">Available Formats</h3>
          
          <div className="grid grid-cols-2 xl:grid-cols-1 gap-2 xl:space-y-0 xl:gap-3">
            {formats.map((format, index) => {
              const locked = isTemplateLocked(index);

              return (
              <div 
                key={format.templateId}
                onClick={() => handleSelectFormat(format, index)}
                className={`group relative p-3 xl:p-3.5 rounded-xl border-2 transition-all duration-200 ${
                  locked ? 'cursor-not-allowed bg-white/40 border-gray-200 opacity-40' : 'cursor-pointer'
                } ${
                  selectedFormat === format.templateId 
                    ? 'bg-white border-[#145be9] shadow-sm shadow-blue-500/10' 
                    : 'bg-transparent border-gray-200 hover:border-gray-300 hover:bg-white/50'
                }`}
              >
                {selectedFormat === format.templateId && !locked && (
                  <div className="absolute top-2 right-2 xl:top-3 xl:right-3 bg-[#145be9] text-white text-[7px] font-black uppercase tracking-wider py-0.5 px-1.5 rounded-full">
                    Selected
                  </div>
                )}

                {locked && (
                  <>
                    <div className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 xl:right-3 xl:top-3">
                      <Lock className="h-3.5 w-3.5" />
                    </div>
                    <div className="pointer-events-none absolute left-3 right-3 top-3 z-20 translate-y-1 rounded-lg bg-[#1a2b4b] px-3 py-2 text-center text-[10px] font-bold leading-snug text-white opacity-0 shadow-xl transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
                      Upgrade your plan to access this template
                    </div>
                  </>
                )}
                
                <div className={`w-7 h-7 xl:w-8 xl:h-8 ${format.iconBg || 'bg-gray-100'} rounded-lg flex items-center justify-center mb-2 transition-colors`}>
                  {ICON_MAP[format.icon] ? React.cloneElement(ICON_MAP[format.icon], { 
                    className: `w-3.5 h-3.5 xl:w-4 xl:h-4 ${selectedFormat === format.templateId && !locked ? 'text-[#145be9]' : 'text-gray-400'}`
                  }) : <FileText className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-[#145be9]" />}
                </div>
                
                <h4 className={`font-bold text-sm xl:text-base mb-1 ${selectedFormat === format.templateId && !locked ? 'text-[#1a2b4b]' : 'text-gray-700'}`}>
                  {format.title}
                </h4>
                <p className="text-gray-500 text-[11px] leading-tight font-medium hidden sm:block">
                  {format.description}
                </p>
              </div>
              );
            })}
          </div>
        </div>

        {/* Right Area - Document Preview / Custom Builder Area */}
        <div className="flex flex-col flex-1 bg-gray-50/30 rounded-2xl p-3 lg:p-6 border border-gray-100 overflow-y-auto">
          {selectedFormat !== 'custom' ? (
            <div className="flex flex-col items-center overflow-hidden w-full">
              {/* A4 Paper Container */}
              <div className="bg-white w-full max-w-[450px] sm:max-w-[550px] lg:max-w-[650px] aspect-[210/297] border border-gray-200 shadow-xl flex flex-col relative overflow-hidden origin-top">
                {/* Document Render Layer */}
                {renderTemplate(false)}
              </div>
            </div>
          ) : (
            /* Custom Builder UI - Split: Left (Builder) and Right (Live Preview) */
            <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-6 w-full h-full items-start">
              {/* Left Column (40%) - Builder Controls */}
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="text-xl font-black text-[#1a2b4b] mb-1">Custom Builder</h2>
                  <p className="text-xs text-gray-500 font-medium">Add pages and customise settings to construct your custom layout.</p>
                </div>

                {/* Add Page Button Strip */}
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Add Page to Builder</p>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    <button
                      onClick={() => addPage('cover')}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg text-xs font-bold transition-all duration-200 active:scale-95 border border-purple-100"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Cover Page
                    </button>
                    <button
                      onClick={() => addPage('items')}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold transition-all duration-200 active:scale-95 border border-blue-100"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Items Table
                    </button>
                    <button
                      onClick={() => addPage('terms')}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-bold transition-all duration-200 active:scale-95 border border-amber-100"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Terms &amp; Conditions
                    </button>
                    <button
                      onClick={() => addPage('catalogs')}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 bg-orange-50 text-orange-700 hover:bg-orange-100 rounded-lg text-xs font-bold transition-all duration-200 active:scale-95 border border-orange-100"
                    >
                      + Catalogs
                    </button>
                    <button
                      onClick={() => addPage('summary')}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-all duration-200 active:scale-95 border border-emerald-100"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Financial Summary
                    </button>
                    <button
                      onClick={() => addPage('company')}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-bold transition-all duration-200 active:scale-95 border border-rose-100"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Company Info
                    </button>
                  </div>
                </div>

                {/* Validation Error */}
                {validationError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-lg animate-in fade-in duration-200">
                    {validationError}
                  </div>
                )}

                {/* Ordered List of Added Pages */}
                <div className="flex flex-col gap-3">
                  {pages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl border border-gray-100 border-dashed text-gray-400">
                      <Layout className="w-8 h-8 mb-2 stroke-[1.5]" />
                      <p className="text-xs font-bold">No pages added yet. Click one of the buttons above to build your layout.</p>
                    </div>
                  ) : (
                    pages.map((page, index) => (
                      <div key={page.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm transition-all duration-200 hover:border-gray-300">
                        {/* Page Row Header */}
                        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                          <div className="flex items-center gap-2">
                            <GripVertical className="w-4 h-4 text-gray-400 cursor-grab active:cursor-grabbing" />
                            <span className="text-[10px] font-black uppercase tracking-wider bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">Page {index + 1}</span>
                            <span className="text-xs font-bold text-gray-800 capitalize">{page.type === 'items' ? 'Items Table' : page.type === 'company' ? 'Company Info' : page.type === 'terms' ? 'Terms & Conditions' : page.type === 'catalogs' ? 'Product Catalogs' : page.type === 'summary' ? 'Financial Summary' : page.type}</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => toggleExpand(page.id)}
                              className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                              title="Configure Page Settings"
                            >
                              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${page.isExpanded ? 'rotate-180' : ''}`} />
                            </button>
                            <button
                              onClick={() => movePage(index, 'up')}
                              disabled={index === 0}
                              className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                              title="Move Page Up"
                            >
                              <ChevronUp className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => movePage(index, 'down')}
                              disabled={index === pages.length - 1}
                              className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                              title="Move Page Down"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => removePage(page.id)}
                              className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors"
                              title="Remove Page"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Expandable Configuration Form Panel */}
                        {page.isExpanded && (
                          <div className="p-4 border-t border-gray-100 bg-white animate-in slide-in-from-top duration-200">
                            {page.type === 'cover' && (
                              <div className="flex flex-col gap-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                  <label
                                    className={`cursor-pointer rounded-xl border p-4 transition ${page.config.coverMode === 'custom' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}
                                  >
                                    <input
                                      type="radio"
                                      name={`coverMode-${page.id}`}
                                      value="custom"
                                      checked={page.config.coverMode !== 'existing'}
                                      onChange={() => updatePageConfig(page.id, { coverMode: 'custom' })}
                                      className="sr-only"
                                    />
                                    <div className="text-sm font-black text-gray-900">Custom Cover</div>
                                    <p className="mt-1 text-[10px] text-gray-500">Build a page with logo, colors, and text fields.</p>
                                  </label>
                                  <label
                                    className={`cursor-pointer rounded-xl border p-4 transition ${page.config.coverMode === 'existing' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}
                                  >
                                    <input
                                      type="radio"
                                      name={`coverMode-${page.id}`}
                                      value="existing"
                                      checked={page.config.coverMode === 'existing'}
                                      onChange={() => updatePageConfig(page.id, { coverMode: 'existing', existingCoverTemplateId: page.config.existingCoverTemplateId || 'dual' })}
                                      className="sr-only"
                                    />
                                    <div className="text-sm font-black text-gray-900">Use Existing Template Cover</div>
                                    <p className="mt-1 text-[10px] text-gray-500">Choose from built-in cover designs used by other templates.</p>
                                  </label>
                                </div>

                                {page.config.coverMode === 'existing' ? (
                                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {EXISTING_COVER_TEMPLATES.map((template) => {
                                      const selected = page.config.existingCoverTemplateId === template.id;
                                      return (
                                        <button
                                          type="button"
                                          key={template.id}
                                          onClick={() => updatePageConfig(page.id, { existingCoverTemplateId: template.id })}
                                          className={`group w-full rounded-3xl border p-3 text-left transition ${selected ? 'border-blue-500 shadow-lg' : 'border-gray-200 hover:border-gray-400'}`}
                                        >
                                          <div className="flex items-center justify-between gap-3 mb-3">
                                            <span className="text-xs font-black uppercase tracking-wider text-gray-700">{template.label}</span>
                                            {selected && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                                          </div>
                                          <div className="overflow-hidden rounded-2xl bg-slate-100" style={{ height: '200px' }}>
                                            <div
                                              className="origin-top-left"
                                              style={{
                                                transform: 'scale(0.18)',
                                                width: '794px',
                                                height: '1123px',
                                                transformOrigin: 'top left',
                                              }}
                                            >
                                              {renderCoverPage({ coverMode: 'existing', existingCoverTemplateId: template.id }, MOCK_QUOTATION, companyInfo)}
                                            </div>
                                          </div>
                                        </button>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Upload Cover Logo</label>
                                        <div className="flex items-center gap-3">
                                          {page.config.logo && (
                                            <img src={page.config.logo} alt="Preview" className="w-12 h-12 object-contain rounded border border-gray-200 bg-gray-50" />
                                          )}
                                          <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleLogoUpload(page.id, e.target.files[0])}
                                            className="text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#145be9]/10 file:text-[#145be9] hover:file:bg-[#145be9]/20"
                                          />
                                        </div>
                                      </div>
                                      <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Override theme color for this page</label>
                                        <div className="flex items-center gap-2">
                                          <input
                                            type="color"
                                            value={page.config.accentColor || themeColor || '#145be9'}
                                            onChange={(e) => updatePageConfig(page.id, { accentColor: e.target.value })}
                                            className="w-10 h-8 p-0 border border-gray-200 rounded cursor-pointer"
                                          />
                                          <span className="text-xs font-bold text-gray-700">{page.config.accentColor || themeColor || '#145be9'}</span>
                                        </div>
                                        <p className="mt-2 text-[10px] text-gray-500">Leave empty to use the global theme color.</p>
                                      </div>

                                      <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Header Background</label>
                                        <div className="flex items-center gap-2">
                                          <input
                                            type="color"
                                            value={page.config.headerColor || '#1a2b4b'}
                                            onChange={(e) => updatePageConfig(page.id, { headerColor: e.target.value })}
                                            className="w-10 h-8 p-0 border border-gray-200 rounded cursor-pointer"
                                          />
                                          <span className="text-xs font-bold text-gray-700">{page.config.headerColor || '#1a2b4b'}</span>
                                        </div>
                                        <p className="mt-2 text-[10px] text-gray-500">Customize the cover page header banner color.</p>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Title Text</label>
                                        <input
                                          type="text"
                                          value={page.config.title || ''}
                                          onChange={(e) => updatePageConfig(page.id, { title: e.target.value })}
                                          className="w-full text-xs font-bold text-gray-700 border border-gray-200 rounded-lg p-2 focus:ring-[#145be9] focus:border-[#145be9]"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Subtitle</label>
                                        <input
                                          type="text"
                                          value={page.config.subtitle || ''}
                                          onChange={(e) => updatePageConfig(page.id, { subtitle: e.target.value })}
                                          className="w-full text-xs font-bold text-gray-700 border border-gray-200 rounded-lg p-2 focus:ring-[#145be9] focus:border-[#145be9]"
                                        />
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                            )}

                            {page.type === 'items' && (
                              <div className="flex flex-col gap-3">
                                <div>
                                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Product Images</label>
                                  <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={!!page.config.showProductImages}
                                      onChange={(e) => updatePageConfig(page.id, { showProductImages: e.target.checked })}
                                      className="w-4 h-4 rounded border-gray-300 text-[#145be9] focus:ring-[#145be9]"
                                    />
                                    <span className="text-xs font-bold text-gray-700">
                                      Show product images
                                      <span className="block text-[10px] font-medium text-gray-400 mt-0.5">When enabled, each product card shows a full-width image on the left</span>
                                    </span>
                                  </label>
                                </div>
                              </div>
                            )}

                            {page.type === 'terms' && (
                              <div className="flex flex-col gap-3">
                                <div>
                                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Section Title</label>
                                  <input
                                    type="text"
                                    value={page.config.sectionTitle || ''}
                                    onChange={(e) => updatePageConfig(page.id, { sectionTitle: e.target.value })}
                                    className="w-full text-xs font-bold text-gray-700 border border-gray-200 rounded-lg p-2 focus:ring-[#145be9] focus:border-[#145be9] mb-3"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Terms Source</label>
                                  <div className="flex gap-4 mb-3">
                                    <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 cursor-pointer">
                                      <input
                                        type="radio"
                                        name={`termsSource-${page.id}`}
                                        checked={page.config.termsSource === 'custom' || !page.config.termsSource}
                                        onChange={() => updatePageConfig(page.id, { termsSource: 'custom' })}
                                        className="text-[#145be9] focus:ring-[#145be9]"
                                      />
                                      Write your own
                                    </label>
                                    <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 cursor-pointer">
                                      <input
                                        type="radio"
                                        name={`termsSource-${page.id}`}
                                        checked={page.config.termsSource === 'saved'}
                                        onChange={() => updatePageConfig(page.id, { termsSource: 'saved' })}
                                        className="text-[#145be9] focus:ring-[#145be9]"
                                      />
                                      Choose from saved T&C
                                    </label>
                                    <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 cursor-pointer">
                                      <input
                                        type="radio"
                                        name={`termsSource-${page.id}`}
                                        checked={page.config.termsSource === 'pdf'}
                                        onChange={() => updatePageConfig(page.id, { termsSource: 'pdf' })}
                                        className="text-[#145be9] focus:ring-[#145be9]"
                                      />
                                      Upload PDF
                                    </label>
                                  </div>
                                </div>

                                {(page.config.termsSource === 'custom' || !page.config.termsSource) && (
                                  <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Terms Text</label>
                                    <textarea
                                      rows={6}
                                      placeholder="Enter your company's terms and conditions..."
                                      value={page.config.termsText || ''}
                                      onChange={(e) => updatePageConfig(page.id, { termsText: e.target.value })}
                                      className="w-full text-xs text-gray-700 border border-gray-200 rounded-lg p-2 focus:ring-[#145be9] focus:border-[#145be9]"
                                    />
                                  </div>
                                )}

                                {page.config.termsSource === 'saved' && (
                                  <div className="flex flex-col gap-2">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Select Terms Version</label>
                                    <select
                                      value={page.config.termsId || ''}
                                      onChange={(e) => {
                                        const selectedId = e.target.value;
                                        const selectedTerm = savedTermsList.find(t => t._id === selectedId);
                                        updatePageConfig(page.id, { 
                                          termsId: selectedId,
                                          termsText: selectedTerm?.content || '' 
                                        });
                                      }}
                                      className="w-full text-xs font-bold text-gray-700 border border-gray-200 rounded-lg p-2 focus:ring-[#145be9] focus:border-[#145be9]"
                                    >
                                      <option value="">-- Select Saved T&C --</option>
                                      {savedTermsList.map(term => (
                                        <option key={term._id} value={term._id}>
                                          {term.versionLabel} ({term.versionId}){term.isDefault ? ' (Default)' : ''}
                                        </option>
                                      ))}
                                    </select>
                                    
                                    {page.config.termsId && (() => {
                                      const termObj = savedTermsList.find(t => t._id === page.config.termsId);
                                      if (!termObj?.content) return null;
                                      const cleanText = termObj.content.replace(/<[^>]*>/g, '');
                                      const snippet = cleanText.length > 150 ? cleanText.substring(0, 150) + '...' : cleanText;
                                      return (
                                        <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg text-xs text-gray-500 font-medium">
                                          <p className="font-bold text-gray-700 mb-1">Preview:</p>
                                          <p className="italic">{snippet}</p>
                                        </div>
                                      );
                                    })()}
                                  </div>
                                )}

                                {page.config.termsSource === 'pdf' && (
                                  <div className="flex flex-col gap-2">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Upload PDF File</label>
                                    <input
                                      type="file"
                                      accept=".pdf"
                                      onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                          handleTermsPdfUpload(page.id, file);
                                        }
                                      }}
                                      className="text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#145be9]/10 file:text-[#145be9] hover:file:bg-[#145be9]/20"
                                    />
                                    {pdfUploadState[page.id]?.isLoading && (
                                      <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Extracting text...
                                      </div>
                                    )}
                                    {pdfUploadState[page.id]?.error && (
                                      <div className="text-xs text-rose-600 font-bold">
                                        {pdfUploadState[page.id].error}
                                      </div>
                                    )}
                                    {page.config.termsPdfText && (
                                      <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-xs text-emerald-900 font-medium">
                                        <div className="flex items-center gap-1 mb-1 text-emerald-900 font-bold">
                                          <CheckCircle2 className="w-3.5 h-3.5" />
                                          <span>Uploaded: {page.config.termsPdfName}</span>
                                        </div>
                                        <p className="text-[11px] text-emerald-800">
                                          {(() => {
                                            const previewLines = page.config.termsPdfText
                                              .split('\n')
                                              .map((line) => line.trim())
                                              .filter(Boolean)
                                              .slice(0, 3)
                                              .join(' • ');
                                            return previewLines || page.config.termsPdfText.substring(0, 150);
                                          })()}
                                        </p>
                                        <button
                                          type="button"
                                          onClick={() => updatePageConfig(page.id, { termsPdfName: '', termsPdfText: '' })}
                                          className="mt-2 text-[11px] text-[#145be9] font-bold underline"
                                        >
                                          Re-upload
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}

                            {page.type === 'summary' && (
                              <div className="flex flex-col gap-3">
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                  <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={!!page.config.showSubtotal}
                                      onChange={(e) => updatePageConfig(page.id, { showSubtotal: e.target.checked })}
                                      className="rounded border-gray-300 text-[#145be9] focus:ring-[#145be9]"
                                    />
                                    Show Subtotal
                                  </label>
                                  <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={!!page.config.showTaxRate}
                                      onChange={(e) => updatePageConfig(page.id, { showTaxRate: e.target.checked })}
                                      className="rounded border-gray-300 text-[#145be9] focus:ring-[#145be9]"
                                    />
                                    Show Tax Rate
                                  </label>
                                  <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={!!page.config.showShipping}
                                      onChange={(e) => updatePageConfig(page.id, { showShipping: e.target.checked })}
                                      className="rounded border-gray-300 text-[#145be9] focus:ring-[#145be9]"
                                    />
                                    Show Shipping
                                  </label>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                  {page.config.showShipping && (
                                    <div>
                                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Shipping Amount</label>
                                      <input
                                        type="number"
                                        value={page.config.shippingAmount || 0}
                                        onChange={(e) => updatePageConfig(page.id, { shippingAmount: parseFloat(e.target.value) || 0 })}
                                        className="w-full text-xs font-bold text-gray-700 border border-gray-200 rounded-lg p-2 focus:ring-[#145be9] focus:border-[#145be9]"
                                      />
                                    </div>
                                  )}
                                  <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Accent Color</label>
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="color"
                                        value={page.config.accentColor || '#145be9'}
                                        onChange={(e) => updatePageConfig(page.id, { accentColor: e.target.value })}
                                        className="w-10 h-8 p-0 border border-gray-200 rounded cursor-pointer"
                                      />
                                      <span className="text-xs font-bold text-gray-700">{page.config.accentColor || '#145be9'}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {page.type === 'company' && (
                              <div className="flex flex-col gap-4">
                                <div className="p-3 bg-[#eef2ff] rounded-lg border border-blue-100 text-xs text-[#0f52ba]">
                                  <p className="font-bold mb-1">Company details will be auto-filled from your profile:</p>
                                  <div className="mt-2 space-y-1 font-medium text-gray-700">
                                    <p><strong className="text-gray-400 uppercase text-[9px] tracking-wider mr-1">Name:</strong> {companyInfo.companyName || '-'}</p>
                                    <p><strong className="text-gray-400 uppercase text-[9px] tracking-wider mr-1">Phone:</strong> {companyInfo.phone || '-'}</p>
                                    <p><strong className="text-gray-400 uppercase text-[9px] tracking-wider mr-1">Email:</strong> {companyInfo.email || '-'}</p>
                                    <p><strong className="text-gray-400 uppercase text-[9px] tracking-wider mr-1">GST:</strong> {companyInfo.gstNo || '-'}</p>
                                    <p><strong className="text-gray-400 uppercase text-[9px] tracking-wider mr-1">Address:</strong> {companyInfo.address || '-'}</p>
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Accent Color</label>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="color"
                                      value={page.config.accentColor || companyInfo.primaryColor}
                                      onChange={(e) => updatePageConfig(page.id, { accentColor: e.target.value })}
                                      className="w-10 h-8 p-0 border border-gray-200 rounded cursor-pointer"
                                    />
                                    <span className="text-xs font-bold text-gray-700">{page.config.accentColor || companyInfo.primaryColor}</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Live Mini-Preview */}
                {pages.length > 0 && (
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-3">Live Page Order Preview</p>
                    <div className="flex flex-wrap gap-3">
                      {pages.map((page, index) => {
                        let typeBg = 'bg-purple-100 text-purple-700 border-purple-200';
                        if (page.type === 'items') typeBg = 'bg-blue-100 text-blue-700 border-blue-200';
                        if (page.type === 'terms') typeBg = 'bg-amber-100 text-amber-700 border-amber-200';
                        if (page.type === 'catalogs') typeBg = 'bg-orange-100 text-orange-700 border-orange-200';
                        if (page.type === 'summary') typeBg = 'bg-emerald-100 text-emerald-700 border-emerald-200';
                        if (page.type === 'company') typeBg = 'bg-rose-100 text-rose-700 border-rose-200';

                        return (
                          <div key={page.id} className={`w-[110px] aspect-[210/297] border rounded-lg flex flex-col justify-between p-2 shadow-sm ${typeBg}`}>
                            <div className="text-[9px] font-black uppercase tracking-wider">Page {index + 1}</div>
                            <div className="text-[10px] font-black leading-tight text-center capitalize">{page.type === 'items' ? 'Items Table' : page.type === 'company' ? 'Company Info' : page.type === 'terms' ? 'Terms & Conditions' : page.type === 'catalogs' ? 'Product Catalogs' : page.type === 'summary' ? 'Financial Summary' : page.type}</div>
                            <div className="w-full h-1 bg-current opacity-30 rounded"></div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column (60%) - Stacked A4 Live Preview */}
              <div className="flex flex-col items-center bg-gray-100/50 p-4 rounded-xl border border-gray-200 overflow-y-auto max-h-[750px] w-full custom-scrollbar">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-4 self-start">Live Stacked A4 Preview</p>
                {pages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-20 bg-white border border-gray-200 rounded-xl shadow-sm text-gray-400 aspect-[210/297] w-[350px]">
                    <Layout className="w-10 h-10 mb-2 stroke-[1.5]" />
                    <p className="text-xs font-bold">Add pages to preview</p>
                  </div>
                ) : (
                  <CustomLivePreview pages={pages} quotation={previewQuotation} companyInfo={companyInfo} themeColor={themeColor} />
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Bottom Bar */}
      <div className="flex flex-col sm:flex-row xl:grid xl:grid-cols-[300px_1fr] gap-3 lg:gap-6 mt-auto">
        <button
          onClick={() => navigate(-1)}
          className="bg-white hover:bg-gray-50 text-gray-500 border border-gray-200 w-full py-2.5 lg:py-3 rounded-lg flex items-center justify-center gap-2 font-bold transition-all active:scale-95 text-sm lg:text-base"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go Back</span>
        </button>
        
        <div className="grid grid-cols-3 gap-3 lg:gap-4">
          <button
            type="button"
            onClick={handleSaveAsDefault}
            disabled={savingDefault}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#145be9] text-[#145be9] text-sm font-bold transition-colors ${isDefault ? 'bg-[#eaf1fd]' : 'bg-white'} ${savingDefault ? 'opacity-60 cursor-not-allowed' : 'hover:bg-[#eaf1fd]'}`}
          >
            <Star className="w-4 h-4" fill={isDefault ? 'currentColor' : 'none'} />
            {isDefault ? 'Default' : 'Save as Default'}
          </button>
          <button 
            onClick={() => setIsPreviewOpen(true)}
            disabled={selectedFormat === 'custom'}
            className="bg-[#0f52ba] hover:bg-blue-800 text-white w-full py-2.5 lg:py-3 rounded-lg font-bold transition-all active:scale-95 text-sm lg:text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Preview Template
          </button>
          <button
            onClick={handleUseTemplate}
            disabled={changeTemplateMutation.isPending}
            className="bg-[#dce6fa] hover:bg-blue-200 text-[#0f52ba] w-full py-2.5 lg:py-3 rounded-lg font-bold transition-all active:scale-95 text-sm lg:text-base disabled:opacity-60"
          >
            {changeTemplateMutation.isPending ? 'Saving…' : (quoteId ? 'Apply Template' : 'Use This Template')}
          </button>
        </div>
      </div>

      {/* Full Screen Modal Viewer */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-[150] bg-[#323639] flex flex-col animate-in fade-in duration-200">
          {/* Top Toolbar */}
          <div className="h-[60px] bg-[#323639] border-b border-white/10 flex items-center justify-between px-4 flex-shrink-0 shadow-sm">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsPreviewOpen(false)} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <span className="text-white font-medium text-sm">
                {formats.find(f => f.templateId === selectedFormat)?.title}_Template.pdf
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={handleZoomOut} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors flex">
                <ZoomOut className="w-5 h-5" />
              </button>
              <span className="text-white/50 text-[10px] font-bold w-10 text-center block">
                {Math.round(zoom * 100)}%
              </span>
              <button onClick={handleZoomIn} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors flex">
                <ZoomIn className="w-5 h-5" />
              </button>
              <div className="w-px h-5 bg-white/20 mx-2 block"></div>
              <button className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                <Printer className="w-5 h-5" />
              </button>
              <button className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Document Canvas Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 flex items-start justify-center custom-scrollbar">
            <div 
              style={{ transform: `scale(${zoom})`, transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
              className="w-full max-w-[850px] flex flex-col relative my-auto origin-top"
            >
              {/* Document Render Layer */}
              <div className="w-full bg-white">
                {renderTemplate(true)}
              </div>
            </div>
          </div>
        </div>
      )}
      <QuotationLimitModal
        isOpen={isLimitModalOpen}
        maxLimit={maxTemplates}
        onClose={() => setIsLimitModalOpen(false)}
        onUpgrade={handleUpgradePlan}
        title="Template Locked"
        message="Upgrade your plan to access this template."
      />
    </div>
  );
};

export default QuotationFormat;
