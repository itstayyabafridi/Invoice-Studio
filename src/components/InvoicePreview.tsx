import React, { useEffect, useState } from 'react';
import {
  calculateInvoiceTotals,
  formatInvoiceDate,
  formatMoney,
} from '../data/defaults';
import { CompanyProfile, InvoiceDraft } from '../types/invoice';
import { getCleanPaidStampDataUrl } from '../utils/paidStamp';
import { BrandLogo } from './TkmLogo';

interface InvoicePreviewProps {
  invoice: InvoiceDraft;
  profile: CompanyProfile;
  scale?: number;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({
  invoice,
  profile,
  scale = 1,
}) => {
  const totals = calculateInvoiceTotals(invoice);
  const formattedDate = formatInvoiceDate(invoice.dateISO);
  const [paidStampUrl, setPaidStampUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getCleanPaidStampDataUrl().then((url) => {
      if (active) setPaidStampUrl(url);
    });
    return () => {
      active = false;
    };
  }, []);

  const waveColor = '#B7DCE1';

  const discountLabel =
    invoice.discountType === 'percent'
      ? `Dis ${invoice.discountValue}%`
      : 'Discount';

  const hasContactDetails = Boolean(
    profile.website?.trim() ||
      profile.email?.trim() ||
      profile.whatsapp?.trim()
  );

  const hasAccountDetails = Boolean(
    !invoice.isPaid &&
      (profile.companyName?.trim() ||
        profile.bankName?.trim() ||
        profile.accountNumber?.trim() ||
        profile.branchCode?.trim() ||
        profile.accountType?.trim())
  );

