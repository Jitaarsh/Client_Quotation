import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import useAuthStore from '../../../../store/authStore';
import profileSettingsApi from '../../../../services/profileSettingsApi';
import DesignLayer from './DesignLayer';
import {
  renderCoverPage,
  renderItemsPage,
  renderSummaryPage,
  renderTermsPage,
  renderCompanyPage,
  expandCustomPages,
} from './customPageRenderers';

const CustomTemplate = ({ quotation, isVertical = false }) => {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

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

  const expandedPages = React.useMemo(() => expandCustomPages(pages, quotation), [pages, quotation]);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current && containerRef.current.parentElement) {
        const parentWidth = containerRef.current.parentElement.offsetWidth;
        const targetWidth = 794; 
        const newScale = parentWidth / targetWidth;
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
  }, []);

  const renderPage = (page) => {
    const resolvedColor = quotation?.templateSettings?.themeColor || page.config?.accentColor || companyInfo.primaryColor;
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

  const renderedPages = expandedPages.flatMap((page) => {
    const rendered = renderPage(page);
    return Array.isArray(rendered) ? rendered : [rendered];
  });
  const numPages = renderedPages.length || 1;
  const unscaledPageHeight = 1122.5;
  const totalUnscaledHeight = unscaledPageHeight * numPages;

  return (
    <div 
      className="flex flex-col items-start justify-center w-full leading-normal group/container"
      style={isVertical ? { height: totalUnscaledHeight * scale, overflow: 'hidden' } : { overflow: 'hidden' }}
    >
      <div 
        ref={containerRef}
        style={{ 
          width: '210mm', 
          height: isVertical ? `${totalUnscaledHeight}px` : 'auto', 
          minWidth: '210mm',
          transform: `scale(${scale})`, 
          transformOrigin: 'top center',
          boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)'
        }}
        className={`text-[#111827] flex flex-col gap-6 shrink-0 relative ${isVertical ? '' : 'overflow-hidden'}`}
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
              {/* Pagination footer overlay relative to each individual sheet if needed */}
              <div className="absolute bottom-[20px] left-0 right-0 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest pointer-events-none">
                PAGE {String(index + 1).padStart(2, '0')} — {String(numPages).padStart(2, '0')}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CustomTemplate;
