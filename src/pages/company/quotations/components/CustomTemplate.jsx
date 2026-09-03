import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import useAuthStore from '../../../../store/authStore';
import profileSettingsApi from '../../../../services/profileSettingsApi';
import productApi from '../../../../services/productApi';
import DesignLayer from './DesignLayer';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import {
  renderCoverPage,
  renderItemsPage,
  CatalogPdfRenderer,
  renderCatalogsPage,
  renderSummaryPage,
  renderTermsPage,
  renderCompanyPage,
  expandCustomPages,
} from './customPageRenderers';

if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).href;
}

const CustomTemplate = ({ quotation, isVertical = false }) => {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [catalogPages, setCatalogPages] = useState([]);
  const [catalogsLoading, setCatalogsLoading] = useState(false);
  const [catalogsError, setCatalogsError] = useState('');

  const { user } = useAuthStore();
  const { data: settingsResponse } = useQuery({
    queryKey: ['profile-settings'],
    queryFn: () => profileSettingsApi.getSettings(),
  });
  const profileSettings = settingsResponse?.data;

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

  const ts = quotation?.templateSettings || {};
  const pages = ts.customConfig || [];

  const hasCatalogsPage = pages.some((p) => p.type === 'catalogs');

  // ── Catalog PDF → canvas rasterisation ────────────────────────────────────
  // Mirrors the exact same async pattern used in CustomLivePreview inside
  // QuotationFormat.jsx so that the preview template shows the same output.
  // Items are iterated in their quotation.items array order (= product
  // selection sequence: first selected product first, etc.).
  useEffect(() => {
    let cancelled = false;

    const loadCatalogPages = async () => {
      if (!hasCatalogsPage) {
        setCatalogPages([]);
        setCatalogsLoading(false);
        setCatalogsError('');
        return;
      }

      // Match EditProduct's proven file-preview base URL.
      const BASE_URL = 'http://localhost:5000';
      // Prefer the quotation snapshot, then the populated product. For older
      // quotations that have neither, load the current product record exactly
      // as EditProduct does and retain the original item ordering.
      const resolvedItems = await Promise.all((quotation?.items || []).map(async (item) => {
        const snapshotPath = item.cataloguePdf || item.product?.cataloguePdf || '';
        if (snapshotPath) return { ...item, resolvedCataloguePdf: snapshotPath };

        const productId = item.product?._id || item.product;
        if (!productId) return { ...item, resolvedCataloguePdf: '' };

        try {
          const productResponse = await productApi.getProductById(productId);
          return {
            ...item,
            resolvedCataloguePdf: productResponse?.data?.cataloguePdf || '',
          };
        } catch (error) {
          console.error('[catalog debug] product lookup failed:', productId, error);
          return { ...item, resolvedCataloguePdf: '' };
        }
      }));
      if (cancelled) return;
      const catalogItems = resolvedItems.filter((item) => item.resolvedCataloguePdf);

      console.log('[catalog debug] quotation.items:', quotation?.items);
      console.log('[catalog debug] catalogItems after filter:', catalogItems);

      if (catalogItems.length === 0) {
        setCatalogPages([]);
        setCatalogsLoading(false);
        setCatalogsError('');
        return;
      }

      setCatalogsLoading(true);
      setCatalogsError('');
      const renderedPages = [];

      try {
        for (const [itemIndex, item] of catalogItems.entries()) {
          const cataloguePdf = item.resolvedCataloguePdf;
          const pdfUrl = /^https?:\/\//i.test(cataloguePdf)
            ? cataloguePdf
            : `${BASE_URL}/${cataloguePdf}`;

          console.log('[catalog debug] resolved pdfUrl:', pdfUrl);

          const pdf = await pdfjsLib.getDocument({ url: pdfUrl }).promise;

          for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            // scale:2 → retina-quality rasterisation that then fills the A4 width
            const viewport = page.getViewport({ scale: 2 });
            const canvas = document.createElement('canvas');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;

            renderedPages.push({
              id: `${item.product || item.name || itemIndex}-p${pageNum}`,
              itemName: item.name,
              pageNum,
              showHeader: pageNum === 1,
              dataUrl: canvas.toDataURL('image/png'),
            });
          }
        }

        if (!cancelled) setCatalogPages(renderedPages);
      } catch (err) {
        console.error('CustomTemplate – catalog PDF render error:', err);
        if (!cancelled) {
          setCatalogPages([]);
          setCatalogsError('The catalog PDF could not be loaded. Check that its file path is reachable.');
        }
      } finally {
        if (!cancelled) setCatalogsLoading(false);
      }
    };

    loadCatalogPages();
    return () => { cancelled = true; };
  }, [quotation?.items, hasCatalogsPage]);

  // ── Expand non-catalog pages (items chunking, terms pagination) ────────────
  const expandedPages = useMemo(
    () => expandCustomPages(pages, quotation),
    [pages, quotation]
  );

  // ── Responsive scale ────────────────────────────────────────────────────────
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current && containerRef.current.parentElement) {
        const parentWidth = containerRef.current.parentElement.offsetWidth;
        const targetWidth = 794;
        const newScale = parentWidth / targetWidth;
        setScale(newScale < 1 ? newScale : 1);
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  // ── Per-page renderer ───────────────────────────────────────────────────────
  const renderPage = (page) => {
    const resolvedColor =
      quotation?.templateSettings?.themeColor ||
      page.config?.accentColor ||
      companyInfo.primaryColor;

    const resolvedPage = {
      ...page,
      config: {
        ...page.config,
        accentColor: page.config?.accentColor || resolvedColor,
      },
    };

    switch (resolvedPage.type) {
      case 'cover':
        return renderCoverPage(resolvedPage.config, quotation, companyInfo);

      case 'items':
        return renderItemsPage(resolvedPage.config, {
          ...quotation,
          items: page.itemsChunk || quotation.items,
        });

      case 'catalogs':
        // While PDFs are still being rasterised show the placeholder so the
        // page slot exists and the page-number overlay keeps counting correctly.
        if (catalogsLoading) return renderCatalogsPage(quotation);
        if (catalogsError) {
          return (
            <div className="relative bg-white flex flex-col items-center justify-center shrink-0 w-[794px] h-[1123px] min-w-[794px] min-h-[1123px] border border-gray-100 select-none px-12 text-center">
              <p className="text-[11px] font-black text-red-500 uppercase tracking-widest">Catalog could not be loaded</p>
              <p className="text-[10px] text-gray-400 mt-2">{catalogsError}</p>
            </div>
          );
        }
        if (catalogPages.length === 0) return renderCatalogsPage(quotation);
        // Each catalog PDF page becomes its own A4 page element.
        return catalogPages.map((cp) => (
          <CatalogPdfRenderer key={cp.id} {...cp} />
        ));

      case 'summary':
        return renderSummaryPage(resolvedPage.config, quotation);

      case 'terms': {
        const mergedConfig = {
          ...page.config,
          ...(page.termsPageText !== undefined
            ? page.config.termsSource === 'pdf'
              ? { termsPdfText: page.termsPageText }
              : { termsText: page.termsPageText }
            : {}),
        };
        return renderTermsPage(mergedConfig, quotation);
      }

      case 'company':
        return renderCompanyPage(page.config, quotation, companyInfo);

      default:
        return null;
    }
  };

  // ── Flatten all rendered page elements ─────────────────────────────────────
  const renderedPages = expandedPages.flatMap((page) => {
    const rendered = renderPage(page);
    return Array.isArray(rendered) ? rendered : [rendered];
  });

  const numPages = renderedPages.length || 1;
  const unscaledPageHeight = 1122.5;
  const pageGap = 24;
  const totalUnscaledHeight =
    unscaledPageHeight * numPages + pageGap * Math.max(0, numPages - 1);

  return (
    <div
      className="flex flex-col items-start justify-center w-full leading-normal group/container"
      style={
        isVertical
          ? { height: totalUnscaledHeight * scale, overflow: 'hidden' }
          : { overflow: 'hidden' }
      }
    >
      <div
        ref={containerRef}
        style={{
          width: '210mm',
          height: isVertical ? `${totalUnscaledHeight}px` : 'auto',
          minWidth: '210mm',
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)',
        }}
        className={`text-[#111827] flex flex-col gap-6 shrink-0 relative ${
          isVertical ? '' : 'overflow-hidden'
        }`}
      >
        <DesignLayer
          settings={ts}
          shouldShowBg={true}
          shouldShowWm={ts.showWatermark !== false}
        />

        {expandedPages.length === 0 ? (
          <div className="bg-white p-20 text-center text-gray-400 font-bold border rounded shadow-md w-[210mm] h-[297mm]">
            No Pages Configured
          </div>
        ) : (
          renderedPages.map((renderedPage, index) => (
            <div key={`rendered-${index}`} className="relative w-full">
              {renderedPage}
              <div className="absolute bottom-[20px] left-0 right-0 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest pointer-events-none">
                PAGE {String(index + 1).padStart(2, '0')} —{' '}
                {String(numPages).padStart(2, '0')}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CustomTemplate;
