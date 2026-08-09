import React from 'react';

const DesignLayer = ({ settings, shouldShowBg, shouldShowWm }) => {
  if (!settings) return null;

  const {
    bgImage, bgOpacity, bgBlur, bgFit,
    wmImage, wmOpacity, wmPosition, wmSize
  } = settings;

  const getPositionStyles = (pos) => {
    // Standard margin for watermarks from the edge (approx 1cm)
    const margin = '40px';
    
    switch (pos) {
      case 'top-left': 
        return { top: margin, left: margin, transform: 'none' };
      case 'top-center': 
        return { top: margin, left: '50%', transform: 'translateX(-50%)' };
      case 'top-right': 
        return { top: margin, right: margin, transform: 'none' };
      case 'middle-left': 
        return { top: '50%', left: margin, transform: 'translateY(-50%)' };
      case 'center': 
        return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
      case 'middle-right': 
        return { top: '50%', right: margin, transform: 'translateY(-50%)' };
      case 'bottom-left': 
        return { bottom: margin, left: margin, transform: 'none' };
      case 'bottom-center': 
        return { bottom: margin, left: '50%', transform: 'translateX(-50%)' };
      case 'bottom-right': 
        return { bottom: margin, right: margin, transform: 'none' };
      default: 
        return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }
  };

  return (
    <>
      {/* 1. Background Image Layer - Always stays at the very bottom (z-0) */}
      {bgImage && shouldShowBg && (
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0">
          <img
            src={bgImage}
            alt=""
            className="absolute inset-0 w-full h-full transition-all duration-500"
            style={{
              opacity: (bgOpacity ?? 8) / 100,
              filter: `blur(${bgBlur ?? 0}px)`,
              objectFit: bgFit ?? 'cover',
              zIndex: 1
            }}
          />
        </div>
      )}

      {/* 2. Watermark Layer - Always floats at the very top (z-50) */}
      {wmImage && shouldShowWm && (
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-[50]">
          <div 
            className="absolute transition-all duration-500 flex items-center justify-center"
            style={{ 
              ...getPositionStyles(wmPosition),
              opacity: (wmOpacity ?? 15) / 100,
              zIndex: 50,
              mixBlendMode: 'multiply'
            }}
          >
            <img
              src={wmImage}
              alt="Watermark"
              className="h-auto max-w-none shadow-sm"
              style={{ 
                width: `${wmSize ?? 120}px`,
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.05))'
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default DesignLayer;
