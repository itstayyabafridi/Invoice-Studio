import React, { useRef } from 'react';
import { ImagePlus, Minus, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { DEFAULT_COMPANY_PROFILE } from '../data/defaults';
import { CompanyProfile } from '../types/invoice';

interface CompanyProfilePanelProps {
  profile: CompanyProfile;
  onChange: (updated: CompanyProfile) => void;
}

export const CompanyProfilePanel: React.FC<CompanyProfilePanelProps> = ({
  profile,
  onChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const update = <K extends keyof CompanyProfile>(
    key: K,
    value: CompanyProfile[K]
  ) => {
    onChange({ ...profile, [key]: value });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      update('customLogoDataUrl', String(reader.result));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="divide-y divide-slate-200">
      {/* Header */}
      <section className="p-6 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Business & Payment Profile
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Automatically saved and applied to all current and future invoices.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onChange(DEFAULT_COMPANY_PROFILE)}
          className="h-8 px-2.5 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Restore TKM
        </button>
      </section>

      {/* Brand Identity */}
      <section className="p-6 space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Brand & Contact Header
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Logo Wordmark (Top Right)
            </label>
            <input
              type="text"
              value={profile.brandTitle}
              onChange={(e) => update('brandTitle', e.target.value)}
              placeholder="TKM"
              className="w-full h-9 px-3 text-sm bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0E7C86]/25 focus:border-[#0E7C86]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Brand Subtitle
            </label>
            <input
              type="text"
              value={profile.brandSubtitle}
              onChange={(e) => update('brandSubtitle', e.target.value)}
              placeholder="TRADING CO"
              className="w-full h-9 px-3 text-sm bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0E7C86]/25 focus:border-[#0E7C86]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Brand Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={profile.accentColor}
                onChange={(e) => update('accentColor', e.target.value)}
                className="w-9 h-9 p-0.5 bg-white border border-slate-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={profile.accentColor}
                onChange={(e) => update('accentColor', e.target.value)}
                className="w-full h-9 px-3 text-sm font-mono-num bg-white border border-slate-300 rounded text-slate-900"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 h-9 px-3 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <ImagePlus className="w-3.5 h-3.5" />
              {profile.customLogoDataUrl ? 'Replace Logo Image' : 'Upload Custom Logo'}
            </button>
            {profile.customLogoDataUrl && (
              <button
                type="button"
                onClick={() => update('customLogoDataUrl', null)}
                title="Remove custom logo"
                className="h-9 w-9 inline-flex items-center justify-center text-slate-500 hover:text-red-600 border border-slate-300 rounded hover:bg-red-50 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleLogoUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* Logo Width & Height Controls */}
        <div className="space-y-3 p-3.5 bg-slate-50 border border-slate-200 rounded-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-800">
              Logo Dimensions
            </span>
            <button
              type="button"
              onClick={() =>
                onChange({ ...profile, logoWidth: 100, logoHeight: 100 })
              }
              className="text-[11px] font-medium text-[#0E7C86] hover:underline cursor-pointer"
            >
              Reset 100%
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Width Control */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="profile-logo-width"
                  className="text-xs font-medium text-slate-700"
                >
                  Width
                </label>
                <span className="text-xs font-mono-num text-slate-600">
                  {profile.logoWidth ?? 100}%
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  aria-label="Decrease logo width"
                  onClick={() =>
                    update(
                      'logoWidth',
                      Math.max(40, (profile.logoWidth ?? 100) - 5)
                    )
                  }
                  className="w-8 h-8 inline-flex items-center justify-center bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  id="profile-logo-width"
                  type="range"
                  min={40}
                  max={200}
                  step={5}
                  value={profile.logoWidth ?? 100}
                  onChange={(e) => update('logoWidth', Number(e.target.value))}
                  className="w-full accent-[#0E7C86] cursor-pointer"
                />
                <button
                  type="button"
                  aria-label="Increase logo width"
                  onClick={() =>
                    update(
                      'logoWidth',
                      Math.min(200, (profile.logoWidth ?? 100) + 5)
                    )
                  }
                  className="w-8 h-8 inline-flex items-center justify-center bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Height Control */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="profile-logo-height"
                  className="text-xs font-medium text-slate-700"
                >
                  Height
                </label>
                <span className="text-xs font-mono-num text-slate-600">
                  {profile.logoHeight ?? 100}%
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  aria-label="Decrease logo height"
                  onClick={() =>
                    update(
                      'logoHeight',
                      Math.max(40, (profile.logoHeight ?? 100) - 5)
                    )
                  }
                  className="w-8 h-8 inline-flex items-center justify-center bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  id="profile-logo-height"
                  type="range"
                  min={40}
                  max={200}
                  step={5}
                  value={profile.logoHeight ?? 100}
                  onChange={(e) => update('logoHeight', Number(e.target.value))}
                  className="w-full accent-[#0E7C86] cursor-pointer"
                />
                <button
                  type="button"
                  aria-label="Increase logo height"
                  onClick={() =>
                    update(
                      'logoHeight',
                      Math.min(200, (profile.logoHeight ?? 100) + 5)
                    )
                  }
                  className="w-8 h-8 inline-flex items-center justify-center bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Address Line 1
            </label>
            <input
              type="text"
              value={profile.addressLine1}
              onChange={(e) => update('addressLine1', e.target.value)}
              className="w-full h-9 px-3 text-sm bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0E7C86]/25 focus:border-[#0E7C86]"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                City / Country
              </label>
              <input
                type="text"
                value={profile.addressLine2}
                onChange={(e) => update('addressLine2', e.target.value)}
                className="w-full h-9 px-3 text-sm bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0E7C86]/25 focus:border-[#0E7C86]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Phone
              </label>
              <input
                type="text"
                value={profile.phone}
                onChange={(e) => update('phone', e.target.value)}
                className="w-full h-9 px-3 text-sm font-mono-num bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0E7C86]/25 focus:border-[#0E7C86]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Footer Contact Details & Thank You Default */}
      <section className="p-6 space-y-3.5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Footer Contact Details & Thank You
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Website URL
            </label>
            <input
              type="text"
              value={profile.website}
              onChange={(e) => update('website', e.target.value)}
              placeholder="www.tkmtrading.com"
              className="w-full h-9 px-3 text-sm bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0E7C86]/25 focus:border-[#0E7C86]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => update('email', e.target.value)}
              placeholder="info@tkmtrading.com"
              className="w-full h-9 px-3 text-sm bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0E7C86]/25 focus:border-[#0E7C86]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              WhatsApp Number
            </label>
            <input
              type="text"
              value={profile.whatsapp}
              onChange={(e) => update('whatsapp', e.target.value)}
              placeholder="+92-3375681180"
              className="w-full h-9 px-3 text-sm font-mono-num bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0E7C86]/25 focus:border-[#0E7C86]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Thank You Paragraph
          </label>
          <textarea
            rows={2}
            value={profile.defaultThankYouText}
            onChange={(e) => update('defaultThankYouText', e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0E7C86]/25 focus:border-[#0E7C86]"
          />
        </div>
      </section>

      {/* Bank Payment Details */}
      <section className="p-6 space-y-3.5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Account Details For Payments (Bottom Right)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Account Title
            </label>
            <input
              type="text"
              value={profile.companyName}
              onChange={(e) => update('companyName', e.target.value)}
              placeholder="TKM TRADING COMPANY"
              className="w-full h-9 px-3 text-sm bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0E7C86]/25 focus:border-[#0E7C86]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Account Number
            </label>
            <input
              type="text"
              value={profile.accountNumber}
              onChange={(e) => update('accountNumber', e.target.value)}
              placeholder="3142301000006443"
              className="w-full h-9 px-3 text-sm font-mono-num bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0E7C86]/25 focus:border-[#0E7C86]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Branch Code
            </label>
            <input
              type="text"
              value={profile.branchCode}
              onChange={(e) => update('branchCode', e.target.value)}
              placeholder="250655"
              className="w-full h-9 px-3 text-sm font-mono-num bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0E7C86]/25 focus:border-[#0E7C86]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Account Type
            </label>
            <input
              type="text"
              value={profile.accountType}
              onChange={(e) => update('accountType', e.target.value)}
              placeholder="Business Cheque"
              className="w-full h-9 px-3 text-sm bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0E7C86]/25 focus:border-[#0E7C86]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Bank Name (Optional)
          </label>
          <input
            type="text"
            value={profile.bankName}
            onChange={(e) => update('bankName', e.target.value)}
            placeholder="e.g. First National Bank (FNB)"
            className="w-full h-9 px-3 text-sm bg-white border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0E7C86]/25 focus:border-[#0E7C86]"
          />
        </div>
      </section>

      {/* Formatting */}
      <section className="p-6 space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Currency & Number Format
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Currency Label
            </label>
            <input
              type="text"
              value={profile.currencySymbol}
              onChange={(e) => update('currencySymbol', e.target.value)}
              placeholder="ZAR"
              className="w-full h-9 px-3 text-sm bg-white border border-slate-300 rounded text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Show Currency
            </label>
            <div className="grid grid-cols-2 p-0.5 bg-slate-100 rounded h-9">
              <button
                type="button"
                onClick={() => update('showCurrencySymbol', false)}
                className={`text-xs font-medium rounded transition-colors cursor-pointer ${
                  !profile.showCurrencySymbol
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600'
                }`}
              >
                Off
              </button>
              <button
                type="button"
                onClick={() => update('showCurrencySymbol', true)}
                className={`text-xs font-medium rounded transition-colors cursor-pointer ${
                  profile.showCurrencySymbol
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600'
                }`}
              >
                On
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Decimals
            </label>
            <div className="grid grid-cols-2 p-0.5 bg-slate-100 rounded h-9">
              <button
                type="button"
                onClick={() => update('decimalPlaces', 0)}
                className={`text-xs font-medium rounded transition-colors cursor-pointer ${
                  profile.decimalPlaces === 0
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600'
                }`}
              >
                0
              </button>
              <button
                type="button"
                onClick={() => update('decimalPlaces', 2)}
                className={`text-xs font-medium rounded transition-colors cursor-pointer ${
                  profile.decimalPlaces === 2
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600'
                }`}
              >
                .00
              </button>
            </div>
          </div>
        </div>

      </section>
    </div>
  );
};
