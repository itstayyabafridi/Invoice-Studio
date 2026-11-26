import {
  DEFAULT_CATALOG_ITEMS,
  DEFAULT_COMPANY_PROFILE,
  createReferenceDraft,
} from '../data/defaults';
import {
  CatalogItem,
  CompanyProfile,
  InvoiceDraft,
  InvoiceItem,
  SavedInvoice,
} from '../types/invoice';

const KEYS = {
  DRAFT: 'invoice_studio_active_draft_v1',
  PROFILE: 'invoice_studio_company_profile_v1',
  SAVED_INVOICES: 'invoice_studio_saved_invoices_v1',
  CATALOG: 'invoice_studio_catalog_v1',
};

function safeRead<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeWrite<T>(key: string, value: T): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

type LegacyInvoiceItem = InvoiceItem & { deliveryCharges?: number };
type LegacyInvoiceDraft = Omit<Partial<InvoiceDraft>, 'items'> & {
  items?: LegacyInvoiceItem[];
};

function normalizeDraft(
  saved: LegacyInvoiceDraft,
  defaults: InvoiceDraft
): InvoiceDraft {
  let legacyItemDeliverySum = 0;
  const items: InvoiceItem[] = Array.isArray(saved.items)
    ? saved.items.map((item) => {
        if (
          typeof item.deliveryCharges === 'number' &&
          Number.isFinite(item.deliveryCharges)
        ) {
          legacyItemDeliverySum += Math.max(0, item.deliveryCharges);
        }
        return {
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        };
      })
    : defaults.items;

  const deliveryCharges =
    typeof saved.deliveryCharges === 'number' &&
    Number.isFinite(saved.deliveryCharges)
      ? Math.max(0, saved.deliveryCharges)
      : legacyItemDeliverySum;

  return {
    ...defaults,
    ...saved,
    items,
    deliveryCharges,
    isPaid: Boolean(saved.isPaid),
    thankYouText:
      typeof saved.thankYouText === 'string'
        ? saved.thankYouText
        : defaults.thankYouText,
  };
}

export function loadActiveDraft(): InvoiceDraft {
  const defaults = createReferenceDraft();
  const saved = safeRead<LegacyInvoiceDraft>(KEYS.DRAFT, defaults);
  return normalizeDraft(saved, defaults);
}

export function saveActiveDraft(draft: InvoiceDraft): boolean {
  return safeWrite(KEYS.DRAFT, draft);
}

export function loadCompanyProfile(): CompanyProfile {
  const saved = safeRead<
    Partial<CompanyProfile> & { iban?: string }
  >(KEYS.PROFILE, DEFAULT_COMPANY_PROFILE);
  const legacySize =
    typeof saved.logoSize === 'number' ? saved.logoSize : 100;
  const isLegacyPkrDefault =
    saved.currencySymbol === 'PKR' || !saved.currencySymbol;
  const isLegacyBankDefault =
    saved.bankName === 'Faysal Bank-Wapda Town Branch Gujranwala' &&
    typeof saved.branchCode !== 'string';

  return {
    ...DEFAULT_COMPANY_PROFILE,
    ...saved,
    bankName: isLegacyBankDefault ? '' : (saved.bankName ?? ''),
    branchCode:
      typeof saved.branchCode === 'string'
        ? saved.branchCode
        : DEFAULT_COMPANY_PROFILE.branchCode,
    accountType:
      typeof saved.accountType === 'string'
        ? saved.accountType
        : DEFAULT_COMPANY_PROFILE.accountType,
    currencySymbol: isLegacyPkrDefault
      ? 'ZAR'
      : (saved.currencySymbol ?? 'ZAR'),
    showCurrencySymbol: isLegacyPkrDefault
      ? true
      : (saved.showCurrencySymbol ?? true),
    logoWidth:
      typeof saved.logoWidth === 'number' ? saved.logoWidth : legacySize,
    logoHeight:
      typeof saved.logoHeight === 'number' ? saved.logoHeight : legacySize,
  };
}

export function saveCompanyProfile(profile: CompanyProfile): boolean {
  return safeWrite(KEYS.PROFILE, profile);
}

export function loadSavedInvoices(): SavedInvoice[] {
  const defaults = createReferenceDraft();
  const list = safeRead<SavedInvoice[]>(KEYS.SAVED_INVOICES, []);
  return list.map((entry) => ({
    ...entry,
    invoice: normalizeDraft(entry.invoice as LegacyInvoiceDraft, defaults),
  }));
}

export function saveSavedInvoices(list: SavedInvoice[]): boolean {
  return safeWrite(KEYS.SAVED_INVOICES, list);
}

export function loadCatalogItems(): CatalogItem[] {
  return safeRead<CatalogItem[]>(KEYS.CATALOG, DEFAULT_CATALOG_ITEMS);
}

export function saveCatalogItems(items: CatalogItem[]): boolean {
  return safeWrite(KEYS.CATALOG, items);
}