  return (
    <div
      className="relative origin-top-left"
      style={{
        width: `${794 * scale}px`,
        height: `${1123 * scale}px`,
      }}
    >
      <div
        id="invoice-a4-sheet"
        className="print-only-sheet relative bg-white text-[#1A1A1A] shadow-[0_12px_40px_rgba(15,23,42,0.08)] border border-slate-200/80 overflow-hidden flex flex-col justify-between"
        style={{
          width: '794px',
          height: '1123px',
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          fontFamily: "'DM Sans', system-ui, sans-serif",
        }}
      >
        {/* Main Content */}
        <div className="px-[76px] pt-[56px] pb-[112px] flex-1 flex flex-col">
          {/* Top Header: INVOICE Left | Logo & Address Right */}
          <div className="flex items-start justify-between gap-8">
            <div className="pt-1">
              <h1
                className="text-[44px] font-extrabold tracking-tight leading-none text-[#1A1A1A]"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                INVOICE
              </h1>
            </div>

            <div className="flex flex-col items-end text-right">
              <BrandLogo
                brandTitle={profile.brandTitle}
                brandSubtitle={profile.brandSubtitle}
                accentColor={profile.accentColor}
                customLogoDataUrl={profile.customLogoDataUrl}
                logoWidth={profile.logoWidth ?? profile.logoSize ?? 100}
                logoHeight={profile.logoHeight ?? profile.logoSize ?? 100}
              />
              <div className="mt-2.5 text-[12.5px] leading-[1.5] font-semibold text-[#222222]">
                {profile.addressLine1 && <div>{profile.addressLine1}</div>}
                {profile.addressLine2 && <div>{profile.addressLine2}</div>}
                {profile.phone && (
                  <div className="tabular-nums">{profile.phone}</div>
                )}
              </div>
            </div>
          </div>

          {/* Date & Invoice Number Row */}
          <div className="mt-8 flex items-center justify-between text-[14.5px] text-[#1A1A1A] mb-6">
            <div>
              <span className="font-bold">Date:</span>{' '}
              <span className="font-normal ml-1">{formattedDate || '—'}</span>
            </div>
            <div
              className="font-extrabold tracking-tight tabular-nums text-[15px]"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {invoice.invoiceNumber || 'INV-0001'}
            </div>
          </div>

          {/* Customer Block */}
          <div className="space-y-1.5 text-[14.5px] text-[#1A1A1A] mb-7">
            <div className="flex items-baseline">
              <span className="font-bold w-[64px] shrink-0">Name:</span>
              <span>{invoice.customerName || '—'}</span>
            </div>
            <div className="flex items-baseline">
              <span className="font-bold w-[64px] shrink-0">City:</span>
              <span>{invoice.customerCity || '—'}</span>
            </div>
            {invoice.customerPhone.trim() && (
              <div className="flex items-baseline">
                <span className="font-bold w-[64px] shrink-0">Phone:</span>
                <span className="tabular-nums">{invoice.customerPhone}</span>
              </div>
            )}
          </div>

          {/* Line Items Table */}
          <div className="w-full">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#EAEAEA] text-[#1A1A1A]">
                  <th
                    className="py-3 pl-4 pr-2 text-left text-[13px] font-bold"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    Product Name
                  </th>
                  <th
                    className="py-3 px-2 text-center text-[13px] font-bold w-[92px]"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    Quantity
                  </th>
                  <th
                    className="py-3 px-2 text-right text-[13px] font-bold w-[120px]"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    Unit Price
                  </th>
                  <th
                    className="py-3 pl-2 pr-4 text-right text-[13px] font-bold w-[130px]"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="text-[13.5px] text-[#222222]">
                {invoice.items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-10 text-center text-slate-400 italic border-b border-slate-200"
                    >
                      No order items added yet. Add items from the Product Details panel.
                    </td>
                  </tr>
                ) : (
                  invoice.items.map((item, index) => {
                    const amount = (item.quantity || 0) * (item.price || 0);
                    const isFirst = index === 0;
                    const isLast = index === invoice.items.length - 1;
                    return (
                      <tr
                        key={item.id}
                        className={isLast ? 'border-b border-[#E2E4E8]' : ''}
                      >
                        <td
                          className={`pl-4 pr-2 text-left align-top ${
                            isFirst ? 'pt-5' : 'pt-2.5'
                          } ${isLast ? 'pb-6' : 'pb-1.5'}`}
                        >
                          {item.name || 'Untitled Product'}
                        </td>
                        <td
                          className={`px-2 text-center tabular-nums align-top ${
                            isFirst ? 'pt-5' : 'pt-2.5'
                          } ${isLast ? 'pb-6' : 'pb-1.5'}`}
                        >
                          {item.quantity}
                        </td>
                        <td
                          className={`px-2 text-right tabular-nums align-top ${
                            isFirst ? 'pt-5' : 'pt-2.5'
                          } ${isLast ? 'pb-6' : 'pb-1.5'}`}
                        >
                          {formatMoney(item.price, profile)}
                        </td>
                        <td
                          className={`pl-2 pr-4 text-right tabular-nums align-top ${
                            isFirst ? 'pt-5' : 'pt-2.5'
                          } ${isLast ? 'pb-6' : 'pb-1.5'}`}
                        >
                          {formatMoney(amount, profile)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Totals Summary Right-Aligned + Optional PAID Stamp */}
          <div
            className={`mt-5 relative flex justify-end pr-4 ${
              invoice.isPaid ? 'min-h-[138px]' : ''
            }`}
          >
            {invoice.isPaid && paidStampUrl && (
              <img
                src={paidStampUrl}
                alt="PAID"
                className="pointer-events-none select-none absolute left-2 -top-1 w-[186px] h-auto opacity-90"
              />
            )}
            <div
              className="w-[360px] space-y-1.5 text-[19px] font-extrabold text-[#1A1A1A]"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              <div className="flex items-center justify-between">
                <span className="text-right flex-1 pr-6">Total</span>
                <span className="tabular-nums text-right min-w-[135px] whitespace-nowrap">
                  {formatMoney(totals.subtotal, profile)}
                </span>
              </div>

              {totals.discountAmount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-right flex-1 pr-6">{discountLabel}</span>
                  <span className="tabular-nums text-right min-w-[135px] whitespace-nowrap">
                    {formatMoney(totals.discountAmount, profile)}
                  </span>
                </div>
              )}

              {totals.deliveryCharges > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-right flex-1 pr-6 whitespace-nowrap">
                    Delivery Charges
                  </span>
                  <span className="tabular-nums text-right min-w-[135px] whitespace-nowrap">
                    {formatMoney(totals.deliveryCharges, profile)}
                  </span>
                </div>
              )}

              {totals.taxAmount > 0 && (
                <div className="flex items-center justify-between text-[16px] font-bold text-[#333333]">
                  <span className="text-right flex-1 pr-6">
                    Tax {invoice.taxPercent}%
                  </span>
                  <span className="tabular-nums text-right min-w-[135px] whitespace-nowrap">
                    {formatMoney(totals.taxAmount, profile)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between pt-0.5">
                <span className="text-right flex-1 pr-6">Grand Total</span>
                <span className="tabular-nums text-right min-w-[135px] whitespace-nowrap">
                  {formatMoney(totals.grandTotal, profile)}
                </span>
              </div>
            </div>
          </div>

          {/* Optional Order Notes */}
          {invoice.notes.trim() && (
            <div className="mt-6 text-[12.5px] text-slate-600 leading-relaxed max-w-[520px]">
              <span className="font-bold text-slate-800">Notes: </span>
              {invoice.notes}
            </div>
          )}

          {/* Post-Total Section: Thank You Paragraph + Side-by-Side Contact Details & Account Details */}
          {(invoice.thankYouText?.trim() ||
            hasContactDetails ||
            hasAccountDetails) && (
            <div className="mt-auto pt-7 border-t border-slate-200 space-y-5">
              {invoice.thankYouText?.trim() && (
                <div>
                  <div
                    className="text-[13.5px] font-bold text-[#111111] mb-1"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    Thank You
                  </div>
                  <p className="text-[12.5px] leading-[1.6] text-[#333333]">
                    {invoice.thankYouText}
                  </p>
                </div>
              )}

              {(hasContactDetails || hasAccountDetails) && (
                <div className="flex items-start justify-between gap-8 pt-1">
                  {/* Bottom-Left: Contact Details */}
                  <div className="flex-1 min-w-0 text-[12.5px] leading-[1.65] text-[#1A1A1A]">
                    {hasContactDetails && (
                      <>
                        <div
                          className="text-[13.5px] font-bold underline underline-offset-4 decoration-[1.5px] mb-1.5 text-[#111111]"
                          style={{
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                          }}
                        >
                          Contact Details:
                        </div>
                        {profile.website?.trim() && (
                          <div>
                            <span className="font-semibold">Website:</span>{' '}
                            <span>{profile.website}</span>
                          </div>
                        )}
                        {profile.email?.trim() && (
                          <div>
                            <span className="font-semibold">Email:</span>{' '}
                            <span>{profile.email}</span>
                          </div>
                        )}
                        {profile.whatsapp?.trim() && (
                          <div>
                            <span className="font-semibold">WhatsApp:</span>{' '}
                            <span className="tabular-nums">
                              {profile.whatsapp}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Bottom-Right (In Front of Contact Details): Account Details For Payments */}
                  <div className="flex-1 min-w-0 text-right text-[12.5px] leading-[1.65] text-[#1A1A1A]">
                    {hasAccountDetails && (
                      <>
                        <div
                          className="text-[13.5px] font-bold underline underline-offset-4 decoration-[1.5px] mb-1.5 text-[#111111]"
                          style={{
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                          }}
                        >
                          Account Details For Payments:
                        </div>
                        {profile.companyName?.trim() && (
                          <div className="text-[12px] text-[#222222]">
                            <span className="font-semibold">Account Title:</span>{' '}
                            <span className="font-bold uppercase">
                              {profile.companyName}
                            </span>
                          </div>
                        )}
                        {profile.bankName?.trim() && (
                          <div className="text-[12px] text-[#222222]">
                            <span className="font-semibold">Bank:</span>{' '}
                            <span>{profile.bankName}</span>
                          </div>
                        )}
                        {profile.accountNumber?.trim() && (
                          <div className="text-[12px] text-[#222222]">
                            <span className="font-semibold">
                              Account Number:
                            </span>{' '}
                            <span className="tabular-nums">
                              {profile.accountNumber}
                            </span>
                          </div>
                        )}
                        {profile.branchCode?.trim() && (
                          <div className="text-[12px] text-[#222222]">
                            <span className="font-semibold">Branch Code:</span>{' '}
                            <span className="tabular-nums">
                              {profile.branchCode}
                            </span>
                          </div>
                        )}
                        {profile.accountType?.trim() && (
                          <div className="text-[12px] text-[#222222]">
                            <span className="font-semibold">Account Type:</span>{' '}
                            <span>{profile.accountType}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Curved Teal Wave */}
        <div className="relative h-[68px] w-full shrink-0 pointer-events-none">
          <svg
            viewBox="0 0 794 60"
            preserveAspectRatio="none"
            className="absolute bottom-0 left-0 w-full h-[54px]"
            aria-hidden="true"
          >
            <path
              d="M0 32 C 135 2, 310 6, 448 60 L 0 60 Z"
              fill={waveColor}
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
