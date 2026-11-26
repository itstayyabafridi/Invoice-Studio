import React from 'react';

interface BrandMarkProps {
  brandTitle: string;
  brandSubtitle: string;
  accentColor: string;
  customLogoDataUrl: string | null;
  logoWidth?: number;
  logoHeight?: number;
}

export const BrandLogo: React.FC<BrandMarkProps> = ({
  brandTitle,
  brandSubtitle,
  accentColor,
  customLogoDataUrl,
  logoWidth = 100,
  logoHeight = 100,
}) => {
  const scaleX = Math.min(2.2, Math.max(0.4, logoWidth / 100));
  const scaleY = Math.min(2.2, Math.max(0.4, logoHeight / 100));

  if (customLogoDataUrl) {
    return (
      <div className="flex flex-col items-end">
        <img
          src={customLogoDataUrl}
          alt={brandTitle || 'Company Logo'}
          referrerPolicy="no-referrer"
          style={{
            width: `${Math.round(144 * scaleX)}px`,
            height: `${Math.round(58 * scaleY)}px`,
          }}
          className="object-fill"
        />
      </div>
    );
  }

  const isDefaultTkm = brandTitle.trim().toUpperCase() === 'TKM';

  if (isDefaultTkm) {
    const svgW = Math.round(136 * scaleX);
    const svgH = Math.round(52 * scaleY);
    const avgScale = (scaleX + scaleY) / 2;
    return (
      <div className="flex flex-col items-center select-none">
        <svg
          width={svgW}
          height={svgH}
          viewBox="0 0 136 52"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="TKM Logo"
        >
          {/* T top horizontal bar */}
          <rect x="2" y="4" width="32" height="7" rx="1" fill={accentColor} />
          {/* T vertical stem */}
          <rect x="14" y="15" width="8" height="33" rx="1" fill={accentColor} />

          {/* K vertical stem */}
          <rect x="41" y="4" width="8" height="44" rx="1" fill={accentColor} />
          {/* K upper & lower diagonal strokes */}
          <path
            d="M49 27L67 4H77L57 26L78 48H68L49 27Z"
            fill={accentColor}
          />

          {/* M geometric ribbon */}
          <path
            d="M84 48V15C84 9 88.5 4 94.5 4C99 4 102.5 6.8 104.5 11.2L108 18.8L111.5 11.2C113.5 6.8 117 4 121.5 4C127.5 4 132 9 132 15V48H124V16C124 13.5 122.4 11.8 120.4 11.8C118.6 11.8 117.2 13 116.3 15.2L111.3 26.8C110.2 29.2 105.8 29.2 104.7 26.8L99.7 15.2C98.8 13 97.4 11.8 95.6 11.8C93.6 11.8 92 13.5 92 16V48H84Z"
            fill={accentColor}
          />
        </svg>
        {brandSubtitle.trim() && (
          <div
            className="mt-0.5 font-extrabold tracking-[0.14em] text-[#1A1A1A] uppercase"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: `${(14.5 * avgScale).toFixed(1)}px`,
            }}
          >
            {brandSubtitle}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="flex flex-col items-end select-none origin-top-right"
      style={{
        transform: `scale(${scaleX}, ${scaleY})`,
      }}
    >
      <div
        className="text-[34px] font-extrabold leading-none tracking-tight"
        style={{
          color: accentColor,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        {brandTitle || 'BRAND'}
      </div>
      {brandSubtitle.trim() && (
        <div
          className="mt-1 text-[12px] font-extrabold tracking-[0.16em] text-[#1A1A1A] uppercase"
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          {brandSubtitle}
        </div>
      )}
    </div>
  );
};
