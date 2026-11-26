import {
  CatalogItem,
  CompanyProfile,
  InvoiceDraft,
  InvoiceItem,
} from '../types/invoice';

export const DEFAULT_THANK_YOU_TEXT =
  'Thank you for your business! We truly appreciate your order and look forward to serving you again. Please reach out via any of the contact channels below if you need assistance.';

export const DEFAULT_COMPANY_PROFILE: CompanyProfile = {
  companyName: 'TKM TRADING COMPANY',
  brandTitle: 'TKM',
  brandSubtitle: 'TRADING CO',
  logoSize: 100,
  logoWidth: 100,
  logoHeight: 100,
  bankName: '',
  accountNumber: '3142301000006443',
  branchCode: '250655',
  accountType: 'Business Cheque',
  addressLine1: '1-3/D Small Industrial Estate: 02',
  addressLine2: 'Gujranwala-Pakistan',
  phone: '+92-3375681180',
  website: 'www.tkmtrading.com',
  email: 'info@tkmtrading.com',
  whatsapp: '+92-3375681180',
  defaultThankYouText: DEFAULT_THANK_YOU_TEXT,
  accentColor: '#107E87',
  currencySymbol: 'ZAR',
  showCurrencySymbol: true,
  decimalPlaces: 0,
  customLogoDataUrl: null,
};

export function createReferenceDraft(): InvoiceDraft {
  return {
    id: 'inv-ref-5043',
    invoiceNumber: 'INV-5043',
    dateISO: '2026-09-05',
    customerName: 'Furqan Hassan',
    customerCity: 'Peshawar',
    customerPhone: '',
    items: [
      {
        id: 'item-1',
        name: 'Muslim Shower (Gray)',
        quantity: 1,
        price: 3000,
      },
      {
        id: 'item-2',
        name: 'Multifunctional Sink (Black)',
        quantity: 1,
        price: 23500,
      },
      {
        id: 'item-3',
        name: 'Bath Set Piano (Silver)',
        quantity: 1,
        price: 28500,
      },
    ],
    discountType: 'percent',
    discountValue: 10,
    deliveryCharges: 0,
    taxPercent: 0,
    isPaid: false,
    thankYouText: DEFAULT_THANK_YOU_TEXT,
    notes: '',
    updatedAt: new Date().toISOString(),
  };
}

export const DEFAULT_CATALOG_ITEMS: CatalogItem[] = [
  { id: 'cat-1', name: 'Muslim Shower (Gray)', defaultPrice: 3000, sku: 'MS-GRY' },
  { id: 'cat-2', name: 'Multifunctional Sink (Black)', defaultPrice: 23500, sku: 'MFS-BLK' },
  { id: 'cat-3', name: 'Bath Set Piano (Silver)', defaultPrice: 28500, sku: 'BSP-SLV' },
];

export interface InvoiceTotals {
  subtotal: number;
  discountAmount: number;
  afterDiscount: number;
  deliveryCharges: number;
  taxAmount: number;
  grandTotal: number;
}

export function calculateInvoiceTotals(invoice: InvoiceDraft): InvoiceTotals {
  let subtotal = 0;

  for (const item of invoice.items) {
    const qty = Number.isFinite(item.quantity) ? Math.max(0, item.quantity) : 0;
    const price = Number.isFinite(item.price) ? Math.max(0, item.price) : 0;
    subtotal += qty * price;
  }

  const rawDiscount = Number.isFinite(invoice.discountValue)
    ? Math.max(0, invoice.discountValue)
    : 0;

  const discountAmount =
    invoice.discountType === 'percent'
      ? Math.min(subtotal, (subtotal * Math.min(100, rawDiscount)) / 100)
      : Math.min(subtotal, rawDiscount);

  const afterDiscount = Math.max(0, subtotal - discountAmount);
  const deliveryCharges = Number.isFinite(invoice.deliveryCharges)
    ? Math.max(0, invoice.deliveryCharges)
    : 0;
  const taxPct = Number.isFinite(invoice.taxPercent)
    ? Math.max(0, invoice.taxPercent)
    : 0;
  const taxAmount = (afterDiscount * taxPct) / 100;
  const grandTotal = afterDiscount + deliveryCharges + taxAmount;

  return {
    subtotal,
    discountAmount,
    afterDiscount,
    deliveryCharges,
    taxAmount,
    grandTotal,
  };
}

export function formatMoney(
  value: number,
  profile: Pick<CompanyProfile, 'currencySymbol' | 'showCurrencySymbol' | 'decimalPlaces'>
): string {
  const safeVal = Number.isFinite(value) ? value : 0;
  const formatted = safeVal.toLocaleString('en-US', {
    minimumFractionDigits: profile.decimalPlaces,
    maximumFractionDigits: profile.decimalPlaces,
  });
  if (profile.showCurrencySymbol && profile.currencySymbol.trim()) {
    return `${profile.currencySymbol.trim()} ${formatted}`;
  }
  return formatted;
}

export function formatInvoiceDate(dateISO: string): string {
  if (!dateISO) return '';
  const parts = dateISO.split('-');
  if (parts.length !== 3) return dateISO;
  const year = Number(parts[0]);
  const monthIdx = Number(parts[1]) - 1;
  const day = Number(parts[2]);
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  if (monthIdx < 0 || monthIdx > 11 || Number.isNaN(day) || Number.isNaN(year)) {
    return dateISO;
  }
  return `${day} ${months[monthIdx]}, ${year}`;
}

export function incrementInvoiceNumber(current: string): string {
  const match = current.match(/^(.*?)(\d+)$/);
  if (!match) {
    return `${current}-1`;
  }
  const prefix = match[1];
  const numStr = match[2];
  const nextNum = String(Number(numStr) + 1).padStart(numStr.length, '0');
  return `${prefix}${nextNum}`;
}

export function getTodayISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function createNewItem(name = '', price = 0): InvoiceItem {
  return {
    id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name,
    quantity: 1,
    price,
  };
}
