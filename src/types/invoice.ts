export type DiscountType = 'percent' | 'fixed';

export interface InvoiceItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface CompanyProfile {
  companyName: string;
  brandTitle: string;
  brandSubtitle: string;
  logoSize: number; // Legacy fallback percentage scale
  logoWidth: number; // Width percentage scale: 50 to 200 (default 100)
  logoHeight: number; // Height percentage scale: 50 to 200 (default 100)
  bankName: string;
  accountNumber: string;
  branchCode: string;
  accountType: string;
  addressLine1: string;
  addressLine2: string;
  phone: string;
  website: string;
  email: string;
  whatsapp: string;
  defaultThankYouText: string;
  accentColor: string;
  currencySymbol: string;
  showCurrencySymbol: boolean;
  decimalPlaces: 0 | 2;
  customLogoDataUrl: string | null;
}

export interface InvoiceDraft {
  id: string;
  invoiceNumber: string;
  dateISO: string; // YYYY-MM-DD
  customerName: string;
  customerCity: string;
  customerPhone: string;
  items: InvoiceItem[];
  discountType: DiscountType;
  discountValue: number;
  deliveryCharges: number;
  taxPercent: number;
  isPaid?: boolean;
  thankYouText: string;
  notes: string;
  updatedAt: string;
}

export interface SavedInvoice {
  id: string;
  invoice: InvoiceDraft;
  profileSnapshot: CompanyProfile;
  grandTotal: number;
  savedAt: string;
}

export interface CatalogItem {
  id: string;
  name: string;
  defaultPrice: number;
  sku?: string;
}
